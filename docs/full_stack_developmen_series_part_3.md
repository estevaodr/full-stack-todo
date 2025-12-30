# Connecting Angular to a REST API
Welcome back! In part 3 of this series we're going to dive into what it takes to consume a REST API from an Angular-based front end. By the end of this post you will see:

*   Creating a "feature" library for our first component
*   Creating a "data-access" library for front-end HTTP code
*   Updates to shared data structures for strongly-typed HTTP requests/responses in both applications
*   Using the `async` pipe to create reactive templates and display data
*   Basic CSS styling

Other posts in this series:

*   [An Introduction](https://thefullstack.engineer/full-stack-development-series-an-introduction/)
*   Part 1: [Getting Started With Nx, Angular, and NestJS](https://thefullstack.engineer/full-stack-development-series-part-1-getting-started-with-nx-angular-and-nestjs/)
*   Part 2: [Creating a REST API](https://thefullstack.engineer/full-stack-development-series-part-2-creating-a-rest-api-with-nestjs/)
*   Part 3: [Connecting Angular to a REST API](https://thefullstack.engineer/full-stack-development-series-part-3-connect-angular-with-nestjs-api) (this post)

If you want to skip ahead to the code, you can checkout out the repository: [wgd3/full-stack-todo@part-03](https://github.com/wgd3/full-stack-todo/tree/part-03?ref=thefullstack.engineer)

Fire It Up
----------

As I mentioned in a previous post, my preferred way to get all apps up and running is with this command:

```
> nx run-many --target=serve --all
```


Once that's running, you can visit the `client` app by navigating to http://localhost:4200 in your browser. You'll be greeted by the placeholder page from Nx:

![](https://thefullstack.engineer/content/images/2023/02/localhost_4200_.png)

Nothing much to see here, other than some very helpful links if it's your first time using Nx. Let's clean up the Nx placeholders before moving forward. First step, you can delete `apps/client/src/app/nx-welcome.component.ts`. Following that, update the `app.*` files like so:

```
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'fse-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'client';
}

```


apps/client/src/app/app.component.ts

```
<router-outlet></router-outlet>

```


apps/client/src/app/app.component.html

Now we're ready to add our first component!

The First Client Library
------------------------

In order to display anything in our UI, there needs to be a "container" component in which to display information. Everything displayed on a page in an Angular app is a component, and that includes every descendent of the `<body>` element.

By using the library generator for this component, we accomplish a few things:

1.  Modularity. An isolated library is easier to test and refactor as necessary.
2.  Automatic component generation with a template and stylesheet, pre-exported by an `index.ts` file
3.  Automated updates to `tsconfig.base.json` which allows us to import content from the library anywhere in the application.

```
> nx generate @nrwl/angular:library FeatureDashboard \
--style=scss \
--directory=libs/client \
--importPath=@fst/client/feature-dashboard \
--routing \
--simpleName 
--skipModule \
--standalone \
--standaloneConfig \
--tags=type:feature,scope:client \
--unitTestRunner=none
```


Our new library has been prepped, and thanks to the `--routing` flag there is now. a `libs/client/feature-dashboard/src/lib/lib.routes.ts` with easily-imported routes! In order to wire up the dashboard with the main app, the `app.routes.ts` file needs to be updated like so:

```
import { Route } from '@angular/router';
import { featureDashboardRoutes } from '@fst/client/feature-dashboard';

export const appRoutes: Route[] = [...featureDashboardRoutes];


```


apps/client/src/app/app.routes.ts

 And in our browser...

![](https://thefullstack.engineer/content/images/2023/02/Screen-Shot-2023-02-22-at-3.05.59-PM.png)

It's definitely not pretty, but it's a start!

Data Access library for HTTP Communication
------------------------------------------

Angular has some [extensive documentation](https://angular.io/guide/http?ref=thefullstack.engineer) on their HTTPClient library, so I won't dive too deep.

```
import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideHttpClient(),
  ],
}).catch((err) => console.error(err));

```


apps/client/src/main.ts

```
> npx nx generate @nx/angular:library \
  --name=DataAccess \
  --style=scss \
  --directory=libs/client/data-access \
  --importPath=@fst/client/data-access \
  --skipModule \
  --standalone \
  --tags=type:data-access,scope:client \
  --unitTestRunner=none
```


Generating the data-access library

Delete all `data-access.component.*` files under `libs/client/data-access/src/lib/data-access` and update `index.ts` to remove exports.

```
> nx generate @schematics/angular:service Api \
--project=client-data-access \
--path=libs/client/data-access/src/lib
```


Generating the API service

Update `ApiService` with some base methods:

```
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  getAllToDoItems(): Observable<unknown[]> {
    return of([]);
  }

  getToDoById(todoId: string): Observable<unknown> {
    return of();
  }

  createToDo(todoData: unknown): Observable<unknown> {
    return of();
  }

  updateToDo(todoId: string, todoData: unknown): Observable<unknown> {
    return of();
  }

  createOrUpdateToDo(todoId: string, todoData: unknown): Observable<unknown> {
    return of();
  }

  deleteToDo(todoId: string): Observable<unknown> {
    return of();
  }
}

```


libs/client/data-access/src/lib/api.service.ts

#### What's this about? `inject(HttpClient)`

Dependency Injection! Traditionally, a class's `constructor()` was used to "inject" dependencies into that class. This can quickly become messy when you have more than 1-2 dependencies, even more so when those dependencies need their own decorators such as `@Self()`. With Angular 15, [inject](https://angular.io/api/core/inject?ref=thefullstack.engineer) can be used instead to place dependencies outside of a constructor.

Update return signatures to use `ITodo` interface:

```
  getAllToDoItems(): Observable<ITodo[]> {
    return of([]);
  }
```


In the last post, DTOs were introduced to enforce strictly-typed payloads for our API. These DTOs can not be used by Angular directly, however we can update the `ITodo` interface file with types that the DTOs can implement. We need types for creating, updating, and upserting to-do items:

```
export interface ITodo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export type ICreateTodo = Pick<ITodo, 'title' | 'description'>;
export type IUpdateTodo = Partial<Omit<ITodo, 'id'>>;
export type IUpsertTodo = ITodo;
```


libs/shared/domain/src/lib/models/todo.interface.ts

Going back to the ServerFeatureTodo library, the DTOs can be updated to implement these new types:

```
export class CreateTodoDto implements ICreateTodo {
  //
}

export class UpsertTodoDto implements IUpsertTodo {
  //
}

export class UpdateTodoDto implements IUpdateTodo {
  // 
}
```


libs/server/feature-todo/src/lib/dtos/todo.dto.ts

Our Angular app can now make REST calls and use these CRUD interfaces to ensure the call signature matches what our API requires! Let's update the ApiService to reflect the changes, and return real data:

```
  getAllToDoItems(): Observable<ITodo[]> {
    return this.http.get<ITodo[]>(`/api/todos`);
  }

  getToDoById(todoId: string): Observable<ITodo> {
    return this.http.get<ITodo>(`/api/todos/${todoId}`);
  }

  createToDo(todoData: ICreateTodo): Observable<ITodo> {
    return this.http.post<ITodo>(`/api/todos`, todoData);
  }

  updateToDo(todoId: string, todoData: IUpdateTodo): Observable<ITodo> {
    return this.http.patch<ITodo>(`/api/todos/${todoId}`, todoData);
  }

  createOrUpdateToDo(todoId: string, todoData: IUpsertTodo): Observable<ITodo> {
    return this.http.put<ITodo>(`/api/todos/${todoId}`, todoData);
  }

  deleteToDo(todoId: string): Observable<never> {
    return this.http.delete<never>(`/api/todos/${todoId}`);
  }
```


libs/client/data-access/src/lib/api.service.ts

💡

At some point during the development of this post, I got tired of using the very long `/api/server-feature-todo` endpoint - not to mention, it doesn't exactly conform to REST conventions. As such, the controller decorator was updated to shorten the endpoint:  
`@Controller({ path: 'todos' })` which makes endpoints `/api/todos`

💡

We use relative URLs since our Angular application is configured to automatically proxy relative URLs to the back end. If a full URL scheme was specified the proxy would not be used.

Displaying The Results
----------------------

It's time to finally show the API responses in the UI!

First step is to connect our dashboard component to the ApiService:

```
@Component({
  selector: 'full-stack-todo-feature-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-dashboard.component.html',
  styleUrls: ['./feature-dashboard.component.scss'],
})
export class FeatureDashboardComponent {
  private readonly apiService = inject(ApiService);

  todoItems$ = this.apiService.getAllToDoItems();
}

```


libs/client/feature-dashboard/src/lib/feature-dashboard/feature-dashboard.component.ts

💡

`todoItems$` doesn't hold any data yet! It needs a subscriber, which in this case will be an [AsyncPipe](https://angular.io/api/common/AsyncPipe?ref=thefullstack.engineer) in the template. This pipe automatically handles subscribing/unsubscribing for us, so there's no additional code needed.

Double check that Angular's proxy config is properly defined:

```
{
  "/api": {
    "target": "http://localhost:3333",
    "secure": false,
    "logLevel": "debug"
  }
}
```


apps/client/proxy.conf.json

💡

I stumbled across a small issue with my setup, where the `proxy.conf.json` file added a `/api` suffix to the `target` value. This was resulting in 404s on the UI, and I'll admit I was embarrassed I didn't understand why immediately.  
Bonus knowledge: As of Angular 13, [logLevel](https://github.com/angular/angular-cli/issues/22112?ref=thefullstack.engineer#issuecomment-962987474) does not actually print to console while you run the dev server! To see that output you need to run the dev server with a `--verbose` flag.

And now display the results from our API call!

```
<p>feature-dashboard works!</p>

<ul>
    <li *ngFor="let todo of todoItems$ | async; let i = index">{{i}}. {{ todo.title }}</li>
</ul>
```


Yes, `<ol>` would automatically number our list items (and start from 1!) but for demonstration purposes I used `<ul>`

![](https://thefullstack.engineer/content/images/2023/02/Screen-Shot-2023-02-22-at-4.16.59-PM.png)

Making It Pretty... ish
-----------------------

I usually hold off on any styling until I've got a decent amount of code written, and I'll dive into styling an Angular app in another post, but for demonstration purposes I updated these to-do items with a little flare.

```
<div class="todo-list">
  <div class="todo" *ngFor="let todo of todoItems$ | async; let i = index">
    <h2 class="todo__title">#{{ i + 1 }} {{ todo.title }}</h2>
    <p class="todo__description">{{ todo.description }}</p>
    <small class="todo__id">ID: {{ todo.id }}</small>
    <br />
    <small class="todo__completed-label"
      >Completed:
      <span class="todo__completed-value--{{ todo.completed }}">{{
        todo.completed
      }}</span></small
    >
  </div>
</div>
```


libs/client/feature-dashboard/src/lib/feature-dashboard/feature-dashboard.component.html

```
// container element for the (vertical) list
.todo-list {
  display: flex;
  flex-direction: column;
  
  // "owl" pattern used for spacing between list items
  > * + * {
    margin-block-start: 1em;
  }
}

// block-level class name
.todo {
  width: 30rem;
  padding: 8px;
  box-shadow: 4px 4px 8px 0px;
  border: 1px solid #000000;
  font-family: Arial, Helvetica, sans-serif;

  // element-level class name
  &__title {
    margin-block-start: 0;
  }

  // element-level class name
  &__id {
    color: #a5a5a5;
  }

  // element-level class name
  &__completed-value {
  
    // modifier-level class name
    &--false {
      color: red;
    }
    
    // modifier-level class name
    &--true {
      color: green;
    }
  }
}
```


libs/client/feature-dashboard/src/lib/feature-dashboard/feature-dashboard.component.scss

💡

What's with the CSS class naming scheme? [BEM 101](https://css-tricks.com/bem-101/?ref=thefullstack.engineer)  
This application does not incorporate any styling frameworks (yet!) such as Tailwind, Bootstrap, Angular Material, etc. But even with a framework, you should decide on a naming convention for your CSS classes for consistency purposes. I've used BEM for a long time, and am of the opinion that it's easy to pick up for new developers. 

![](https://thefullstack.engineer/content/images/2023/02/Screen-Shot-2023-02-22-at-4.40.35-PM.png)

Summary
-------

At this point you technically have a "full-stack" application! Bare as it may be, there is a back-end API (with an ephemeral data store) and a front-end UI in one neat monorepo. Speaking of monorepos, I'd like to highlight one of Nx's cooler features now that we have a handful of libraries to work with. Nx offers the ability to create dependency graphs in a fancy UI with it's `nx dep-graph` command:

![](https://thefullstack.engineer/content/images/2023/02/graph.png)

We have successfully implemented a hierarchy of apps and libraries, being mindful of both a separation of concerns _and_ shared data!

I hope you found this post useful in getting started on the front-end side of a full-stack application. The next entry in this series will focus on forms, front-end validation, and UI interaction. There's still a lot of ground to cover, so stay tuned for the next post!

All code up to this point can be found here: [wgd3/full-stack-todo@part-03](https://github.com/wgd3/full-stack-todo/tree/part-03?ref=thefullstack.engineer)