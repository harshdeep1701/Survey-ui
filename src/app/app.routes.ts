import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'admin', pathMatch: 'full' },

  { path: 'admin',
    loadComponent: () => import('./pages/admin/admin-page.component').then(m => m.AdminPageComponent) },

  { path: 'admin/surveys/new', 
    loadComponent: () => import('./pages/admin/survey-editor.component').then(m => m.SurveyEditorComponent) },

  { path: 'admin/surveys/:id',
    loadComponent: () => import('./pages/admin/survey-editor.component').then(m => m.SurveyEditorComponent) },

  { path: 's/:id',
    loadComponent: () => import('./pages/public/public-survey.component').then(m => m.PublicSurveyComponent) },

  { path: '**',
    loadComponent: () => import('./pages/not-found.component').then(m => m.NotFoundComponent) }
];
