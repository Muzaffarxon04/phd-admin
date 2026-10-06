"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { App, Button, Form, Skeleton } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useGet, useUpload } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/applicant/errors";
import { useApplicantProfile } from "@/lib/applicant/useApplicantProfile";
import {
  buildSubmissionFormData,
  extractCreatedId,
  isIdentityNotVerified,
  type ApplicationDetail,
  type CreateSubmissionResponse,
  type SpecialitySelection,
} from "@/lib/applicant/applications";
import { PageHeader } from "@/components/applicant/ui/PageHeader";
import { EmptyState } from "@/components/applicant/ui/EmptyState";
import { ApplicationInfoCard } from "@/components/applicant/application-form/ApplicationInfoCard";
import { ApplicantSummaryCard } from "@/components/applicant/application-form/ApplicantSummaryCard";
import { VerifyIdentityGate } from "@/components/applicant/application-form/VerifyIdentityGate";
import { SpecialitySection } from "@/components/applicant/application-form/SpecialitySection";
import { EducationFormSection } from "@/components/applicant/application-form/EducationFormSection";
import { DynamicFieldsSection } from "@/components/applicant/application-form/DynamicFieldsSection";
import { SubmitBar } from "@/components/applicant/application-form/SubmitBar";
import { FilePreview, type PreviewFile } from "@/components/applicant/application-form/FilePreview";

interface ApplicationResponse {
  data: ApplicationDetail;
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();

  const { data: res, isLoading, isError, error, refetch } = useGet<ApplicationResponse>(`/applicant/applications/${id}/`);
  const application = res?.data;
  const {
    profile,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorObj,
    refetch: refetchProfile,
  } = useApplicantProfile();

  const [selection, setSelection] = useState<SpecialitySelection>({ speciality: null, foreign: [] });
  const [specialityError, setSpecialityError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewFile | null>(null);
  const [gated, setGated] = useState(false);

  const create = useUpload<CreateSubmissionResponse>("/applicant/submissions/create/", {
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/applicant/my-submissions/"] });
      const createdId = extractCreatedId(data);
      const target = createdId ? `/my-submissions/${createdId}` : "/my-submissions";
      const m = modal.success({
        title: "Ariza qoralama sifatida saqlandi",
        icon: <CheckCircleOutlined className="text-success" />,
        content: (
          <p className="text-sm leading-6 text-muted">
            Ariza hali yuborilmadi. &quot;Mening arizalarim&quot; bo&apos;limida uni tekshirib, so&apos;ng yuboring.
          </p>
        ),
        okText: "Arizalarimga o'tish",
        onOk: () => {
          m.destroy();
          router.push(target);
        },
      });
    },
    onError: (err) => {
      if (isIdentityNotVerified(err)) {
        setGated(true);
        return;
      }
      const text = getErrorMessage(err, "Ariza yaratishda xatolik yuz berdi");
      message.error(text.includes("duplicate key") ? "Siz bu e'longa allaqachon ariza topshirgansiz" : text);
    },
  });

  const submit = (values: Record<string, unknown>) => {
    if (!application) return;
    const built = buildSubmissionFormData(application, values, selection);
    if (!built.ok) {
      if (built.error.includes("mutaxassislik")) setSpecialityError(built.error);
      message.error(built.error);
      return;
    }
    setSpecialityError(null);
    create.mutate(built.formData);
  };

  if (isLoading || profileLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton active title paragraph={{ rows: 1 }} />
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-5">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !application) {
    return (
      <>
        <PageHeader title="Ariza topshirish" back={{ href: "/applications", label: "Arizalar" }} />
        <EmptyState
          title="Ariza topilmadi"
          description={isError ? getErrorMessage(error) : "E'lon o'chirilgan yoki mavjud emas"}
          action={<Button onClick={() => refetch()}>Qayta urinish</Button>}
        />
      </>
    );
  }

  // A failed profile request is an error, not "unverified": never send a verified user through the wizard for it.
  if (!profile) {
    return (
      <>
        <PageHeader title="Ariza topshirish" back={{ href: "/applications", label: "Arizalar" }} />
        <EmptyState
          title="Profil yuklanmadi"
          description={profileError ? getErrorMessage(profileErrorObj) : "Profil ma'lumotlari topilmadi"}
          action={<Button onClick={() => refetchProfile()}>Qayta urinish</Button>}
        />
      </>
    );
  }

  const verified = profile.is_verified === true && !gated;
  const here = `/applications/${id}`;

  return (
    <>
      <PageHeader
        title="Ariza topshirish"
        description="Ma'lumotlarni to'ldiring — ariza avval qoralama sifatida saqlanadi."
        back={{ href: "/applications", label: "Arizalar" }}
      />

      <div className="flex flex-col gap-5">
        <ApplicationInfoCard application={application} />

        {!verified ? (
          <VerifyIdentityGate next={here} />
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={submit}
            onFinishFailed={({ errorFields }) => {
              const first = errorFields?.[0];
              if (first) {
                form.scrollToField(first.name, { behavior: "smooth", block: "center" });
                if (first.errors?.[0]) message.error(first.errors[0]);
              }
            }}
            autoComplete="off"
            className="flex flex-col gap-5"
          >
            <ApplicantSummaryCard
              data={profile}
              description="Bu ma'lumotlar ariza bilan birga muhrlanadi va keyin o'zgartirilmaydi"
            />

            <SpecialitySection
              applicationId={application.id}
              specialities={application.specialities ?? []}
              value={selection}
              onChange={(v) => {
                setSelection(v);
                if (v.speciality || v.foreign.length) setSpecialityError(null);
              }}
              onPreview={setPreview}
              error={specialityError}
            />

            <EducationFormSection />

            <DynamicFieldsSection fields={application.fields ?? []} onPreview={setPreview} />

            <SubmitBar loading={create.isPending} />
          </Form>
        )}
      </div>

      <FilePreview target={preview} onClose={() => setPreview(null)} />
    </>
  );
}
