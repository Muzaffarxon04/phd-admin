import { LockOutlined } from "@ant-design/icons";
import { displayName } from "@/lib/applicant/session";
import { genderLabel } from "@/lib/applicant/profile";
import { formatDate, formatPhone } from "@/lib/utils";
import { Card } from "@/components/applicant/ui/Card";
import { DataList, type DataItem } from "@/components/applicant/ui/DataList";
import { UserAvatar } from "@/components/applicant/ui/UserAvatar";
import { VerifiedBadge } from "@/components/applicant/ui/VerifiedBadge";
import type { ApplicantProfile, ApplicantSnapshot } from "@/types";

interface ApplicantSummaryCardProps {
  /** Live profile (application form) or the frozen snapshot (submission detail). */
  data: ApplicantProfile | ApplicantSnapshot;
  title?: string;
  description?: React.ReactNode;
  /** When true the rows are shown with lock icons (data comes from TSMU ID). */
  locked?: boolean;
}

function str(v: unknown): string | undefined {
  return v === undefined || v === null || v === "" ? undefined : String(v);
}

/** Read-only view of the personal data that is (or was) frozen into a submission. */
export function ApplicantSummaryCard({ data, title = "Ariza beruvchi", description, locked = true }: ApplicantSummaryCardProps) {
  const passport = [str(data.passport_seria) ?? str(data.passport_series), str(data.passport_number)].filter(Boolean).join(" ");
  const items: DataItem[] = [
    { key: "pinfl", label: "JSHSHIR", value: str(data.pinfl), mono: true, locked },
    { key: "birth_date", label: "Tug'ilgan sana", value: data.birth_date ? formatDate(String(data.birth_date)) : undefined, mono: true, locked },
    { key: "passport", label: "Pasport", value: passport || undefined, mono: true, locked },
    { key: "gender", label: "Jinsi", value: genderLabel(data.gender), locked },
    { key: "phone", label: "Telefon", value: data.phone_number ? formatPhone(String(data.phone_number)) : undefined, mono: true, locked: true },
    { key: "email", label: "Elektron pochta", value: str(data.email) },
    { key: "organization", label: "Tashkilot", value: str(data.organization), span: 2 },
    { key: "address", label: "Doimiy manzil", value: str(data.permanent_address), span: 2 },
  ];

  return (
    <Card
      title={title}
      description={description}
      actions={locked ? <LockOutlined className="text-muted" aria-label="O'zgartirib bo'lmaydi" /> : undefined}
    >
      <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
        <UserAvatar user={data as ApplicantProfile} size={48} />
        <div className="min-w-0">
          <p className="break-words text-[15px] font-semibold leading-6 text-text">{displayName(data as ApplicantProfile)}</p>
          {(data as ApplicantProfile).is_verified && <VerifiedBadge compact className="mt-1" />}
        </div>
      </div>
      <DataList items={items} />
    </Card>
  );
}
