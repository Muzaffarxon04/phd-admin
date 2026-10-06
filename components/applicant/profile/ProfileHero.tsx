"use client";

import Link from "next/link";
import { Button } from "antd";
import { EditOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { displayName } from "@/lib/applicant/session";
import { formatDate, formatPhone } from "@/lib/utils";
import { UserAvatar } from "@/components/applicant/ui/UserAvatar";
import { VerifiedBadge } from "@/components/applicant/ui/VerifiedBadge";
import type { ApplicantProfile } from "@/types";

interface ProfileHeroProps {
  profile: ApplicantProfile;
  onEdit: () => void;
}

/** Top card: photo, name, phone and the TSMU ID verification state. */
export function ProfileHero({ profile, onEdit }: ProfileHeroProps) {
  const verified = profile.is_verified === true;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <UserAvatar user={profile} size={72} className="ring-4 ring-surface-2" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h1 className="min-w-0 break-words text-xl font-semibold tracking-tight text-text sm:text-2xl">
              {displayName(profile)}
            </h1>
            {verified && <VerifiedBadge compact />}
          </div>
          <p className="tabular mt-1 text-sm text-muted">
            {profile.phone_number ? formatPhone(String(profile.phone_number)) : "Telefon kiritilmagan"}
          </p>
          {verified && profile.identity_verified_at && (
            <p className="mt-0.5 text-xs text-muted">Tasdiqlangan: {formatDate(profile.identity_verified_at)}</p>
          )}
        </div>
        <Button icon={<EditOutlined />} onClick={onEdit} className="sm:self-start">
          Tahrirlash
        </Button>
      </div>

      {!verified && (
        <div className="flex flex-col gap-3 border-t border-border bg-warning-soft px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-start gap-3">
            <SafetyCertificateOutlined className="mt-0.5 shrink-0 text-base text-warning" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">Shaxsingiz hali tasdiqlanmagan</p>
              <p className="mt-0.5 text-[13px] leading-5 text-muted">
                Ariza yuborish uchun JSHSHIR va yuz orqali TSMU ID tasdig&apos;idan o&apos;ting. Bu 2 daqiqa oladi.
              </p>
            </div>
          </div>
          <Link href="/verify-identity?next=%2Fdashboard" className="sm:shrink-0">
            <Button type="primary" block>
              Shaxsni tasdiqlash
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
