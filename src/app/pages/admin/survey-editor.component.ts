import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgFor, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { trigger, transition, style, animate } from "@angular/animations";

import { CdkDrag, CdkDropList, CdkDragDrop } from "@angular/cdk/drag-drop";

import { MatCardModule } from "@angular/material/card";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { SurveyApiService } from "../../services/survey-api.service";
import { InputType, Survey, SurveyInput } from "../../models/api-model";

type PaletteItem = { label: string; type: InputType; icon: string };

@Component({
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    // CDK
    CdkDrag,
    CdkDropList,
    // Material
    MatCardModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(8px)" }),
        animate("200ms ease-out", style({ opacity: 1, transform: "none" })),
      ]),
    ]),
  ],
  styles: [
    `
      .editor-grid {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 16px;
        align-items: start;
        padding: 12px;
      }
      .palette mat-list-item {
        cursor: grab;
      }
      .question-card {
        margin-bottom: 12px;
      }
      .row {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .spacer {
        flex: 1;
      }

      /* Canvas drop zone */
      .drop-zone {
        min-height: 140px;
        border: 2px dashed #9e9e9e;
        border-radius: 8px;
        padding: 12px;
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .drop-zone.cdk-drop-list-dragging {
        border-color: #3f51b5;
        background: rgba(63, 81, 181, 0.04);
      }
    `,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>{{ survey().id ? "Edit Survey" : "New Survey" }}</span>
      <span class="spacer"></span>
      <button mat-stroked-button color="accent" (click)="save()">
        <mat-icon>save</mat-icon>&nbsp;Save
      </button>
      <button mat-button (click)="cancel()">
        <mat-icon>close</mat-icon>&nbsp;Cancel
      </button>
    </mat-toolbar>

    <div class="editor-grid" [@fadeIn]>
      <!-- LEFT TOOLBAR: DRAGGABLE PALETTE -->
      <mat-card class="palette">
        <mat-card-title>Input Types</mat-card-title>
        <mat-card-subtitle>Drag to canvas to add</mat-card-subtitle>

        <!-- Note: Not a drop list. Items are plain draggables with data, so they never leave the toolbar. -->
        <mat-nav-list
          cdkDropList
          #paletteList="cdkDropList"
          [cdkDropListData]="palette"
          [cdkDropListConnectedTo]="[canvasList]"
        >
          <a mat-list-item *ngFor="let p of palette" cdkDrag [cdkDragData]="p">
            <mat-icon matListItemIcon>{{ p.icon }}</mat-icon>
            <div matListItemTitle>{{ p.label }}</div>
            <div matListItemLine>{{ p.type }}</div>
            <mat-icon cdkDragHandle style="margin-left:auto;"
              >drag_indicator</mat-icon
            >
          </a>
        </mat-nav-list>
      </mat-card>

      <!-- CENTER CANVAS: DROP TO APPEND AT BOTTOM -->
      <div
        class="drop-zone"
        cdkDropList
        #canvasList="cdkDropList"
        [cdkDropListData]="survey().inputs"
        [cdkDropListConnectedTo]="[paletteList]"
        (cdkDropListDropped)="onCanvasDrop($event)"
      >
        <mat-card>
          <mat-card-title>Survey Details</mat-card-title>
          <div class="row">
            <mat-form-field
              appearance="outline"
              style="min-width:280px; flex:1;"
            >
              <mat-label>Title</mat-label>
              <input matInput [(ngModel)]="survey().title" />
            </mat-form-field>
          </div>
        </mat-card>

        <mat-card style="margin-top:16px;">
          <mat-card-title>Questions</mat-card-title>
          <mat-card-subtitle
            >Drag an input type from the left to add it at the
            bottom.</mat-card-subtitle
          >

          <div
            *ngFor="let i of survey().inputs; let idx = index"
            class="question-card"
          >
            <mat-card>
              <mat-card-subtitle
                >Q{{ idx + 1 }} · {{ i.type }}</mat-card-subtitle
              >

              <div class="row">
                <mat-form-field
                  appearance="outline"
                  style="flex:2; min-width:280px;"
                >
                  <mat-label>Label</mat-label>
                  <input matInput [(ngModel)]="i.label" />
                </mat-form-field>

                <mat-form-field appearance="outline" style="width:140px;">
                  <mat-label>Order</mat-label>
                  <input matInput type="number" [(ngModel)]="i.orderIndex" />
                </mat-form-field>

                <mat-checkbox [(ngModel)]="i.required">Required</mat-checkbox>

                <!-- NEW: remove button -->
                <span class="spacer"></span>
                <button
                  mat-icon-button
                  color="warn"
                  aria-label="Remove question"
                  (click)="remove(idx)"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <div
                *ngIf="
                  i.type === 'RADIO' ||
                  i.type === 'DROPDOWN' ||
                  i.type === 'CHECKBOX'
                "
                class="row"
              >
                <mat-form-field
                  appearance="outline"
                  style="flex:1; min-width:320px;"
                >
                  <mat-label>Options (comma separated)</mat-label>
                  <input
                    matInput
                    [ngModel]="i.options?.join(', ')"
                    (ngModelChange)="setOptions(i, $event)"
                  />
                </mat-form-field>
              </div>
            </mat-card>
          </div>

          <div
            *ngIf="!survey().inputs?.length"
            style="opacity:.7; padding:12px;"
          >
            Drag from the left to add your first question.
          </div>
        </mat-card>
      </div>
    </div>
  `,
})
export class SurveyEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(SurveyApiService);
  private snack = inject(MatSnackBar);

  palette: PaletteItem[] = [
    { label: "Text", type: "TEXT", icon: "text_fields" },
    { label: "Checkbox", type: "CHECKBOX", icon: "check_box" },
    { label: "Radio", type: "RADIO", icon: "radio_button_checked" },
    { label: "Dropdown", type: "DROPDOWN", icon: "arrow_drop_down_circle" },
    { label: "File", type: "FILE", icon: "attach_file" },
  ];

  private _survey = signal<Survey>({ title: "", inputs: [] });
  survey = computed(() => this._survey());

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (id) this.svc.getSurvey(id).subscribe((s) => this._survey.set(s));
  }

  // Accept any drag entering the canvas
  alwaysAccept = () => true;

  // Drop handler: ALWAYS append at bottom (ignore pointer position)
  onCanvasDrop(ev: CdkDragDrop<unknown>) {
    // Only act on palette -> canvas transfers
    if (ev.previousContainer === ev.container) return;

    const data = ev.item.data as
      | { type: InputType; label?: string }
      | undefined;
    if (!data?.type) return;

    const s = this._survey();
    const inputs = [...(s.inputs ?? [])];

    const nextOrder = inputs.length + 1;
    inputs.push({
      label: data.label ?? `Question ${nextOrder}`,
      type: data.type,
      required: true,
      orderIndex: nextOrder,
      options: [],
    });

    // normalize order indexes
    inputs.forEach((q, idx) => (q.orderIndex = idx + 1));
    this._survey.set({ ...s, inputs });

    // IMPORTANT: do NOT modify palette data; CDK will snap the pellet back automatically
  }

  setOptions(i: SurveyInput, value: string) {
    i.options = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  save() {
    const s = this._survey();
    const normalized: Survey = {
      ...s,
      inputs: [...(s.inputs ?? [])].sort((a, b) => a.orderIndex - b.orderIndex),
    };

    const req$ = s.id
      ? this.svc.updateSurvey(s.id, normalized)
      : this.svc.createSurvey(normalized);

    req$.subscribe({
      next: () => {
        this.snack.open("Saved successfully", "Close", { duration: 2000 });
        this.router.navigate(["/admin"]);
      },
      error: () => this.snack.open("Save failed", "Close", { duration: 2500 }),
    });
  }

  cancel() {
    this.router.navigate(["/admin"]);
  }

  remove(idx: number) {
    const s = this._survey();
    const inputs = [...(s.inputs ?? [])];
    inputs.splice(idx, 1);
    // re-number orderIndex to stay 1..n
    inputs.forEach((q, i) => (q.orderIndex = i + 1));
    this._survey.set({ ...s, inputs });
  }
}
