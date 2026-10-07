"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Drawer, Input, Select, Tag } from "antd";
import type { Dayjs } from "dayjs";
import {
  ArrowRightOutlined,
  CloseOutlined,
  ReloadOutlined,
  ScanOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/hooks";
import { formatDateTime } from "@/lib/utils";
import {
  AdminCard,
  PageHeader,
  ResponsiveTable,
  useAdminBreakpoint,
} from "@/components/admin/ui";
import { FaceFrame } from "./_components/FaceFrame";

/* ================= TYPES ================= */

type Pose = "front" | "left" | "right";
type Purpose = "REGISTRATION" | "PASSWORD_RESET";
type Reason = "" | "NO_FACE" | "MULTIPLE_FACES" | "LOW_SIMILARITY" | "LIVENESS_FAILED" | "POSE_MISMATCH" | "SERVICE_ERROR";

interface FaceLogFrame {
  index: 1 | 2 | 3;
  pose: Pose | null;
  url: string;
}

interface FaceLog {
  id: number;
  created_at: string;
  pinfl: string;
  purpose: Purpose;
  passed: boolean;
  reason: Reason;
  similarity_pct: number | null;
  challenge: Pose[];
  user: { id: number; full_name: string; phone_number: string } | null;
  ip_address: string | null;
  user_agent: string | null;
  frames: FaceLogFrame[];
}

interface FaceLogsResponse {
  next?: string | null;
  previous?: string | null;
  total_elements?: number;
  page_size?: number;
  from?: number;
  to?: number;
  data?: { message?: string; error?: unknown; status?: number; data?: FaceLog[] };
}

/* ================= LABELS ================= */

const POSE_LABELS: Record<Pose, string> = { front: "To'g'ri", left: "Chap", right: "O'ng" };

const PURPOSE_LABELS: Record<Purpose, string> = {
  REGISTRATION: "Ro'yxatdan o'tish",
  PASSWORD_RESET: "Parol tiklash",
};

const REASON_LABELS: Record<Exclude<Reason, "">, string> = {
  NO_FACE: "Yuz topilmadi",
  MULTIPLE_FACES: "Bir nechta yuz",
  LOW_SIMILARITY: "Yuz mos kelmadi",
  LIVENESS_FAILED: "Jonlilik tasdiqlanmadi",
  POSE_MISMATCH: "Bosh holati tartibi buzilgan",
  SERVICE_ERROR: "Xizmat xatosi",
};

const PAGE_SIZE = 20;

type ResultFilter = "all" | "passed" | "failed";

const poseLabel = (pose: Pose | null | undefined, index: number) =>
  pose ? POSE_LABELS[pose] ?? pose : `Kadr ${index}`;

const reasonLabel = (reason: Reason) => (reason ? REASON_LABELS[reason] ?? reason : "");

/* ================= SMALL PIECES ================= */

function ResultTag({ log }: { log: FaceLog }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <Tag color={log.passed ? "success" : "error"} className="!m-0 font-semibold">
        {log.passed ? "Tasdiqlandi" : "Aniqlanmadi"}
      </Tag>
      {!log.passed && log.reason ? (
        <span className="admin-muted text-[12px] leading-snug">{reasonLabel(log.reason)}</span>
      ) : null}
    </div>
  );
}

function PurposeTag({ purpose }: { purpose: Purpose }) {
  return (
    <Tag color={purpose === "REGISTRATION" ? "purple" : "orange"} className="!m-0">
      {PURPOSE_LABELS[purpose] ?? purpose}
    </Tag>
  );
}

function Similarity({ value }: { value: number | null }) {
  if (value == null) return <span className="admin-muted">—</span>;
  const color = value >= 80 ? "var(--admin-success)" : value >= 60 ? "var(--admin-warning)" : "var(--admin-danger)";
  return (
    <span className="admin-tabular font-semibold" style={{ color }}>
      {value.toFixed(1)}%
    </span>
  );
}

function UserCell({ log }: { log: FaceLog }) {
  if (log.user) {
    return (
      <div className="min-w-0">
        <div className="admin-heading font-semibold leading-snug break-words">{log.user.full_name || "—"}</div>
        <div className="admin-muted text-[12px]">{log.user.phone_number || log.pinfl}</div>
      </div>
    );
  }
  return (
    <div className="min-w-0">
      <div className="admin-heading font-mono font-semibold">{log.pinfl || "—"}</div>
      <div className="admin-muted text-[12px]">JSHSHIR</div>
    </div>
  );
}

function sortedFrames(frames: FaceLogFrame[] | undefined) {
  return [...(frames ?? [])].sort((a, b) => a.index - b.index);
}

