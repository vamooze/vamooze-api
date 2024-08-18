import {  Roles } from '../interfaces/constants'
const roles = [
    { id: 1, name: 'Admin', slug: 'admin', description: 'Administrator role with full permissions' },
    { id: 2, name: 'Asset-Owner', slug: 'asset-owner', description: 'Regular user role with limited permissions' },
    { id: 3, name: 'Dispatch', slug: 'dispatch', description: 'Dispatch role with permissions to accept orders' },
    { id: 4, name: 'Super-admin', slug: Roles.SuperAdmin, description: 'Administrator role with full permissions' },
    { id: 5, name: 'Business-owner', slug: Roles.BusinessOwner, description: 'Business owner role with full permission over a business' },
    { id: 6, name: 'Guest-user', slug: Roles.GuestUser, description: 'Guest user who just need a delivery service to tranport their items' }
];

export default roles 