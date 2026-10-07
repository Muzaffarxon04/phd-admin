"use client";

import { Skeleton } from "antd";
import { useGet } from "@/lib/hooks";
import {
  FileTextOutlined,
  TeamOutlined,
  SolutionOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  AdminCard,
  DonutChart,
  HorizontalBarChart,
  PageHeader,
  StatCard,
  StatGrid,
} from "@/components/admin/ui";

export interface StatisticsResponse {
  total_applications?: number;
  total_submissions?: number;
  approved_count?: number;
  paid_count?: number;
  [key: string]: unknown;
}

type OverallV1Response = {
  message?: string;
  error?: unknown;
  status?: number;
  data?: {
    applications?: { total?: number; by_status?: Record<string, number> };
    submissions?: { total?: number; by_status?: Record<string, number> };
    applicants?: { total?: number; with_submission?: number };
    examiners?: { total?: number; active?: number };
  };
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Qoralama",
  PUBLISHED: "E'lon qilingan",
  CLOSED: "Yopilgan",
  ARCHIVED: "Arxivlangan",
  SUBMITTED: "Topshirilgan",
  UNDER_REVIEW: "Tekshirilmoqda",
  APPROVED: "Qabul qilingan",
  REJECTED: "Rad etilgan",
  WITHDRAWN: "Bekor qilingan",
};


const STAT_LABELS: Record<string, string> = {
  total: "Jami",
  total_count: "Jami",
  count: "Son",
  total_applications: "Jami arizalar",
  total_submissions: "Jami topshiriqlar",
  total_applicants: "Jami ariza beruvchilar",
  total_examiners: "Jami ekspertlar",
  approved_count: "Qabul qilingan",
  rejected_count: "Rad etilgan",
  pending_count: "Kutilmoqda",
  under_review_count: "Tekshirilmoqda",
  submitted_count: "Topshirilgan",
  paid_count: "To'langan",
  draft_count: "Qoralama",
  published_count: "E'lon qilingan",
  closed_count: "Yopilgan",
  archived_count: "Arxivlangan",
  withdrawn_count: "Bekor qilingan",
  active_count: "Faol",
  inactive_count: "Nofaol",
  by_status: "Holat bo'yicha",
  by_type: "Turi bo'yicha",
  status_breakdown: "Holat bo'yicha",
  application_breakdown: "Ariza bo'yicha",
  by_application: "Ariza bo'yicha ekspertlar",
  by_speciality: "Mutaxassislik bo'yicha topshiriqlar",
  monthly: "Oylik",
  by_month: "Oylar bo'yicha",
};

function getLabel(key: string): string {
  return (
    STAT_LABELS[key] ||
    STATUS_LABELS[key] ||
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function isBreakdownValue(value: unknown): value is Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const o = value as Record<string, unknown>;
  return Object.values(o).every((v) => typeof v === "number");
}

function breakdownToChartData(breakdown: Record<string, number>): { name: string; value: number }[] {
  return Object.entries(breakdown)
    .map(([key, val]) => ({ name: getLabel(key), value: Number(val) }))
    .filter((d) => d.value > 0);
}

/** by_application: massiv yoki { key: number } — har bir item bo'yicha chart */
type ByApplicationChartRow = { name: string; fullName: string; value: number };

function byApplicationToChartData(raw: unknown): ByApplicationChartRow[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        if (item == null || typeof item !== "object" || Array.isArray(item)) return null;
        const o = item as Record<string, unknown>;
        const num = (k: string): number | null => {
          const v = o[k];
          if (typeof v === "number" && Number.isFinite(v)) return v;
          if (typeof v === "string" && v.trim() !== "") {
            const n = Number(v);
            return Number.isFinite(n) ? n : null;
          }
          return null;
        };
        const valueKeys = ["count", "value", "examiner_count", "examiners_count", "total", "number"];
        let value: number | null = null;
        for (const k of valueKeys) {
          const n = num(k);
          if (n != null && n > 0) {
            value = n;
            break;
          }
        }
        if (value == null) return null;
        if (!Number.isFinite(value) || value <= 0) return null;
        const fullName =
          String(o.application_title ?? o.title ?? o.name ?? o.label ?? o.application_name ?? "").trim() ||
          String(o.application_id ?? o.id ?? `Ariza ${index + 1}`);
        const name = fullName.length > 36 ? `${fullName.slice(0, 33)}…` : fullName;
        return { name, fullName, value };
      })
      .filter((x): x is ByApplicationChartRow => x != null);
  }
  if (isBreakdownValue(raw)) {
    return Object.entries(raw as Record<string, number>)
      .map(([key, val]) => {
        const value = Number(val);
        if (!Number.isFinite(value) || value <= 0) return null;
        const fullName = key;
        const name = key.length > 36 ? `${key.slice(0, 33)}…` : key;
        return { name, fullName, value };
      })
      .filter((x): x is ByApplicationChartRow => x != null);
  }
  return [];
}

