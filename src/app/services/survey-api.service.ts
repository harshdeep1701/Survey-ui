import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Survey } from '../models/api-model';

@Injectable({ providedIn: 'root' })
export class SurveyApiService {
  private readonly base = `${environment.apiBaseUrl}/api/surveys`;

  constructor(private http: HttpClient) {}

  /** GET /api/surveys */
  getAllSurveys(): Observable<Survey[]> {
    return this.http.get<Survey[]>(this.base);
  }

  /** GET /api/surveys/{id} */
  getSurvey(id: number): Observable<Survey> {
    return this.http.get<Survey>(`${this.base}/${id}`);
  }

  /** POST /api/surveys */
  createSurvey(survey: Survey): Observable<Survey> {
    return this.http.post<Survey>(this.base, survey);
  }

  /** PUT /api/surveys/{id} */
  updateSurvey(id: number, survey: Survey): Observable<Survey> {
    return this.http.put<Survey>(`${this.base}/${id}`, survey);
  }

  /** DELETE /api/surveys/{id} */
  deleteSurvey(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
