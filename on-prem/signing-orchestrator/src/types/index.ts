export interface SignerInfo {
  userId: string; // NRIC or Passport
  fullName: string;
  emailAddress: string;
  mobileNo: string;
  nationality?: string;
  userType: 1 | 2; // 1=External borrower, 2=Internal signatory
}

export interface VerificationData {
  status: string;
  datetime: string;
  verifier: string;
  method: string;
  evidence?: {
    nricFront?: string;
    nricBack?: string;
    passportImage?: string;
    selfieImage?: string;
    loaDocument?: string;
  };
}

export interface SignatureCoordinates {
  pageNo: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SignatureInfo {
  pdfInBase64: string;
  visibility: boolean;
  coordinates?: SignatureCoordinates;
  sigImageInBase64?: string;
}

export interface FieldUpdate {
  [key: string]: string;
}

export interface DocuSealWebhookPayload {
  event_type: string;
  data: {
    id: string;
    packet_id?: string;
    document_id?: string;
    template_id?: string;
    signer_id?: string;
    signer_name?: string;
    signer_email?: string;
    signer_nric?: string;
    signer_passport?: string;
    unsigned_pdf_url?: string;
    status?: string;
    completed_at?: string;
    [key: string]: any;
  };
}

export interface MTSARequestCertificateRequest {
  UserID: string;
  FullName: string;
  EmailAddress: string;
  MobileNo: string;
  Nationality: string;
  UserType: 1 | 2;
  AuthFactor: string;
  NRICFront?: string;
  NRICBack?: string;
  PassportImage?: string;
  SelfieImage?: string;
  VerificationData: VerificationData;
}

export interface MTSARequestCertificateResponse {
  statusCode: string;
  message: string;
  certSerialNo?: string;
  validFrom?: string;
  validTo?: string;
  userCert?: string;
}

export interface MTSAGetCertInfoRequest {
  UserID: string;
}

export interface MTSAGetCertInfoResponse {
  statusCode: string;
  message: string;
  certStatus?: string;
  validFrom?: string;
  validTo?: string;
  userCert?: string;
  issuer?: string;
  subject?: string;
  certSerialNo?: string;
}

export interface MTSASignPDFRequest {
  UserID: string;
  FullName: string;
  AuthFactor: string;
  SignatureInfo: SignatureInfo;
  FieldListToUpdate?: FieldUpdate;
}

export interface MTSASignPDFResponse {
  statusCode: string;
  message: string;
  signedPdfInBase64?: string;
  userCert?: string;
}

export interface MTSAVerifyPDFRequest {
  SignedPdfInBase64: string;
}

export interface MTSAVerifyPDFResponse {
  statusCode: string;
  message: string;
  totalSignatureInPdf?: number;
  signatureDetails?: Array<{
    signerName: string;
    signedDate: string;
    isValid: boolean;
    certStatus: string;
  }>;
}

export interface MTSARequestEmailOTPRequest {
  UserID: string;
  OTPUsage: 'DS' | 'NU'; // DS=digital signing, NU=new cert enrolment
  EmailAddress?: string; // Required for NU
}

export interface MTSARequestEmailOTPResponse {
  statusCode: string;
  message: string;
  otpSent?: boolean;
}

export interface MTSARequestRevokeCertRequest {
  UserID: string;
  CertSerialNo: string;
  RevokeReason: 'keyCompromise' | 'CACompromise' | 'affiliationChanged' | 'superseded' | 'cessationOfOperation';
  RevokeBy: 'Admin' | 'Self';
  AuthFactor: string;
  VerificationData: VerificationData;
  NRICFront?: string;
  NRICBack?: string;
  PassportImage?: string;
  SelfieImage?: string;
}

export interface MTSARequestRevokeCertResponse {
  statusCode: string;
  message: string;
  revoked?: boolean;
}

export interface SigningRequest {
  packetId: string;
  documentId: string;
  templateId: string;
  signerInfo: SignerInfo;
  pdfUrl: string;
  otp?: string;
  coordinates?: SignatureCoordinates;
  signatureImage?: string;
  fieldUpdates?: FieldUpdate;
}

export interface SigningResponse {
  success: boolean;
  message: string;
  signedPdfPath?: string;
  certificateInfo?: {
    serialNo: string;
    validFrom: string;
    validTo: string;
    status: string;
  };
  error?: {
    code: string;
    details: string;
  };
}

export interface EnrollmentRequest {
  signerInfo: SignerInfo;
  verificationData: VerificationData;
  otp?: string;
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  certificateInfo?: {
    serialNo: string;
    validFrom: string;
    validTo: string;
    certificate: string;
  };
  error?: {
    code: string;
    details: string;
  };
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    soapConnection: boolean;
    diskWritable: boolean;
    docusealReachable: boolean;
  };
  details?: {
    [key: string]: any;
  };
}

export interface OrchestratorConfig {
  app: {
    port: number;
    baseUrl: string;
    nodeEnv: string;
  };
  docuseal: {
    baseUrl: string;
    webhookSecret: string;
    apiToken: string;
  };
  storage: {
    signedFilesDir: string;
    maxUploadMB: number;
  };
  mtsa: {
    env: 'pilot' | 'prod';
    wsdlPilot: string;
    wsdlProd: string;
    username: string;
    password: string;
  };
  network: {
    timeoutMs: number;
    retryBackoffMs: number;
    retryMax: number;
  };
  security: {
    corsOrigins: string[];
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
  };
  logging: {
    level: string;
    format: string;
  };
  signatureCoordinates: { [templateId: string]: SignatureCoordinates };
  notification?: {
    webhookUrl: string;
    webhookSecret: string;
  };
}
