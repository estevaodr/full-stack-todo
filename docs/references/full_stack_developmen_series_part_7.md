# Unit and Integration Testing for Angular and NestJS
Welcome back! For this entry in the series, we'll be covering the various types of tests used during application development. Our goal is to ensure that all individual parts of our "stack" work both independently and as a whole. We'll examine the use of Jest as our main testing platform, as well as address integration/functional testing with Cypress. I also took the approach of explaining many of these tests in the code block themselves, so don't skim over those too fast!

Other posts in this series:

*   [An Introduction](https://thefullstack.engineer/full-stack-development-series-an-introduction/)
*   Part 1: [Getting Started With Nx, Angular, and NestJS](https://thefullstack.engineer/full-stack-development-series-part-1-getting-started-with-nx-angular-and-nestjs/)
*   Part 2: [Creating a REST API](https://thefullstack.engineer/full-stack-development-series-part-2-creating-a-rest-api-with-nestjs/)
*   Part 3: [Connecting Angular to a REST API](https://thefullstack.engineer/full-stack-development-series-part-3-connect-angular-with-nestjs-api)
*   Part 4: [Data Persistence with TypeORM and NestJS](https://thefullstack.engineer/full-stack-development-series-part-4-data-persistence)
*   Part 5: [Design Systems and Angular Component Development with Storybook](https://thefullstack.engineer/full-stack-development-series-part-5-angular-component-development-with-storybook)
*   Part 6: [Application Deployment and CI/CD](https://thefullstack.engineer/full-stack-development-series-part-6-application-deployment-and-ci-cd)
*   Part 7: [Unit and Integration Testing](https://thefullstack.engineer/full-stack-development-series-part-7-unit-and-integration-testing) (this post)

If you want to skip ahead to the code, you can checkout out the repository: [wgd3/full-stack-todo@part-07](https://github.com/wgd3/full-stack-todo/tree/part-07?ref=thefullstack.engineer)

Introduction
------------

This post isn't meant to fully explain the concepts of unit and integration testing, there's a ton of information out there written by people much smarter than me. That being said, those are the two types of tests we'll be focused on for this post.

[Unit testing](https://softwaretestingfundamentals.com/unit-testing/?ref=thefullstack.engineer) is the process of testing small, focused chunks of code. For our applications that means test suites testing the minutiae of components, controllers, and services. When running tests on these object, everything outside of them should be mocked as much as possible. There's no need to have an in-memory database running just so we can test whether a button click initiates some action.

[Integration testing](https://docs.nestjs.com/fundamentals/testing?ref=thefullstack.engineer#end-to-end-testing) is the concept of testing coordination between the various modules and services of an application. It differs from "end-to-end" testing insofar as E2E tests simulate the user's experience, beginning to end. There are lots of similarities, but Nest's own documentation uses "E2E" so I'll adopt that terminology here as well.

![](https://thefullstack.engineer/content/images/2023/03/Screen-Shot-2023-03-20-at-1.31.51-PM.png)

Pie chart representing test coverage.. Courtesy of CodeCov.io

The above chart comes from CodeCov.io, and illustrates how little coverage there is in the project currently.

Backend Testing
---------------

### Unit Testing the To-do Feature

Let's start with the ToDo controller. It should be easy to isolate small chunk of code to test, and is where a large amount of the application logic lives at the moment. You should already have a `libs/server/feature-todo/src/lib/server-feature-todo.controller.spec.ts` file created, as Nx generates that for you when you create a NestJS library via their generator. Before we begin editing, there's one package that needs to be added:

```
$ npm i --save-dev @nestjs/testing
```


[

Documentation | NestJS - A progressive Node.js framework

Nest is a framework for building efficient, scalable Node.js server-side applications. It uses progressive JavaScript, is built with TypeScript and combines elements of OOP (Object Oriented Progamming), FP (Functional Programming), and FRP (Functional Reactive Programming).

![](https://docs.nestjs.com/apple-touch-icon-precomposed.png)

![](http://nestjs.com/img/nest-og.png)

](https://docs.nestjs.com/fundamentals/testing?ref=thefullstack.engineer)

One of the most important blocks in this file is the `beforeEach` function. As the name implies, the code in this block is run before every test in it's scope. We need to make sure we have references to our controller as well as the service used by the controller for our tests:

```
describe('ServerFeatureTodoController', () => {
  let controller: ServerFeatureTodoController;
  let service: ServerFeatureTodoService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      // no imports used here!
      providers: [
        ServerFeatureTodoService,
        {
          provide: getRepositoryToken(ToDoEntitySchema),
          useFactory: repositoryMockFactory,
        },
      ],
      controllers: [ServerFeatureTodoController],
    }).compile();

    // use the "module" defined above to get references to
    // the controller and service
    controller = module.get(ServerFeatureTodoController);
    service = module.get(ServerFeatureTodoService);
  });
```


libs/server/feature-todo/src/lib/server-feature-todo.controller.spec.ts

[Dependency Injection](https://docs.nestjs.com/providers?ref=thefullstack.engineer#dependency-injection) is heavily used for our tests; as you see above we can't simply "provide" `ServerFeatureTodoService` and start testing. The service uses a connection to our database, and we need to "mock" that so no actual database connection is needed.

💡

What is a "mock" exactly? If that word (in this context) is new, it's simply a way of saying that we're faking a specific resource. In that resource's place we could use Jest's basic `jest.fn()`, or it could be a full-blown Typescript class with custom behavior in it. Either way, the point is that we're keeping our tests focused on small chunks of code and not concerning ourselves with other parts of the application.

`getRepositoryToken()` is a tool from NestJS's [TypeORM library](https://docs.nestjs.com/techniques/database?ref=thefullstack.engineer#testing) and tells the compiler that whenever `@InjectRepository()` is called, return the value provided by `useFactory` instead. Thanks to a StackOverflow answer that I can no longer find, we're using a mock repository that makes "spying" on code much easier:

```
export type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    findOne: jest.fn((entity) => entity),
    findOneBy: jest.fn(() => ({})),
    save: jest.fn((entity) => entity),
    findOneOrFail: jest.fn(() => ({})),
    delete: jest.fn(() => null),
    find: jest.fn((entities) => entities),
  })
);
```


With this all defined, let's add the first test - ensuring that a GET request to the `/api/v1/todos` endpoint returns an array:

```
  it('should return an array of to-do items', async () => {
    // before anything else, this "spy" waits for service.getAll()
    // to be called, and returns a Promise that resolves to an 
    // array of 5 to-do items
    jest.spyOn(service, 'getAll').mockReturnValue(
      new Promise((res, rej) => {
        res(Array.from({ length: 5 }).map(() => createMockTodo()));
      })
    );
    
    // call the method that is run when the GET request is made
    // and store the result
    const res = await controller.getAll();
    
    // finally, set our expectations for the above code:
    // - make sure the JSON payload returned by the controller
    //   is in fact an array
    // - ensure the length of the array matches the length 
    //   that was assigned in the spy above
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(5);
  });
```


Easy, right? No database, no real HTTP calls, just a straightforward if-this-than-that. Now, let's examine a test that requires a little more effort:

```
// testing the method associated with a PATCH HTTP request
it('should allow updates to a single todo', async () => {
    // generate a random to-do item
    const todo = createMockTodo();
    
    // create a variable for the property being changed
    // (just makes it easier to reference, instead of risking
    //  a type later in the test)
    const newTitle = 'newTitle';
    
    // make the "service" method return a todo with the updated
    // title when it is called
    jest
      .spyOn(service, 'update')
      .mockReturnValue(Promise.resolve({ ...todo, title: newTitle }));
      
    // store the result
    // NOTE: the parameters passed to update() are the same as the params
    // used in the endpoint's request!. `todo.id` refers to the UUID
    // that is in the endpoint's URL, and the object parameter is the 
    // PATCH payload of the request
    const updated = await controller.update(todo.id, { title: newTitle });
    
    // finally, ensure that the response includes the updated title
    expect(updated.title).toBe(newTitle);
  });
```


There were tests added for each endpoint, which you can find in the repository for this post. That's it though! We have one test for each `/todos` endpoint. We could have many more, such as for testing that our endpoints require a payload, or a parameter in the URL, or 404s are returned for non-existent endpoints, but for now this is enough to get started.

So how are these tests run? Nx already has a run target defined in this library's `project.json`, so simply run the `test` command:

```
$ nx test server-feature-todo

> nx run server-feature-todo:test


Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        3.173 s
Ran all test suites.

 ————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 >  NX   Successfully ran target test for project server-feature-todo
```


Now, let's set up some tests for the corresponding service. Just like the controller, we need to use the `beforeEach` block to initialize and make reference to certain entities:

```
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServerFeatureTodoService,
        {
          provide: getRepositoryToken(ToDoEntitySchema),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get(ServerFeatureTodoService);
    repoMock = module.get(getRepositoryToken(ToDoEntitySchema));
  });
```


We're still providing a mock repository here, but instead of a `controller` reference we need a reference to the mocked repository. This will allow us to spy on and fake responses from the "database" during our tests, keeping everything focused on the service itself!

```
  it('should return an array of to-do items', async () => {
    // just like the controller test, create an array of fake todo items
    const todos = Array.from({ length: 5 }).map(() => createMockTodo());
    
    // in the controller we mocked what the service returned. but
    // now that we're testing the service, we're mocking what the
    // "database" would return if the `find()` query was run
    repoMock.find?.mockReturnValue(todos);
    
    // make sure the service is responding with the array of
    // fake todo items
    expect((await service.getAll()).length).toBe(todos.length);
    
    // because we're using jest.fn() for our mock database repository
    // methods, we can spy on `find()` and ensure that it was called
    // instead of something like `findBy()` or `findOne()`
    expect(repoMock.find).toHaveBeenCalled();
  });
```


As of the end of this post, our unit tests for this library do not cover all the various outcomes from our controller and service. We're not validating input, response codes, or catching errors. We are simply ensuring that the endpoints and the service's methods respond the way we expect when called correctly. This gives us 100% code coverage, as every method and branch are tested.

⚠️

It's important to keep in mind that 100% code coverage does _not_ necessarily mean all the possible outcomes from your code have been tested. It _does_ communicate that your tests have utilized a certain percentage of lines of code, which is helpful in identifying areas of your codebase that may or may not behave as expected.

There's a flag you can pass to Nx when testing to analyze code coverage: `--codeCoverage`. When your tests have run, you can find an HTML report under the `coverage/libs/server/feature-todo` folder to visually understand your test results:

![](https://thefullstack.engineer/content/images/2023/03/Screen-Shot-2023-03-24-at-3.00.02-PM.png)

### Discoveries Along The Way

Testing is something easily overlooked when working on a project. I'm definitely guilty of putting it on the back burner - it's not nearly as cool to show off tests as it is to try out a new framework or something interactive. But when tests are given first-class attention, they often reveal small bits of your application that don't work like you thought they would. Case and point: the `ValidationPipe` from NestJS!

During my testing, I realized that certain properties could be passed to the endpoints that shouldn't be allowed. I thought for sure with the DTOs and `class-validator` decorators I had my bases covered. I even had the `ValidationPipe` set up in `main.ts`! So what was going on?  There are 2 configuration parameters for the `ValidationPipe` class that I was unaware of:

```
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      // only decorated parameters in DTOs are delievered
      whitelist: true,
      // additional parameters will cause an error!
      forbidNonWhitelisted: true,
    })
  );
```


With the whitelist-related properties specified, I could finally trigger `property XYZ should not exist` messages on API calls.

I also came across a bug in which unique constraints in the todo database table were not being enforced. At least, I _assumed_ they should be enforced. Sure enough I had left out the `unique: true` property in the schema definition:

```
> http localhost:3333/api/v1/todos title=foo description=foo

{
    "completed": false,
    "description": "foo",
    "id": "a3ae59d3-08a2-4c91-8dcc-5fac1082fe02",
    "title": "foo"
}

# this should return a 400!
> http localhost:3333/api/v1/todos title=foo description=foo

{
    "completed": false,
    "description": "foo",
    "id": "7043c728-1502-4cef-ae34-9609d65fb4bb",
    "title": "foo"
}
```


After fixing the schema, I also created a new `util` library under `libs/shared` for utilities only specific to the `server` application and it's libraries. The first addition to the utility library was a custom [exception filter](https://docs.nestjs.com/exception-filters?ref=thefullstack.engineer) for handling unique constraint conflicts:

```
@Catch(QueryFailedError)
export class QueryErrorFilter extends BaseExceptionFilter {
  public override catch(exception: QueryFailedError, host: ArgumentsHost): any {
    Logger.debug(JSON.stringify(exception, null, 2));
    Logger.error(exception.message);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception.message.includes('UNIQUE')) {
      const invalidKey = exception.message.split(':').pop()?.trim();
      response.status(401).json({
        error: `Unique constraint failed`,
        message: `Value for '${invalidKey}' already exists, try again`,
      });
    } else {
      response.status(500).json({
        statusCode: 500,
        path: request.url,
      });
    }
  }
}
```


libs/server/util/src/lib/query-error.filter.ts

After adding this filter via a decorator to the controller, I was ready to (cleanly) handle database exceptions.

### Integration Testing

At this point, our `ServerFeatureTodo` library has been well unit tested. We know all the small parts work independently as expected. So what happens when all these parts are used together? That's where integration comes in! In this section we'll cover what it looks like to test the API from the HTTP request to the database.

Our integration tests for the time being are going to live in the `server-e2e` "application" that was created automatically by Nx. I tried originally to add `*.e2e-spec.ts` files in the feature library, but there was a lot of configuration surrounding auto-detection of file names and decided that wasn't worth the time.

The setup for our integration test suite looks incredibly similar to our unit tests:

```
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      providers: [
        ServerFeatureTodoService,
        {
          provide: getRepositoryToken(ToDoEntitySchema),
          useFactory: repositoryMockFactory,
        },
        {
          provide: APP_PIPE,
          useValue: new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
          }),
        },
      ],
      controllers: [ServerFeatureTodoController],
    }).compile();

    app = moduleRef.createNestApplication();
    repoMock = moduleRef.get(getRepositoryToken(ToDoEntitySchema));

    await app.init();
  });
```


apps/server-e2e/src/server/todo-controller.spec.ts

There's one small difference though: we've added the `ValidationPipe` to our providers list. That's because, for these tests, we're actually instantiating a live version of our application. Code you would find in `main.ts` or perhaps `app.module.ts` should also be utilized (when necessary) here to emulate the same environment for your code.

Let's breakdown an integration test for a POST request on the `/todos` endpoint:

```
    it('should create a todo item', () => {
      // utilize the same, shared utility for creating a fake todo item
      const { id, completed, title, description } = createMockTodo();
      
      // eventually we'll use an actual database in these tests, but 
      // for now we're still mocking that layer
      jest
        .spyOn(repoMock, 'save')
        .mockReturnValue(
          Promise.resolve({ id, completed, title, description })
        );
        
      // `request` comes from the supertest package as recommended by NestJS in their docs
      return request
        // get a reference to the live app
        .default(app.getHttpServer())
        // issue a POST HTTP request
        .post(todoUrl)
        // add a payload to the request
        .send({ title, description })
        // when the API returns a Response object, analyze the response
        .expect((resp) => {
          const newTodo = resp.body as ITodo;
          expect(newTodo.title).toEqual(title);
          expect(newTodo.description).toEqual(description);
          expect(typeof newTodo.completed).toEqual('boolean');
          expect(typeof newTodo.id).toEqual('string');
        })
        // ensure that the response's status code matches expectations
        .expect(HttpStatus.CREATED);
    });
```


When this test runs, it performs a "real" HTTP API call so that the request gets processed by our controller. Part of this request is getting past all the built-in validation provided to us by the `ValidationPipe` and `TodoDto`. Once received, the todo service is called, where it in turns calls "the database" (which is still mocked for now). It's that simple!

Let's complicate things a bit. Our unit tests did not cover edge cases, but users can be creative at times and we need to ensure that no one is trying to name their todo with a number instead of a string:

```
    it('should enforce strings for title', () => {
      return request
        .default(app.getHttpServer())
        .post(todoUrl)
        // description is optional in the payload, so just send an integer for the title
        .send({ title: 123 })
        .expect((resp) => {
          const { message } = resp.body;
          // class-validator delivers error messages in an array so that multiple validation errors can be raised when necessary
          // this tests that one of those array elements speaks to the string requirement
          expect(
            (message as string[]).some((m) => m === 'title must be a string')
          );
        })
        // finally, make sure we're returning a 401
        .expect(HttpStatus.BAD_REQUEST);
    });
```


Similar to running our unit tests, Nx has a run target for the `server-e2e` project:

```
$ nx e2e server-e2e

Setting up...


> Test run started at 3/24/2023, 3:45:58 PM <

 PASS   server-e2e  apps/server-e2e/src/server/todo-controller.spec.ts
  ServerFeatureTodoController E2E
    GET /todos
      ✓ should return an array of todo items (13 ms)
    POST /todos
      ✓ should create a todo item (17 ms)
      ✓ should prevent adding a to-do with an ID (5 ms)
      ✓ should prevent adding a todo item with a completed status (7 ms)
      ✓ should enforce strings for title (4 ms)
      ✓ should enforce strings for description (3 ms)
      ✓ should enforce a required title (4 ms)


> Test run finished at 3/24/2023, 3:46:00 PM <

Test Suites: 1 passed, 1 total
Tests:       0 skipped, 7 passed, 7 total
Snapshots:   0 total
Time:        1.846 s
```


The next post in this series requires some major changes to our database schema and service logic, so that's where I'll be demonstrating how to use a real, in-memory database during testing instead of mocking it.

Frontend Testing
----------------

With a stable, well-tested API in place, we can focus on getting the front end squared away. The concepts of unit testing the frontend are the same, we'll focus on small bits of functionality in components and services before anything else.

### Unit Testing Components

Given that NestJS was structured in the same way as Angular, the following chunk of code should look similar:

```
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // this usually mirrors the imports/providers declared on the component itself
      imports: [
        ToDoComponent,
        FontAwesomeModule,
        FormsModule,
        ReactiveFormsModule,
        EditableModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToDoComponent);
    
    // define a global reference to the component itself
    component = fixture.componentInstance;
    
    // tell the change detection system to "process" our newly-instantiated component
    fixture.detectChanges();
  });
```


libs/client/ui-components/src/lib/to-do/to-do.component.spec.ts

Our `client` project uses Jest, the same as the `server` application, so the syntax surrounding `describe` `it` and `expect` are the same. One difference here though is that we're not working with a database or external service in this component, so no dependencies are getting mocked.

A functional requirement of this component is that when a user tries to edit their todo item, but decides to discard the changes, the form should be reset to it's original value. Testing this is fairly straightforward:

```
  it('should cancel an edit', () => {
    // use the same,shared todo generator as the backend
    const todo = createMockTodo();
    
    // assign the component's `Input()` property to the
    // fake todo
    component.todo = todo;
    
    // manually run ngOnOnit to ensure that the initialization code
    // runs (doesn't happen in the compileComponents() method)
    component.ngOnInit();
    
    // update the form value with a new title
    // NOTE: thanks to strongly-typed forms we can access
    // the title control with `controls.title` syntax instead
    // of `controls['title']`!
    component.todoForm.controls.title.setValue('foo');
    
    // call the same method that's called when a user leaves 
    // an editable field without hitting Enter (which triggers
    // a submit)
    component.cancelEdit();
    
    // make sure we've reset the title to it's original value
    expect(component.todoForm.value.title).toBe(todo.title);
  });
```


libs/client/ui-components/src/lib/to-do/to-do.component.spec.ts

Our Angular application does/will heavily utilize RxJs Observables, so handling async code looks a little different than our API's Promise-based code. Here's a test that monitor's the `TodoComponent` EventEmitter via a subscription:

```
  // in the outer function, a 'done' callback function is added as a parameter so we can manually tell Jest when we've completed the test
  it('should successfully toggle completion', (done) => {
    const todo = createMockTodo();

    // `updateTodo` is the EventEmitter that parent components will
    // bind to in a template. Our goal is to monitor the output 
    // of this EventEmitter and examine what happens when a user updates
    // the todo
    //
    // this subscription may be initiated here, but `updateTodo` has not
    // emitted any data yet. this subscription lies "dormant" until 
    // _something_ is emitted later in the test
    component.updateTodo.subscribe((data) => {
      expect(data).toStrictEqual({ ...todo, completed: !todo.completed });
      // when the subscription does receive data, after we've 
      // validated the output, call the test's callback to 
      // finalize the test and move on
      done();
    });

    // run our component's initialization logic to set up the 
    // FormGroup
    component.todo = todo;
    component.ngOnInit();
    
    // call the same method tied to a button press in the template
    // 
    // this will trigger the EventEmitter which is detected and
    // processed a few lines above
    component.triggerToggleComplete();
  });
```


libs/client/ui-components/src/lib/to-do/to-do.component.spec.ts

### Unit Testing the Data Access Library

The `client-data-access` library has a single service in it at the moment, `ApiService`, which requires `HttpClient` to perform HTTP requests. For this series of tests we won't be mocking `HttpClient` as a whole; instead we'll use `jest.spyOn()` to mock return values without actually making HTTP calls.

```
  /**
   * The first test is a simple call against the GET endpoint
   * for to-do entities. 
   * 
   * This test differs from the backend's unit tests in that
   * instead of using `async ()` for the callback, we define
   * a callback method `done` that we can call when we choose.
   */
  it('should get a list of to-do items', (done) => {
    const todos: ITodo[] = Array.from({ length: 5 }).map(() =>
      createMockTodo()
    );
    
    /**
     * This should look familiar at this point - Jest will monitor
     * HttpClient for calls to it's `get()` method and return whatever
     * value we provide. Since HttpClient returns Observables, we
     * need to wrap our response payload with `of()`
     */
    const httpSpy = jest.spyOn(http, 'get').mockReturnValue(of(todos));
    
    /**
     * Calling `subscribe()` on the service's method will cause it
     * to run, thus emitting the value we mocked above. As you can
     * see, we manually call the `done` callback once we've
     * completed our checks.
     */
    service.getAllToDoItems().subscribe({
      next: (val) => {
        expect(val).toStrictEqual(todos);
        expect(val.length).toEqual(todos.length);
        done();
      },
      error: done.fail,
    });
    
    expect(httpSpy).toHaveBeenCalledTimes(1);
  });
```


This pattern repeats for all the methods in our `ApiService`. At this time there are not unit tests for "unexpected" situations like handling 4XX-level HTTP errors, browser being offline, etc.

**Note:** In the `TestBed` setup for this spec file, I used the "old" method of importing testing modules instead of using provides such as `provideHttpClient()`. Either way works at this time, but the generators still use the traditional `imports`.

### E2E Testing with Cypress and Storybook

I'll own up to not enjoying writing tests (for the most part). It can be tedious, time-consuming, and even though it is an _excellent_ practice it doesn't provide that same dopamine rush of getting real, functional code in place. Cypress + Storybook changed this for me though - Cypress provides a beautiful UI through which you can _watch_ your components get tested and see what a user would see.

When running the E2E target for `ui-components-e2e` with the `--watch` flag, we get a pop up asking us which browser we'd like to use for tests:

```
$ npx nx e2e ui-components-e2e --watch
```


![](https://thefullstack.engineer/content/images/2023/03/Screenshot-2023-03-28-at-12.15.03-PM.png)

Since my default browser is Chrome (which is already running and would cause a conflict) I just pick Electron here. When the Electron browser fires up, you're presented with a directory tree that lists all detected Cypress test files. Clicking any of them will trigger an immediate run of that test suite:

![](https://thefullstack.engineer/content/images/2023/03/Screenshot-2023-03-28-at-12.16.02-PM.png)

Note the URL in the top right - our tests are running against a live Storybook server on port 4400!

First, some background on what's happening before we look at the actual test code. [Cypress](https://www.cypress.io/?ref=thefullstack.engineer) is a tool that aims to make e2e testing easy to run and debug. Storybook, as we've [talked about before](https://thefullstack.engineer/full-stack-development-series-part-5-angular-component-development-with-storybook/#integrating-storybook), enables developers to design components in isolation. In order for Cypress to run, it's web browser needs a live application to be running and accessible at a given URL. Nx goes ahead and sets up the run target to use the `storybook` run target as that application, and Cypress gets pointed to the `<iframe>` in which our Storybook component lives.

```
    "e2e": {
      "executor": "@nrwl/cypress:cypress",
      "options": {
        "cypressConfig": "apps/ui-components-e2e/cypress.config.ts",
        "devServerTarget": "client-ui-components:storybook",
        "testingType": "e2e"
      },
      "configurations": {
        "ci": {
          "devServerTarget": "client-ui-components:storybook:ci"
        }
      }
    },
```


apps/ui-components-e2e/project.json

```
export default defineConfig({
  e2e: nxE2EStorybookPreset(__dirname),
});
```


apps/ui-components-e2e/cypress.config.ts

In the above file, the Nx preset defines a base URL which matches the storybook server. Then in our test we simply tell Cypress to visit the `<iframe>` with this command:

```
/**
 * The `id` specified after the iframe is a slugified version of 
 * the story title defined in a component's *.stories.ts file
 */
beforeEach(() => cy.visit('/iframe.html?id=todocomponent--primary'));
```


Excerpt from our TodoComponent E2E test file

Cypress also has the concept of [Commands](https://docs.cypress.io/api/cypress-api/custom-commands?ref=thefullstack.engineer#docusaurus_skipToContent_fallback) - small chunks of functionality that can be used throughout spec files. During development of this post, I came across a blog post with some helpful information on integrating Storybook Actions with Cypress tests: [Expect Storybook actions in Cypress](https://jgelin.medium.com/expect-storybook-actions-in-cypress-36e9542d109d?ref=thefullstack.engineer). I also used [this](https://stackoverflow.com/a/66745953?ref=thefullstack.engineer) massive StackOverflow answer to learn more about integrating Angular with Cypress and Storybook.

Now, onto our actual tests! The minimum needed to get up an running looks like this:

```
describe('To-Do Component', () => {
  beforeEach(() => cy.visit('/iframe.html?id=todocomponent--primary'));
  it('should render the component', () => {
    cy.get('fst-todo').should('exist');
  });
});

```


apps/ui-components-e2e/src/integration/to-do.cy.ts

All this does is ensure that Storybook's `<iframe>` contains a DOM element named `fst-todo`. Our component is interactive though, so let's make sure we can click on the delete button:

```
  it('should detect clicks on the delete button', () => {
    /**
     * Use the custom command to add an event listener 
     * for the 'click' action at the `document`-level.
     *
     * Don't forget that with Javascript, unless you
     * have custom event handling code in place, 
     * events in the DOM bubble up - meaning our event
     * listener at the root level will detect a click
     * on a child element
     */ 
    cy.storyAction('click');
    
    /**
     * Tell the browser to interact with (click) on the
     * button with a `.btn--danger` class. Is this really
     * reliable or the best way to refer to a specific element?
     * Not exactly, but for now that button is the only one
     * with that class on it
     */
    cy.get('.btn--danger').click();
    
    /**
     * Use Cypress' `should` syntax to ensure our event listener
     * detected the click - meaning the button was successfully
     * interacted with (an element with that class was found)
     */
    cy.get('@click').should('have.been.calledOnce');
  });
```


One other bit of functionality to ensure exists is the editing of a to-do's title and description. In the component, we've enabled this functionality using the Editable component from [@ngneat/edit-in-place](https://github.com/ngneat/edit-in-place?ref=thefullstack.engineer) and need to test that it responds as expected to certain types of clicks:

```
  it('should be able to edit the title', () => {
    /**
     * Like before, set up a mock listener for the 'dblclick'
     * browser event
     */
    cy.storyAction('dblclick');
    
    /**
     * Perform an actual double-click in the Cypress browser
     * on the title element
     */
    cy.get('.todo__title').dblclick();
    
    /**
     * Ensure the DOM detected the double click
     */
    cy.get('@dblclick').should('have.been.calledOnce');
    
    /**
     * Ensure that our title element has been switched out
     * for a <input> element with the correct classes!
     */
    cy.get('.form-control.h4').should('exist');
  });
```


It's as simple as that! With these in place, our CI workflows will now run the above test suite (in headless mode!) and we can feel safe knowing our components are acting as intended.

In the future I'll be adding more advanced E2E tests for our components, including information on the videos recorded during testing and using mock backends during the test.

Summary
-------

At the end of development for this post I had achieved 100% code coverage for the repository:

[![](https://codecov.io/gh/wgd3/full-stack-todo/branch/part-07-testing/graphs/tree.svg?token=YvdXIYy0ji)](https://app.codecov.io/gh/wgd3/full-stack-todo/tree/part-07-testing?ref=thefullstack.engineer)

Grid coverage map representing directory size/structure/coverage. Courtesy of CodeCov.io

I'd like to reiterate however - 100% code coverage **does not** mean that your code is safe, or that you've handled all your edge cases. It simply means that every line of code in the repository has been touched by a test case.

As always, thank you for reading and I hope you learned something! The code for this post can be found in the repository here: [wgd3/full-stack-todo@part-07](https://github.com/wgd3/full-stack-todo/tree/part-07?ref=thefullstack.engineer)