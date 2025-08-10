// src/app/app.component.ts
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, NgIf,
    MatToolbarModule, MatIconModule, MatButtonModule,
    MatSidenavModule, MatListModule
  ],
  styles: [`
    .app-shell { height: 100dvh; }
    .content { padding: 16px; }
    .spacer { flex: 1; }
    a[mat-list-item] { text-decoration: none; }
  `],
  template: `
  <mat-sidenav-container class="app-shell">
    <mat-sidenav mode="side" opened>
      <mat-nav-list>
        <a mat-list-item routerLink="/admin">
          <mat-icon>dashboard</mat-icon>&nbsp; Admin
        </a>
        <a mat-list-item routerLink="/s/1">
          <mat-icon>assignment</mat-icon>&nbsp; Public Survey (demo)
        </a>
      </mat-nav-list>
    </mat-sidenav>

    <mat-sidenav-content>
      <mat-toolbar color="primary">
        <button mat-icon-button aria-label="Menu" (click)="toggle()">
          <mat-icon>menu</mat-icon>
        </button>
        <span>Survey UI</span>
        <span class="spacer"></span>
        <a mat-button routerLink="/admin">
          <mat-icon>dashboard</mat-icon>&nbsp;Admin
        </a>
        <a mat-button routerLink="/s/1">
          <mat-icon>assignment</mat-icon>&nbsp;Public
        </a>
      </mat-toolbar>

      <div class="content">
        <router-outlet></router-outlet>
      </div>
    </mat-sidenav-content>
  </mat-sidenav-container>
  `
})
export class AppComponent {
  sidenavOpened = signal(true);
  toggle(){ this.sidenavOpened.set(!this.sidenavOpened()); }
}
