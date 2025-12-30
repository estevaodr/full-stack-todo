// Angular platform bootstrap function
import { bootstrapApplication } from '@angular/platform-browser';
// Router providers for navigation
import { 
    provideRouter, 
    withEnabledBlockingInitialNavigation 
} from '@angular/router';
// HTTP client provider for API calls
import { provideHttpClient } from '@angular/common/http';
// Root application component
import { App } from './app/app';
// Application routes configuration
import { appRoutes } from './app/app.routes';

// Bootstrap the Angular application with providers
bootstrapApplication(App, {
    providers: [
        // Configure router with routes and enable blocking initial navigation
        // (waits for initial navigation to complete before rendering)
        provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
        // Enable HTTP client for making API requests
        provideHttpClient(),
    ],
}).catch((err) => console.error(err));
