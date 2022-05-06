import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  Authorizer,
} from '@loopback/authorization';
import {Provider} from "@loopback/context";
import {securityId, UserProfile} from '@loopback/security';
import _ from 'lodash';
import { MyUserProfile } from '../types';

// Instance level authorizer
// Can be also registered as an authorizer, depends on users' need.
export async function basicAuthorization(
  authorizationCtx: AuthorizationContext,
  metadata: AuthorizationMetadata,
): Promise<AuthorizationDecision> {
  // No access if authorization details are missing
  let currentUser: UserProfile;
  if (authorizationCtx.principals.length > 0) {
    console.log('informacion que quiero' + JSON.stringify(authorizationCtx))
    const user = _.pick(authorizationCtx.principals[0], [
      'id',
      'email',
      'roles',
      'rolId'
    ]);
    console.log('jejejejejejejeje'+JSON.stringify(user))
    currentUser = {[securityId]: user.id, name: user.email, roles: user.roles, rolId:user.rolId};
    console.log(`CurrentUser ${JSON.stringify(currentUser)}`);
    console.log('user', authorizationCtx.roles);
  } else {
    console.log('Aqui1')
    return AuthorizationDecision.DENY;
  }

  if (!currentUser.roles) {
    console.log('Aqui2'+ !currentUser.roles)
    return AuthorizationDecision.DENY;
  }

  // Authorize everything that does not have a allowedRoles property
  if (!metadata.allowedRoles) {
    console.log('Aqui3')
    console.log('allowed', metadata.allowedRoles)
    return AuthorizationDecision.ALLOW;
  }

  let roleIsAllowed = false;
  for (const role of currentUser.roles) {
    if (metadata.allowedRoles!.includes(role)) {
      console.log('Aqui4')
      roleIsAllowed = true;
      break;
    }
  }

  if (!roleIsAllowed) {
    console.log('Aqui5')
    return AuthorizationDecision.DENY;
  }

  // Admin and support accounts bypass id verification
  // if (
  //   currentUser.roles.includes('admin') ||
  //   currentUser.roles.includes('support')
  // ) {
  //   return AuthorizationDecision.ALLOW;
  // }

  /**
   * Allow access only to model owners, using route as source of truth
   *
   * eg. @post('/users/{userId}/orders', ...) returns `userId` as args[0]
   */
  if (currentUser[securityId] === authorizationCtx.invocationContext.args[0]) {
    console.log('Aqui6')
    return AuthorizationDecision.ALLOW;
  }

  return AuthorizationDecision.DENY;
}