/** by_speciality: /statistics/submissions/ — massiv itemlari bo'yicha bar chart */
function bySpecialityToChartData(raw: unknown): ByApplicationChartRow[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        if (item == null || typeof item !== "object" || Array.isArray(item)) return null;
        const o = item as Record<string, unknown>;
        const num = (k: string): number | null => {
          const v = o[k];
          if (typeof v === "number" && Number.isFinite(v)) return v;
          if (typeof v === "string" && v.trim() !== "") {
            const n = Number(v);
            return Number.isFinite(n) ? n : null;
          }
          return null;
        };
        const valueKeys = [
          "count",
          "value",
          "submission_count",
          "submissions_count",
          "total",
          "number",
        ];
        let value: number | null = null;
        for (const k of valueKeys) {
          const n = num(k);
          if (n != null && n > 0) {
            value = n;
            break;
          }
        }
        if (value == null) return null;
        const rawName =
          String(
            o.speciality_name ??
              o.speciality ??
              o.specialty_name ??
              o.name ??
              o.title ??
              o.label ??
              ""
          ).trim() ||
          String(o.speciality_id ?? o.id ?? `Mutaxassislik ${index + 1}`);
        const parentName =
          (o as unknown as { parent?: { name?: string }; speciality_parent_name?: string }).parent?.name ||
          (o as unknown as { speciality_parent_name?: string }).speciality_parent_name ||
          "";
        const specialityName = parentName ? `${rawName} (${parentName})` : rawName;
        const specialityCode = String(o.speciality_code ?? o.code ?? "").trim();
        const fullName = specialityCode ? `${specialityName} (${specialityCode})` : specialityName;
        const name = fullName.length > 36 ? `${fullName.slice(0, 33)}…` : fullName;
        return { name, fullName, value };
      })
      .filter((x): x is ByApplicationChartRow => x != null);
  }
  if (isBreakdownValue(raw)) {
    return byApplicationToChartData(raw);
  }
  return [];
}

