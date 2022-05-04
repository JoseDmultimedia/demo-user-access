// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {getJsonSchemaRef, HttpErrors, post, requestBody} from '@loopback/rest';
import _ from 'lodash';
import {PermissionKeys} from '../authorization/permission-keys';
import {Credentials, UserRepository} from '../repositories';
import {User} from '../models';
import {BcryptHasher} from '../services/hash.password';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user.service';
import {validateCredentials} from '../services/validator.service';
import {PasswordHasherBindings, TokenServiceBindings, UserServiceBindings} from '../keys';
import {repository} from '@loopback/repository';

// import {inject} from '@loopback/core';


export class UserAdminController {
  constructor(

    @repository(UserRepository)
    public userRepository: UserRepository,

    // @inject('service.hasher')
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,

    // @inject('service.user.service')
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,

    // @inject('service.jwt.service')
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,

  ) {}

  @post('/users/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          schema: getJsonSchemaRef(User),
        },
      },
    },
  })
  async signup(@requestBody() userData: User) {
    validateCredentials(_.pick(userData, ['email', 'password']));

    console.log(userData);

    if (userData.rolId === 1){
      //userData.rolId = 1;
      userData.permissions = [PermissionKeys.adminRole];
      console.log('primer if')
    }else if (userData.rolId === 2){
      //userData.rolId  = 2;
      userData.permissions = [PermissionKeys.userRole];
      console.log('segundo if')
    }else{
      throw new HttpErrors.UnprocessableEntity('Invalid Role')
    }

    userData.password = await this.hasher.hashPassword(userData.password);
    const savedUser = await this.userRepository.create(userData);
    //delete savedUser.password;
    return savedUser;
  }


  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody() credentials: Credentials,
  ): Promise<{token: string}> {
    // make sure user exist,password should be valid
    const user = await this.userService.verifyCredentials(credentials);
    // console.log(user);
    const userProfile = await this.userService.convertToUserProfile(user);
    // console.log(userProfile);

    const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({token: token});
  }

}
