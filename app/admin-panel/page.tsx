"use client";

import { Button, Typography, Tag } from "antd";
const { Title } = Typography;
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  BookOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import type { ApplicationListResponse, ApplicationSubmissionListResponse } from "@/lib/api";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDate } from "@/lib/utils";
import Link from "next/link";



export default function AdminPanelPage() {
  const { theme } = useThemeStore();
  const { data: applications, isLoading: isLoadingApps } = useGet<ApplicationListResponse>("/admin/application/");
  const { data: submissions, isLoading: isLoadingSubs } = useGet<ApplicationSubmissionListResponse>("/admin/application/submissions/");
  console.log(applications, submissions);
  const totalApplications = applications?.results?.length || 0;
  const totalSubmissions = submissions?.count || 0;
  const submissionsList = submissions?.results || [];

  // Arizalar holati boyicha statistika
  const approvedCount = submissionsList.filter((s) => s.status === "approved").length;
  const rejectedCount = submissionsList.filter((s) => s.status === "rejected").length;
  const pendingCount = submissionsList.filter((s) => s.status === "under_review" || s.status === "submitted").length;
  const draftCount = submissionsList.filter((s) => s.status === "draft").length;

  // Tolovlar boyicha statistika
  const paidCount = 0;
  const pendingPaymentCount = 0;
  const failedPaymentCount = 0;

  // Foiz ozgarishlar
  const calculatePercentage = (current: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  };

  // Oylik statistika
  const currentMonth = new Date().getMonth();
  const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonth - 5 + i + 12) % 12;
    const monthSubmissions = submissionsList.filter((s) => {
      if (!s.created_at) return false;
      const date = new Date(s.created_at);
      return date.getMonth() === monthIndex;
    });
    return {
      month: months[monthIndex],
      arizalar: monthSubmissions.length,
      qabul: monthSubmissions.filter((s) => s.status === "approved").length,
    };
  });

  // Oxirgi arizalar (5 ta)
  const recentSubmissions = [...submissionsList]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // Chart data
  const statusData = [
    { name: "Qabul qilingan", value: approvedCount, color: "#52c41a" },
    { name: "Rad etilgan", value: rejectedCount, color: "#ff4d4f" },
    { name: "Tekshirilmoqda", value: pendingCount, color: "#faad14" },
    { name: "Qoralama", value: draftCount, color: "#8b8b8b" },
  ].filter((item) => item.value > 0);

  const approvalRate = totalSubmissions > 0 ? calculatePercentage(approvedCount, totalSubmissions) : 0;




  if (isLoadingApps || isLoadingSubs) {
    return <DashboardSkeleton />;
  }



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
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Jami Arizalar",
            value: totalApplications.toLocaleString(),
            icon: <FileTextOutlined style={{ fontSize: "24px" }} />,
            color: "blue",
            change: totalApplications > 0 ? `+${Math.round((totalApplications / 10) * 100) / 10}%` : "0%",
            bg: "bg-blue-500/10",
            textColor: "text-blue-500"
          },
          {
            label: "Topshirilganlar",
            value: totalSubmissions.toLocaleString(),
            icon: <UserOutlined style={{ fontSize: "24px" }} />,
            color: "purple",
            change: totalSubmissions > 0 ? `+${Math.round((totalSubmissions / 20) * 100) / 10}%` : "0%",
            bg: "bg-purple-500/10",
            textColor: "text-purple-500"
          },
          {
            label: "Qabul qilingan",
            value: approvedCount,
            icon: <CheckCircleOutlined style={{ fontSize: "24px" }} />,
            color: "green",
            change: `${approvalRate}% qabul`,
            bg: "bg-green-500/10",
            textColor: "text-green-500"
          },
          {
            label: "To&apos;langan",
            value: paidCount,
            icon: <DollarOutlined style={{ fontSize: "24px" }} />,
            color: "orange",
            change: `${paymentRate}% to&apos;lov`,
            bg: "bg-orange-500/10",
            textColor: "text-orange-500"
          }
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
      </div> */}

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
