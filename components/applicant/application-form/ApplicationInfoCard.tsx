import { CalendarOutlined, ClockCircleOutlined, InfoCircleOutlined, WalletOutlined } from "@ant-design/icons";
import { deadlineInfo, type ApplicationDetail } from "@/lib/applicant/applications";
import { formatDateTime, parseMoneyAmount } from "@/lib/utils";
import { Card } from "@/components/applicant/ui/Card";
import { StatusBadge } from "@/components/applicant/ui/StatusBadge";

/** Dates, fee and instructions of the announcement. */
export function ApplicationInfoCard({ application: app }: { application: ApplicationDetail }) {
  const deadline = deadlineInfo(app.end_date);
  const facts = [
    { icon: <CalendarOutlined />, label: "Boshlanish", value: formatDateTime(app.start_date) },
    { icon: <ClockCircleOutlined />, label: "Tugash", value: formatDateTime(app.end_date) },
    { icon: <CalendarOutlined />, label: "Imtihon", value: app.exam_date ? formatDateTime(app.exam_date) : "Belgilanmagan" },
    { icon: <WalletOutlined />, label: "To'lov", value: parseMoneyAmount(app.application_fee) },
  ];

  return (
    <Card title={app.title} actions={<StatusBadge tone={deadline.tone}>{deadline.label}</StatusBadge>}>
      {app.description && <p className="whitespace-pre-line text-sm leading-6 text-text">{app.description}</p>}

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="min-w-0 rounded-lg bg-surface-2 px-3 py-2.5">
            <dt className="flex items-center gap-1.5 text-xs text-muted">
              {f.icon} {f.label}
            </dt>
            <dd className="tabular mt-1 truncate text-sm font-medium text-text">{f.value}</dd>
          </div>
        ))}
      </dl>

      {app.instructions && (
        <div className="mt-4 flex gap-3 rounded-lg border border-border bg-primary-soft/40 px-3.5 py-3">
          <InfoCircleOutlined className="mt-1 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-text">Ko&apos;rsatmalar</p>
            <p className="mt-0.5 whitespace-pre-line break-words text-[13px] leading-5 text-muted">{app.instructions}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
