"use client";

import Link from "next/link";
import { Button } from "antd";
import { CalendarOutlined, WalletOutlined } from "@ant-design/icons";
import { deadlineInfo, type AvailableApplication } from "@/lib/applicant/applications";
import { formatDate, parseMoneyAmount } from "@/lib/utils";
import { StatusBadge } from "@/components/applicant/ui/StatusBadge";

interface ApplicationCardProps {
  application: AvailableApplication;
  now?: Date;
}

export function ApplicationCard({ application: app, now }: ApplicationCardProps) {
  const deadline = deadlineInfo(app.end_date, now);
  const closed = deadline.daysLeft !== null && deadline.daysLeft < 0;
  const href = `/applications/${app.id}`;

  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 break-words text-[15px] font-semibold leading-6 text-text">
          <Link href={href} className="hover:text-primary">
            {app.title}
          </Link>
        </h2>
        <StatusBadge tone={deadline.tone} className="shrink-0">
          {deadline.label}
        </StatusBadge>
      </div>

      {app.description && <p className="mt-2 line-clamp-3 text-[13px] leading-5 text-muted">{app.description}</p>}

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 text-xs text-muted">
            <CalendarOutlined /> Muddat
          </dt>
          <dd className="tabular mt-0.5 truncate text-text">{formatDate(app.end_date)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 text-xs text-muted">
            <CalendarOutlined /> Imtihon
          </dt>
          <dd className="tabular mt-0.5 truncate text-text">{app.exam_date ? formatDate(app.exam_date) : "Belgilanmagan"}</dd>
        </div>
        <div className="col-span-2 min-w-0">
          <dt className="flex items-center gap-1.5 text-xs text-muted">
            <WalletOutlined /> To&apos;lov
          </dt>
          <dd className="tabular mt-0.5 truncate font-medium text-text">{parseMoneyAmount(app.application_fee)}</dd>
        </div>
      </dl>

      {!app.can_apply && app.can_apply_message && (
        <p className="mt-3 rounded-lg bg-warning-soft px-3 py-2 text-[13px] leading-5 text-warning">{app.can_apply_message}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="tabular text-xs text-muted">
          {app.user_submission_count ? `${app.user_submission_count} ta ariza yuborgansiz` : "Hali ariza yubormagansiz"}
        </span>
        <Link href={href}>
          <Button type="primary" disabled={closed}>
            Ariza berish
          </Button>
        </Link>
      </div>
    </article>
  );
}
