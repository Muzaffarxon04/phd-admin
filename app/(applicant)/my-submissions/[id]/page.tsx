"use client";

import { use, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { App, Button, Skeleton } from "antd";
import { API_BASE_URL, useGet, usePost, useUploadPatch } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/applicant/errors";
import type { ApplicationField } from "@/lib/applicant/applications";
import {
  buildUpdateFormData,
  canEditSubmission,
  educationFormLabel,
  resolveFileUrl,
  type SubmissionDetail,
} from "@/lib/applicant/submissions";
import { formatDateTime, parseMoneyAmount } from "@/lib/utils";
import { PageHeader } from "@/components/applicant/ui/PageHeader";
import { Card } from "@/components/applicant/ui/Card";
import { DataList } from "@/components/applicant/ui/DataList";
import { EmptyState } from "@/components/applicant/ui/EmptyState";
import { StatusBadge } from "@/components/applicant/ui/StatusBadge";
import { ApplicantSummaryCard } from "@/components/applicant/application-form/ApplicantSummaryCard";
import { FilePreview, type PreviewFile } from "@/components/applicant/application-form/FilePreview";
import { StatusTimeline } from "@/components/applicant/submissions/StatusTimeline";
import { AnswersCard } from "@/components/applicant/submissions/AnswersCard";
import { DocumentsCard } from "@/components/applicant/submissions/DocumentsCard";
import { ActionsCard } from "@/components/applicant/submissions/ActionsCard";
import { EditAnswersSheet } from "@/components/applicant/submissions/EditAnswersSheet";

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const detailKey = `/applicant/my-submissions/${id}/`;

  const { data, isLoading, isError, error, refetch } = useGet<{ data: SubmissionDetail }>(detailKey);
  const submission = data?.data;

  const appId = submission?.application?.id;
  const { data: appData } = useGet<{ data: { fields?: ApplicationField[] } }>(`/applicant/applications/${appId}/`, {
    enabled: !!appId,
  });
  const fields = appData?.data?.fields ?? [];

  const [preview, setPreview] = useState<PreviewFile | null>(null);
  const [editing, setEditing] = useState(false);
  const resolve = useCallback((path: string) => resolveFileUrl(path, API_BASE_URL), []);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [detailKey] });
    queryClient.invalidateQueries({ queryKey: ["/applicant/my-submissions/"] });
  };

  const submit = usePost(`/applicant/submissions/${id}/submit/`, {
    onSuccess: () => {
      invalidate();
      message.success("Ariza yuborildi");
    },
    onError: (err) => {
      const text = getErrorMessage(err, "Yuborishda xatolik");
      message.error(
        text.toLowerCase().includes("missing required")
          ? "Majburiy maydonlar to'ldirilmagan yoki ariza allaqachon yuborilgan"
          : text
      );
    },
  });

  const update = useUploadPatch(`/applicant/submissions/${id}/update/`, {
    onSuccess: () => {
      invalidate();
      message.success("Javoblar yangilandi");
      setEditing(false);
    },
    onError: (err) => message.error(getErrorMessage(err, "Yangilashda xatolik")),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton active title paragraph={{ rows: 1 }} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-5">
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <>
        <PageHeader title="Ariza tafsilotlari" back={{ href: "/my-submissions", label: "Mening arizalarim" }} />
        <EmptyState
          title="Ariza topilmadi"
          description={isError ? getErrorMessage(error) : "Bunday ariza mavjud emas yoki sizga tegishli emas"}
          action={<Button onClick={() => refetch()}>Qayta urinish</Button>}
        />
      </>
    );
  }

  const s = submission;
  const editable = s.can_edit ?? canEditSubmission(s.status);

  return (
    <>
      <PageHeader
        title={<span className="tabular">Ariza #{s.submission_number}</span>}
        description={s.application?.title}
        meta={<StatusBadge status={s.status} />}
        back={{ href: "/my-submissions", label: "Mening arizalarim" }}
      />

      <div className="flex flex-col gap-5">
        <Card>
          <StatusTimeline status={s.status} />
        </Card>

        {s.review_notes && (
          <div
            className={
              s.status === "REJECTED"
                ? "rounded-xl border border-danger/30 bg-danger-soft px-4 py-3.5"
                : "rounded-xl border border-border bg-primary-soft/40 px-4 py-3.5"
            }
          >
            <p className="text-[13px] font-semibold text-text">Komissiya xulosasi</p>
            <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-text">{s.review_notes}</p>
            {(s.reviewed_by_name || s.reviewed_at) && (
              <p className="mt-2 text-xs text-muted">
                {[s.reviewed_by_name, s.reviewed_at && formatDateTime(s.reviewed_at)].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-5">
            <Card title="Ariza haqida">
              <DataList
                items={[
                  { key: "spec", label: "Mutaxassislik", value: s.speciality ? `${s.speciality.code} — ${s.speciality.name}` : undefined, span: 2 },
                  { key: "form", label: "Ta'lim shakli", value: educationFormLabel(s.education_form) },
                  { key: "fee", label: "To'lov", value: s.application?.application_fee ? parseMoneyAmount(s.application.application_fee) : undefined, mono: true },
                  { key: "payment", label: "To'lov holati", value: <StatusBadge kind="payment" status={s.payment_status} /> },
                  { key: "created", label: "Yaratilgan", value: formatDateTime(s.created_at), mono: true },
                  { key: "submitted", label: "Yuborilgan", value: s.submitted_at ? formatDateTime(s.submitted_at) : undefined, mono: true },
                  { key: "updated", label: "So'nggi o'zgarish", value: s.updated_at ? formatDateTime(s.updated_at) : undefined, mono: true },
                ]}
              />
            </Card>

            {s.applicant_snapshot && (
              <ApplicantSummaryCard
                data={s.applicant_snapshot}
                title="Ariza beruvchi (ariza paytidagi ma'lumot)"
                description="Ariza yaratilgan paytdagi shaxsiy ma'lumotlar muhrlangan nusxasi"
              />
            )}

            <AnswersCard
              answers={s.answers ?? []}
              resolve={resolve}
              onPreview={setPreview}
              onEdit={editable && fields.length ? () => setEditing(true) : undefined}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <ActionsCard
              submission={s}
              submitting={submit.isPending}
              onSubmit={() => submit.mutate({})}
              onEdit={() => setEditing(true)}
            />
            <DocumentsCard documents={s.documents ?? []} resolve={resolve} onPreview={setPreview} />
          </div>
        </div>
      </div>

      <EditAnswersSheet
        open={editing}
        fields={fields}
        answers={s.answers ?? []}
        resolve={resolve}
        saving={update.isPending}
        onClose={() => setEditing(false)}
        onSave={(values) => update.mutate(buildUpdateFormData(fields, values))}
        onPreview={setPreview}
      />
      <FilePreview target={preview} onClose={() => setPreview(null)} />
    </>
  );
}
