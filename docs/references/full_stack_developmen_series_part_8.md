# User Authentication and JWT Support in NestJS
If you've been following along in this series, you'll know that the codebase provides a basic to-do tracker and not much else. However these posts are meant to address the most common aspects of modern, full-stack applications, and user authentication is a _major_ part of public-facing web apps. In this article we'll accomplish the following:

*   Add JWT support to most of the API endpoints
*   Add a `user` table to our database
*   Define a one-to-many relationship between to-do items and a user
*   Update Swagger documentation with JWT support
*   Add E2E tests to cover authenticated API calls

Other posts in this series:

*   [An Introduction](https://thefullstack.engineer/full-stack-development-series-an-introduction/)
*   Part 1: [Getting Started With Nx, Angular, and NestJS](https://thefullstack.engineer/full-stack-development-series-part-1-getting-started-with-nx-angular-and-nestjs/)
*   Part 2: [Creating a REST API](https://thefullstack.engineer/full-stack-development-series-part-2-creating-a-rest-api-with-nestjs/)
*   Part 3: [Connecting Angular to a REST API](https://thefullstack.engineer/full-stack-development-series-part-3-connect-angular-with-nestjs-api)
*   Part 4: [Data Persistence with TypeORM and NestJS](https://thefullstack.engineer/full-stack-development-series-part-4-data-persistence)
*   Part 5: [Design Systems and Angular Component Development with Storybook](https://thefullstack.engineer/full-stack-development-series-part-5-angular-component-development-with-storybook)
*   Part 6: [Application Deployment and CI/CD](https://thefullstack.engineer/full-stack-development-series-part-6-application-deployment-and-ci-cd)
*   Part 7: [Unit and Integration Testing](https://thefullstack.engineer/full-stack-development-series-part-7-unit-and-integration-testing)
*   Part 8: [User Authentication and JWT Support in NestJS](https://thefullstack.engineer/full-stack-development-series-user-authentication) (this post)

If you want to skip ahead to the code, you can checkout out the repository: [wgd3/full-stack-todo@part-08](https://github.com/wgd3/full-stack-todo/tree/part-08?ref=thefullstack.engineer)

Before we even begin to think about our database or API endpoints, we should consider what a `User` object should look like and make that interface available to any application or library in the repository:

```
import { ITodo } from './todo.interface';

export interface IUser {
  /** Randomly generated primary key (UUID) by the database */
  id: string;
  
  /**
   * We'll just use an email as a user identifier
   * instead of worrying about a username, or a 
   * formal first/last name.
   */
  email: string;
  
  /**
   * This is **NOT** the user's actual password! Instead,
   * this property will contain a hash of the password
   * specified when the user signed up. An API should 
   * never be storing the actual password, encrypted or
   * not.
   */
  password: string;
  
  /**
   * A single user will be associated with zero, one, or more
   * to-do items, which means this field should never be
   * `undefined`. The object will always contain an array, 
   * even if empty.
   */
  todos: ITodo[];
}

export type ICreateUser = Pick<IUser, 'email' | 'password'>;
export type IUpdateUser = Partial<Omit<IUser, 'id'>>;
export type IUpsertUser = IUser;

/**
 * this was added so that we can consistently know which User properties
 * will be exposed in API payloads
 */
export type IPublicUserData = Omit<IUser, 'password'>;


```


libs/shared/domain/src/lib/models/user.interface.ts

The `ITodo` interface will require a small update to reflect this new one-to-many relationship:

```
export interface ITodo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  
  /**
   * These fields are marked as optional, as there
   * will be situations where the user is not returned
   * as part of the response payload. 
   */
  user?: IUser;
  user_id?: string;
}
```


libs/shared/domain/src/lib/models/todo.interface.ts

Create New Libraries
--------------------

With our data structures established, it's time to add a new Nest module with a collection of `/auth` endpoints. Since the commands are almost identical, I went ahead and created the User module as well:

```
# controller for /auth endpoints
$ npx nx generate @nrwl/nest:library FeatureAuth \
--controller \
--directory=libs/server \
--importPath=@fst/server/feature-auth \
--service \
--strict \
--tags=type:feature,scope:server

# controller for /users endpoint
npx nx generate @nrwl/nest:library FeatureUser \
--controller \
--directory=libs/server \
--importPath=@fst/server/feature-user \ 
--service \
--strict \
--tags=type:feature,scope:server
```


I also took this opportunity to rename the `server-data-access-todo` library to `server-data-access`. If our application was larger I would advocate for dedicated `data-access` libraries to separate concerns, but for now I feel comfortable grouping our (soon to be created) services together.

Instead of worrying about manually updating imports and moving files, Nx provides a generator that handles this "migration" for us:

```
$ npx nx generate @nrwl/workspace:move server/data-access \
--projectName=server-data-access-todo \
--importPath=@fst/server/data-access
```


In our newly-renamed data access library we'll add an ORM entity schema for our User objects:

```
import { IUser } from '@fst/shared/domain';
import { EntitySchema } from 'typeorm';

export const UserEntitySchema = new EntitySchema<IUser>({
  name: 'user',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    email: {
      type: String,
      nullable: false,
      // make sure we don't have someone signing up with
      // the same email multiple times!
      unique: true,
    },
    password: {
      type: String,
      nullable: false,
    },
  },
  relations: {
    todos: {
      // _one_ user has _many_ to-do items
      type: 'one-to-many',
      // name of the database table we're associating with
      target: 'todo',
      // if a user is removed, it's to-do items should be
      // removed as well
      cascade: true,
      // name of the property on the to-do side that relates
      // back to this user
      inverseSide: 'user',
    },
  },
});

```


libs/server/data-access/src/lib/database/schemas/user.entity-schema.ts

We'll have to add a `relations` key to the `TodoEntitySchema` to match the definition above:

```
  relations: {
    user: {
      type: 'many-to-one',
      target: 'user',
      // column name in this table where the foreign key
      // of the associated table is referenced
      joinColumn: {
        name: 'user_id',
      },
      inverseSide: 'todos',
    },
  },
  // adds a constraint to the table that ensures each
  // userID + title combination is unique
  uniques: [
    {
      name: 'UNIQUE_TITLE_USER',
      columns: ['title', 'user.id'],
    },
  ],
```


libs/server/data-access/src/lib/database/schemas/to-do.entity-schema.ts

Not too difficult, right? Our repository has an established pattern for file names and locations, so adding elements like interfaces and entities is straightforward. There's a problem now though - our to-do DTO is out of sync with our interface, and a user DTO is needed as well. As our repository grows, it's important to keep in mind which libraries rely on others, and since these DTOs will be referenced in multiple libraries I migrated DTOs to the recently-renamed `server-data-access` library.

Here's the DTO I came up with for our user objects:

```
export class UserResponseDto implements IPublicUserData {
  @ApiProperty({
    type: String,
    readOnly: true,
    example: 'DCA76BCC-F6CD-4211-A9F5-CD4E24381EC8',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({
    type: String,
    example: `[email protected]`,
    readOnly: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    type: TodoDto,
    isArray: true,
    readOnly: true,
    example: [],
  })
  @IsArray()
  todos!: ITodo[];
}

export class CreateUserDto implements ICreateUser {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Password1!',
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minNumbers: 1,
      minUppercase: 1,
      minSymbols: 1,
    },
    {
      message: `Password is not strong enough. Must contain: 8 characters, 1 number, 1 uppercase letter, 1 symbol`,
    }
  )
  password!: string;

  @ApiProperty({
    type: String,
    example: `[email protected]`,
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
```


libs/server/data-access/src/lib/dtos/user.dto.ts

⚠️

Originally at this point in time, the `user` and `user_id` properties of `ITodo` were not optional - my logic was that a todo requires a user, so why make it optional? As this code was developed I decided to make them optional so that they were not required properties in the to-do DTOs. Any API request that involves to-do entities will be "protected" with a JWT in the request header, and our service will (soon) read the user ID from the token before interacting with the database. The service will inject the user ID as necessary on behalf of the user.

Next we need to focus on implementing authentication. Following the [NestJS docs](https://docs.nestjs.com/security/authentication?ref=thefullstack.engineer), there are a few dependencies we'll need to install:

```
$ npm i --save @nestjs/passport passport passport-jwt @nestjs/jwt bcrypt
$ npm i -D @types/passport-jwt @types/bcrypt
```


If you'll recall, we used the `--service` flag when generating our UserModule, and we can now update that service with some basic methods. We'll follow the same pattern as the TodoService: injecting a `Repository` reference in the constructor, and use async/await calls to interact with the database layer:

```
import * as bcrypt from 'bcrypt';

@Injectable()
export class ServerFeatureUserService {
  constructor(
    @InjectRepository(UserEntitySchema)
    private userRepository: Repository<IUser>
  ) {}

  async getOne(id: string): Promise<IUser> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      /**
       * We could use `findOneOrFail()` from TypeORM, but
       * instead of a TypeORM exception I prefer to throw
       * native NestJS exceptions when possible
       */
      throw new NotFoundException(`User could not be found`);
    }
    return user;
  }

  /**
   * TODO - make number of rounds configurable via ConfigService!
   */
  async create(user: ICreateUser): Promise<IUser> {
    const { email, password } = user;
    // set the payload password to a _hash_ of the originally
    // supplied password!
    user.password = await bcrypt.hash(password, 10);
    const newUser = await this.userRepository.save({ email, password });
    return newUser;
  }
}
```


libs/server/feature-user/src/lib/server-feature-user.service.ts

Once a user is created, they'll need to be sent [access tokens](https://auth0.com/docs/secure/tokens/access-tokens?ref=thefullstack.engineer) to make authenticated API requests. The `JwtService` from `@nestjs/jwt` will do this for us in the AuthSerivce:

```
@Injectable()
export class ServerFeatureAuthService {
  private readonly logger = new Logger(ServerFeatureAuthService.name);

  constructor(
    @Inject(forwardRef(() => ServerFeatureUserService))
    private userService: ServerFeatureUserService,
    private jwtService: JwtService
  ) {}

  async validateUser(
    email: string,
    password: string
  ): Promise<IPublicUserData | null> {
    const user = await this.userService.getOneByEmail(email);
    if (await bcrypt.compare(password, user.password)) {
      this.logger.debug(`User '${email}' authenticated successfully`);
      const { password, ...publicUserData } = user;
      return publicUserData;
    }
    return null;
  }

  async generateAccessToken(user: IPublicUserData) {
    const payload = {
      email: user.email,
      sub: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```


libs/server/feature-auth/src/lib/server-feature-auth.service.ts

⚠️

In the constructor, you'll see the use `forwardRef` to get around [circular dependencies](https://docs.nestjs.com/fundamentals/circular-dependency?ref=thefullstack.engineer#circular-dependency). I think a case could be made to refactor our User and Auth services into the `server-data-access` library, and that will most likely happen soon. I left this code as-is for now to bring awareness to the circular dependency issue, and show how it is "remedied".

I was a bit bothered with the code for the AuthService - the method `generateAccessToken` was missing a return signature. I try to ensure that all inter-application data is defined in an interface, so I added interfaces not only for the token response, but also for the _content_ of the decoded JWT.

```
export interface ITokenResponse {
  access_token: string;
}

```


libs/shared/domain/src/lib/models/token-response.interface.ts

```
export interface IAccessTokenPayload {
  email: string;

  /**
   * user's ID will be used as the subject
   */
  sub: string;
}

```


libs/shared/domain/src/lib/models/jwt-payload.interface.ts

💡

Why bother with interfaces that are so small? Well if you haven't heard me say it enough yet: _shared data structures!!_  
Additionally, it's likely that more data will be added to a user's `access_token` or a `refresh_token` will be added. Premature optimization is a weakness of mine, but I believe these interfaces are worth it at this time.

Now we can explicitly define the return signature for `generateAccessToken`:

```
  async generateAccessToken(user: IPublicUserData): Promise<ITokenResponse> {
    const payload: IAccessTokenPayload = {
      email: user.email,
      sub: user.id,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
```


libs/server/feature-auth/src/lib/server-feature-auth.service.ts

The `ServerFeatureAuthModule` is going to contain the majority of code related to user auth, which makes it a fitting place for the `JwtModule` registration:

```
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn:
            config.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') || '600s',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ServerFeatureAuthController],
  providers: [ServerFeatureAuthService],
  exports: [ServerFeatureAuthService],
})
export class ServerFeatureAuthModule {}
```


libs/server/feature-auth/src/lib/server-feature-auth.module.ts

In the above code block I've reference 2 new environment variables:

*   `JWT_SECRET` should be a long, secure string that is not shared anywhere or checked into Git. In deployment environments (such as Render!) there is often a "secrets" or environment variable management page where you can define these as well.
*   `JWT_ACCESS_TOKEN_EXPIRES_IN` is also a string. This module can interpret various time expressions such as `10m` and `3600s` (read more about the configuration options [here](https://github.com/auth0/node-jsonwebtoken?ref=thefullstack.engineer#usage))

If you remember the list of packages that were installed earlier, [passport](https://github.com/jaredhanson/passport?ref=thefullstack.engineer) is used quite heavily for our authentication needs. Passport introduces the concept of [strategies](https://www.passportjs.org/concepts/authentication/strategies/?ref=thefullstack.engineer) for "drag-n-drop" authentication mechanisms. The homepage for Passport includes a large list of the strategies available, but we're going to stay focused on `passport-jwt` here.

We'll create a simple extension of the strategy provided by `passport-jwt`:

```
$ npx nx generate @nrwl/nest:service JwtStrategy \
--project=server-feature-auth \
--directory=lib \
--flat
```


```
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  /**
   * Simple method for converting an access token into data included in
   * a Request object.
   *
   * From https://docs.nestjs.com:
   * For the jwt-strategy, Passport first verifies the JWT's signature and
   * decodes the JSON. It then invokes our validate() method passing the
   * decoded JSON as its single parameter. Based on the way JWT signing
   * works, we're guaranteed that we're receiving a valid token that we
   * have previously signed and issued to a valid user.
   *
   * As a result of all this, our response to the validate() callback
   * is trivial: we simply return an object containing the userId and
   * username properties. Recall again that Passport will build a user
   * object based on the return value of our validate() method, and
   * attach it as a property on the Request object.
   */
  async validate(
    payload: Pick<IAccessTokenPayload, 'sub'> &
      Record<string, string | number | boolean | object>
  ) {
    const { sub, ...rest } = payload;
    return { userId: sub, ...rest };
  }
}
```


libs/server/feature-auth/src/lib/jwt-strategy.service.ts

We can now add `JwtStrategy` to the list of `providers` in the `ServerFeatureAuthModule` and everything will be ready to go!

#### Surprise - tests have broken!

Since the beginning of this post, there have been at least 7 services/controllers added, as well as numerous other classes and interfaces added. It was at this point that I ran `nx run-many --target=test --all` and sure enough `server-feature-user` and `server-feature-auth` failed.

I didn't document the code I added for tests at this point, because it was just enough to prevent the tests from failing. The repository tag for this post will include the whole suite of unit and integration tests for these new libraries. A few things to note however:

*   Factories in `lib/shared/util-testing` had to be updated to support the User <-> Todo relationship. This broke a few other test suites that rely on those factories, and needed to be updated with user IDs. You can check out this [commit](https://github.com/wgd3/full-stack-todo/commit/78b546eeb715d9e715545d557a632003be0674a8?ref=thefullstack.engineer) to see how all tests were remedied.
*   Tests for the new libraries failed immediately because I had started writing functional code and injecting dependencies without reconciling the test suites. The commit that fixed all the new tests is [here](https://github.com/wgd3/full-stack-todo/commit/67cb477f200b3d404032b836310abeee152a11ce?ref=thefullstack.engineer)

⚠️

I tried running the application at this point to start developing endpoints, but hit an odd error where Jest and test code was being bundled with the development server and was preventing the API from running. Read about that and it's resolution in the [Speed Bumps](#speed-bumps) section

Adding User Endpoints
---------------------

Given that we've significantly reduced our code coverage percentage, we're going to write some unit tests in conjunction with the `/user` endpoints to verify functionality. First we'll create a POST endpoint to create a new user, and that endpoint should receive and validate a `CreateUserDto` object:

```
  @Post('')
  async createUser(@Body() userData: CreateUserDto): Promise<IPublicUserData> {
    const { id, email } = await this.serverFeatureUserService.create(userData);
    return {
      id,
      email,
      todos: [],
    };
  }
```


libs/server/feature-user/src/lib/server-feature-user.controller.ts

👉

`create` returns the full user, so we strip out the hashed password from the return value. Since the user is new, we can hard code `todos` to an empty array as well.

Next, a test to make sure the controller returns a "sanitized" payload even though the service's method returns a full user object:

```
  it('should create a user', async () => {
    const user = createMockUser();
    const publicUser: IPublicUserData = {
      id: user.id,
      email: user.email,
      todos: [],
    };
    jest.spyOn(service, 'create').mockReturnValue(Promise.resolve(user));
    const res = await controller.createUser({
      email: user.email,
      password: user.password,
    });
    expect(res).toStrictEqual(publicUser);
  });
```


libs/server/feature-user/src/lib/server-feature-user.controller.spec.ts

Note that the above does **not** test the DTO's validation, just the method itself. DTO validation is handled by the `ValidationPipe` outside the scope of the test - therefore that belongs in the integration tests.

```
# test user sign up
$ http -b localhost:3333/api/v1/users [email protected] password="Password1\!"
{
    "email": "[email protected]",
    "id": "98dd8297-af15-43bb-a767-a6c33324e33a",
    "todos": []
}
```


Adding Auth Endpoints
---------------------

Repeating the process for the POST endpoint that was just created, let's add (and test) that our new users can log in and retrieve access tokens:

```
  @Get('login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  async login(
    @Body() { email, password }: LoginRequestDto
  ): Promise<ITokenResponse> {
    const user = await this.serverFeatureAuthService.validateUser(
      email,
      password
    );
    if (!user) {
      throw new BadRequestException(`Email or password is invalid`);
    }
    return await this.serverFeatureAuthService.generateAccessToken(user);
  }
```


libs/server/feature-auth/src/lib/server-feature-auth.controller.ts

```
  it('should login a user', async () => {
    const res = await controller.login({
      email: mockUser.email,
      password: mockUserUnhashedPassword,
    });
    expect(res.access_token).toBeDefined();
    expect(typeof res.access_token).toBe('string');
  });
```


libs/server/feature-auth/src/lib/server-feature-auth.controller.spec.ts

```
# test token generation
$ http -b localhost:3333/api/v1/auth/login [email protected] password="Password1\!"
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IndhbGxhY2VAdGhlZnVsbHN0YWNrLmVuZ2luZWVyIiwic3ViIjoiOThkZDgyOTctYWYxNS00M2JiLWE3NjctYTZjMzMzMjRlMzNhIiwiaWF0IjoxNjc5NTAwNjIwLCJleHAiOjE2Nzk1MDEyMjB9.G0UqHUfsHtuSZurjhwnOhWRqZ0dTZaCSDrVUNKKLVR4"
}

# parsed output from jwt.io
{
  "email": "[email protected]",
  "sub": "98dd8297-af15-43bb-a767-a6c33324e33a",
  "iat": 1679500719,
  "exp": 1679501319
}
```


Bearer Auth Integration
-----------------------

We're _almost_ there. Our API supports user creation and login requests, but we need to add a few things to **enforce** our JWT strategy. I started by copy/pasting some code that I've used for years, and originated in some StackOverflow post I can no longer find. The following creates a [custom parameter decorator](https://docs.nestjs.com/custom-decorators?ref=thefullstack.engineer#param-decorators) that gives us quick access to the `req.user` property of a request:

```
/**
 * Returns all user data stored in the user object of a Request
 */
export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Logger.debug(JSON.stringify(request.user));
    return request.user;
  }
);

/**
 * Returns the User ID stored in the user object of a Request
 *
 * @example getTodos(@ReqUserId() userId: string) {}
 */
export const ReqUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.userId as string;
  }
);
```


libs/server/util/src/lib/decorators/req-user.decorator.ts

👉

The above code is possible thanks to our `JwtStrategy`. The strategy starts by attempting to pull the JWT from the headers of an incoming request. If the `Authorization` header is present, and the token is valid, then Passport modifies the incoming request and adds a `user` property to it. 

To show this in use, check out the `getUser` method in the UserController. It reads the user ID from the JWT, compares it the to user ID requested in the URL, and throws a 404 if they don't match (don't want users reading each other's data!).

```
  @Get(':id')
  @ApiBearerAuth()  
  async getUser(
    @ReqUserId() reqUserId: string,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<IPublicUserData> {
    if (reqUserId !== id) {
      throw new NotFoundException();
    }
    const { password, ...user } = await this.serverFeatureUserService.getOne(
      id
    );
    return user;
  }
```


libs/server/feature-user/src/lib/server-feature-user.controller.ts

Once again quoting the [NestJS documentation](https://docs.nestjs.com/security/authentication?ref=thefullstack.engineer#enable-authentication-globally), we're going to add a custom Guard at the application-level so that it applies to the whole app:

```
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { SKIP_AUTH_KEY } from '../skip-auth';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(ctx: ExecutionContext) {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    return skipAuth ?? super.canActivate(ctx);
  }
}

```


libs/server/util/src/lib/guards/jwt.auth-guard.ts

```
  @Module({
    ...
    providers: [
      {
        provide: APP_GUARD,
        useClass: JwtAuthGuard,
      },
    ]
  })
  export class AppModule {}
```


apps/server/src/app/app.module.ts

What's a `Reflector` and what is it doing in the auth Guard? NestJS [provides this](https://docs.nestjs.com/fundamentals/execution-context?ref=thefullstack.engineer#reflection-and-metadata) in order to manipulate and access the execution context of a request. In the above code, we're looking for a bit of metadata that indicates whether or not we need to validate tokens on for a given request. The metadata in question gets set by another custom decorator:

```
import { SetMetadata } from '@nestjs/common';

export const SKIP_AUTH_KEY = 'skipAuth';

/**
 * Used in conjunction with the JWT Auth Guard.
 */
export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true);

```


libs/server/util/src/lib/skip-auth.ts

This decorator will be used on any and all endpoints we deem to be "public", such as the POST request to create a new user:

```
  @Post('')
  @SkipAuth()
  async createUser(@Body() userData: CreateUserDto): Promise<IPublicUserData> {
    const { id, email } = await this.serverFeatureUserService.create(userData);
    return {
      id,
      email,
      todos: [],
    };
  }
```


libs/server/feature-user/src/lib/server-feature-user.controller.ts

One more bit of "enforcement" that I wanted to address concerns the use of the `ApiBearerAuth()` decorator on both routes and controllers. There's a distinct difference in the two: if a _controller_ is decorated, then all of it's routes will default to requiring valid tokens.

```
@Controller({ path: 'todos', version: '1' })
@ApiTags('To-Do')
@ApiBearerAuth()
export class ServerFeatureTodoController {}
```


libs/server/feature-todo/src/lib/server-feature-todo.controller.ts

When added to a route however, only that specific route will require a valid token:

```
  /**
   * In the UserController the POST endpoint for creating
   * a user should not require a token, however the routes
   * that return user data should require one.
   */
  @Get(':id')
  @ApiBearerAuth()
  async getUser(
    @ReqUserId() reqUserId: string,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<IPublicUserData> {
    ...
  }
```


libs/server/feature-user/src/lib/server-feature-user.controller.ts

We're also going to add one line to the `main.ts` file while will tell the Swagger documentation to provide authentication options in it's UI:

```
  const config = new DocumentBuilder()
    .setTitle(`Full Stack To-Do REST API`)
    .setVersion('1.0')
    .addBearerAuth()  // <-- add this!
    .build();
```


You'll now be able to paste tokens into this prompt, and Swagger will automatically add the `Authorization` header to each request.

![](https://thefullstack.engineer/content/images/2023/04/Screen-Shot-2023-04-03-at-1.17.40-PM.png)

Updating To-Do Endpoints to Enforce Authentication
--------------------------------------------------

A large update was made at this time that covered all of the `/todo` routes: they all needed to use the `@ReqUserId` decoration to retrieve an ID from the request's `user` object, and _every_ method in the `TodoService` needed to be update with support for this variable.

For example, the flow for retrieving a specific to-do item looks like this:

```
  @Get('')
  @ApiOkResponse({
    type: TodoDto,
    isArray: true,
  })
  @ApiOperation({
    summary: 'Returns all to-do items',
    tags: ['todos'],
  })
  async getAll(@ReqUserId() userId: string): Promise<ITodo[]> {
    return this.serverFeatureTodoService.getAll(userId);
  }
```


libs/server/feature-todo/src/lib/server-feature-todo.controller.ts

```
  async getOne(userId: string, id: string): Promise<ITodo> {
    const todo = await this.todoRepository.findOneBy({
      id,
      user: { id: userId },
    });
    if (!todo) {
      throw new NotFoundException(`To-do could not be found!`);
    }
    return todo;
  }
```


libs/server/feature-todo/src/lib/server-feature-todo.service.ts

I think it would be a bit repetitive to see all the routes/services that were changed to reflect this requirement, but the final code for this tag includes all the necessary updates.

Updating E2E Tests with Authentication
--------------------------------------

There has been a large amount of code added, and like I mentioned previously should be mindful of the code coverage percentage. I've shown some of the unit tests that focused on controllers, now it's time to look at the entire request-response cycle. Before I wrote any tests, I knew that we would need at least 1 test user as well as a valid JWT for that user, so I added this to my `beforeAll()` code block:

```
    /////////////////////////////////////////////
    // Create a user that can be used for the
    // whole test suite
    /////////////////////////////////////////////
    createdUser = await request
      .default(app.getHttpServer())
      .post(`${baseUrl}${userUrl}`)
      .set('Content-type', 'application/json')
      .send({ email: USER_EMAIL, password: USER_UNHASHED_PASSWORD })
      .expect(201)
      .expect('Content-Type', /json/)
      .then((res) => {
        return res.body as IPublicUserData;
      });

    /////////////////////////////////////////////
    // Create a valid, signed access token to be
    // used with all API calls
    /////////////////////////////////////////////
    access_token = await request
      .default(app.getHttpServer())
      .post(`${baseUrl}${authUrl}/login`)
      .send({ email: USER_EMAIL, password: USER_UNHASHED_PASSWORD })
      .expect(200)
      .expect('Content-Type', /json/)
      .then((resp) => (resp.body as ITokenResponse).access_token);
```


apps/server-e2e/src/server/todo-controller.spec.ts

I used the same `request`/`expect` pattern for all the tests in this suite, and used nested `describe` block to group the various HTTP verbs:

```
 PASS   server-e2e  apps/server-e2e/src/server/todo-controller.spec.ts
  ServerFeatureTodoController E2E
    GET /todos
      ✓ should return an array of todo items (13 ms)
      ✓ should not return an array of todo items without auth (5 ms)
    POST /todos
      ✓ should create a todo item (20 ms)
      ✓ should prevent adding a to-do with an ID (9 ms)
      ✓ should prevent adding a to-do with an existing title (11 ms)
      ✓ should prevent adding a todo item with a completed status (7 ms)
      ✓ should enforce strings for title (8 ms)
      ✓ should enforce strings for description (16 ms)
      ✓ should enforce a required title (10 ms)
      ✓ should require an access token to create (4 ms)
    PATCH /todos
      ✓ should successfully patch a todo (21 ms)
      ✓ should return a 404 for a non-existent todo (6 ms)
      ✓ should return a 404 for a todo that doesn't belong to the user (9 ms)
      ✓ should prevent updating a to-do with an ID (7 ms)
      ✓ should enforce strings for title (8 ms)
      ✓ should enforce strings for description (8 ms)
      ✓ should enforce boolean for completed (8 ms)
    PUT /todos
      ✓ should successfully put a todo (14 ms)
      ✓ should return a 400 for a todo that doesn't belong to the user (9 ms)
      ✓ should prevent updating the ID of a todo (17 ms)
      ✓ should enforce strings for title (7 ms)
      ✓ should enforce strings for description (7 ms)
      ✓ should enforce boolean for completed (7 ms)
    DELETE /todos
      ✓ should delete a todo (13 ms)
      ✓ should not delete a todo of another user (7 ms)
      ✓ should require authorization (4 ms)
```


Once I ironed out some issues with the `ConfigModule`, actual testing database, and environment variables I was able to start writing tests:

```
    it('should return an array of todo items', () => {
      return request
        .default(app.getHttpServer())
        .get(`${baseUrl}${todoUrl}`)
        .auth(access_token, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/)
        .expect((res) => {
          return Array.isArray(res.body);
        });
    });
```


Simple test (using an access token) to retrieve an array

```
    it('should require an access token to create', () => {
      return request
        .default(app.getHttpServer())
        .post(`${baseUrl}${todoUrl}`)
        .send({ title: 'foo', description: 'bar' })
        .expect('Content-Type', /json/)
        .expect(HttpStatus.UNAUTHORIZED);
    });
```


Intentionally left out the JWT to check for a 401 response

One of the more complicated tests (relative to the above) were tests that involved database manipulation _before_ making HTTP calls. Here's the PUT test for attempting to updated a different user's to-do:

```
    it("should return a 400 for a todo that doesn't belong to the user", async () => {
      // create new user
      const altUser = await userRepo.save({
        email: randEmail(),
        password: 'Password1!',
      });
      
      // create todo for that user so that the UUID is already taken
      const altUserTodo = await todoRepo.save({
        title: 'foo',
        description: 'bar',
        user: {
          id: altUser.id,
        },
      });

      // use ID from new user's todo
      const url = `${baseUrl}${todoUrl}/${altUserTodo.id}`;

      const payload = {
        id: altUserTodo.id,
        title: 'foo',
        description: 'bar',
        completed: false,
      };

      return (
        request
          .default(app.getHttpServer())
          .put(url)
          // use the access token with our user ID instead of new user
          .auth(access_token, { type: 'bearer' })
          .send(payload)
          .expect('Content-Type', /json/)
          .expect(HttpStatus.BAD_REQUEST)
      );
    });
```


Bonus: Module Boundaries and Dependency Graph
---------------------------------------------

During the development of this post, I realized that I was writing code counter to everything we've structured so far: the `ServerFeatureAuthModule` relies on a `forwardRef` to `ServerFeatureUserModule` in order to properly reference the user service. In an ideal world, feature-level libraries have no dependency on one another at all. I then updated the root `.eslintrc.json` file to properly enforce our tag boundaries:

```
"@nrwl/nx/enforce-module-boundaries": [
          "error",
          {
            "enforceBuildableLibDependency": true,
            "allow": [],
            "depConstraints": [
              {
                "sourceTag": "*",
                "onlyDependOnLibsWithTags": ["*"]
              },
              {
                "sourceTag": "scope:server",
                "onlyDependOnLibsWithTags": ["scope:server", "scope:shared"]
              },
              {
                "sourceTag": "scope:client",
                "onlyDependOnLibsWithTags": ["scope:client", "scope:shared"]
              },
              {
                "sourceTag": "scope:shared",
                "onlyDependOnLibsWithTags": ["scope:shared"]
              },
              {
                "sourceTag": "type:app",
                "onlyDependOnLibsWithTags": [
                  "type:feature",
                  "type:util",
                  "type:domain"
                ]
              },
              {
                "sourceTag": "type:feature",
                "onlyDependOnLibsWithTags": [
                  "type:data-access",
                  "type:util",
                  "type:ui",
                  "type:domain"
                ]
              },
              {
                "sourceTag": "type:data-access",
                "onlyDependOnLibsWithTags": [
                  "type:data-access",
                  "type:util",
                  "type:domain"
                ]
              },
              {
                "sourceTag": "type:ui",
                "onlyDependOnLibsWithTags": [
                  "type:ui",
                  "type:util",
                  "type:domain"
                ]
              },
              {
                "sourceTag": "type:util",
                "onlyDependOnLibsWithTags": ["type:util", "type:domain"]
              }
            ]
          }
        ]
```


Going forward, this rule set will enforce the library hierarchy we've been aiming for throughout this series. There is one exception to the rule, for the aforementioned user service:

```
  "overrides": [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {
        "@nrwl/nx/enforce-module-boundaries": [
          "error",
          {
            "allow": ["@fst/server/feature-user"]
          }
        ]
      }
    },
```


libs/server/feature-auth/.eslintrc.json

Until a refactor occurs which renders this feature-on-feature connection obsolete, this rule tells the linter that it's OK for the auth module to depend on the user module.

So what does our dependency graph look like now that we've added a bunch of libraries?

![](https://thefullstack.engineer/content/images/2023/03/graph--4-.png)

It looks like a mess, but it represents the desired hierarchy of libraries and the separation of concerns.

It's not small. 13 libraries and 4 applications (including the e2e apps, not shown above), makes for a large repo. But it's well organized and makes a pretty graph!

Summary
-------

User authentication is not a small addition to any application. It affects the majority of the code base, changes the structure of the database, and requires a lot of testing to ensure expected behavior. But, with some practice, it doesn't have to be a massive hurdle.

The next post in this series will add user registration/login and token management from the client side of the stack. In the mean time, all of the code for this post is available on GitHub: [wgd3/full-stack-todo@part-08](https://github.com/wgd3/full-stack-todo/tree/part-08?ref=thefullstack.engineer)

See you next time!

Speed Bumps
-----------

*   `ReferenceError: jest is not defined` appeared when I attempted to run `server` after adding a bunch of tests. This was a fun one to track down - running the application should pull in any test-related code at all! It boiled down to path mapping in `tsconfig.base.json` and the use of testing tools in `libs/server/util`. Since I was importing `QueryErrorFilter` from a barrel file (`libs/server/util/src/index.ts`), and that barrel file also exported test utilities, the test utilities were being bundled with the application. I resolved this by making two changes:  
    1) Removing the testing exports from the barrel file  
    2) Adding a specific path mapping for testing utils in that library (`"@fst/server/util/testing": ["libs/server/util/src/lib/testing/index.ts"]`)
*   Did not account for unique constraint on userId + todo.title. Couldn't figure out why the definition wasn't being enforced. This was due to not using migrations - updating the constraints on the table did not _replace_ the existing constraints on the database table. Fixed by deleting the database and restarting the application (which rebuilt the database using the most recent schema)