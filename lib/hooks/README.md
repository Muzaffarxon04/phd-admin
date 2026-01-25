# API Hooks Foydalanish Qollanmasi

Barcha API sorovlar uchun `useUniversalFetch` hook'laridan tog'ridan-tog'ri foydalaning.

## Import qilish

```typescript
import { useGet, usePost, usePut, usePatch, useDelete, useUpload } from "@/lib/hooks";
```

## Foydalanish misollari

### GET Request

```typescript
"use client";

import { useGet } from "@/lib/hooks";

export default function ApplicationsPage() {
  const { data, isLoading, error } = useGet("/applicant/");
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.map((app) => (
        <div key={app.id}>{app.title}</div>
      ))}
    </div>
  );
}
```

### POST Request

```typescript
"use client";

import { usePost } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";

export default function LoginPage() {
  const queryClient = useQueryClient();
  const { mutate, isPending } = usePost("/auth/login/", {
    onSuccess: (data) => {
      // Save token
      localStorage.setItem("access_token", data.access);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/auth/me/"] });
    },
  });
  
  const handleLogin = () => {
    mutate({
      phone_number: "+998901234567",
      password: "password123",
    });
  };
  
  return (
    <button onClick={handleLogin} disabled={isPending}>
      {isPending ? "Loading..." : "Login"}
    </button>
  );
}
```

### PUT Request

```typescript
"use client";

import { usePut } from "@/lib/hooks";

export default function UpdateProfilePage() {
  const { mutate, isPending } = usePut("/auth/me/");
  
  const handleUpdate = () => {
    mutate({
      first_name: "John",
      last_name: "Doe",
    });
  };
  
  return <button onClick={handleUpdate}>Update</button>;
}
```

### PATCH Request

```typescript
"use client";

import { usePatch } from "@/lib/hooks";

export default function EditSubmissionPage({ id }: { id: string }) {
  const { mutate, isPending } = usePatch(`/applicant/my-submissions/${id}/`);
  
  const handleUpdate = () => {
    mutate({
      answers: [
        { field_id: 1, answer_text: "Answer" }
      ],
    });
  };
  
  return <button onClick={handleUpdate}>Update</button>;
}
```

### DELETE Request

```typescript
"use client";

import { useDelete } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";

export default function DeleteSubmission({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useDelete(`/applicant/my-submissions/${id}/`, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/applicant/my-submissions/"] });
    },
  });
  
  const handleDelete = () => {
    mutate();
  };
  
  return <button onClick={handleDelete} disabled={isPending}>Delete</button>;
}
```

### File Upload

```typescript
"use client";

import { useUpload } from "@/lib/hooks";

export default function UploadDocumentPage({ submissionId }: { submissionId: string }) {
  const { mutate, isPending } = useUpload(`/applicant/my-submissions/${submissionId}/upload-document/`);
  
  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", "PASSPORT");
    
    mutate(formData);
  };
  
  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }}
      disabled={isPending}
    />
  );
}
```

### Multiple Queries

```typescript
"use client";

import { useGet } from "@/lib/hooks";

export default function DashboardPage() {
  // Multiple queries
  const { data: user } = useGet("/auth/me/");
  const { data: applications } = useGet("/applicant/");
  const { data: submissions } = useGet("/applicant/my-submissions/");
  
  return (
    <div>
      <h1>Welcome {user?.full_name}</h1>
      <p>Applications: {applications?.length}</p>
      <p>My Submissions: {submissions?.length}</p>
    </div>
  );
}
```

### Conditional Query

```typescript
"use client";

import { useGet } from "@/lib/hooks";

export default function ApplicationDetailPage({ id }: { id?: string }) {
  const { data, isLoading } = useGet(
    id ? `/applicant/${id}/` : "",
    {
      enabled: !!id, // Only fetch if id exists
    }
  );
  
  if (!id) return <div>No ID provided</div>;
  
  return <div>{data?.title}</div>;
}
```

## Query Invalidation

```typescript
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ["/applicant/"] });

// Invalidate all queries
queryClient.invalidateQueries();

// Refetch specific query
queryClient.refetchQueries({ queryKey: ["/applicant/"] });
```

## Error Handling

```typescript
import { usePost, ApiError } from "@/lib/hooks";

const { mutate, error } = usePost("/auth/login/", {
  onError: (error: ApiError) => {
    if (error.status === 401) {
      console.log("Unauthorized");
    } else if (error.status === 500) {
      console.log("Server error");
    }
  },
});
```
