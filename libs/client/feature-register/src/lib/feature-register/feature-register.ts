import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-feature-register',
  standalone: true,
  imports: [],
  templateUrl: './feature-register.html',
  styleUrl: './feature-register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureRegister {}