function FrameStrip({ log }: { log: FaceLog }) {
  const frames = sortedFrames(log.frames);
  if (frames.length === 0) return <span className="admin-muted text-[12px]">Kadr yo&apos;q</span>;
  return (
    <div className="flex gap-1.5">
      {frames.map((f) => (
        <FaceFrame
          key={f.index}
          url={f.url}
          alt={`${poseLabel(f.pose, f.index)} kadr`}
          caption={poseLabel(f.pose, f.index)}
        />
      ))}
    </div>
  );
}

/* ================= DETAIL ================= */

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 py-2.5 sm:grid-cols-[150px_1fr] sm:gap-4" style={{ borderTop: "1px solid var(--admin-border)" }}>
      <dt className="admin-muted text-[13px]">{label}</dt>
      <dd className="admin-heading m-0 min-w-0 text-[14px] break-words">{children}</dd>
    </div>
  );
}

function FaceLogDetail({ log }: { log: FaceLog }) {
  const frames = sortedFrames(log.frames);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <ResultTag log={log} />
        <PurposeTag purpose={log.purpose} />
      </div>

      {frames.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {frames.map((f) => (
            <FaceFrame
              key={f.index}
              url={f.url}
              size="large"
              alt={`${poseLabel(f.pose, f.index)} kadr`}
              caption={`${f.index}. ${poseLabel(f.pose, f.index)}`}
            />
          ))}
        </div>
      ) : (
        <div className="admin-muted text-[13px]">Kadrlar saqlanmagan</div>
      )}

      <dl className="m-0">
        <DetailRow label="Sana">{formatDateTime(log.created_at)}</DetailRow>
        <DetailRow label="Foydalanuvchi">{log.user?.full_name || "—"}</DetailRow>
        <DetailRow label="Telefon">{log.user?.phone_number || "—"}</DetailRow>
        <DetailRow label="JSHSHIR">
          <span className="font-mono">{log.pinfl || "—"}</span>
        </DetailRow>
        <DetailRow label="O'xshashlik">
          <Similarity value={log.similarity_pct} />
        </DetailRow>
        {!log.passed && log.reason ? <DetailRow label="Sabab">{reasonLabel(log.reason)}</DetailRow> : null}
        <DetailRow label="Bosh holati tartibi">
          {log.challenge?.length ? (
            <span className="inline-flex flex-wrap items-center gap-1.5">
              {log.challenge.map((p, i) => (
                <span key={`${p}-${i}`} className="inline-flex items-center gap-1.5">
                  {i > 0 ? <ArrowRightOutlined className="admin-muted text-[11px]" /> : null}
                  <Tag className="!m-0">{POSE_LABELS[p] ?? p}</Tag>
                </span>
              ))}
            </span>
          ) : (
            "—"
          )}
        </DetailRow>
        <DetailRow label="IP manzil">
          <span className="font-mono">{log.ip_address || "—"}</span>
        </DetailRow>
        <DetailRow label="Qurilma (User agent)">
          <span className="admin-muted text-[12px] break-all">{log.user_agent || "—"}</span>
        </DetailRow>
      </dl>
    </div>
  );
}

/* ================= PAGE ================= */

