/**
 * Application Configuration
 * 
 * This file configures the Angular application with essential services and features.
 * In modern Angular (v14+), we use "providers" to configure the app instead of modules.
 * 
 * Key concepts:
 * - ApplicationConfig: TypeScript interface for app configuration
 * - Providers: Services and features available throughout the app
 * - Standalone components: Modern Angular approach (no NgModules needed)
 */
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router'; // Enables routing functionality
import { provideHttpClient } from '@angular/common/http'; // Enables HTTP requests
import { appRoutes } from './app.routes';

/**
 * Application configuration object
 * 
 * This configures what services and features are available app-wide.
 * All components can use these services via dependency injection.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Global error handler - catches unhandled errors across the app
    provideBrowserGlobalErrorListeners(),
    
    // Router configuration - enables navigation between routes
    // appRoutes defines which URLs map to which components
    provideRouter(appRoutes),
    
    // HttpClient provider - enables making HTTP requests
    // Without this, HttpClient won't work in services
    // This is required for TodoService to make API calls
    provideHttpClient(),
  ],
};
