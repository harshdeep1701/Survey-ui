import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { SurveyResponseApiService } from '../../services/survey-response-api.service';
import { DynamicFormComponent } from '../../components/dynamic-form/dynamic-form.component';
import { SurveyApiService } from '../../services/survey-api.service';
import { Survey, UserInputDTO, SurveyResponseSaveRequest } from '../../models/api-model';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  imports: [NgIf, MatCardModule, MatCardModule, MatIconModule, DynamicFormComponent],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ],
  template: `
  <mat-card *ngIf="survey" [@fadeIn]>
    <mat-card-header>
      <mat-card-title>{{ survey.title }}</mat-card-title>
      <mat-card-subtitle>Public Survey</mat-card-subtitle>
    </mat-card-header>
    <mat-card-content>
      <app-dynamic-form [survey]="survey" (submitted)="onFormSubmitted($event)"></app-dynamic-form>
    </mat-card-content>
  </mat-card>
  `
})
export class PublicSurveyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private surveys = inject(SurveyApiService);
  private responses = inject(SurveyResponseApiService);
  private snack = inject(MatSnackBar);

  survey?: Survey;
  done = false;
  error = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.surveys.getSurvey(id).subscribe(s => this.survey = s);
  }

  onFormSubmitted(fd: FormData) {
    if (!this.survey?.id || !this.survey.inputs?.length) return;

    const inputsByOrder = new Map<number, { id: number; type?: string }>();
    this.survey.inputs.forEach(i => {
      if (typeof i.orderIndex === 'number' && typeof i.id === 'number') {
        inputsByOrder.set(i.orderIndex, { id: i.id, type: i.type });
      }
    });

    const userInputs: UserInputDTO[] = [];
    let attachedFile: File | undefined;

    // Walk through each survey input and extract values from FormData based on orderIndex
    for (const input of this.survey.inputs) {
      const order = input.orderIndex!;
      const key = `q_${order}`;
      const mapEntry = inputsByOrder.get(order);
      if (!mapEntry) continue;

      // Handle values by type
      switch (input.type) {
        case 'CHECKBOX': {
          const all = fd.getAll(key).map(v => String(v));
          const value = all.join(','); // API requires a single string
          userInputs.push({ inputId: mapEntry.id, value });
          break;
        }
        case 'FILE': {
          // pick file to send as the top-level "file" multipart part
          const f = fd.get(key);
          if (f instanceof File) attachedFile = f;
          // For DTO we still push empty or file name as value (optional)
          userInputs.push({ inputId: mapEntry.id, value: '' });
          break;
        }
        default: {
          const v = fd.get(key);
          userInputs.push({ inputId: mapEntry.id, value: v ? String(v) : '' });
        }
      }
    }

    const dto: SurveyResponseSaveRequest = { userInputs };

    this.responses.submitResponseObject(this.survey.id, dto, attachedFile)
      .subscribe({
        next: () => this.snack.open('Thanks! Your response was recorded.', 'Close', { duration: 2500 }),
      error: () => this.snack.open('Submission failed. Please try again.', 'Close', { duration: 3000 })
      });
  }
}
