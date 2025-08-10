// src/app/components/dynamic-form/dynamic-form.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Survey, SurveyInput } from '../../models/api-model';


@Component({
  standalone: true,
  selector: 'app-dynamic-form',
  imports: [
    CommonModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatRadioModule, MatButtonModule, MatDividerModule, MatIconModule
  ],
  styles: [`
    .q { margin-bottom: 16px; display: block; }
    .actions { margin-top: 12px; display:flex; gap:12px; }
  `],
  template: `
  <form (ngSubmit)="submit()" #f="ngForm">
    <div *ngFor="let q of orderedInputs()" class="q">
      <!-- TEXT -->
      <mat-form-field *ngIf="q.type==='TEXT'" appearance="outline" style="width:100%;">
        <mat-label>{{ q.label }}</mat-label>
        <input matInput [(ngModel)]="textValues[q.orderIndex]" name="t{{q.orderIndex}}" [required]="q.required">
      </mat-form-field>

      <!-- CHECKBOX -->
      <div *ngIf="q.type==='CHECKBOX'">
        <div style="font-weight:600; margin-bottom:6px;">{{ q.label }} <span *ngIf="q.required">*</span></div>
        <mat-checkbox *ngFor="let opt of q.options" (change)="onCheckboxChange(q, $event)" [value]="opt">
          {{ opt }}
        </mat-checkbox>
      </div>

      <!-- RADIO -->
      <div *ngIf="q.type==='RADIO'">
        <div style="font-weight:600; margin-bottom:6px;">{{ q.label }} <span *ngIf="q.required">*</span></div>
        <mat-radio-group [(ngModel)]="radioValues[q.orderIndex]" name="r{{q.orderIndex}}">
          <mat-radio-button *ngFor="let opt of q.options" [value]="opt">{{ opt }}</mat-radio-button>
        </mat-radio-group>
      </div>

      <!-- DROPDOWN -->
      <mat-form-field *ngIf="q.type==='DROPDOWN'" appearance="outline" style="width:100%;">
        <mat-label>{{ q.label }}</mat-label>
        <mat-select [(ngModel)]="dropdownValues[q.orderIndex]" name="d{{q.orderIndex}}" [required]="q.required">
          <mat-option *ngFor="let opt of q.options" [value]="opt">{{ opt }}</mat-option>
        </mat-select>
      </mat-form-field>

      <!-- FILE -->
      <div *ngIf="q.type==='FILE'">
        <div style="font-weight:600; margin-bottom:6px;">{{ q.label }} <span *ngIf="q.required">*</span></div>
        <input type="file" (change)="onFileChange(q, $event)">
      </div>

      <mat-divider style="margin:12px 0;"></mat-divider>
    </div>

    <div class="actions">
      <button mat-raised-button color="primary" type="submit">
        <mat-icon>send</mat-icon>&nbsp;Submit
      </button>
      <button mat-stroked-button type="button" (click)="reset()">
        <mat-icon>restart_alt</mat-icon>&nbsp;Reset
      </button>
    </div>
  </form>
  `
})
export class DynamicFormComponent {
  @Input() survey!: Survey;
  @Output() submitted = new EventEmitter<FormData>();

  textValues: Record<number, string> = {};
  radioValues: Record<number, string> = {};
  dropdownValues: Record<number, string> = {};
  checkboxValues: Record<number, Set<string>> = {};
  files: Record<number, File> = {};

  orderedInputs(): SurveyInput[] {
    return [...(this.survey?.inputs ?? [])].sort((a,b)=>a.orderIndex-b.orderIndex);
  }

  onCheckboxChange(q: SurveyInput, evt: any) {
    const target = evt.source?.value ?? evt.target?.value;
    const checked = evt.checked ?? evt.target?.checked;
    const set = this.checkboxValues[q.orderIndex] ?? new Set<string>();
    if (checked) set.add(target); else set.delete(target);
    this.checkboxValues[q.orderIndex] = set;
  }

  onFileChange(q: SurveyInput, evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (file) this.files[q.orderIndex] = file;
  }

  reset() {
    this.textValues = {};
    this.radioValues = {};
    this.dropdownValues = {};
    this.checkboxValues = {};
    this.files = {};
  }

  submit() {
    const fd = new FormData();
    fd.append('surveyId', String(this.survey.id ?? ''));
    this.orderedInputs().forEach(q => {
      const key = `q_${q.orderIndex}`;
      switch (q.type) {
        case 'TEXT':
          fd.append(key, this.textValues[q.orderIndex] ?? '');
          break;
        case 'RADIO':
          fd.append(key, this.radioValues[q.orderIndex] ?? '');
          break;
        case 'DROPDOWN':
          fd.append(key, this.dropdownValues[q.orderIndex] ?? '');
          break;
        case 'CHECKBOX':
          Array.from(this.checkboxValues[q.orderIndex] ?? []).forEach(v => fd.append(key, v));
          break;
        case 'FILE':
          if (this.files[q.orderIndex]) fd.append(key, this.files[q.orderIndex]);
          break;
      }
    });
    this.submitted.emit(fd);
  }
}
