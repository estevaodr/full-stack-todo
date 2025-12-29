/**
 * Application Routes Configuration
 * 
 * This file defines the routing structure for the Angular application.
 * Routes map URLs to components - when a user navigates to a URL,
 * Angular loads and displays the corresponding component.
 * 
 * Key concepts:
 * - Route: Configuration object that maps a URL path to a component
 * - Lazy loading: loadComponent() loads the component only when needed (code splitting)
 * - Dynamic import: import() is a JavaScript feature for loading modules on demand
 */
import { Route } from '@angular/router';

/**
 * Array of route configurations
 * 
 * Currently has one route:
 * - Empty path ('') = root URL (http://localhost:4200/)
 * - Uses lazy loading to load TodoListComponent only when needed
 * 
 * Note: We're not using this route in the current implementation,
 * but it's set up for future use when we add more pages.
 */
export const appRoutes: Route[] = [
  {
    // Empty string means this is the default/home route
    path: '',
    
    // Lazy loading: Component is loaded only when this route is accessed
    // This improves initial load time by splitting the code
    // The function returns a Promise that resolves to the component
    loadComponent: () =>
      import('./todo/todo-list.component').then((m) => m.TodoListComponent),
  },
];
