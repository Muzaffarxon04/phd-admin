"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Segmented, Skeleton } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/applicant/errors";
import { unwrapApplications } from "@/lib/applicant/applications";
import { educationFormLabel, type SubmissionRow } from "@/lib/applicant/submissions";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/applicant/ui/PageHeader";
import { EmptyState } from "@/components/applicant/ui/EmptyState";
import { StatusBadge } from "@/components/applicant/ui/StatusBadge";
import { ResponsiveTable, type RTColumn } from "@/components/applicant/ui/ResponsiveTable";

const FILTERS = [
  { value: "all", label: "Barchasi" },
  { value: "DRAFT", label: "Qoralama" },
  { value: "SUBMITTED", label: "Yuborilgan" },
  { value: "UNDER_REVIEW", label: "Ko'rilmoqda" },
  { value: "APPROVED", label: "Qabul" },
  { value: "REJECTED", label: "Rad" },
];

export default function MySubmissionsPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useGet<unknown>("/applicant/my-submissions/");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => unwrapApplications<SubmissionRow>(data), [data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (!q || r.application_title?.toLowerCase().includes(q) || r.submission_number?.toLowerCase().includes(q))
    );
  }, [rows, search, status]);

  const columns: RTColumn<SubmissionRow>[] = [
    {
      key: "number",
      title: "Raqam",
      width: 130,
      mobile: "meta",
      render: (r) => <span className="tabular font-medium text-primary">#{r.submission_number}</span>,
    },
    {
      key: "title",
      title: "Ariza",
      mobile: "title",
      render: (r) => <span className="line-clamp-2 break-words">{r.application_title}</span>,
    },
    {
      key: "form",
      title: "Ta'lim shakli",
      width: 220,
      render: (r) => <span className="text-muted">{educationFormLabel(r.education_form) ?? "—"}</span>,
    },
    { key: "status", title: "Holat", width: 150, mobile: "badge", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "payment",
      title: "To'lov",
      width: 130,
      render: (r) => <StatusBadge kind="payment" status={r.payment_status} />,
    },
    {
      key: "date",
      title: "Sana",
      width: 120,
      render: (r) => <span className="tabular text-muted">{formatDate(r.submitted_at || r.created_at)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Mening arizalarim"
        description="Yuborilgan va qoralama arizalaringiz holati"
        actions={
          <Link href="/applications">
            <Button type="primary" icon={<PlusOutlined />}>
              Yangi ariza
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <Segmented options={FILTERS} value={status} onChange={(v) => setStatus(String(v))} />
        </div>
        <Input
          allowClear
          prefix={<SearchOutlined className="text-muted" />}
          placeholder="Raqam yoki ariza nomi"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-72"
        />
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-surface p-5">
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      ) : isError ? (
        <EmptyState
          title="Arizalarni yuklab bo'lmadi"
          description={getErrorMessage(error)}
          action={<Button onClick={() => refetch()}>Qayta urinish</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={rows.length ? "Mos ariza topilmadi" : "Hali ariza yubormagansiz"}
          description={rows.length ? "Filtr yoki qidiruvni o'zgartiring" : "Ochiq e'lonlardan birini tanlab ariza yarating"}
          action={
            !rows.length && (
              <Link href="/applications">
                <Button type="primary">Arizalarga o&apos;tish</Button>
              </Link>
            )
          }
        />
      ) : (
        <ResponsiveTable
          columns={columns}
          data={filtered}
          rowKey={(r) => r.id}
          onRowClick={(r) => router.push(`/my-submissions/${r.id}`)}
          rowClassName={(r) => (r.status === "DRAFT" ? "bg-warning-soft/40" : "")}
          mobileFooter={(r) =>
            r.status === "DRAFT" ? (
              <p className="mt-3 text-[13px] text-warning">Qoralama — tekshirib, yuborishni unutmang</p>
            ) : null
          }
        />
      )}
    </>
  );
}
