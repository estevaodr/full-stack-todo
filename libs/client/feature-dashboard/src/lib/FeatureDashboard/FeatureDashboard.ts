import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '@full-stack-todo/client/data-access';
import { inject } from '@angular/core';

@Component({
  selector: 'lib-feature-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './FeatureDashboard.html',
  styleUrl: './FeatureDashboard.scss',
})
export class FeatureDashboard {
  private readonly api = inject(Api);
  todoItems$ = this.api.getAllToDoItems();
}
