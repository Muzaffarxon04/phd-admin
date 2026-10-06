"use client";

import { useState } from "react";
import { Button, Skeleton, message } from "antd";
import { usePatch } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/applicant/errors";
import { PROFILE_ENDPOINT, profileSections } from "@/lib/applicant/profile";
import { useApplicantProfile } from "@/lib/applicant/useApplicantProfile";
import { Card } from "@/components/applicant/ui/Card";
import { DataList } from "@/components/applicant/ui/DataList";
import { EmptyState } from "@/components/applicant/ui/EmptyState";
import { ProfileHero } from "@/components/applicant/profile/ProfileHero";
import { EditProfileSheet, type EditProfileValues } from "@/components/applicant/profile/EditProfileSheet";

export default function DashboardPage() {
  const { profile, isLoading, isError, error, refetch } = useApplicantProfile();
  const patchProfile = usePatch(PROFILE_ENDPOINT);
  const [editing, setEditing] = useState(false);

  const save = async (values: EditProfileValues) => {
    try {
      await patchProfile.mutateAsync(values);
      await refetch();
      message.success("Profil yangilandi");
      setEditing(false);
    } catch (err) {
      message.error(getErrorMessage(err, "Profilni yangilashda xatolik yuz berdi"));
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-xl border border-border bg-surface p-5">
          <Skeleton avatar={{ size: 72 }} active paragraph={{ rows: 1 }} />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-5">
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        title="Profil yuklanmadi"
        description={isError ? getErrorMessage(error) : "Ma'lumotlar topilmadi"}
        action={<Button onClick={() => refetch()}>Qayta urinish</Button>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <ProfileHero profile={profile} onEdit={() => setEditing(true)} />

      {profileSections(profile).map((section) => (
        <Card key={section.key} title={section.title}>
          <DataList items={section.items} />
        </Card>
      ))}

      <EditProfileSheet
        open={editing}
        profile={profile}
        saving={patchProfile.isPending}
        onClose={() => setEditing(false)}
        onSave={save}
      />
    </div>
  );
}
