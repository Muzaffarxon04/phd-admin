"use client";

import { use } from "react";
import { Card, Spin, Tag, Button, message, Alert } from "antd";
import { useGet, usePost, usePatch, useUpload } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { formatDate, getApplicationStatusLabel, getApplicationStatusColor } from "@/lib/utils";

interface Submission {
  id: number;
  submission_number: string;
  application_title: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  review_notes?: string;
  answers: Array<{
    id: number;
    field_label: string;
    field_type: string;
    answer_text?: string;
  }>;
  documents: Array<{
    id: number;
    document_type: string;
    file: string;
    status: string;
    uploaded_at: string;
  }>;
  created_at: string;
  submitted_at?: string;
}

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: submission, isLoading } = useGet<Submission>(`/applicant/my-submissions/${id}/`);

  const { mutate: submitSubmission, isPending: isSubmitting } = usePost(`/applicant/submissions/${id}/submit/`, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/applicant/my-submissions/${id}/`] });
      message.success("Ariza muvaffaqiyatli topshirildi!");
    },
    onError: (error) => {
      message.error(error.message || "Topshirishda xatolik");
    },
  });

  const { mutate: updateSubmission } = usePatch(`/applicant/submissions/${id}/update/`, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/applicant/my-submissions/${id}/`] });
      message.success("Ariza yangilandi!");
    },
    onError: (error) => {
      message.error(error.message || "Yangilashda xatolik");
    },
  });

  const { mutate: uploadDocument } = useUpload(`/applicant/submissions/${id}/documents/`, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/applicant/my-submissions/${id}/`] });
      message.success("Hujjat yuklandi!");
    },
    onError: (error) => {
      message.error(error.message || "Hujjat yuklashda xatolik");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <p>Ariza topilmadi</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <div className="mb-6">
          <Link href="/my-submissions">
            <Button type="link">← Orqaga</Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4">Ariza #{submission.submission_number}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card size="small" className="border-l-4 border-l-blue-500">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Ariza nomi</p>
              <p className="text-base font-semibold">{submission.application_title}</p>
            </div>
          </Card>
          
          <Card size="small" className="border-l-4 border-l-purple-500">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Holati</p>
              <Tag color={getApplicationStatusColor(submission.status)} className="text-sm">
                {getApplicationStatusLabel(submission.status)}
              </Tag>
            </div>
          </Card>
          
          <Card size="small" className="border-l-4 border-l-green-500">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">To&apos;lov holati</p>
              <Tag color={submission.payment_status === "PAID" ? "green" : "orange"} className="text-sm">
                {submission.payment_status === "PAID" ? "To'langan" : submission.payment_status === "PENDING" ? "Kutilmoqda" : submission.payment_status}
              </Tag>
            </div>
          </Card>
          
          <Card size="small" className="border-l-4 border-l-orange-500">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Yaratilgan sana</p>
              <p className="text-base font-medium">{formatDate(submission.created_at)}</p>
            </div>
          </Card>
          
          {submission.submitted_at && (
            <Card size="small" className="border-l-4 border-l-teal-500">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Topshirilgan sana</p>
                <p className="text-base font-medium">{formatDate(submission.submitted_at)}</p>
              </div>
            </Card>
          )}
        </div>

        {submission.review_notes && (
          <Alert message={submission.review_notes} type="info" className="mb-6" />
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Javoblar</h2>
          <div className="space-y-4">
            {submission.answers.map((answer) => (
              <Card key={answer.id} size="small">
                <div>
                  <p className="font-medium mb-2">{answer.field_label}</p>
                  <p className="text-gray-600">{answer.answer_text || "-"}</p>
                  <Tag className="mt-2">{answer.field_type}</Tag>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Hujjatlar</h2>
          <div className="space-y-4">
            {submission.documents.map((doc) => (
              <Card key={doc.id} size="small">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{doc.document_type}</p>
                    <p className="text-sm text-gray-500">{formatDate(doc.uploaded_at)}</p>
                    <Tag color={doc.status === "APPROVED" ? "green" : "orange"}>{doc.status}</Tag>
                  </div>
                  <a href={doc.file} target="_blank" rel="noopener noreferrer">
                    <Button>Yuklab olish</Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          {submission.status === "DRAFT" && (
            <Button type="primary" size="large" onClick={() => submitSubmission({})} loading={isSubmitting}>
              Topshirish
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
