import { transactions } from './transactions/transactions'
import { wallet } from './wallet/wallet'
import { dispatch } from './dispatch/dispatch'
import { requests, tripEstimates } from './requests/requests'
import { businessDispatches } from './business-dispatches/business-dispatches'
import { businessSettings } from './business-settings/business-settings'
import { businessTypes } from './business-types/business-types'
import { business } from './business/business'
import { maintenance } from './maintenance/maintenance'
import { leasePreferences } from './lease-preferences/lease-preferences'
import { leases } from './leases/leases'
import { messages } from './messages/messages'
import { assets } from './assets/assets'
import { assetType } from './asset-type/asset-type'
import { roles } from './roles/roles'
import { user } from './users/users'
import axios from 'axios'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'
import { GeneralError, NotFound, Conflict } from '@feathersjs/errors'
import { formatPhoneNumber, sendEmail, sendSms, getOtp, isVerified } from '../helpers/functions'
import { Termii } from '../helpers/termii'
import bcrypt from 'bcryptjs'
import Joi from 'joi'
import { createValidator } from 'express-joi-validation'
import fileUpload from 'express-fileupload'
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage'
import AzureStorageService from './azureStorageService'
import storage from '../helpers/firebase'
import { logger } from '../logger'
import { OAuthTypes, Roles, TemplateName, TemplateType } from '../interfaces/constants'
import { constants } from '../helpers/constants'

import emailTemplates from '../helpers/emailTemplates'

const validator = createValidator({ passError: true, statusCode: 400 })




const phoneRegex = /^\+\d{7,15}$/

const joi_phone_number_validator = Joi.string().pattern(phoneRegex).required().messages({
  'string.pattern.base': 'Phone number must start with "+" followed by 7 to 15 digits',
  'any.required': 'Phone number is required'
})

const schemas = {
  forgotPassword: Joi.object().keys({
    email: Joi.string().required().email(),
    phoneNumber: joi_phone_number_validator
  }),
  resetPassword: Joi.object().keys({
    email: Joi.string().required().email(),
    otp: Joi.number().required().integer(),
    phoneNumber: joi_phone_number_validator,
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
    role: Joi.string()
      .required()
      .valid(...Object.values(Roles)),
    phone_number: Joi.string().optional().length(11)
  }),

  guestUserSignUp: Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    phone_number: joi_phone_number_validator,
    state: Joi.string().optional(),
    address: Joi.string().optional(),
    local_government_area: Joi.string().optional()
  }),

  in_house_manager_invite: Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().required().email(),
    role: Joi.string()
      .required()
      .valid(...Object.values(Roles)),
    phone_number: joi_phone_number_validator,
  }),

  google_signin: Joi.object().keys({
    email: Joi.string().required().email()
  }),
  logout: Joi.object().keys({
    email: Joi.string().required().email()
  }),
  resend_otp: Joi.object().keys({
    email: Joi.string().required().email()
  }),
  dispatch_signup: Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    phone_number: joi_phone_number_validator
  }),
  dispatch_login: Joi.object().keys({
    phone_number: joi_phone_number_validator
  }),
  complete_dispatch_login: Joi.object().keys({
    phone_number: joi_phone_number_validator,
    otp: Joi.number().required()
  })
}

export const inhouseInviteValidator = Joi.object().keys({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().required().email(),
  // role: Joi.string()
  //   .required()
  //   .valid(...Object.values(Roles)),
  phone_number: joi_phone_number_validator, // Assuming this is defined elsewhere
});

import { Response, Request } from 'express'