export default function AdminPanelPage() {

  const { data: statisticsData, isLoading: statsLoading } = useGet<
    StatisticsResponse | { data: StatisticsResponse } | OverallV1Response
  >("/statistics/");
  const raw = statisticsData as unknown as
    | { data?: StatisticsResponse }
    | StatisticsResponse
    | OverallV1Response
    | undefined;
  const overall: OverallV1Response["data"] | undefined =
    raw &&
    typeof raw === "object" &&
    "message" in raw &&
    "data" in raw &&
    (raw as OverallV1Response).data
      ? (raw as OverallV1Response).data
      : undefined;

  const stats: StatisticsResponse | undefined =
    overall
      ? (overall as unknown as StatisticsResponse)
      : raw && typeof raw === "object" && "data" in raw && !("message" in raw)
        ? ((raw as { data?: StatisticsResponse }).data as StatisticsResponse | undefined)
        : (raw as StatisticsResponse | undefined);

  const totalApplications = Number(
    (overall?.applications?.total ?? (stats as unknown as { total_applications?: number } | undefined)?.total_applications) ?? 0
  );
  const approvedCount = Number(
    (overall?.submissions?.by_status?.APPROVED ??
      (stats as unknown as { approved_count?: number } | undefined)?.approved_count) ?? 0
  );
  const paidCount = Number((stats as unknown as { paid_count?: number } | undefined)?.paid_count ?? 0);
  void totalApplications;
  void approvedCount;
  void paidCount;

  const submissionsByStatus =
    (overall?.submissions?.by_status && isBreakdownValue(overall.submissions.by_status)
      ? (overall.submissions.by_status as Record<string, number>)
      : null) ?? null;

  const { data: applicantsData, isLoading: applicantsLoading } = useGet<Record<string, unknown> | { data: Record<string, unknown> }>("/statistics/applicants/");
  const { data: applicationsStatsData, isLoading: applicationsStatsLoading } = useGet<Record<string, unknown> | { data: Record<string, unknown> }>("/statistics/applications/");
  const { data: examinersData, isLoading: examinersLoading } = useGet<Record<string, unknown> | { data: Record<string, unknown> }>("/statistics/examiners/");
  const { data: submissionsStatsData, isLoading: submissionsStatsLoading } = useGet<Record<string, unknown> | { data: Record<string, unknown> }>("/statistics/submissions/");

  const unwrap = (raw: Record<string, unknown> | { data: Record<string, unknown> } | undefined): Record<string, unknown> | undefined => {
    if (!raw || typeof raw !== "object") return undefined;
    if ("data" in raw && raw.data && typeof raw.data === "object") return raw.data as Record<string, unknown>;
    return raw as Record<string, unknown>;
  };

  const applicantsStats = unwrap(applicantsData as Record<string, unknown> | { data: Record<string, unknown> } | undefined);
  const applicationsStats = unwrap(applicationsStatsData as Record<string, unknown> | { data: Record<string, unknown> } | undefined);
  const examinersStats = unwrap(examinersData as Record<string, unknown> | { data: Record<string, unknown> } | undefined);
  const submissionsStats = unwrap(submissionsStatsData as Record<string, unknown> | { data: Record<string, unknown> } | undefined);

  function splitScalarsAndBreakdowns(data: Record<string, unknown> | undefined): {
    scalars: [string, string | number][];
    breakdowns: { key: string; data: Record<string, number> }[];
  } {
    if (!data || typeof data !== "object") return { scalars: [], breakdowns: [] };
    const scalars: [string, string | number][] = [];
    const breakdowns: { key: string; data: Record<string, number> }[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (isBreakdownValue(value)) {
        breakdowns.push({ key, data: value as Record<string, number> });
      } else if (value !== null && value !== undefined && typeof value !== "object") {
        const display = Array.isArray(value) ? value.length : value;
        scalars.push([key, typeof display === "number" ? display : String(display)]);
      } else if (Array.isArray(value)) {
        scalars.push([key, value.length]);
      }
    }
    return { scalars, breakdowns };
  }

  const statsSections = [
    { title: "Ariza beruvchilar", data: applicantsStats, loading: applicantsLoading, endpoint: "/statistics/applicants/", icon: <TeamOutlined /> },
    { title: "Arizalar", data: applicationsStats, loading: applicationsStatsLoading, endpoint: "/statistics/applications/", icon: <FileTextOutlined /> },
    { title: "Ekspertlar", data: examinersStats, loading: examinersLoading, endpoint: "/statistics/examiners/", icon: <SolutionOutlined /> },
    { title: "Topshiriqlar", data: submissionsStats, loading: submissionsStatsLoading, endpoint: "/statistics/submissions/", icon: <SendOutlined /> },
  ] as const;

  const kpis = [
    { label: "Arizalar", value: overall?.applications?.total, icon: <FileTextOutlined />, color: "#7367f0" },
    { label: "Topshiriqlar", value: overall?.submissions?.total, icon: <SendOutlined />, color: "#28c76f" },
    { label: "Ariza beruvchilar", value: overall?.applicants?.total, icon: <TeamOutlined />, color: "#ff9f43" },
    { label: "Ekspertlar", value: overall?.examiners?.total, icon: <SolutionOutlined />, color: "#00cfe8" },
  ].filter((k) => statsLoading || typeof k.value === "number");

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Boshqaruv paneli" />

      {/* KPI row (from /statistics/ overall totals) */}
      {kpis.length > 0 && (
        <StatGrid columns={4}>
          {kpis.map((k) => (
            <StatCard
              key={k.label}
              label={k.label}
              value={Number(k.value ?? 0)}
              icon={k.icon}
              color={k.color}
              loading={statsLoading}
            />
          ))}
        </StatGrid>
      )}

      {/* Submissions by_status — alohida chart (markazida total) */}
      {!statsLoading && submissionsByStatus && (() => {
        const chartData = breakdownToChartData(submissionsByStatus);
        const pieTotal = Number(overall?.submissions?.total ?? chartData.reduce((s, d) => s + d.value, 0));
        return (
          <AdminCard
            title="Topshiriqlar holati"
            extra={
              <span className="admin-muted text-[13px] font-medium">
                Jami: {Number(overall?.submissions?.total ?? Object.values(submissionsByStatus).reduce((s, v) => s + v, 0)).toLocaleString()}
              </span>
            }
          >
            {chartData.length > 0 ? (
              <DonutChart data={chartData} total={pieTotal} size="lg" legend="side" showSliceLabels />
            ) : null}
          </AdminCard>
        );
      })()}

      {/* Asosiy statistika qo'shimcha (by_status, boshqa breakdown va scalar) */}
      {!statsLoading && stats && (() => {
        const { scalars: mainScalars, breakdowns: mainBreakdowns } = splitScalarsAndBreakdowns(stats as Record<string, unknown>);
        const knownKeys = ["total_applications", "total_submissions", "approved_count", "paid_count"];
        const extraScalars = mainScalars.filter(([k]) => !knownKeys.includes(k));
        if (extraScalars.length === 0 && mainBreakdowns.length === 0) return null;
        return (
          <section className="space-y-3 sm:space-y-4">
            <SectionTitle>Umumiy statistika (batafsil)</SectionTitle>
            {extraScalars.length > 0 && (
              <StatGrid columns={4}>
                {extraScalars.map(([key, value]) => (
                  <StatCard key={key} label={getLabel(key)} value={value} />
                ))}
              </StatGrid>
            )}
            {mainBreakdowns.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                {mainBreakdowns.map(({ key, data }) => {
                  const chartData = breakdownToChartData(data);
                  if (chartData.length === 0) return null;
                  return (
                    <AdminCard key={key} title={getLabel(key)}>
                      <DonutChart data={chartData} />
                    </AdminCard>
                  );
                })}
              </div>
            )}
          </section>
        );
      })()}

      {/* Statistics: applicants, applications, examiners, submissions — ketma ket, chartlar bilan */}
      {statsSections.map((section) => {
        const { scalars, breakdowns } = splitScalarsAndBreakdowns(section.data);
        const isExaminers = section.endpoint === "/statistics/examiners/";
        const isSubmissions = section.endpoint === "/statistics/submissions/";
        const byApplicationChartData =
          isExaminers && section.data
            ? byApplicationToChartData(section.data.by_application)
            : [];
        const bySpecialityChartData =
          isSubmissions && section.data
            ? bySpecialityToChartData(section.data.by_speciality)
            : [];
        const breakdownsWithoutByApplication =
          isExaminers ? breakdowns.filter((b) => b.key !== "by_application") : breakdowns;
        const hasContent =
          scalars.length > 0 ||
          breakdownsWithoutByApplication.length > 0 ||
          byApplicationChartData.length > 0 ||
          bySpecialityChartData.length > 0;
        return (
          <section key={section.endpoint} className="space-y-3 sm:space-y-4">
            <SectionTitle icon={section.icon}>{section.title} statistikasi</SectionTitle>
            {section.loading ? (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                {[0, 1].map((i) => (
                  <AdminCard key={i}>
                    <Skeleton active paragraph={{ rows: 5 }} />
                  </AdminCard>
                ))}
              </div>
            ) : !hasContent ? (
              <AdminCard>
                <div className="admin-muted py-2 text-center text-[13px]">Ma&apos;lumot yo&apos;q</div>
              </AdminCard>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {isExaminers && byApplicationChartData.length > 0 && (
                  <AdminCard title={getLabel("by_application")}>
                    <HorizontalBarChart data={byApplicationChartData} color="#7367f0" valueLabel="Ekspertlar soni" />
                  </AdminCard>
                )}
                {isSubmissions && bySpecialityChartData.length > 0 && (
                  <AdminCard title={getLabel("by_speciality")}>
                    <HorizontalBarChart data={bySpecialityChartData} color="#52c41a" valueLabel="Topshiriqlar soni" />
                  </AdminCard>
                )}
                {breakdownsWithoutByApplication.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                    {breakdownsWithoutByApplication.map(({ key, data }) => {
                      const chartData = breakdownToChartData(data);
                      if (chartData.length === 0) return null;
                      return (
                        <AdminCard key={key} title={getLabel(key)}>
                          <DonutChart data={chartData} showSliceLabels />
                        </AdminCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function SectionTitle({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      {icon ? <span className="admin-card__icon">{icon}</span> : null}
      <h2 className="admin-heading m-0 text-base font-semibold sm:text-[17px]">{children}</h2>
    </div>
  );
}
