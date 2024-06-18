import { maintenance } from './maintenance/maintenance'
import { leasePreferences } from './lease-preferences/lease-preferences'
import { leases } from './leases/leases'
import { messages } from './messages/messages'
import { assets } from './assets/assets'
import { assetType } from './asset-type/asset-type'
import { roles } from './roles/roles'
import { user } from './users/users'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'
import { GeneralError, NotFound } from '@feathersjs/errors'
import { formatPhoneNumber, sendSms } from '../helpers/functions'
import bcrypt from 'bcryptjs'
import Joi from 'joi'
import { createValidator } from 'express-joi-validation'
import fileUpload from 'express-fileupload'
import AzureStorageService from './azureStorageService'
import { logger } from '../logger'
import { Roles } from '../interfaces/constants'
const validator = createValidator({ passError: true, statusCode: 400 })
const schemas = {
  forgotPassword: Joi.object().keys({
    email: Joi.string().required().email(),
    phoneNumber: Joi.string().optional().length(11)
  }),
  resetPassword: Joi.object().keys({
    email: Joi.string().required().email(),
    otp: Joi.number().required().integer(),
    phoneNumber: Joi.string().optional().length(11),
    password: Joi.string().required()
  }),
  changePassword: Joi.object().keys({
    userId: Joi.string().required(),
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required()
  }),
  verify: Joi.object().keys({
    otp: Joi.number().required().integer(),
    email: Joi.string().required().email(),
    password: Joi.string().required()
  }),
  google_signup: Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().required().email(),
    role: Joi.number().required(),
    phone_number: Joi.string().optional().length(11)
  }),
  google_signin: Joi.object().keys({
    email: Joi.string().required().email()
  }),
  logout: Joi.object().keys({
    email: Joi.string().required().email()
  })
}