export default function FaceLogsPage() {
  const { isMobile } = useAdminBreakpoint();

  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ResultFilter>("all");
  const [purpose, setPurpose] = useState<Purpose | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);
  const [selected, setSelected] = useState<FaceLog | null>(null);

  // Debounce the search box.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
    if (result !== "all") params.set("passed", result === "passed" ? "true" : "false");
    if (purpose) params.set("purpose", purpose);
    if (search) params.set("search", search);
    if (dateFrom) params.set("date_from", dateFrom.format("YYYY-MM-DD"));
    if (dateTo) params.set("date_to", dateTo.format("YYYY-MM-DD"));
    return params.toString();
  }, [page, result, purpose, search, dateFrom, dateTo]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-face-logs", query],
    queryFn: () => apiRequest<FaceLogsResponse>(`/auth/tsmu-id/admin/face-logs/?${query}`),
    placeholderData: (prev) => prev,
  });

  const logs = data?.data?.data ?? [];
  const total = data?.total_elements ?? logs.length;
  const hasFilters = result !== "all" || !!purpose || !!searchInput || !!dateFrom || !!dateTo;

  const resetFilters = () => {
    setResult("all");
    setPurpose(undefined);
    setSearchInput("");
    setSearch("");
    setDateFrom(null);
    setDateTo(null);
    setPage(1);
  };

  const columns = [
    {
      title: "Sana",
      key: "created_at",
      width: 132,
      render: (_: unknown, log: FaceLog) => <span className="admin-tabular whitespace-nowrap">{formatDateTime(log.created_at)}</span>,
    },
    {
      title: "Foydalanuvchi",
      key: "user",
      width: 210,
      render: (_: unknown, log: FaceLog) => <UserCell log={log} />,
    },
    {
      title: "Maqsad",
      key: "purpose",
      width: 136,
      render: (_: unknown, log: FaceLog) => <PurposeTag purpose={log.purpose} />,
    },
    {
      title: "Natija",
      key: "result",
      width: 176,
      render: (_: unknown, log: FaceLog) => <ResultTag log={log} />,
    },
    {
      title: "O'xshashlik",
      key: "similarity",
      width: 96,
      align: "right" as const,
      render: (_: unknown, log: FaceLog) => <Similarity value={log.similarity_pct} />,
    },
    {
      title: "Kadrlar",
      key: "frames",
      width: 172,
      render: (_: unknown, log: FaceLog) => <FrameStrip log={log} />,
    },
  ];

  const renderCard = (log: FaceLog) => (
    <button
      type="button"
      onClick={() => setSelected(log)}
      className="block w-full cursor-pointer border-0 bg-transparent p-0 text-left"
      style={{ color: "inherit", font: "inherit" }}
    >
      <div className="flex items-start justify-between gap-3">
        <UserCell log={log} />
        <ResultTag log={log} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px]">
        <PurposeTag purpose={log.purpose} />
        <span className="admin-muted admin-tabular">{formatDateTime(log.created_at)}</span>
        <span className="ml-auto">
          <Similarity value={log.similarity_pct} />
        </span>
      </div>
      <div className="mt-3">
        <FrameStrip log={log} />
      </div>
    </button>
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        icon={<ScanOutlined />}
        title="Yuz tekshiruvi loglari"
        subtitle="TSMU ID orqali yuz tekshiruvining barcha urinishlari va kadrlari"
        actions={
          <Button size="large" icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching && !isLoading}>
            Yangilash
          </Button>
        }
      />

      {/* Filters */}
      <AdminCard padding="sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))_auto]">
          <Input
            allowClear
            size="large"
            prefix={<SearchOutlined className="admin-muted" />}
            placeholder="JSHSHIR, telefon yoki F.I.Sh."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Qidirish"
            className="sm:col-span-2 lg:col-span-1"
          />
          <Select<ResultFilter>
            size="large"
            value={result}
            onChange={(v) => {
              setResult(v);
              setPage(1);
            }}
            aria-label="Natija"
            options={[
              { value: "all", label: "Natija: hammasi" },
              { value: "passed", label: "Muvaffaqiyatli" },
              { value: "failed", label: "Aniqlanmadi" },
            ]}
          />
          <Select<Purpose>
            size="large"
            allowClear
            placeholder="Maqsad: hammasi"
            value={purpose}
            onChange={(v) => {
              setPurpose(v);
              setPage(1);
            }}
            aria-label="Maqsad"
            options={[
              { value: "REGISTRATION", label: PURPOSE_LABELS.REGISTRATION },
              { value: "PASSWORD_RESET", label: PURPOSE_LABELS.PASSWORD_RESET },
            ]}
          />
          <DatePicker
            size="large"
            placeholder="Sanadan"
            format="DD.MM.YYYY"
            value={dateFrom}
            onChange={(d) => {
              setDateFrom(d);
              setPage(1);
            }}
            inputReadOnly={isMobile}
            className="w-full"
          />
          <DatePicker
            size="large"
            placeholder="Sanagacha"
            format="DD.MM.YYYY"
            value={dateTo}
            onChange={(d) => {
              setDateTo(d);
              setPage(1);
            }}
            inputReadOnly={isMobile}
            className="w-full"
          />
          <Button
            size="large"
            icon={<CloseOutlined />}
            onClick={resetFilters}
            disabled={!hasFilters}
            className="sm:col-span-2 lg:col-span-1"
          >
            Tozalash
          </Button>
        </div>
      </AdminCard>

      <AdminCard
        padding="none"
        className="overflow-hidden"
        title="Urinishlar"
        extra={<span className="admin-muted admin-tabular text-[13px]">Jami: {total.toLocaleString()}</span>}
      >
        <ResponsiveTable<FaceLog>
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={isLoading || isFetching}
          renderCard={renderCard}
          emptyText="Loglar topilmadi"
          onRow={(log) => ({ onClick: () => setSelected(log), style: { cursor: "pointer" } })}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
            showTotal: (t: number, range: [number, number]) => `${range[0]}-${range[1]} dan ${t} ta`,
            className: "!px-4 sm:!px-6",
          }}
        />
      </AdminCard>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Urinish #${selected.id}` : ""}
        placement={isMobile ? "bottom" : "right"}
        width={isMobile ? undefined : 600}
        height={isMobile ? "92dvh" : undefined}
        styles={{
          content: isMobile ? { borderTopLeftRadius: 16, borderTopRightRadius: 16 } : undefined,
          body: { padding: isMobile ? 16 : 24 },
        }}
        destroyOnHidden
      >
        {selected ? <FaceLogDetail log={selected} /> : null}
      </Drawer>
    </div>
  );
}
