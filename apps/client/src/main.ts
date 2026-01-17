// Angular platform bootstrap function
import { bootstrapApplication } from '@angular/platform-browser';
// Router providers for navigation
import { 
    provideRouter, 
    withEnabledBlockingInitialNavigation 
} from '@angular/router';
// HTTP client provider for API calls
import { provideHttpClient, withInterceptors } from '@angular/common/http';
// Root application component
import { App } from './app/app';
// Application routes configuration
import { appRoutes } from './app/app.routes';
// JWT interceptor for adding authentication tokens to requests
import { jwtInterceptor } from '@full-stack-todo/client/data-access';

// Bootstrap the Angular application with providers
bootstrapApplication(App, {
    providers: [
        // Configure router with routes and enable blocking initial navigation
        // (waits for initial navigation to complete before rendering)
        provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
        // Enable HTTP client with JWT interceptor for making authenticated API requests
        // The interceptor automatically adds the Authorization header with the JWT token
        provideHttpClient(withInterceptors([jwtInterceptor])),
    ],
}).catch((err) => console.error(err));
