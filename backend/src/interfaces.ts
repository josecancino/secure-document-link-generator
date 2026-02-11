export const SECURITY_CONFIG = {
  TOKEN_EXPIRATION_MINUTES: 15,
  DOCUMENT_NAME_MIN_LENGTH: 3,
  DOCUMENT_NAME_MAX_LENGTH: 50,
};

export interface LinkRecord {
  token: string;
  documentName: string;
  createdAt: string;
  redeemedAt: string | null;
}

export interface GenerateLinkResponse {
  token: string;
  link: string;
}

export interface ErrorResponse {
  error: string;
}

export class GenerateLinkDto {
  documentName: string;
}
