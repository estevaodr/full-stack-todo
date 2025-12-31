# Getting Started with Nx, Angular, and NestJS
Welcome to my Full Stack Development Series! This collection of posts intends on teaching developers how to build a full-stack application "from soup to nuts". By the end of the series you will have learned how to use NestJS as a REST API, Angular as a front-end client, Nx to manage your repository, and Docker to deploy the application in a variety of ways.

As part of each post, I'll include a link to my GitHub repo and specifically a tag that corresponds to the article. If you'd like to check that out before reading, you can do so here: [wgd3/full-stack-todo@part-01](https://github.com/wgd3/full-stack-todo/tree/part-01?ref=thefullstack.engineer)

*   [An Introduction](https://thefullstack.engineer/full-stack-development-series-an-introduction/)
*   Part 1: [Getting Started With Nx, Angular, and NestJS](https://thefullstack.engineer/full-stack-development-series-part-1-getting-started-with-nx-angular-and-nestjs/) (this post)
*   Part 2: [Creating a REST API](https://thefullstack.engineer/full-stack-development-series-part-2-creating-a-rest-api-with-nestjs/)
*   Part 3: [Connecting Angular to a REST API](https://thefullstack.engineer/full-stack-development-series-part-3-connect-angular-with-nestjs-api/)

Prerequisites
-------------

This series of tutorials makes a few assumptions:

*   You have Node.js installed: [https://nodejs.org/en/download/current/](https://nodejs.org/en/download/current/?ref=thefullstack.engineer)
*   Git is installed: [https://git-scm.com/book/en/v2/Getting-Started-Installing-Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git?ref=thefullstack.engineer)
*   You have an IDE available. The one I am using in these posts is VSCode and has installation instructions here: [https://code.visualstudio.com/docs/setup/mac](https://code.visualstudio.com/docs/setup/mac?ref=thefullstack.engineer)

Creating A Monorepo and the NestJS API
--------------------------------------

In most modern Javascript frameworks there is a recommended project/directory structure. For smaller apps, standalone apps that don't have companion microservices, or for developers who are learning, that structure makes the most sense. However, as this "stack" will have multiple applications developed in tandem, and share data structures, I prefer to use a monorepo and keep all the code in one place. So, what is a monorepo?

> A monorepo is a single git repository that holds the source code for multiple applications and libraries, along with the tooling for them.  
> \- From Nx Documentation: ["Why Monorepos?"](https://nx.dev/more-concepts/why-monorepos?ref=thefullstack.engineer)

There are a handful of monorepo "tools" such as [Turbo](https://turbo.build/?ref=thefullstack.engineer) and [Lerna](https://lerna.js.org/?ref=thefullstack.engineer), but my preferred tool is [Nx](https://nx.dev/?ref=thefullstack.engineer). Their site has excellent documentation on high-level concepts, caching, and the complete CLI - but for now, let's create the repository:

```
# change to your choice of directory, for me that's ~/git
$ cd ~/git

$ npx create-nx-workspace@latest --preset nest \
--name full-stack-todo \
--appName server \
--nxCloud true
```


💡

**Note**: If you are familiar with Nx already, you may be wondering why I didn't use the `angular-nest` preset as that would perfectly fit our needs. After a while, I stumbled across [nrwl/nx#14228](https://github.com/nrwl/nx/issues/14228?ref=thefullstack.engineer) and learned that this preset is no longer available!

After a minute or two of `npm install` commands, you will find the following folder structure:

```
full-stack-todo
├── apps
│   ├── server
│   └── server-e2e
├── libs
└── tools
    └── generators
```


The `server-e2e` application is automatically generated for creating integration tests, and that will be covered in a future post. `server` contains the bootstrap code `main.ts` and the `AppModule` for NestJS. And finally, the `libs` directory is where all application logic will live.

Running The NestJS Application
------------------------------

Before we create a client Angular application, I want to point out how simple it is to run the `server` application that was just created:

```
 ~/git 
> cd full-stack-todo

~/git/full-stack-todo | main
> nx serve server

[Nest] 67756  - 02/09/2023, 12:11:39 PM     LOG [NestFactory] Starting Nest application...
[Nest] 67756  - 02/09/2023, 12:11:39 PM     LOG [InstanceLoader] AppModule dependencies initialized +16ms
[Nest] 67756  - 02/09/2023, 12:11:39 PM     LOG [RoutesResolver] AppController {/api}: +13ms
[Nest] 67756  - 02/09/2023, 12:11:39 PM     LOG [RouterExplorer] Mapped {/api, GET} route +4ms
[Nest] 67756  - 02/09/2023, 12:11:39 PM     LOG [NestApplication] Nest application successfully started +7ms
[Nest] 67756  - 02/09/2023, 12:11:39 PM     LOG 🚀 Application is running on: http://localhost:3333/api
No errors found.
```


It can't _do_ anything yet, but we know it works!

Creating An Angular Application
-------------------------------

Now that we have a back end in place, it's time to create the front end. If you've seen Angular tutorials (or read [their documentation](https://angular.io/guide/setup-local?ref=thefullstack.engineer#create-a-workspace-and-initial-application)), you may be used to running `ng new` and going from there. Since Nx is managing this repository, we're going to let Nx do the heavy lifting for us:

```
# add Angular support to the repository
~/git/full-stack-todo | main
> npm install @nrwl/angular

# generate the app
 ~/git/full-stack-todo | main !2 
> nx generate @nrwl/angular:application --name client \
> --style scss \
> --prefix fse \
> --tags type:app,scope:client \
> --strict \
> --backendProject server \
> --standaloneConfig \
> --standalone \
> --routing
```


There are a lot of flags specified here, which I did namely for a shorter code block - you could leave out everything except `name` and use the colorful prompts to set options. Here's what was set:

*   `name` - Pretty self-explanatory, the name of the application as it will appear under the `apps/` folder
*   `style` - There are a couple of options here, but I always go for SCSS. There are [many more features](https://blog.udemy.com/scss-vs-css/?ref=thefullstack.engineer) available when it comes to styling or organizing styles
*   `prefix` - Angular and Nx use generators to create common parts of the application such as components, directives, and pipes. Whenever the generator runs, it uses the prefix specified here for the `selector`  property of that object. This is arbitrary, but I'd recommend keeping it short
*   `tags` - Tags are used by ESLint (by way of [Nx plugins](https://nx.dev/recipes/other/tag-multiple-dimensions?ref=thefullstack.engineer)) to enforce boundaries between libraries (API controllers have no need to call Angular services) and prevent circular dependencies. More on this later.
*   `strict` - [Stronger type safety](https://betterprogramming.pub/why-to-and-how-to-use-strict-mode-in-angular-applications-1e6f6ffc0595?ref=thefullstack.engineer) throughout the project
*   `backendProject` - Nx will create a `proxy.conf.json` for us so that we don't have to edit our `/etc/hosts` file or set up an nginx server - any HTTP requests made by the front-end that are relative (don't include `http://someother.api`) are routed to the API
*   `standaloneConfig` - Creates a `project.json` file under `apps/client/` with app-specific settings, instead of all libraries and apps using a singular `workspace.json` file in the project root.
*   `standalone` - Embrace the future! Angular is [moving away](https://angular.io/guide/standalone-components?ref=thefullstack.engineer) from a `NgModule`\-focused structure.
*   `routing` - Exactly what it sounds like, this flag initializes a routing system for the `client` application.

Again with a simple command, we can run and view our new front end:

```
 ~/git/full-stack-todo | main !4 ?2 
> nx serve client

> nx run client:serve:development

✔ Browser application bundle generation complete.

Initial Chunk Files   | Names         |  Raw Size
vendor.js             | vendor        |   2.04 MB |
polyfills.js          | polyfills     | 314.17 kB |
styles.css, styles.js | styles        | 210.17 kB |
main.js               | main          |  40.54 kB |
runtime.js            | runtime       |   6.51 kB |

                      | Initial Total |   2.60 MB

Build at: 2023-02-09T18:16:18.842Z - Hash: 219090fa6e2ad09b - Time: 12554ms

** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **


✔ Compiled successfully.
```


Time To Commit
--------------

Every developer (or rather, every Git user) has their philosophy on when to commit their work. I'm often a fan of pushing _frequently_ but we just updated/added over 30 files in this repository without committing anything.. oops!

```
# check in all files into version control
 ~/git/full-stack-todo | main !4 ?2 
> git add .

# run the commit
 ~/git/full-stack-todo | main +33
> git commit -m "added client app"
[main c46eae8] added client app
 33 files changed, 9249 insertions(+), 2655 deletions(-)
```


Hello, World!
-------------

One of the other commands that Nx offers is `run-many` and is how I prefer to get both `client` and `server` running simulatneously, in the same terminal window:

```
 ~/git/full-stack-todo | main 
> nx run-many --target=serve --projects=client,server

 >  NX   Running target serve for 2 projects:

    - client
    - server

 ————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run client:serve:development


> nx run server:serve
```


You can see here that with no other flags, the serve command defaults to using the `development` configuration for `client`. This is perfect for now, but something to be mindful of as we focus on different deployment options.

With both applications running, you have the early makings of a full-stack application! Don't forget that if you'd like to follow along or reference this codebase, you can visit the GitHub repo here: [wgd3/full-stack-todo@part-01](https://github.com/wgd3/full-stack-todo/tree/part-01?ref=thefullstack.engineer)

Congratulations on making it this far; I look forward to working with you in the next part of this series.

Some additional notes about everything addressed in this post:

*   You may have noticed the `~/git/full-stack-todo | main !4 ?2` bit of my command prompt in the terminal snippets. The `main` string is a reference to my current git branch, the `!4` indicates that 4 tracked files have changed, and `?2` indicates that 2 new files have been added. This appears on my command prompt thanks to [Oh My Zsh](https://ohmyz.sh/?ref=thefullstack.engineer) and the [git plugin](https://github.com/ohmyzsh/ohmyzsh/blob/master/plugins/git/git.plugin.zsh?ref=thefullstack.engineer). I was hesitant to ever change from Bash after 15 years of a default shell, but I don't regret a thing.