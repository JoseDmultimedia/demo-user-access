import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';

import { BcryptHasher } from './services/hash.password';
import {MyUserService} from './services/user.service';
import {JWTService} from './services/jwt-service';
import {PasswordHasherBindings, TokenServiceBindings, TokenServiceConstants, UserServiceBindings} from './keys';
import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import {JWTStrategy} from './authentication-strategies/jwt-strategy';
import {JWTAuthenticationComponent, SECURITY_SCHEME_SPEC} from '@loopback/authentication-jwt';
import { basicAuthorization } from './services';
// import KeycloakAuthorizationProvider from "./services/authorization-provider";
import {
  AuthorizationComponent,
  AuthorizationTags,
} from "@loopback/authorization";


export {ApplicationConfig};

export class DemoUserAccessApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Bind authentication component related elements
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
    this.component(AuthorizationComponent);


    // setup binding
    this.setupBinding();

    // Add security spec
    this.addSecuritySpec();

    console.log('antes de la estrategia');

    this.component(AuthenticationComponent);
    registerAuthenticationStrategy(this, JWTStrategy)

    console.log('despues de la estrategia');


    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };


  }

  setupBinding(): void {

    //This was binding when we don't have the key.ts to calls the bindings
    // this.bind('service.hasher').toClass(BcryptHasher);
    // this.bind('service.user.service').toClass(MyUserService);
    // this.bind('service.jwt.service').toClass(JWTService);

    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);
    this.bind(PasswordHasherBindings.ROUNDS).to(10)
    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(
        TokenServiceConstants.TOKEN_SECRET_VALUE)
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
        TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE);

        // this.bind("authorizationProviders.keycloak-authorization-providers")
        // .toProvider(KeycloakAuthorizationProvider)
        // .tag(AuthorizationTags.AUTHORIZER);


  }

  addSecuritySpec(): void {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'test application',
        version: '1.0.0',
      },
      paths: {},
      components: {securitySchemes: SECURITY_SCHEME_SPEC},
      security: [
        {
          // secure all endpoints with 'jwt'
          jwt: [],
        },
      ],
      servers: [{url: '/'}],
    });
  }

}