export const services = (app: Application) => {
  app.configure(maintenance)
  app.configure(leasePreferences)
  app.configure(leases)
  app.configure(messages)
  // All services will be registered here
  app.configure(assets)
  app.configure(assetType)
  app.configure(roles)
  app.configure(user)

  app.post('/auth/logout', validator.body(schemas.logout), async (req: any, res: any) => {
    try {
      const USERS = app.service('users')
      const user = await USERS.find({ query: { email: req.body.email } })
      const updatedUser = await USERS.patch(user.data[0].id, { is_logged_in: false })
      app.service('users').emit('loggingOut', { updatedUser })
      return res.json({ status: 200, message: 'User logged out successfully' })
    } catch (error) {
      res.json(error)
    }
  })

  app.post('/auth/user/verify', validator.body(schemas.verify), async (req: any, res: any) => {
    try {
      let User = app.service('users')
      let userDetails = await User.find({
        query: {
          otp: req.body.otp,
          email: req.body.email
        }
      })

      if (userDetails.data.length == 0) {
        throw new NotFound('Ouch! User OTP or Email is not correct')
      }
      await User.patch(userDetails.data[0].id, { is_verified: true, is_logged_in: true, otp: 0 })
      const data = await app
        .service('authentication')
        .create({ password: req.body.password, email: userDetails.data[0].email, strategy: 'local' })
      return res.json({ message: 'User verification successful!', status: 200, data })
    } catch (error) {
      res.status(400).json(error)
    }
  })

  app.post(
    '/auth/user/forgot-password',
    validator.body(schemas.forgotPassword),
    async (req: any, res: any) => {
      try {
        let User = app.service('users')
        let userDetails = await User.find({
          query: {
            $or: [{ email: req.body.email }, { phone_number: req?.body?.phoneNumber || 0 }]
          }
        })

        if (userDetails.data.length < 1) {
          throw new NotFound(`${req.body.email ? 'Email address' : 'Phone number'} not found`)
        }

        const otp = Math.floor(1000 + Math.random() * 9000)
        const contentBody = `Hi! <br><br> You requested for password reset. Here is your OTP: ${otp} to continue the reset process. <br><br>Team Vamooze`
        const smdContentBody = `Hi! ${userDetails.data[0].first_name} You requested for password reset. Here is your OTP: ${otp} to continue the reset process. Team Vamooze`
        const phoneNumber = formatPhoneNumber(userDetails.data[0].phone_number)
        const smsSent = await sendSms(phoneNumber, smdContentBody)
        // if(userDetails.data[0].email){
        //   await forgotPassword({content: '',to: userDetails.data[0].email, subject: 'Vamooze account password reset', type: 'html',
        //     firstName: userDetails.data[0].first_name, otp: otp });
        // }

        await User.patch(userDetails.data[0].id, { otp: otp })
        if (smsSent === 200) {
          let otpData = {
            message: `OTP has been sent to your ${req.body.email ? 'email address' : 'your phone number'}`
          }
          res.json({ result: { ...otpData }, status: 200 })
        } else {
          res.json({ error: { message: 'Something went wrong' }, status: 400 })
        }
      } catch (error: any) {
        res.json({ error: { message: error.message }, status: 400 })
      }
    }
  )

  app.post('/auth/user/reset-password', validator.body(schemas.resetPassword), async (req: any, res: any) => {
    try {
      let User = app.service('users')
      let userDetails = await User.find({
        query: {
          otp: req.body.otp,
          $or: [{ email: req.body.email }, { phone_number: req?.body?.phoneNumber || 0 }]
        }
      })

      console.log('====================================userDetails')
      console.log(userDetails)
      console.log('====================================userDetails')

      if (userDetails.data.length == 0) {
        throw new NotFound('Ouch! User OTP is not correct')
      }
      await User.patch(userDetails.data[0].id, { password: req.body.password, otp: 0 })
      return res.json({ message: 'Password reset was successful', status: 200 })
    } catch (error) {
      res.json(error)
    }
  })

  app.post('/user/change-password', validator.body(schemas.changePassword), async (req: any, res: any) => {
    try {
      let user = app.service('users')
      let foundUser = await user.find({
        query: {
          id: req.body.userId
        }
      })

      let result = bcrypt.compareSync(req.body.oldPassword, foundUser.data[0]['password'])

      if (result) {
        await user.patch(foundUser.data[0]['id'], { password: req.body.newPassword })
        return res.json({ message: 'Password Changed Successfully', status: 200 })
      } else {
        throw new GeneralError('Incorrect Password')
      }
    } catch (error: any) {
      res.json({ error: { message: error.message }, status: 400 })
    }
  })

  app.post('/auth/google/sign-up', validator.body(schemas.google_signup), async (req: any, res: any) => {
    try {
      let User = app.service('users')
      const roleData = await app.service('roles').find({ query: { $limit: 1, slug: Roles.AssetOwner } })
      if (roleData?.data?.length === 0) {
        throw new NotFound('Role not found')
      }
      req.body.role = roleData?.data[0]?.id
      const { first_name, last_name, email, role, phone_number } = req.body
      const user = await User.create({
        first_name,
        last_name,
        email,
        password: 'google',
        role: role,
        is_verified: true,
        phone_number
      })
      let data
      if (user) {
        data = await app
          .service('authentication')
          .create({ password: 'google', email: email, strategy: 'local' })
      }

      return res.json({ message: 'Successful Sign Up!', status: 200, data: data })
    } catch (error) {
      res.json(error)
    }
  })

  app.post('/auth/google/sign-in', validator.body(schemas.google_signin), async (req: any, res: any) => {
    try {
      const data = await app
        .service('authentication')
        .create({ password: 'google', email: req.body.email, strategy: 'local' })
      return res.json({ status: 200, data })
    } catch (error) {
      res.json(error)
    }
  })

  app.post('/upload', async (req: any, res: any) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.')
    }

    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'asset-images'
    const file = req.files.file as fileUpload.UploadedFile

    try {
      const azureStorageService = new AzureStorageService()
      const fileUrl = await azureStorageService.uploadBuffer(containerName, file.data, file.name)
      res.send({ fileUrl })
    } catch (error) {
      logger.error(error)
      res.status(500).send('Error uploading file')
    }
  })
}
