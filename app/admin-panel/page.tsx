"use client";

import { Typography, Spin } from "antd";
const { Title } = Typography;
import { useThemeStore } from "@/lib/stores/themeStore";
import { useGet } from "@/lib/hooks";
import {
  FileTextOutlined,
  UserOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  TeamOutlined,
  SolutionOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";

export interface StatisticsResponse {
  total_applications?: number;
  total_submissions?: number;
  approved_count?: number;
  paid_count?: number;
  [key: string]: unknown;
}

const CHART_COLORS = ["#7367f0", "#52c41a", "#ff9f43", "#ea5455", "#00cfe8", "#28c76f", "#8b5cf6", "#06b6d4"];

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
  monthly: "Oylik",
  by_month: "Oylar bo'yicha",
};

function getLabel(key: string): string {
  return STAT_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function calculatePercentage(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
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

export default function AdminPanelPage() {
  const { theme } = useThemeStore();

  const { data: statisticsData, isLoading: statsLoading } = useGet<StatisticsResponse | { data: StatisticsResponse }>("/statistics/");
  const raw = statisticsData as { data?: StatisticsResponse } | StatisticsResponse | undefined;
  const stats: StatisticsResponse | undefined = (raw && typeof raw === "object" && "data" in raw && raw.data
    ? raw.data
    : raw) as StatisticsResponse | undefined;
  const totalApplications = Number(stats?.total_applications ?? 0);
  const totalSubmissions = Number(stats?.total_submissions ?? 0);
  const approvedCount = Number(stats?.approved_count ?? 0);
  const paidCount = Number(stats?.paid_count ?? 0);
  const approvalRate = totalSubmissions > 0 ? calculatePercentage(approvedCount, totalSubmissions) : 0;
  const paymentRate = totalSubmissions > 0 ? calculatePercentage(paidCount, totalSubmissions) : 0;

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

  const cardStyle = {
    background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
    border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
    boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
  };
  const textColor = theme === "dark" ? "#ffffff" : "#484650";
  const tooltipStyle = {
    borderRadius: "12px",
    border: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    background: theme === "dark" ? "rgb(30, 38, 60)" : "#ffffff",
  };



  return (
    <div className="space-y-8" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={4} className="!mb-1" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
            Boshqaruv paneli
          </Title>
          {/* <div className="text-gray-400 text-sm font-medium">Tizimning umumiy holati va statistikasi</div> */}
        </div>
        <div className="flex gap-3">
          {/* <Button
            icon={<ExportOutlined />}
            className="rounded-xl border-0 shadow-sm transition-all duration-300"
            style={{
              background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#484650",
              border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
            }}
          >
            Hisobot yuklash
          </Button> */}
        </div>
                </div>

      {/* Key Metrics Grid */}
      {statsLoading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Jami Arizalar",
              value: totalApplications.toLocaleString(),
              icon: <FileTextOutlined style={{ fontSize: "24px" }} />,
              change: totalApplications > 0 ? `+${Math.round((totalApplications / 10) * 100) / 10}%` : "0%",
              bg: "bg-blue-500/10",
              textColor: "text-blue-500",
            },
            {
              label: "Topshirilganlar",
              value: totalSubmissions.toLocaleString(),
              icon: <UserOutlined style={{ fontSize: "24px" }} />,
              change: totalSubmissions > 0 ? `+${Math.round((totalSubmissions / 20) * 100) / 10}%` : "0%",
              bg: "bg-purple-500/10",
              textColor: "text-purple-500",
            },
            {
              label: "Qabul qilingan",
              value: String(approvedCount),
              icon: <CheckCircleOutlined style={{ fontSize: "24px" }} />,
              change: `${approvalRate}% qabul`,
              bg: "bg-green-500/10",
              textColor: "text-green-500",
            },
            {
              label: "To'langan",
              value: String(paidCount),
              icon: <DollarOutlined style={{ fontSize: "24px" }} />,
              change: `${paymentRate}% to'lov`,
              bg: "bg-orange-500/10",
              textColor: "text-orange-500",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{
                background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm font-medium mb-1">{stat.label}</div>
                  <div className="text-2xl font-bold" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
                    {stat.value}
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <span className={`text-xs font-bold ${stat.textColor}`}>{stat.change}</span>
                    <ArrowUpOutlined className={`text-[10px] ${stat.textColor}`} />
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.textColor}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Asosiy statistika qo'shimcha (by_status, boshqa breakdown va scalar) */}
      {!statsLoading && stats && (() => {
        const { scalars: mainScalars, breakdowns: mainBreakdowns } = splitScalarsAndBreakdowns(stats as Record<string, unknown>);
        const knownKeys = ["total_applications", "total_submissions", "approved_count", "paid_count"];
        const extraScalars = mainScalars.filter(([k]) => !knownKeys.includes(k));
        if (extraScalars.length === 0 && mainBreakdowns.length === 0) return null;
        return (
          <div className="space-y-4">
            <Title level={5} className="!mb-2" style={{ color: textColor }}>
              Umumiy statistika (batafsil)
            </Title>
            <div className="space-y-6">
              {extraScalars.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {extraScalars.map(([key, value]) => (
                    <div key={key} className="rounded-xl p-4" style={cardStyle}>
                      <div className="text-gray-400 text-xs font-medium mb-1">{getLabel(key)}</div>
                      <div className="text-lg font-bold" style={{ color: textColor }}>{typeof value === "number" ? value.toLocaleString() : value}</div>
                    </div>
                  ))}
                </div>
              )}
              {mainBreakdowns.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mainBreakdowns.map(({ key, data }) => {
                    const chartData = breakdownToChartData(data);
                    if (chartData.length === 0) return null;
                    return (
                      <div key={key} className="rounded-xl p-6" style={cardStyle}>
                        <div className="text-gray-400 text-sm font-medium mb-4">{getLabel(key)}</div>
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name">
                              {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />)}
                            </Pie>
                            <RechartsTooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [(v ?? 0).toLocaleString(), "Son"]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
                          {chartData.map((item, i) => (
                            <div key={item.name} className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                              <span className="text-sm text-gray-400">{item.name}:</span>
                              <span className="text-sm font-semibold" style={{ color: textColor }}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Statistics: applicants, applications, examiners, submissions — ketma ket, chartlar bilan */}
      {statsSections.map((section) => {
        const { scalars, breakdowns } = splitScalarsAndBreakdowns(section.data);
        const hasContent = scalars.length > 0 || breakdowns.length > 0;
        const isExaminers = section.endpoint === "/statistics/examiners/";
        const examinersChartFromScalars =
          isExaminers &&
          scalars
            .filter(([key, v]) => typeof v === "number" && Number(v) > 0 && getLabel(key) !== "Jami")
            .map(([key, value]) => ({ name: getLabel(key), value: Number(value) }));
        const showExaminersPie = isExaminers && examinersChartFromScalars && examinersChartFromScalars.length > 0;
        return (
          <div key={section.endpoint} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[#7367f0]" style={{ fontSize: "20px" }}>{section.icon}</span>
              <Title level={5} className="!mb-0" style={{ color: textColor }}>
                {section.title} statistikasi
              </Title>
            </div>
            {section.loading ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : !hasContent ? (
              <div className="rounded-xl p-6 text-center text-gray-400 text-sm" style={cardStyle}>
                Ma&apos;lumot yo&apos;q
              </div>
            ) : (
              <div className="space-y-6">
                {scalars.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {scalars.map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-xl p-4 transition-all duration-300 hover:shadow-md"
                        style={{ ...cardStyle, border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)" }}
                      >
                        <div className="text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider">
                          {getLabel(key)}
                        </div>
                        <div className="text-xl font-bold" style={{ color: textColor }}>
                          {typeof value === "number" ? value.toLocaleString() : value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showExaminersPie && examinersChartFromScalars && (
                  <div className="rounded-xl p-6 transition-all duration-300" style={cardStyle}>
                    <div className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">
                      Ekspertlar taqsimoti
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={examinersChartFromScalars}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        >
                          {examinersChartFromScalars.map((_, index) => (
                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={tooltipStyle}
                          formatter={(value: number | undefined) => [(value ?? 0).toLocaleString(), "Son"]}
                          labelFormatter={(label) => label}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
                      {examinersChartFromScalars.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="text-sm text-gray-400">{item.name}:</span>
                          <span className="text-sm font-semibold" style={{ color: textColor }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {breakdowns.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {breakdowns.map(({ key, data }) => {
                      const chartData = breakdownToChartData(data);
                      if (chartData.length === 0) return null;
                      return (
                        <div
                          key={key}
                          className="rounded-xl p-6 transition-all duration-300"
                          style={cardStyle}
                        >
                          <div className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">
                            {getLabel(key)}
                          </div>
                          <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                              >
                                {chartData.map((_, index) => (
                                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                                ))}
                              </Pie>
                              <RechartsTooltip
                                contentStyle={tooltipStyle}
                                formatter={(value: number | undefined) => [(value ?? 0).toLocaleString(), "Son"]}
                                labelFormatter={(label) => label}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
                            {chartData.map((item, index) => (
                              <div key={item.name} className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                                />
                                <span className="text-sm text-gray-400">{item.name}:</span>
                                <span className="text-sm font-semibold" style={{ color: textColor }}>{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Breakdown Chart */}
        {/* <div
          className="rounded-xl p-6 transition-all duration-300"
          style={{
            background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
            border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
            boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div className="flex justify-between items-center mb-8">
            <Title level={5} className="!m-0" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
              Arizalar holati
            </Title>
            <div className="text-gray-400 text-sm">Jami: {totalSubmissions}</div>
              </div>
          <div className="relative flex flex-col items-center">
            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    background: theme === "dark" ? "rgb(30, 38, 60)" : "#ffffff"
                  }}
                />
                </PieChart>
              </ResponsiveContainer>
            <div className="absolute top-[130px] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-3xl font-bold" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
                {calculatePercentage(approvedCount, totalSubmissions)}%
              </div>
              <div className="text-xs text-gray-400 font-medium">Qabul stavkasi</div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-6 w-full px-8">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-sm font-medium text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* Monthly Activity Chart */}
        {/* <div
          className="rounded-xl p-6 transition-all duration-300"
          style={{
            background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
            border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
            boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div className="flex justify-between items-center mb-8">
            <Title level={5} className="!m-0" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
              Oylik faollik
            </Title>
                <Select
              defaultValue="6"
              size="small"
              className="w-32 premium-select"
                  options={[
                { value: "6", label: "Oxirgi 6 oy" },
                { value: "12", label: "Oxirgi 12 oy" },
                  ]}
              variant="borderless"
                />
              </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8b8b8b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8b8b8b' }} />
                <Tooltip 
                cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
                  contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  background: theme === "dark" ? "rgb(30, 38, 60)" : "#ffffff"
                }}
              />
              <Bar dataKey="arizalar" fill="#7367f0" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="qabul" fill="#52c41a" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          <div className="flex gap-6 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-1.5 rounded-full bg-[#7367f0]" />
              <span className="text-xs font-medium text-gray-400">Jami arizalar</span>
                      </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1.5 rounded-full bg-[#52c41a]" />
              <span className="text-xs font-medium text-gray-400">Qabul qilingan</span>
            </div>
                </div>
        </div> */}
              </div>

      {/* Recent Submissions Bottom Section */}
      {/* <div
        className="rounded-xl overflow-hidden transition-all duration-300"
        style={{
          background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
          border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
          boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}>
          <div className="flex justify-between items-center">
            <Title level={5} className="!m-0" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
              So&apos;nggi arizalar
            </Title>
            <Link href="/admin-panel/submissions">
              <Button type="link" className="text-[#7367f0] p-0 h-auto font-bold text-sm">
                Barchasini ko&apos;rish
              </Button>
            </Link>
              </div>
            </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: theme === "dark" ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)" }}>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Holat</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Sana</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent">
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((submission, index) => (
                  <tr key={index} className="hover:bg-[#7367f0]/5 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm" style={{ color: "#7367f0" }}>
                        #{submission.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${submission.status === "approved" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                          submission.status === "rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            submission.status === "under_review" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                              "bg-purple-500/10 text-purple-500 border-purple-500/20"
                          }`}
                      >
                        {submission.status === "approved" ? "Qabul" :
                          submission.status === "rejected" ? "Rad" :
                            submission.status === "under_review" ? "Tekshirilmoqda" :
                              submission.status === "submitted" ? "Topshirilgan" : submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-400">
                        {submission.created_at ? formatDate(submission.created_at) : "-"}
                    </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin-panel/submissions/${submission.id}`}>
                        <Button
                          size="small"
                          icon={<ExportOutlined style={{ fontSize: "14px" }} />}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#7367f0]/10 text-[#7367f0] border-0 hover:bg-[#7367f0] hover:text-white transition-all duration-300 ml-auto"
                        />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                  Hozircha arizalar mavjud emas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
            </div>
      </div> */}
    </div>
  );
}
