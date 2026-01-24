# API Integration Documentation

## Overview

This document describes the API integration between the PhD frontend application and the backend API at `https://api-doktarant.tashmeduni.uz/swagger/`.

## Base URL

```
https://api-doktarant.tashmeduni.uz/api/v1
```

Can be configured via environment variable:
```env
NEXT_PUBLIC_API_URL=https://api-doktarant.tashmeduni.uz/api/v1
```

## API Structure

The API is organized into three main sections:

### 1. Auth API (`/auth/*`)

Handles authentication and user management.

#### Endpoints

**Authentication:**
- `POST /auth/login/` - User login with username and password
- `POST /auth/register/` - Register with phone number
- `POST /auth/register/verify/` - Verify OTP during registration
- `POST /auth/register/complete/` - Complete registration with details
- `POST /auth/token/refresh/` - Refresh access token

**User Management:**
- `GET /auth/me/` - Get current user profile
- `PUT /auth/me/` - Update user profile
- `PATCH /auth/me/` - Partially update user profile

**Password Reset:**
- `POST /auth/password/reset/` - Request password reset
- `POST /auth/password/reset/verify/` - Verify password reset OTP
- `POST /auth/password/reset/confirm/` - Confirm password reset

**OTP:**
- `POST /auth/otp/resend/` - Resend OTP code

#### Usage Example

```typescript
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/authStore";

// Login
const { login } = useAuthStore();
await login({
  username: "user@example.com",
  password: "password123"
});

// Register
await authApi.register({
  phone: "+998901234567",
  full_name: "John Doe"
});

// Verify OTP
await authApi.verifyRegistrationOTP({
  phone: "+998901234567",
  otp: "123456"
});
```

### 2. Applicant API (`/applicant/*`)

Handles applicant-specific operations.

#### Endpoints

**Applications:**
- `GET /applicant/applications/` - Get list of available applications
- `GET /applicant/applications/{id}/` - Get application details

**Submissions:**
- `GET /applicant/my-submissions/` - Get list of user's submissions
- `GET /applicant/my-submissions/{id}/` - Get submission details
- `POST /applicant/submissions/create/` - Create a new submission
- `PUT /applicant/submissions/{id}/update/` - Update a submission
- `POST /applicant/submissions/{id}/submit/` - Submit for review

**Documents:**
- `POST /applicant/submissions/{id}/documents/` - Upload documents

#### Usage Example

```typescript
import { applicantApi } from "@/lib/api";

// Get available applications
const applications = await applicantApi.getApplications();

// Get my submissions
const submissions = await applicantApi.getMySubmissions();

// Create submission
const submission = await applicantApi.createSubmission({
  application_id: "app-123"
});

// Upload document
const formData = new FormData();
formData.append("file", file);
formData.append("document_type", "ilmiy_kengash_nusxasi");
await applicantApi.uploadDocument(submissionId, formData);

// Submit submission
await applicantApi.submitSubmission(submissionId);
```

### 3. Admin API (`/admin/application/admin/*`)

Handles admin-specific operations.

#### Endpoints

**Applications Management:**
- `GET /admin/application/admin/applications/` - Get all applications
- `GET /admin/application/admin/applications/{id}/` - Get application details
- `POST /admin/application/admin/applications/create/` - Create new application
- `PUT /admin/application/admin/applications/{id}/update/` - Update application
- `DELETE /admin/application/admin/applications/{id}/delete/` - Delete application

**Application Fields:**
- `POST /admin/application/admin/applications/{app_id}/fields/create/` - Create field
- `PUT /admin/application/admin/applications/{app_id}/fields/{field_id}/update/` - Update field
- `DELETE /admin/application/admin/applications/{app_id}/fields/{field_id}/delete/` - Delete field

**Submissions Management:**
- `GET /admin/application/admin/submissions/` - Get all submissions
- `GET /admin/application/admin/submissions/{id}/` - Get submission details
- `POST /admin/application/admin/submissions/{id}/approve/` - Approve submission
- `POST /admin/application/admin/submissions/{id}/reject/` - Reject submission

#### Usage Example

