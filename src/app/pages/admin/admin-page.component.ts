// src/app/pages/admin/admin-page.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, AsyncPipe, NgIf } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SurveyApiService } from '../../services/survey-api.service';
import { Survey } from '../../models/api-model';

@Component({
  standalone: true,
  imports: [
    NgFor, AsyncPipe, NgIf, RouterLink,
    MatButtonModule, MatCardModule, MatIconModule, MatListModule, MatProgressSpinnerModule
  ],
  providers: [SurveyApiService],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(6px)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ],
  template: `
  <mat-card>
    <mat-card-title>My Surveys</mat-card-title>
    <mat-card-subtitle>Manage and share your surveys</mat-card-subtitle>

    <div style="margin: 8px 0 16px;">
      <button mat-fab color="primary" routerLink="/admin/surveys/new" aria-label="New Survey">
        <mat-icon>add</mat-icon>
      </button>
      <span style="margin-left: 12px;">Create a new survey</span>
    </div>

    <ng-container *ngIf="surveys; else loading">
      <mat-list [@fadeIn]>
        <mat-list-item *ngFor="let s of surveys">
          <mat-icon matListItemIcon>assignment</mat-icon>
          <div matListItemTitle>{{ s.title }}</div>
          <div matListItemLine>ID: {{ s.id }}</div>
          <span class="spacer"></span>
          <a mat-stroked-button color="primary" [routerLink]="['/admin/surveys', s.id]">
            <mat-icon>edit</mat-icon>&nbsp;Edit
          </a>
          <a mat-button color="accent" [routerLink]="['/s', s.id]">
            <mat-icon>open_in_new</mat-icon>&nbsp;Open Public
          </a>
        </mat-list-item>
      </mat-list>
    </ng-container>

    <ng-template #loading>
      <div style="display:flex;align-items:center;gap:12px;">
        <mat-progress-spinner mode="indeterminate" diameter="24"></mat-progress-spinner>
        Loading...
      </div>
    </ng-template>
  </mat-card>
  `,
  styles: [`.spacer{flex:1}`]
})
export class AdminPageComponent implements OnInit {
  private svc = inject(SurveyApiService);
  surveys: Survey[] | null = null;

  ngOnInit() {
    this.svc.getAllSurveys().subscribe(s => this.surveys = s ?? []);
  }
}
