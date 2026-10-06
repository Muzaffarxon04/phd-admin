"use client";

import { Button } from "antd";
import { EditOutlined, SendOutlined } from "@ant-design/icons";
import type { SubmissionDetail } from "@/lib/applicant/submissions";
import { Card } from "@/components/applicant/ui/Card";

interface ActionsCardProps {
  submission: SubmissionDetail;
  submitting: boolean;
  onSubmit: () => void;
  onEdit: () => void;
}

const NOTE: Partial<Record<SubmissionDetail["status"], string>> = {
  SUBMITTED: "Arizangiz qabul qilindi va navbatda turibdi.",
  UNDER_REVIEW: "Komissiya arizangizni ko'rib chiqmoqda.",
  APPROVED: "Arizangiz qabul qilindi. Tabriklaymiz!",
  REJECTED: "Arizangiz rad etildi. Sababi komissiya xulosasida.",
};

/** Submit / resubmit / edit — what the applicant can do in the current status. */
export function ActionsCard({ submission: s, submitting, onSubmit, onEdit }: ActionsCardProps) {
  const canSubmit = s.status === "DRAFT" || s.status === "WITHDRAWN";
  const canEdit = s.can_edit ?? (s.status !== "APPROVED" && s.status !== "REJECTED");

  return (
    <Card title="Amallar">
      {s.status === "WITHDRAWN" && (
        <p className="mb-3 rounded-lg bg-warning-soft px-3 py-2 text-[13px] leading-5 text-warning">
          Ariza qaytarildi — xatolarni to&apos;g&apos;rilab qayta yuboring.
        </p>
      )}
      {s.status === "DRAFT" && (
        <p className="mb-3 text-[13px] leading-5 text-muted">
          Ariza hali yuborilmagan. Javoblarni tekshirib, &quot;Yuborish&quot; tugmasini bosing.
        </p>
      )}
      {NOTE[s.status] && <p className="mb-3 text-[13px] leading-5 text-muted">{NOTE[s.status]}</p>}

      <div className="flex flex-col gap-2">
        {canSubmit && (
          <Button type="primary" size="large" icon={<SendOutlined />} loading={submitting} onClick={onSubmit} block>
            {s.status === "WITHDRAWN" ? "Qayta yuborish" : "Yuborish"}
          </Button>
        )}
        {canEdit && (
          <Button size="large" icon={<EditOutlined />} onClick={onEdit} block>
            Javoblarni tahrirlash
          </Button>
        )}
      </div>
    </Card>
  );
}
