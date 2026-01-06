# Creating A REST API
Welcome back! In part 2 of this series, I'll cover some basics of NestJS, establish the purpose of this application, demonstrate how shared data structures can be used, and implement a proper REST API.

Other posts in this series:

*   [An Introduction](https://thefullstack.engineer/full-stack-development-series-an-introduction/)
*   Part 1: [Getting Started With Nx, Angular, and NestJS](https://thefullstack.engineer/full-stack-development-series-part-1-getting-started-with-nx-angular-and-nestjs/)
*   Part 2: [Creating a REST API](https://thefullstack.engineer/full-stack-development-series-part-2-creating-a-rest-api-with-nestjs/) (this post)
*   Part 3: [Connecting Angular to a REST API](https://thefullstack.engineer/full-stack-development-series-part-3-connect-angular-with-nestjs-api/)

If you want to skip ahead to the code, you can checkout out the repository: [wgd3/full-stack-todo@part-02](https://github.com/wgd3/full-stack-todo/tree/part-02?ref=thefullstack.engineer)

What's This App Going To Do?
----------------------------

Our full stack application is going to...

There might be a lot of Psych references in my posts.

Serve a to-do list! Not the most exciting thing in the world, I know, but it's the perfect way to demonstrate all layers of a full-stack application. To that end, our first step is going to be establishing data structures that both the `client` and `server` apps will use.

Sharing Is Caring
-----------------

Nx has some [excellent documentation](https://nx.dev/more-concepts/grouping-libraries?ref=thefullstack.engineer#sharing-libraries) on their philosophy behind directory structure and shared folders. Following their lead, let's create our first library:

```
 ~/git/full-stack-todo | main
> npx nx generate @nx/js:library domain \
--directory=shared \
--importPath=@fst/shared/domain \
--skipBabelrc \
--standaloneConfig \
--tags=scope:shared,type:domain
```


💡

Code blocks are inherently easier to read, parse, copy/paste. To be honest though, I usually use the [Nx Console](https://nx.dev/core-features/integrate-with-editors?ref=thefullstack.engineer) plugin for VSCode to have a GUI and ensure I don't miss any flags!

#### Explaining what just happened

This command just did a lot of work for us. It automatically:

*   Created the `libs/shared` directory
*   Instantiated a new library under `libs/shared/domain` with all the config files necessary for an individual library
*   Updated the `tsconfig.base.json` file with a new import path (this allows us to not use relative imports in other libraries)
*   Added tags to the `project.json` for the library. More on tags soon.

With a shared library in place, we can create our first interface:

```
// libs/shared/domain/src/lib/models/todo.interface.ts

export interface ITodo {
    id: string;
    title: string;
    description: string;
    completed: boolean;
}
```


There are a couple of conventions I follow in my projects:

*   One file per interface
*   Files that export an interface should use the naming scheme `<name>.interface.ts`. This is extremely useful when tools accept a blob pattern to lookup files, and you can specify exactly what files you want. And it's easier to read in my opinion.
*   Interface names should be prefaced with an `I` for easier identification throughout the codebase

While updating this library, let's remove two auto-generated files that aren't needed:

```
 ~/git/full-stack-todo | main
> rm libs/shared/domain/src/lib/shared-domain*
remove libs/shared/domain/src/lib/shared-domain.spec.ts? y
remove libs/shared/domain/src/lib/shared-domain.ts? y
```


And lastly, update the `index.ts` file:

```
// remove this line
export * from './lib/shared-domain';

// add this line
export * from './lib/models/todo.interface';

```


libs/shared/domain/src/index.ts

Our to-do interface is now available anywhere in the application!

Building Blocks
---------------

I've mentioned before that NestJS was built similarly to Angular in terms of data flow and structure. If you're new to NestJS, let's review some common terms before moving on to the [CRUD REST API](#crud-rest-api).



* Name: Controller
  * Purpose: Similar to a component in the Angular world, controllers are the "user-facing" part of the framework. This is where API routes are established
* Name: Service
  * Purpose: Very similar to Angular services, this is typically where data lookup/manipulation occurs. Controllers should delegate business logic to services as much as possible
* Name: Pipe
  * Purpose: Like Angular, pipes are meant for validating or manipulating data during the request. In this article we'll show a "global" pipe that's used for validating JSON payloads
* Name: Module
  * Purpose: Modules act as you might expect - they are pluggable groupings of controllers, services, and other providers. We'll use a feature module to manage our first controller and service, and the main AppModule will simply import the feature module


CRUD REST API
-------------

Time to write some actual NestJS-specific code. We'll use the Nx generator to create a new feature library:

```
~/git/full-stack-todo | main
> npx nx generate @nx/nest:library feature-todo \
--directory=server \
--controller \
--importPath=@fst/server/feature-todo \
--service \
--strict \
--tags=scope:server,type:feature
```


#### Explaining The Command

Another great generator from Nx, `@nx/nest:library` sets up a fresh library with some needed components:

*   `ServerFeatureTodoController` will host our API routes
*   `ServerFeatureTodoService` will handle our data
*   `ServerFeatureTodoModule` will be imported by `AppModule` soon

The command also used a new tag: `type:feature` with a small scope `scope:server`. I promise we'll get to tags before the end of this post.

Our first controller:

```
@Controller('server-feature-todo')
export class ServerFeatureTodoController {
  constructor(private serverFeatureTodoService: ServerFeatureTodoService) {}
}

```


libs/server/feature-todo/src/lib/server-feature-todo.controller.ts

Before we add a route, there needs to be some form of a data store. A later article will address the TypeORM integration, so for now let's use a [BehaviorSubject](https://www.learnrxjs.io/learn-rxjs/subjects/behaviorsubject?ref=thefullstack.engineer):

```
import { Injectable } from '@nestjs/common';
// importing our interface using the custom import path!
import { ITodo } from '@fst/shared/domain';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ServerFeatureTodoService {
    private todos$ = new BehaviorSubject<ITodo[]>([]);
    
    getAll(): ITodo[] {
        return this.todos$.value;
    }

    getOne(id: string): ITodo {
        const todo = this.todos$.value.find(td => td.id === id);
        return todo;
    }
}

```


libs/server/feature-todo/src/lib/server-feature-todo.service.ts

💡

Sometimes VSCode likes to take it's sweet time recognizing changes to `tsconfig.base.json` - in particular when new import paths are created. I manually typed out the import above, because the autocomplete import pulled from `libs/shared/domain` and that resulted in red squigglies. Once I corrected the import path, I used the Restart TS Command to refresh the available paths. On a Mac, `Shift+Space+P` launches the command prompt, and you can start typing to find the command.

I'm using a [BehaviorSubject](https://www.learnrxjs.io/learn-rxjs/subjects/behaviorsubject?ref=thefullstack.engineer) to store an empty array initially, and made it private so that no other class can directly access the BehaviorSubject - we're forced to add methods to the service for altering data. With a "data store" in place (yes, it's ephemeral, it'll reset every time the `server` app launches), we can start adding routes to the controller.

```
@Controller('server-feature-todo')
export class ServerFeatureTodoController {
  constructor(private serverFeatureTodoService: ServerFeatureTodoService) {}

  @Get('')
  getAll(): ITodo[] {
    return this.serverFeatureTodoService.getAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string): ITodo {
    return this.serverFeatureTodoService.getOne(id);
  }
}
```


libs/server/feature-todo/src/lib/server-feature-todo.controller.ts

Our first routes! NestJS uses decorators to signal which methods should be used as API routes, and what type of [HTTP request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods?ref=thefullstack.engineer) is performed on that route. We're specifying 2 GET routes, one for all of the to-dos, and one for a particular to-do.

I'm sure you're wondering why I left the `getOne()` method in the service, even though the IDE is complaining. The `find()` method isn't guaranteed to return a to-do - if no matching `id` is found, then it will return `undefined`. Let's fix this:

```
@Injectable()
export class ServerFeatureTodoService {
    private todos$ = new BehaviorSubject<ITodo[]>([]);

    getAll(): ITodo[] {
        return this.todos$.value;
    }

    getOne(id: string): ITodo {
        const todo = this.todos$.value.find(td => td.id === id);
        if (!todo) {
            throw new NotFoundException(`Todo could not be found!`)
        }
        return todo;
    }
}
```


libs/server/feature-todo/src/lib/server-feature-todo.service.ts

If `todo` is undefined here, we use NestJS' [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters?ref=thefullstack.engineer#built-in-http-exceptions) to return a 404 to the user.

One last step before we're able to _use_ the API: adding our module to the AppModule:

```
import { ServerFeatureTodoModule } from '@fst/server/feature-todo';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ServerFeatureTodoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```


apps/server/src/app/app.module.ts

And with that, we can now see our feature module and it's API routes in Nest's logger:

```
~/git/full-stack-todo | main
> nx serve server

[Nest] 6607  - 02/10/2023, 2:03:54 PM     LOG [NestFactory] Starting Nest application...
[Nest] 6607  - 02/10/2023, 2:03:54 PM     LOG [InstanceLoader] AppModule dependencies initialized +15ms
[Nest] 6607  - 02/10/2023, 2:03:54 PM     LOG [InstanceLoader] ServerFeatureTodoModule dependencies initialized +0ms
[Nest] 6607  - 02/10/2023, 2:03:54 PM     LOG [RoutesResolver] AppController {/api}: +8ms
[Nest] 6607  - 02/10/2023, 2:03:54 PM     LOG [RouterExplorer] Mapped {/api, GET} route +3ms
[Nest] 6607  - 02/10/2023, 2:03:54 PM     LOG [RoutesResolver] ServerFeatureTodoController {/api/server-feature-todo}: +0ms
[Nest] 6607  - 02/10/2023, 2:03:54 PM     LOG [RouterExplorer] Mapped {/api/server-feature-todo, GET} route +1ms
[Nest] 6607  - 02/10/2023, 2:03:54 PM     LOG [RouterExplorer] Mapped {/api/server-feature-todo/:id, GET} route +1ms
[Nest] 6607  - 02/10/2023, 2:03:54 PM     LOG [NestApplication] Nest application successfully started +6ms
[Nest] 6607  - 02/10/2023, 2:03:54 PM     LOG 🚀 Application is running on: http://localhost:3333/api
```


![](https://media.giphy.com/media/Yqz0RdEiQGTajAJYFs/giphy.gif)

You know that's right

Interacting With The API
------------------------

Great, the routes are there - now how do we use them? There are plenty of tools out there such as the well-known [Postman](https://www.postman.com/product/tools/?ref=thefullstack.engineer), but I'm going to stick to the command line for now. We'll add Swagger docs (a UI for your API that's automatically generated) in a later post.

I used [Homebrew](https://brew.sh/?ref=thefullstack.engineer) to install [httpie](https://formulae.brew.sh/formula/httpie?ref=thefullstack.engineer#default), and can now make GET requests against the routes:

```
 ~/git/full-stack-todo | main
> http localhost:3333/api/server-feature-todo

HTTP/1.1 200 OK

[]
```


It returned the empty array!

Empty arrays are nothing to get excited about, so I'm going to hard code a to-do item in my service:

```
    private todos$ = new BehaviorSubject<ITodo[]>([
        {
            id: 'something-something-dark-side',
            title: 'Add a route to create todo items!',
            description: 'Yes, this is foreshadowing a POST route introduction',
            completed: false
        }
    ]);
```


libs/server/feature-todo/src/lib/server-feature-todo.service.ts

Now I can make that API call again and see my hard-coded item:

```
 ~/git/full-stack-todo | main 
> http localhost:3333/api/server-feature-todo
HTTP/1.1 200 OK

[
    {
        "completed": false,
        "description": "Yes, this is foreshadowing a POST route introduction",
        "id": "something-something-dark-side",
        "title": "Add a route to create todo items!"
    }
]
```


Checking Off The To-do List
---------------------------

We have a way to retrieve data, but we also need to be able to create, update, and delete to-do items. Pivoting for a moment, I'd like to review the various HTTP request methods and how they're [supposed to be used with a REST API](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design?ref=thefullstack.engineer):


|Verb  |Description                                                                          |
|------|-------------------------------------------------------------------------------------|
|GET   |Retrieves a representation of the resource at the specified URI                      |
|POST  |creates a new resource at the specified URI                                          |
|PUT   |replaces an existing resource at the specified URI, or creates it if it doesn't exist|
|PATCH |updates part or all properties of the resource at the specified URI                  |
|DELETE|deletes the resource at the specified URI                                            |


Since I've added a to-do for a POST route, that's what I'll add next.

```
    create(todo: ITodo): ITodo {
        const current = this.todos$.value;
        this.todos$.next([...current, todo]);
        return todo;
    }
```


libs/server/feature-todo/src/lib/server-feature-todo.service.ts

```
  @Post('')
  create(@Body() data: ITodo): ITodo {
    return this.serverFeatureTodoService.create(data);
  }
```


libs/server/feature-todo/src/lib/server-feature-todo.controller.ts

There's a small problem with this code though - once a database is involved, the `id` property of a to-do will be created automatically (provided you're using auto-incrementing primary keys). We don't want users manually specifying the `id`, or creating a to-do item marked `complete: true`. And it has to have a title! All of these issues can be addressed by creating a Data Transfer Object with validation.

Data Transfer Objects and Payload Validation
--------------------------------------------

Since our POST route is using an interface for the `@Body` decorator, there's no real enforcement of the data structure - this just tells the compiler and IDE that data _should_ look that way in the request. Switching to a class-based DTO pattern (and telling NestJS to validate payloads) will avoid this issue. Before we create the DTO, install a couple of helper packages that we'll use for validation:

```
~/git/full-stack-todo | main
> npm i -S class-validator class-transformer
```


Now let's create a DTO for the `ITodo` objects:

```
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ITodo } from '@fst/shared/domain';

/**
 * Use the `Pick` utility type to extract only the properties we want for
 * new to-do items
 */
export class CreateTodoDto implements Pick<ITodo, 'title' | 'description'> {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
```


libs/server/feature-todo/src/lib/dtos/todo.dto.ts

Our POST route needs to be updated to use this class:

```
  @Post('')
  create(@Body() data: CreateTodoDto): ITodo {
    return this.serverFeatureTodoService.create(data);
  }
```


libs/server/feature-todo/src/lib/server-feature-todo.controller.ts

And the IDE is now complaining because `create(data)` is not passing in the expected `ITodo` - so the service should be updated as well:

```
  /**
   * Update the arg signature to match the DTO, but keep the
   * return signature - we still want to respond with the complete
   * object
   */
  create(todo: Pick<ITodo, 'title' | 'description'>): ITodo {
    const current = this.todos$.value;
    // Use the incoming data, a randomized ID, and a default value of `false` to create the new to-do
    const newTodo: ITodo = {
      ...todo,
      id: `todo-${Math.floor(Math.random() * 10000)}`,
      completed: false,
    };
    this.todos$.next([...current, newTodo]);
    return newTodo;
  }
```


libs/server/feature-todo/src/lib/server-feature-todo.service.ts

One last file to update before we can test the validation:

```
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  /** add this line!! */
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  
  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}
```


apps/server/src/main.ts

And the result:

```
~/git/full-stack-todo | main
> http localhost:3333/api/server-feature-todo title=foo description=bar

HTTP/1.1 201 Created

{
    "completed": false,
    "description": "bar",
    "id": "todo-3827",
    "title": "foo"
}

# checking that the valdiation works as well

 ~/git/full-stack-todo | main
> http localhost:3333/api/server-feature-todo title="this will fail"

HTTP/1.1 400 Bad Request

{
    "error": "Bad Request",
    "message": [
        "description should not be empty",
        "description must be a string"
    ],
    "statusCode": 400
}
```


Success!

Now to address the "library types" I've referred to a few times. Nx has [a really good starting point](https://nx.dev/more-concepts/library-types?ref=thefullstack.engineer) for this so I won't type it all out here. It is important that tags are being properly used from the start, however, as it can be a hassle to go back through dozens of libraries to make sure they're all in check. Here's the current state of our apps and libs:

```
 ~/git/full-stack-todo | main
> grep tags {libs,apps}/**/project.json
libs/server/feature-todo/project.json:  "tags": ["scope:server", "type:feature"]
libs/shared/domain/project.json:  "tags": ["scope:shared", "type:domain"]
apps/client-e2e/project.json:  "tags": [],
apps/client/project.json:  "tags": ["type:app", "scope:client"]
apps/server/project.json:  "tags": ["scope:server","type:app"]
```


The `.eslintrc.json` file does not have any boundaries defined for these tags, so let's update that:

```
{
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "enforceBuildableLibDependency": true,
            "allow": [],
            "depConstraints": [
              {
                "sourceTag": "*",
                "onlyDependOnLibsWithTags": ["*"]
              },
              // add these 2 entries below!
              {
                "sourceTag": "scope:server",
                "onlyDependOnLibsWithTags": ["scope:server", "scope:shared"]
              },
              {
                "sourceTag": "scope:client",
                "onlyDependOnLibsWithTags": ["scope:client", "scope:shared"]
              }
            ]
          }
        ]
      }
    },
```


<projectRoot>/.eslintrc.json

This does not address the `type` tags that we've added to libraries, but for now we'll make sure that `server` and `client` don't get any code mixed up. And at the moment, our linting passes!

```
 ~/git/full-stack-todo | main
> nx run-many --target=lint --all

    ✔  nx run shared-domain:lint (3s)
    ✔  nx run server-feature-todo:lint (3s)
    ✔  nx run client:lint (3s)
    ✔  nx run server:lint (2s)
    ✔  nx run client-e2e:lint (2s)
    ✔  nx run server-e2e:lint (2s)

 ——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 >  NX   Successfully ran target lint for 6 projects (5s)
```


Final Notes
-----------

We now officially have a REST API for our to-do items! In the tagged version of the repository for this part, you'll notice that I've fleshed out the remaining CRUD routes for to-do items, updated the service, and added DTOs as needed. That code can be found here: [wgd3/full-stack-todo@part-02](https://github.com/wgd3/full-stack-todo/tree/part-02?ref=thefullstack.engineer)

In the next post, we'll add Swagger documentation to our routes, improve the DTOs and shared interfaces, and add tests; all done in an effort to have a bulletproof API before the Angular client starts using it. Stay tuned and thanks for reading!

```
 ~/git/full-stack-todo | main
> http PATCH localhost:3333/api/server-feature-todo/something-something-dark-side completed:=true

HTTP/1.1 200 OK

{
    "completed": true,
    "description": "Yes, this is foreshadowing a POST route introduction",
    "id": "something-something-dark-side",
    "title": "Add a route to create todo items!"
}
```


Feels like an appropriate way to sign off for this post!

Updates
-------

**May 8, 2023**: Thanks to [@rostag](https://github.com/rostag?ref=thefullstack.engineer) for [pointing out](https://github.com/wgd3/full-stack-todo/discussions/22?ref=thefullstack.engineer) that the `generate` commands I originally posted should be updated! They are now in sync with the proper syntax for Nx 16.