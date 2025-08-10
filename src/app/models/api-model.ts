// src/app/models/api-models.ts

export type InputType = 'TEXT' | 'CHECKBOX' | 'RADIO' | 'DROPDOWN' | 'FILE';

export interface Survey {
  id?: number;          // int64
  title?: string;
  inputs?: SurveyInput[];
}

export interface SurveyInput {
  id?: number;          // int64
  label?: string;
  type?: InputType;
  required?: boolean;
  orderIndex: number;  // int32
  options?: string[];
}

/** New per spec */
export interface UserInputDTO {
  inputId: number;      // int64
  value: string;        // for CHECKBOX, join multiple with commas
}

/** New per spec */
export interface SurveyResponseSaveRequest {
  userInputs: UserInputDTO[];
}

export interface UserInput {
  id?: number;          // int64
  input?: SurveyInput;
  value?: string;
  fileName?: string;
  fileType?: string;
  fileData?: string;    // base64
}

export interface SurveyResponse {
  userInputs?: UserInput[];
}

/** For convenience in service helper */
export interface SurveyUploadRequest {
  response: SurveyResponseSaveRequest; // JSON object (multipart part "response")
  file?: File;                         // optional
}