export const services = (app: Application) => {
  app.configure(transactions)
  app.configure(wallet)
  app.configure(tripEstimates)
  app.configure(dispatch)
  app.configure(requests)
  app.configure(businessDispatches)
  app.configure(businessSettings)
  app.configure(businessTypes)
  app.configure(business)
  app.configure(maintenance)
  app.configure(leasePreferences)
  app.configure(leases)
  app.configure(messages)
  // All services will be registered here
  app.configure(assets)
  app.configure(assetType)
  app.configure(roles)
  app.configure(user)

  const handleOtpDispatch = async (req: any, res: any) => {
    try {
      const User = app.service('users')
      const userDetails = await User.find({
        query: {
          phone_number: req.body.phone_number
        }
      })

      if (userDetails?.data.length === 0) {
        return res.status(404).json({
          status: 404,
          message: 'User not found'
        })
      }

      req.body.otp = getOtp()
      await app.service('users').patch(userDetails?.data[0]?.id, { otp: req.body.otp })

      const termii = new Termii()
      await termii.sendSMS(req.body.phone_number, `Your OTP is ${req.body.otp}`)

      res.json({
        status: 200,
        success: true,
        message: 'Otp sent successfully'
      })
    } catch (error) {
      res.json(error)
    }
  }

  app.post('/auth/logout', validator.body(schemas.logout), async (req: any, res: any) => {
    try {
      const USERS = app.service('users')
      const user = await USERS.find({ query: { email: req.body.email } })
      const updatedUser = await USERS.patch(user.data[0].id, {
        is_logged_in: false
      })
      app.service('users').emit('loggingOut', { updatedUser })
      return res.json({
        status: 200,
        message: 'User logged out successfully'
      })
    } catch (error) {
      res.json(error)
    }
  })

  app.post('/auth/user/verify', validator.body(schemas.verify), async (req: any, res: any) => {
    try {
      const User = app.service('users')
      const userDetails = await User.find({
        query: {
          otp: req.body.otp,
          email: req.body.email
        }
      })

      if (userDetails?.data.length === 0) {
        throw new NotFound('Ouch! User OTP or Email is not correct')
      }
      await User.patch(userDetails.data[0].id, {
        is_verified: true,
        is_logged_in: true,
        otp: 0
      })
      const data = await app.service('authentication').create({
        password: req.body.password,
        email: userDetails.data[0].email,
        strategy: 'local'
      })
      return res.json({
        message: 'User verification successful!',
        status: 200,
        data
      })
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
        if (phoneNumber) {
          const smsSent = await sendSms(phoneNumber, smdContentBody)
          if (smsSent === 200) {
            let otpData = {
              message: `OTP has been sent to your ${req.body.email ? 'email address' : 'your phone number'}`
            }
            res.json({ result: { ...otpData }, status: 200 })
          } else {
            res.json({
              error: { message: 'Something went wrong' },
              status: 400
            })
          }
        }
        // if(userDetails.data[0].email){
        //   await forgotPassword({content: '',to: userDetails.data[0].email, subject: 'Vamooze account password reset', type: 'html',
        //     firstName: userDetails.data[0].first_name, otp: otp });
        // }

        await User.patch(userDetails.data[0].id, { otp: otp })
      } catch (error: any) {
        res.json({ error: { message: error.message }, status: 400 })
      }
    }
  )

  app.post(
    '/otp-via-whatsapp',
    validator.body(schemas.dispatch_login),

    async (req: any, res: any) => {
      const { phone_number } = req.body

      try {
        const User = app.service('users')
        const userDetails = await User.find({
          query: {
            phone_number
          }
        })

        if (userDetails?.data.length === 0) {
          return res.status(404).json({
            status: 404,
            message: 'User not found'
          })
        }

        let otp

        if (!userDetails.data[0].otp) {
          otp = getOtp()

          await app.service('users').patch(userDetails?.data[0]?.id, { otp: req.body.otp })
        } else {
          otp = userDetails.data[0].otp
        }

        // Prepare the request to the external API
        const apiUrl = 'https://wa-notif.loystar.co/v1/app/otp'
        const headers = {
          api_key: constants.whatsAppApi.api_key, // Store in environment variables
          merchant_id: constants.whatsAppApi.merchant_id, // Store in environment variables
          phone_wid: constants.whatsAppApi.phone_wid // Store in environment variables
        }

        const data = {
          toPhoneNumber: phone_number,
          otp: otp
        }

        // Make the POST request using Axios
        const response = await axios.post(apiUrl, data, { headers })

        // If the request to the external API is successful
        if (response.status === 200) {
          return res.json({
            success: true,
            message: 'OTP sent successfully via WhatsApp',
            data: response.data
          })
        } else {
          return res.status(response.status).json({
            success: false,
            message: 'Failed to send OTP via WhatsApp',
            error: response.data
          })
        }
      } catch (error) {
        console.error('Error sending OTP:', error)
        return res.status(500).json({
          success: false,
          message: 'An error occurred while processing your request',
          //@ts-ignore
          error: error.message
        })
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

      if (userDetails.data.length === 0) {
        throw new NotFound('Ouch! User OTP is not correct')
      }
      await User.patch(userDetails.data[0].id, {
        password: req.body.password,
        otp: 0
      })
      return res.json({
        message: 'Password reset was successful',
        status: 200
      })
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

      let result = bcrypt.compareSync(req.body.oldPassword, <string>foundUser?.data[0]['password'])

      if (result) {
        await user.patch(foundUser.data[0]['id'], {
          password: req.body.newPassword
        })
        return res.json({
          message: 'Password Changed Successfully',
          status: 200
        })
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
      let userDetails = await User.find({ query: { email: req.body.email } })
      if (userDetails.data.length > 0) {
        throw new NotFound('User already registered')
      }
      const roleData = await app.service('roles').find({ query: { $limit: 1, slug: req.body.role } })
      if (roleData?.data?.length === 0) {
        throw new NotFound('Role not found')
      }

      const { first_name, last_name, email, phone_number } = req.body
      const user = await User.create({
        first_name,
        last_name,
        email,
        password: OAuthTypes.Google,
        role: roleData.data[0].id,
        is_verified: true,
        phone_number
      })
      let data
      if (user) {
        data = await app.service('authentication').create({
          password: OAuthTypes.Google,
          email: email,
          strategy: 'local'
        })
      }

      return res.json({
        message: 'Successful Sign Up!',
        status: 200,
        data: data
      })
    } catch (error) {
      res.status(400).json(error)
    }
  })

  app.post('/auth/google/sign-in', validator.body(schemas.google_signin), async (req: any, res: any) => {
    try {
      const data = await app.service('authentication').create({
        password: OAuthTypes.Google,
        email: req.body.email,
        strategy: 'local'
      })
      return res.json({ status: 200, data })
    } catch (error) {
      res.json(error)
    }
  })

  app.post('/upload', async (req: any, res: any) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.')
    }

    // const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'asset-images'
    const file = req.files.file as fileUpload.UploadedFile
    const storageRef = ref(storage, `asset-images/${file.name}`)

    try {
      // const azureStorageService = new AzureStorageService()
      // const fileUrl = await azureStorageService.uploadBuffer(containerName, file.data, file.name)
      // res.send({ fileUrl })
      await uploadBytes(storageRef, file.data)
      const fileUrl = await getDownloadURL(storageRef)
      res.send({ fileUrl })
    } catch (error) {
      logger.error(error)
      res.status(500).send('Error uploading file')
    }
  })

  app.post('/resend-otp', validator.body(schemas.resend_otp), async (req: Request, res: Response) => {
    let User = app.service('users')
    let userDetails = await User.find({
      query: {
        email: req.body.email
      }
    })

    if (userDetails.data.length === 0) {
      throw new NotFound('User not found')
    }

    if (!userDetails.data[0].otp) {
      throw new NotFound('OTP is empty')
    }

    sendEmail({
      toEmail: userDetails?.data[0].email,
      subject: 'Here is your otp',
      templateData: emailTemplates.otp(userDetails.data[0].otp),
      receiptName: `${userDetails.data[0].first_name} ${userDetails.data[0].last_name}`
    })

    let otpData = {
      message: `OTP has been sent to your ${req.body.email ? 'email address' : 'your phone number'}`
    }
    res.json({ result: { ...otpData }, status: 200 })
  })

  app.post(
    '/auth/dispatch/signup',
    validator.body(schemas.dispatch_signup),
    async (req: any, res: any, next: any) => {
      try {
        const user = await app.service('users').find({ query: { phone_number: req.body.phone_number } })

        if (user?.data?.length > 0) {
          const simplifiedUserData = {
            id: user.data[0].id,
            first_name: user.data[0].first_name,
            last_name: user.data[0].last_name,
            phone_number: user.data[0].phone_number,
            is_logged_in: user.data[0].is_logged_in,
            is_verified: user.data[0].is_verified
          }
          return res.status(409).json({
            status: 409,
            message: 'User with this phone number already exists',
            data: simplifiedUserData
          })
        }

        const role = await app.service('roles').find({ query: { $limit: 1, slug: Roles.Dispatch } })
        if (role?.data?.length === 0) {
          return res.status(404).json({
            status: 404,
            message: 'Role does not exist'
          })
        }
        req.body.role = role?.data[0]?.id
        req.body.otp = getOtp()
        req.body.password = Roles.Dispatch
        const result = await app.service('users').create(req.body)

        const termii = new Termii()
        await termii.sendSMS(req.body.phone_number, `Your OTP is ${req.body.otp}`)

        res.json(result)
      } catch (error: any) {
        logger.error({
          message: error.message,
          stack: error.stack,
          phone_number: req.body.phone_number
        })
        next(error)
      }
    }
  )

  app.post('/auth/dispatch/initiate-login', validator.body(schemas.dispatch_login), handleOtpDispatch)

  app.post(
    '/auth/dispatch/resend-otp',
    validator.body(schemas.dispatch_login),
    async (req: any, res: any) => {
      const { phone_number } = req.body

      try {
        const User = app.service('users')
        const userDetails = await User.find({
          query: {
            phone_number
          }
        })

        if (userDetails?.data.length === 0) {
          return res.status(404).json({
            status: 404,
            message: 'User not found'
          })
        }

        let otp

        if (!userDetails.data[0].otp) {
          otp = getOtp()

          await app.service('users').patch(userDetails?.data[0]?.id, { otp: req.body.otp })
        } else {
          otp = userDetails.data[0].otp
        }

        // Prepare the request to the external API
        const apiUrl = 'https://wa-notif.loystar.co/v1/app/otp'
        const headers = {
          api_key: constants.whatsAppApi.api_key, // Store in environment variables
          merchant_id: constants.whatsAppApi.merchant_id, // Store in environment variables
          phone_wid: constants.whatsAppApi.phone_wid // Store in environment variables
        }

        const data = {
          toPhoneNumber: phone_number,
          otp: otp
        }

        // Make the POST request using Axios
        const response = await axios.post(apiUrl, data, { headers })

        // If the request to the external API is successful
        if (response.status === 200) {
          return res.json({
            success: true,
            message: 'OTP sent successfully via WhatsApp',
            data: response.data
          })
        } else {
          return res.status(response.status).json({
            success: false,
            message: 'Failed to send OTP via WhatsApp',
            error: response.data
          })
        }
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'An error occurred while processing your request',
          //@ts-ignore
          error: error.message
        })
      }
    }
  )

  app.post(
    '/auth/dispatch/complete-login',
    validator.body(schemas.complete_dispatch_login),
    async (req: any, res: any) => {
      try {
        const User = app.service('users')

        // Check if user exists
        const user = await User.find({
          query: {
            phone_number: req.body.phone_number
          }
        })

        if (user?.data.length === 0) {
          return res.status(404).json({
            status: 404,
            message: 'User not found'
          })
        }

        // Check OTP correctness
        if (user.data[0].otp !== req.body.otp) {
          return res.status(400).json({
            status: 400,
            message: 'Incorrect OTP'
          })
        }

        // Update user status
        await User.patch(user.data[0].id, {
          is_verified: true,
          is_logged_in: true,
          otp: 0
        })

        // Create authentication
        const data = await app.service('authentication').create({
          password: Roles.Dispatch,
          phone_number: req.body.phone_number,
          strategy: 'phone'
        })

        return res.status(200).json({
          status: 200,
          success: true,
          message: 'Login successful',
          data
        })
      } catch (error: any) {
        return res.status(500).json({
          status: 500,
          message: error.message
        })
      }
    }
  )

  app.post(
    '/auth/guest-users/sign-up',
    validator.body(schemas.guestUserSignUp),
    async (req: any, res: any, next: any) => {
      try {
        const user = await app.service('users').find({ query: { email: req.body.email } })

        if (user?.data?.length > 0) {
          throw new Conflict('User with this email already exists')
        }
        const role = await app.service('roles').find({ query: { $limit: 1, slug: Roles.GuestUser } })
        if (role?.data?.length === 0) {
          throw new NotFound('Role not found')
        }
        req.body.role = role?.data[0]?.id
        req.body.otp = getOtp()
        const result = await app.service('users').create(req.body)
        res.json(result)
      } catch (error: any) {
        logger.error({
          message: error.message,
          stack: error.stack,
          email: req.body.email
        })
        next(error)
      }
    }
  )

  // app.post(
  //   '/inhouse-invite',
  //   validator.body(schemas.in_house_manager_invite),
  //   async (req: any, res: any, next: any) => {
  //     try {
  //       const user = await app.service('users').find({ query: { email: req.body.email } })

  //       if (user?.data?.length > 0) {
  //         throw new Conflict('User with this email already exists')
  //       }
  //       const role = await app.service('roles').find({ query: { $limit: 1, slug: Roles.GuestUser } })
  //       if (role?.data?.length === 0) {
  //         throw new NotFound('Role not found')
  //       }
  //       req.body.role = role?.data[0]?.id
  //       req.body.otp = getOtp()
  //       const result = await app.service('users').create(req.body)
  //       res.json(result)
  //     } catch (error: any) {
  //       return res.status(400).json({
  //         status: 400,
  //         message: error.message
  //       })
  //     }
  //   }
  // )

  
}
