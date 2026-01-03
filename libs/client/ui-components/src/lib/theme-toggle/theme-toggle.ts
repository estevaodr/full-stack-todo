/**
 * Theme Toggle Component
 * 
 * A standalone Angular component that allows users to toggle between
 * light and dark themes. Uses CSS custom properties for runtime theme switching.
 * 
 * Features:
 * - Detects system preference on initialization
 * - Persists user preference in localStorage
 * - Smooth theme transitions
 * - Accessible with proper ARIA labels
 */

import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'fst-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="theme-toggle"
      (click)="toggleTheme()"
      type="button"
      [attr.aria-label]="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      [attr.aria-pressed]="isDark"
      [attr.title]="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
      <span class="theme-toggle__icon" aria-hidden="true">
        {{ isDark ? '☀️' : '🌙' }}
      </span>
      <span class="theme-toggle__label">
        {{ isDark ? 'Light' : 'Dark' }}
      </span>
    </button>
  `,
  styles: [`
    .theme-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-md);
      color: var(--color-text-default);
      cursor: pointer;
      font-family: var(--font-family-base);
      font-size: var(--font-size-sm);
      font-weight: 500;
      transition: all var(--transition-base);
      
      &:hover {
        background: var(--color-bg-hover);
        border-color: var(--color-border-hover);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }
      
      &:active {
        transform: translateY(0);
      }
      
      &:focus-visible {
        outline: 2px solid var(--color-border-focus);
        outline-offset: 2px;
      }
    }
    
    .theme-toggle__label {
      @media (max-width: 640px) {
        display: none;
      }
    }
  `]
})
export class ThemeToggleComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  
  isDark = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem('theme');
    
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determine initial theme
    if (savedTheme) {
      this.isDark = savedTheme === 'dark';
    } else {
      this.isDark = prefersDark;
    }
    
    this.applyTheme();
    
    // Listen for system theme changes (optional)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.isDark = e.matches;
        this.applyTheme();
      }
    });
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    this.applyTheme();
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    }
  }

  private applyTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const theme = this.isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    // Add transition class for smooth theme switching
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  }
}

