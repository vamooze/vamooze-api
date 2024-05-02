import { roles } from './roles/roles'
import { user } from './users/users'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(roles)
  app.configure(user)
  app.post('/auth/logout', async (req: any, res: any) => {
    try {
      const USERS = app.service('users');
      const user = await USERS.find({query: { email: req.body.email }});
      console.log('====================================');
      console.log(user.data[0]);
      console.log('====================================');
      const updatedUser = await USERS.patch(user.data[0].id, { is_logged_in: false });
      app.service('users').emit('loggingOut', { updatedUser });
      return res.json({ status: 200, message: 'User logged out successfully' });
    } catch (error) {
      res.json(error);
    }
  });
  // All services will be registered here
}
