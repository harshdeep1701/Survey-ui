// src/app/services/survey-response-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SurveyResponse, SurveyUploadRequest, SurveyResponseSaveRequest } from '../models/api-model';

@Injectable({ providedIn: 'root' })
export class SurveyResponseApiService {
  /** Per spec server url includes context path */
  private readonly base = `${environment.apiBaseUrl}/api/surveys`;

  constructor(private http: HttpClient) {}

  /** GET /api/surveys/{surveyId}/responses */
  getResponses(surveyId: number): Observable<SurveyResponse[]> {
    return this.http.get<SurveyResponse[]>(`${this.base}/${surveyId}/responses`);
  }

  /**
   * POST /api/surveys/{surveyId}/responses (multipart/form-data)
   *  - "response": JSON object (content-type application/json) of SurveyResponseSaveRequest
   *  - "file": optional binary
   */
  submitResponse(surveyId: number, payload: SurveyUploadRequest): Observable<SurveyResponse> {
    const form = new FormData();

    // Attach response as application/json blob
    const responseBlob = new Blob([JSON.stringify(payload.response)], {
      type: 'application/json',
    });
    form.append('response', responseBlob, 'response.json');

    if (payload.file) {
      form.append('file', payload.file);
    }

    return this.http.post<SurveyResponse>(`${this.base}/${surveyId}/responses`, form);
  }

  /** Convenience helper if you only have the DTO + optional file */
  submitResponseObject(
    surveyId: number,
    dto: SurveyResponseSaveRequest,
    file?: File
  ): Observable<SurveyResponse> {
    return this.submitResponse(surveyId, { response: dto, file });
  }
}
