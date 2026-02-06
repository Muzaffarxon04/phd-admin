"use client";

import { useState } from "react";
import {
  Row,
  Col,
  Typography,
  Progress,
  Table,
  Select,
  DatePicker,
  Button,
  Space,
  Tabs,
  List,
  Avatar,
} from "antd";
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
import { useThemeStore } from "@/lib/stores/themeStore";
import {
  BarChartOutlined,
  // PieChartOutlined,
  LineChartOutlined,
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const { Option } = Select;

interface ReportData {
  total_applications: number;
  total_submissions: number;
  total_users: number;
  total_payments: number;
  average_score: number;
  pass_rate: number;
  applications_by_status: Record<string, number>;
  submissions_by_month: Array<{ month: string; count: number }>;
  payments_by_status: Record<string, number>;
  top_specialities: Array<{ name: string; count: number }>;
}

export default function ReportsPage() {
  // Mock data for demonstration

  // Mock data for demonstration
  const reportData: ReportData = {
    total_applications: 12,
    total_submissions: 245,
    total_users: 180,
    total_payments: 18500000,
    average_score: 78.5,
    pass_rate: 68.5,
    applications_by_status: {
      PUBLISHED: 8,
      DRAFT: 3,
      CLOSED: 1,
    },
    submissions_by_month: [
      { month: "Yanvar", count: 45 },
      { month: "Fevral", count: 52 },
      { month: "Mart", count: 38 },
      { month: "Aprel", count: 61 },
      { month: "May", count: 49 },
    ],
    payments_by_status: {
      PAID: 156,
      PENDING: 45,
      FAILED: 12,
    },
    top_specialities: [
      { name: "Kompyuter fanlari", count: 45 },
      { name: "Matematika", count: 38 },
      { name: "Fizika", count: 32 },
      { name: "Kimyo", count: 28 },
      { name: "Biologiya", count: 25 },
    ],
  };

  const handleExportReport = (format: string) => {
    // Mock export functionality
    console.log(`Exporting report as ${format}`);
    // Here you would call the actual export API
  };



  const [, _setDateRange] = useState<unknown>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const { theme } = useThemeStore();

  return (
    <div className="space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title level={4} className="!mb-1" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
            Hisobotlar va Statistika
          </Title>
          <div className="text-gray-400 text-sm font-medium">Tizim faoliyati bo&apos;yicha to&apos;liq ma&apos;lumotlar</div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            className="premium-select w-[140px]"
          >
            <Option value="week">Haftalik</Option>
            <Option value="month">Oylik</Option>
            <Option value="quarter">Choraklik</Option>
            <Option value="year">Yillik</Option>
          </Select>
          <RangePicker
            onChange={(val) => _setDateRange(val)}
            placeholder={["Boshlanish", "Tugash"]}
            className="premium-datepicker"
          />
          <div className="flex gap-2">
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExportReport("pdf")}
              className="h-[42px] px-4 rounded-xl border-0 shadow-md font-bold text-white"
              style={{ background: "linear-gradient(118deg, #ea5455, rgba(234, 84, 85, 0.7))" }}
            >
              PDF
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExportReport("excel")}
              className="h-[42px] px-4 rounded-xl border-0 shadow-md font-bold text-white"
              style={{ background: "linear-gradient(118deg, #28c76f, rgba(40, 199, 111, 0.7))" }}
            >
              Excel
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        defaultActiveKey="overview"
        className="premium-tabs"
        items={[
          {
            key: "overview",
            label: (
              <Space>
                <BarChartOutlined />
                Umumiy
              </Space>
            ),
            children: (
              <div className="space-y-6 pt-2">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "Jami Arizalar", value: reportData.total_applications, icon: <BookOutlined />, color: "#7367f0" },
                    { title: "Jami Arizachilar", value: reportData.total_submissions, icon: <UserOutlined />, color: "#28c76f" },
                    { title: "Jami To&apos;lovlar", value: reportData.total_payments.toLocaleString(), icon: <DollarOutlined />, color: "#ff9f43", suffix: " UZS" },
                    { title: "O&apos;rtacha Ball", value: reportData.average_score, icon: <TrophyOutlined />, color: "#ea5455", suffix: "/100" },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl p-6 transition-all duration-300"
                      style={{
                        background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                        border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                        boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                          style={{ background: `${stat.color}15`, color: stat.color }}
                        >
                          {stat.icon}
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">{stat.title}</div>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-xl font-bold mt-1 ${theme === "dark" ? "text-white" : "text-[#484650]"}`}>{stat.value}</span>
                            {stat.suffix && <span className="text-xs text-gray-400 font-bold">{stat.suffix}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Row gutter={24}>
                  <Col xs={24} lg={12}>
                    <div
                      className="rounded-xl p-6 h-full transition-all duration-300"
                      style={{
                        background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                        border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                      }}
                    >
                      <Title level={5} className="!mb-6" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Ariza Statuslari</Title>
                      <div className="space-y-6">
                        {Object.entries(reportData.applications_by_status).map(([status, count]) => (
                          <div key={status} className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full`} style={{ background: status === 'PUBLISHED' ? '#28c76f' : status === 'DRAFT' ? '#ff9f43' : '#ea5455' }} />
                                <span className="font-bold" style={{ color: theme === "dark" ? "#e2e8f0" : "#484650" }}>{status}</span>
                              </div>
                              <span className="text-gray-400">{count} ta ({Math.round((count / reportData.total_applications) * 100)}%)</span>
                            </div>
                            <Progress
                              percent={(count / reportData.total_applications) * 100}
                              size="small"
                              showInfo={false}
                              strokeColor={status === 'PUBLISHED' ? '#28c76f' : status === 'DRAFT' ? '#ff9f43' : '#ea5455'}
                              trailColor={theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} lg={12}>
                    <div
                      className="rounded-xl p-6 h-full transition-all duration-300 flex flex-col items-center justify-center text-center"
                      style={{
                        background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                        border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                      }}
                    >
                      <Title level={5} className="!mb-2" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>O&apos;tish Foizi</Title>
                      <div className="text-xs text-gray-400 mb-6">Jami abituriyentlarning muvaffaqiyat ko&apos;rsatkichi</div>

                      <Progress
                        type="circle"
                        percent={reportData.pass_rate}
                        strokeWidth={10}
                        size={180}
                        strokeColor={{
                          '0%': '#28c76f',
                          '100%': '#1dd1a1',
                        }}
                        trailColor={theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}
                        format={(percent) => (
                          <div className="flex flex-col">
                            <span className="text-3xl font-bold" style={{ color: '#28c76f' }}>{percent}%</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Muvaffaqiyat</span>
                          </div>
                        )}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            )
          },
          {
            key: "submissions",
            label: (
              <Space>
                <UserOutlined />
                Arizachilar
              </Space>
            ),
            children: (
              <div className="space-y-6 pt-2">
                <div
                  className="rounded-xl p-6 transition-all duration-300"
                  style={{
                    background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                    border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                  }}
                >
                  <Title level={5} className="!mb-6" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Oylik Arizalar Statistikasi</Title>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {reportData.submissions_by_month.map((item) => (
                      <div
                        key={item.month}
                        className="p-4 rounded-xl text-center space-y-1 transition-all hover:bg-[#7367f0]/5"
                        style={{ background: theme === "dark" ? "rgba(255, 255, 255, 0.02)" : "#f8f9fa" }}
                      >
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{item.month}</div>
                        <div className={`text-xl font-bold ${theme === "dark" ? "text-white" : "#484650"}`}>{item.count}</div>
                        <div className="text-[10px] text-green-500 font-bold flex items-center justify-center gap-1">
                          <CheckCircleOutlined style={{ fontSize: '10px' }} /> +{Math.round(item.count * 0.1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-xl p-6 transition-all duration-300"
                  style={{
                    background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                    border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                  }}
                >
                  <Title level={5} className="!mb-6" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Top Mutaxassisliklar</Title>
                  <List
                    dataSource={reportData.top_specialities}
                    renderItem={(item, index: number) => (
                      <List.Item className="border-b last:border-0" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              className="rounded-xl font-bold"
                              style={{ backgroundColor: index === 0 ? "#ff9f4315" : "#7367f015", color: index === 0 ? "#ff9f43" : "#7367f0" }}
                            >
                              {index + 1}
                            </Avatar>
                          }
                          title={<span className="font-bold text-sm" style={{ color: theme === "dark" ? "#e2e8f0" : "#484650" }}>{item.name}</span>}
                          description={<span className="text-xs text-gray-500 font-medium">{item.count} ta ariza</span>}
                        />
                        <div className="min-w-[150px] md:min-w-[300px]">
                          <Progress
                            percent={(item.count / Math.max(...reportData.top_specialities.map(s => s.count))) * 100}
                            size="small"
                            strokeColor={index === 0 ? "#ff9f43" : "#7367f0"}
                            showInfo={false}
                            trailColor={theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}
                          />
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            )
          },
          {
            key: "payments",
            label: (
              <Space>
                <DollarOutlined />
                To&apos;lovlar
              </Space>
            ),
            children: (
              <div className="space-y-6 pt-2">
                <Row gutter={24}>
                  <Col xs={24} lg={12}>
                    <div
                      className="rounded-xl p-6 h-full transition-all duration-300"
                      style={{
                        background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                        border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                      }}
                    >
                      <Title level={5} className="!mb-6" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>To&apos;lov Statuslari</Title>
                      <div className="space-y-6">
                        {[
                          { label: "To&apos;langan", count: reportData.payments_by_status.PAID, icon: <CheckCircleOutlined />, color: "#28c76f" },
                          { label: "Kutilmoqda", count: reportData.payments_by_status.PENDING, icon: <ClockCircleOutlined />, color: "#ff9f43" },
                          { label: "Xatolik", count: reportData.payments_by_status.FAILED, icon: <CloseCircleOutlined />, color: "#ea5455" },
                        ].map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-4 rounded-xl" style={{ background: `${item.color}05` }}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: `${item.color}15`, color: item.color }}>
                                {item.icon}
                              </div>
                              <span className="font-bold" style={{ color: theme === "dark" ? "#e2e8f0" : "#484650" }} dangerouslySetInnerHTML={{ __html: item.label }} />
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold" style={{ color: item.color }}>{item.count}</div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                {((item.count / reportData.total_submissions) * 100).toFixed(1)}% Ulushi
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} lg={12}>
                    <div
                      className="rounded-xl p-6 h-full transition-all duration-300 flex flex-col items-center justify-center text-center space-y-4"
                      style={{
                        background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                        border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                      }}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-3xl text-blue-500 mb-2">
                        <LineChartOutlined />
                      </div>
                      <Title level={5} className="!mb-1" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>To&apos;lovlar Dinamikasi</Title>
                      <Text type="secondary" className="max-w-[300px]">To&apos;lovlar hajmi va o&apos;sish sur&apos;atlarini tahlil qilish uchun interaktiv grafik bo&apos;limi.</Text>
                      <Button className="rounded-xl h-[42px] px-8 font-bold" style={{ background: theme === "dark" ? "rgb(48, 56, 78)" : "#ffffff", color: theme === "dark" ? "#ffffff" : "inherit" }}>Grafikni ochish</Button>
                    </div>
                  </Col>
                </Row>
              </div>
            )
          },
          {
            key: "performance",
            label: (
              <Space>
                <TrophyOutlined />
                Natijalar
              </Space>
            ),
            children: (
              <div className="space-y-6 pt-2">
                <Row gutter={24}>
                  <Col xs={24} lg={12}>
                    <div
                      className="rounded-xl p-6 h-full transition-all duration-300"
                      style={{
                        background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                        border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                      }}
                    >
                      <Title level={5} className="!mb-6" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Imtihon Natijalari</Title>
                      <div className="space-y-8">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-bold text-sm" style={{ color: theme === "dark" ? "#cbd5e1" : "#484650" }}>O&apos;rtacha ball</span>
                            <span className="font-bold text-[#7367f0]">{reportData.average_score}/100</span>
                          </div>
                          <Progress percent={reportData.average_score} strokeColor="#7367f0" strokeWidth={10} trailColor={theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-bold text-sm" style={{ color: theme === "dark" ? "#cbd5e1" : "#484650" }}>O&apos;tish ko&apos;rsatkichi</span>
                            <span className="font-bold text-[#28c76f]">{reportData.pass_rate}%</span>
                          </div>
                          <Progress percent={reportData.pass_rate} strokeColor="#28c76f" strokeWidth={10} trailColor={theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-bold text-sm" style={{ color: theme === "dark" ? "#cbd5e1" : "#484650" }}>Qoniqarsiz natija</span>
                            <span className="font-bold text-[#ea5455]">{(100 - reportData.pass_rate).toFixed(1)}%</span>
                          </div>
                          <Progress percent={100 - reportData.pass_rate} strokeColor="#ea5455" strokeWidth={10} trailColor={theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} />
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} lg={12}>
                    <div
                      className="rounded-xl overflow-hidden transition-all duration-300"
                      style={{
                        background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                        border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                      }}
                    >
                      <div className="p-6 border-b" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}>
                        <Title level={5} className="!mb-0" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Reyting Jadvali</Title>
                      </div>
                      <Table
                        dataSource={reportData.top_specialities.slice(0, 5)}
                        columns={[
                          {
                            title: "O'rin",
                            key: "rank",
                            render: (_: unknown, __: unknown, index: number) => (
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#ff9f43]/10 text-[#ff9f43] font-bold">
                                {index + 1}
                              </div>
                            ),
                            width: 80,
                          },
                          {
                            title: "Mutaxassislik",
                            dataIndex: "name",
                            render: (name: string) => <span className="font-bold text-sm" style={{ color: theme === "dark" ? "#e2e8f0" : "#484650" }}>{name}</span>
                          },
                          {
                            title: "Arizalar",
                            dataIndex: "count",
                            render: (count: number) => (
                              <div className="flex flex-col">
                                <span className="font-bold text-[#7367f0]">{count} ta</span>
                                <span className="text-[10px] text-gray-400 font-medium tracking-tighter uppercase">Raqobat</span>
                              </div>
                            ),
                            width: 120,
                          },
                        ]}
                        pagination={false}
                        className="custom-admin-table"
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            )
          }
        ]}
      />

      <style jsx global>{`
        .premium-select .ant-select-selector, .premium-datepicker {
          background: ${theme === "dark" ? "rgb(48, 56, 78)" : "#ffffff"} !important;
          border: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)"} !important;
          color: ${theme === "dark" ? "#ffffff" : "#484650"} !important;
          border-radius: 12px !important;
          height: 42px !important;
          display: flex !important;
          align-items: center !important;
        }
        .premium-tabs .ant-tabs-nav {
          margin-bottom: 24px !important;
        }
        .premium-tabs .ant-tabs-nav::before {
          border-bottom: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)"} !important;
        }
        .premium-tabs .ant-tabs-tab {
          background: transparent !important;
          border: none !important;
          padding: 12px 20px !important;
        }
        .premium-tabs .ant-tabs-tab-active {
          background: #7367f010 !important;
          border-radius: 10px 10px 0 0 !important;
        }
        .premium-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #7367f0 !important;
          font-weight: 700 !important;
        }
        .premium-tabs .ant-tabs-tab:hover {
          color: #7367f0 !important;
        }
        .premium-tabs .ant-tabs-ink-bar {
          background: #7367f0 !important;
          height: 3px !important;
        }
        
        .custom-admin-table .ant-table {
          background: transparent !important;
          color: ${theme === "dark" ? "#e2e8f0" : "#484650"} !important;
        }
        .custom-admin-table .ant-table-thead > tr > th {
          background: ${theme === "dark" ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)"} !important;
          border-bottom: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)"} !important;
          color: ${theme === "dark" ? "#94a3b8" : "#64748b"} !important;
          font-weight: 700 !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
        }
        .custom-admin-table .ant-table-tbody > tr > td {
          border-bottom: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.03)" : "1px solid rgba(0, 0, 0, 0.03)"} !important;
          padding: 12px 16px !important;
        }
        .custom-admin-table .ant-table-tbody > tr:hover > td {
          background: ${theme === "dark" ? "rgba(115, 103, 240, 0.05)" : "rgba(115, 103, 240, 0.02)"} !important;
        }
      `}</style>
    </div>
  );
}