```typescript
import { adminApi } from "@/lib/api";

// Get all applications
const response = await adminApi.getApplications(1, 20);

// Create application
const app = await adminApi.createApplication({
  title: "PhD Program 2025",
  description: "Application description",
  requirements: ["Req 1", "Req 2"],
  deadline: "2025-12-31",
  is_active: true
});

// Get submissions
const submissions = await adminApi.getSubmissions(1, 20, "submitted");

// Approve submission
await adminApi.approveSubmission(submissionId);

// Reject submission
await adminApi.rejectSubmission(submissionId, {
  reason: "Documents incomplete"
});
```

## Authentication Flow

### 1. Login Flow

```
User → POST /auth/login/ → Receive tokens
     → Store in localStorage
     → Get user profile via GET /auth/me/
```

### 2. Registration Flow

```
User → POST /auth/register/ (phone + name)
     → Receive OTP
     → POST /auth/register/verify/ (phone + OTP)
     → Receive tokens
     → POST /auth/register/complete/ (additional details)
```

### 3. Token Refresh Flow

Tokens are automatically refreshed when they expire using the built-in refresh mechanism in `useUniversalFetch.ts`.

## Error Handling

All API calls can throw errors. Use try-catch blocks:

```typescript
try {
  await authApi.login({ username, password });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error: ${error.message}`);
    console.error(`Status: ${error.status}`);
  }
}
```

## TypeScript Types

All API responses are fully typed. Types are defined in:
- `lib/api/auth.ts` - Auth types
- `lib/api/applicant.ts` - Applicant types
- `lib/api/admin.ts` - Admin types

## Store Integration

### Auth Store

```typescript
import { useAuthStore } from "@/lib/stores/authStore";

const {
  user,
  isAuthenticated,
  isLoading,
  error,
  login,
  register,
  verifyOTP,
  completeRegistration,
  logout,
  checkAuth,
  updateProfile
} = useAuthStore();
```

### Application Store

```typescript
import { useApplicationStore } from "@/lib/stores/applicationStore";

const {
  applications,
  submissions,
  currentApplication,
  currentSubmission,
  isLoading,
  error,
  fetchApplications,
  fetchSubmissions,
  getApplication,
  getSubmission,
  createSubmission,
  uploadDocument,
  submitSubmission,
  // Admin methods...
  adminFetchApplications,
  adminFetchSubmissions,
  adminApproveSubmission,
  adminRejectSubmission
} = useApplicationStore();
```

## File Uploads

Document uploads use multipart/form-data:

```typescript
const formData = new FormData();
formData.append("file", fileObject);
formData.append("document_type", "diplom");

await applicantApi.uploadDocument(submissionId, formData);
```

## Document Types

Supported document types:
- `ilmiy_kengash_nusxasi` - Scientific council copy or OAK (BAK) journal
- `yollanma_xat` - Referral letter
- `diplom` - Bachelor and master's diploma copy
- `shakl_3_4` - Form 3-4
- `annotatsiya` - Abstract

## API Configuration

The API base URL is configured in `lib/hooks/useUniversalFetch.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  "https://api-doktarant.tashmeduni.uz/api/v1";
```

## Development Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Configure API URL (optional):
```env
NEXT_PUBLIC_API_URL=https://api-doktarant.tashmeduni.uz/api/v1
```

3. Run development server:
```bash
npm run dev
```

## Testing

You can test API endpoints using the Swagger UI:
https://api-doktarant.tashmeduni.uz/swagger/

Use the API key provided in the Swagger UI for testing.

## Common Issues

### CORS Errors
If you encounter CORS errors, ensure the backend API is configured to allow requests from your frontend domain.

### Token Expiration
Tokens are automatically refreshed. If you're logged out unexpectedly, check browser console for token refresh errors.

### Network Errors
Check your internet connection and verify the API URL is correct.

## Support

For API issues, refer to the Swagger documentation:
https://api-doktarant.tashmeduni.uz/swagger/

## Migration from Mock Data

The project previously used mock data in the stores. All mock functions have been replaced with real API calls:

### Before (Mock):
```typescript
login: async (data) => {
  await delay(800);
  // Mock implementation...
}
```

### After (Real API):
```typescript
login: async (data) => {
  const response = await authApi.login(data);
  // Real implementation...
}
```

All existing functionality remains the same, but now uses real API endpoints.
