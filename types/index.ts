// User Roles
export type UserRole = "applicant" | "admin" | "SUPER_ADMIN";

// Applicant Types
export interface Applicant {
  id: string;
  oneId: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  address: string; // Doimiy yashash joyi
  passportSeries: string;
  passportNumber: string;
  pinfl: string;
  phone: string;
  full_name?: string;
  role?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

// Specialization Types
export interface Specialization {
  id: string;
  code: string; // Masalan: "03.00.01"
  name: string; // Masalan: "Biokimyo"
  isActive: boolean;
}

// Examiner Types
export interface Examiner {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  specialization_ids?: number[];
  specialization_id: string;
  specialization?: Specialization[];
  department: string
  title: string
  degree: string; // Masalan: "PhD", "DSc"
  position: string; // Lavozimi
  organization: string; // Ish joyi
  is_active: boolean;
  reviews_count?: number;
  pending_reviews?: number;
  created_at: string;
  updated_at: string;
}

// Speciality Types (enhanced from Specialization)
export interface Speciality {
  id: string;
  code: string; // Masalan: "03.00.01"
  name: string; // Masalan: "Biokimyo"
  description?: string;
  speciality:string|number;
  field_of_science: string; // Fan sohasi
  is_active: boolean;
  is_foreign?: boolean;
  created_at: string;
  updated_at: string;
  speciality_code?: string;
  speciality_name?: string;
  // Backenddan keladigan qo'shimcha maydonlar
  comment?: string;
  file?: string | null;
}

// Language Types
export type ForeignLanguage = "english" | "german" | "french";

// Application Status
export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "accepted"
  | "rejected"
  | "revision_required";

// Application Types
export interface Application {
  id: string;
  applicantId: string;
  specializationId: string;
  specialization?: Specialization;
  foreignLanguage: ForeignLanguage;
  organizationName: string;
  examRules: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  documents: ApplicationDocument[];
  paymentId?: string;
  payment?: Payment;
  examId?: string;
  exam?: Exam;
  createdAt: string;
  updatedAt: string;
}

// Document Types
export interface ApplicationDocument {
  id: string;
  applicationId: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export type DocumentType =
  | "ilmiy_kengash_nusxasi" // Ilmiy kengash nusxasi yoki OAK (BAK) jurnali
  | "yollanma_xat" // Yollanma xat
  | "diplom" // Bakalavr va magistratura diplom nusxasi
  | "shakl_3_4" // 3-4 shakl
  | "annotatsiya"; // Annotatsiya

// Exam Types
export interface Exam {
  id: string;
  name: string;
  description: string;
  examDate: string;
  examTime: string;
  examLocation: string;
  announcement: string;
  requiredDocuments: DocumentType[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export type PaymentStatus = "pending" | "confirmed" | "cancelled";
export type PaymentMethod = "click" | "payme";

export interface Payment {
  id: string;
  applicationId: string;
  amount: number;
  currency: string; // "UZS"
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Admin Types
export interface Admin {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "SUPER_ADMIN";
  isActive: boolean;
  createdAt: string;
}

// Notification Types
export type NotificationChannel = "sms" | "telegram" | "email";

export interface Notification {
  id: string;
  recipientId: string;
  channel: NotificationChannel;
  title: string;
  message: string;
  isSent: boolean;
  sentAt?: string;
  createdAt: string;
}

// Statistics Types
export interface Statistics {
  totalApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  pendingApplications: number;
  totalPayments: number;
  confirmedPayments: number;
  pendingPayments: number;
  dailyStats?: DailyStat[];
  monthlyStats?: MonthlyStat[];
}

export interface DailyStat {
  date: string;
  applications: number;
  accepted: number;
  rejected: number;
  payments: number;
}

export interface MonthlyStat {
  month: string;
  applications: number;
  accepted: number;
  rejected: number;
  payments: number;
  revenue: number;
}

export interface SpecialityStatistics {
  speciality: {
    id: number;
    name: string;
    code: string;
  };
  period: {
    start_date: string | null;
    end_date: string | null;
  };
  submissions: {
    total: number;
    draft: number;
    submitted: number;
    under_review: number;
    approved: number;
    rejected: number;
  };
  reviews: {
    total: number;
    pending: number;
    completed: number;
    average_score: number | string | null;
  };
  examiners: {
    total: number;
    list: Array<{
      id: number;
      name: string;
      title: string;
      department: string;
      assigned_at: string;
    }>;
  };
  applications: {
    total: number;
    list: Array<{
      id: number;
      title: string;
      status: string;
    }>;
  };
}

// Settings Types
export interface SystemSettings {
  applicationPeriodOpen: boolean;
  applicationDeadline?: string;
  examStagesEnabled: boolean;
  allowedFileFormats: string[]; // ["pdf", "doc", "docx"]
  maxFileSize: number; // MB
  paymentAmount: number;
  currency: string;
  oneIdIntegration: {
    enabled: boolean;
    apiUrl?: string;
    apiKey?: string;
  };
  paymentIntegration: {
    click: {
      enabled: boolean;
      merchantId?: string;
      serviceId?: string;
    };
    payme: {
      enabled: boolean;
      merchantId?: string;
    };
  };
  notifications: {
    sms: {
      enabled: boolean;
      provider?: string;
      apiKey?: string;
    };
    telegram: {
      enabled: boolean;
      botToken?: string;
      groupId?: string;
    };
    email: {
      enabled: boolean;
      smtpHost?: string;
      smtpPort?: number;
      smtpUser?: string;
      smtpPassword?: string;
    };
  };
}

// FAQ Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ------------------------------------------------------------------
// Applicant account / TSMU ID
// ------------------------------------------------------------------

export type Gender = "MALE" | "FEMALE";

/** Authenticated user as returned by /auth/login/, /auth/me/ and TSMU ID endpoints. */
export interface User {
  id?: number | string;
  phone_number?: string | null;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  middle_name?: string | null;
  full_name?: string | null;
  role?: string;
  is_verified?: boolean;
  identity_verified_at?: string | null;
  photo?: string | null;
  photo_url?: string | null;
  gender?: Gender | string | null;
  nationality?: string | null;
  citizenship?: string | null;
  birth_place?: string | null;
  birth_date?: string | null;
  pinfl?: string | null;
  [key: string]: unknown;
}

/** GET /applicant/profile/ */
export interface ApplicantProfile extends User {
  organization?: string | null;
  permanent_address?: string | null;
  citizen?: string | null;
  nation?: string | null;
  passport_seria?: string | null;
  passport_series?: string | null;
  passport_number?: string | null;
  passport_issued_by?: string | null;
  passport_issued_date?: string | null;
  passport_expiry_date?: string | null;
  locked_fields?: string[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export type VerificationStatus =
  | "LOOKED_UP"
  | "FACE_PASSED"
  | "PHONE_PENDING"
  | "PHONE_VERIFIED"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";

export interface TsmuLookupResponse {
  verification_id: string;
  masked_name: string;
  expires_at: string;
}

export type FaceFailReason = "NO_FACE" | "MULTIPLE_FACES" | "LOW_SIMILARITY" | "LIVENESS_FAILED";

export interface FaceVerifyResponse {
  passed: boolean;
  similarity_pct: number;
  attempts_left: number;
  reason: FaceFailReason | null;
}

export interface TsmuPhoneResponse {
  sent: boolean;
  expires_in: number;
}

export interface TsmuCompleteResponse {
  tokens: AuthTokens;
  user: User;
}

/** Personal data frozen into a submission at creation time. */
export interface ApplicantSnapshot {
  full_name?: string | null;
  last_name?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  pinfl?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  passport_series?: string | null;
  passport_seria?: string | null;
  passport_number?: string | null;
  phone_number?: string | null;
  email?: string | null;
  organization?: string | null;
  permanent_address?: string | null;
  photo_url?: string | null;
  [key: string]: unknown;
}

/** Error envelope: {code, message} */
export interface ApiErrorBody {
  code?: string;
  message?: string;
  error?: string;
  [key: string]: unknown;
}
