import {PermissionKeys} from './authorization/permission-keys';
import {securityId, UserProfile} from '@loopback/security';

export interface RequiredPermissions {
  required: PermissionKeys[];
}

export interface MyUserProfile {
  [securityId]: string,
  email?: string;
  name: string;
  rolId: number;
  roles: [];
}
