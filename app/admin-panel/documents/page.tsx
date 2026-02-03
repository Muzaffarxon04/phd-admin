"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Typography,
  Select,
  Form,
  message,
  Space,
  Alert,
  Breadcrumb,
  Statistic,
  List,
  Avatar,
} from "antd";
const { Title, Text, Paragraph } = Typography;
import { useThemeStore } from "@/lib/stores/themeStore";
import {
  FilePdfOutlined,
  FileWordOutlined,
  DownloadOutlined,
  PrinterOutlined,
  EyeOutlined,
  BookOutlined,
  UserOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Option } = Select;

interface Application {
  id: string;
  title: string;
  total_submissions: number;
}

interface Speciality {
  id: string;
  name: string;
  code: string;
}

export default function DocumentsPage() {
  const [selectedApplication, setSelectedApplication] = useState<string>("");
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data
  const applications: Application[] = [
    { id: "1", title: "PhD Entrance Exam 2025", total_submissions: 45 },
    { id: "2", title: "Master Program 2025", total_submissions: 32 },
    { id: "3", title: "Scientific Research Program", total_submissions: 28 },
  ];

  const specialities: Speciality[] = [
    { id: "1", name: "Kompyuter fanlari", code: "05.01.01" },
    { id: "2", name: "Matematika", code: "01.01.01" },
    { id: "3", name: "Fizika", code: "01.04.02" },
    { id: "4", name: "Kimyo", code: "02.00.01" },
    { id: "5", name: "Biologiya", code: "03.01.04" },
  ];

  const handleGenerateCertificate = async (submissionId: string) => {
    try {
      setIsGenerating(true);
      // Mock download - in real app this would call the PDF API
      const link = document.createElement('a');
      link.href = '#'; // Would be actual PDF URL
      link.download = `certificate-${submissionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success("Sertifikat muvaffaqiyatli yuklandi");
    } catch {
      message.error("Sertifikat yaratishda xatolik yuz berdi");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBulkTemplates = async () => {
    if (!selectedApplication) {
      message.warning("Avval arizani tanlang");
      return;
    }

    try {
      setIsGenerating(true);
      // Mock download - in real app this would call the Words API
      const link = document.createElement('a');
      link.href = '#'; // Would be actual Word document URL
      link.download = `bulk-templates-${selectedApplication}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success("Shablonlar muvaffaqiyatli yuklandi");
    } catch {
      message.error("Shablonlar yaratishda xatolik yuz berdi");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewTemplate = async () => {
    try {
      message.info("Shablon preview funksiyasi tez orada qoshiladi");
    } catch {
      message.error("Preview yaratishda xatolik yuz berdi");
    }
  };

  const { theme } = useThemeStore();

  return (
    <div className="space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title level={4} className="!mb-1" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
            Hujjat Generatsiyasi
          </Title>
          <div className="text-gray-400 text-sm font-medium">Sertifikatlar, guvohnomalar va boshqa hujjatlarni yaratish va yuklash</div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Jami arizalar", value: applications.reduce((sum, app) => sum + app.total_submissions, 0), icon: <BookOutlined />, color: "#7367f0" },
          { title: "Mutaxassisliklar", value: specialities.length, icon: <TrophyOutlined />, color: "#28c76f" },
          { title: "Faol arizalar", value: applications.filter(app => app.total_submissions > 0).length, icon: <UserOutlined />, color: "#00cfe8" },
          { title: "Jami hujjatlar", value: 1250, icon: <FilePdfOutlined />, color: "#ff9f43" },
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
                <div className={`text-xl font-bold mt-1 ${theme === "dark" ? "text-white" : "text-[#484650]"}`}>{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Row gutter={24}>
        {/* PDF Certificates */}
        <Col xs={24} lg={12}>
          <div
            className="h-full rounded-xl overflow-hidden transition-all duration-300"
            style={{
              background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
              border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
              boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="p-6 border-b" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}>
              <Space>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 font-bold">
                  <FilePdfOutlined />
                </div>
                <Title level={5} className="!mb-0" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>PDF Sertifikatlar</Title>
              </Space>
            </div>

            <div className="p-6 space-y-6">
              <Alert
                message="E&apos;tibor bering"
                description="Hujjatlarni generatsiya qilish API tizimi test rejimida ishlamoqda."
                type="info"
                showIcon
                className="rounded-xl border-0"
                style={{ background: theme === "dark" ? "rgba(0, 207, 232, 0.1)" : "#e0f7fa" }}
              />

              <div className="space-y-4">
                <div>
                  <Text strong style={{ color: theme === "dark" ? "#e2e8f0" : "inherit" }}>Abituriyentlar uchun individual sertifikatlar</Text>
                  <br />
                  <Text type="secondary">Har bir abituriyent uchun alohida PDF sertifikat yaratish</Text>
                </div>

                <div
                  className="p-4 rounded-xl space-y-4"
                  style={{ background: theme === "dark" ? "rgba(255, 255, 255, 0.02)" : "#f8f9fa" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Namuna sertifikat yaratish:</Text>
                      <div className="text-xs text-gray-500">Bu test rejimidagi namunaviy sertifikat yaratadi</div>
                    </div>
                    <Button
                      type="primary"
                      icon={<FilePdfOutlined />}
                      onClick={() => handleGenerateCertificate("sample-123")}
                      loading={isGenerating}
                      className="rounded-xl h-[42px] border-0"
                      style={{ background: "linear-gradient(118deg, #ea5455, rgba(234, 84, 85, 0.7))", boxShadow: "0 8px 25px -8px #ea5455" }}
                    >
                      Generatsiya
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Word Templates */}
        <Col xs={24} lg={12}>
          <div
            className="h-full rounded-xl overflow-hidden transition-all duration-300"
            style={{
              background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
              border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
              boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="p-6 border-b" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}>
              <Space>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                  <FileWordOutlined />
                </div>
                <Title level={5} className="!mb-0" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Word Shablonlar</Title>
              </Space>
            </div>

            <div className="p-6">
              <Form layout="vertical">
                <Form.Item label={<span style={{ color: theme === "dark" ? "#94a3b8" : "inherit" }}>Ariza tizimi</span>}>
                  <Select
                    placeholder="Arizani tanlang"
                    value={selectedApplication}
                    onChange={setSelectedApplication}
                    className="premium-select"
                  >
                    {applications.map((app) => (
                      <Option key={app.id} value={app.id}>
                        {app.title} ({app.total_submissions} ta ariza)
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label={<span style={{ color: theme === "dark" ? "#94a3b8" : "inherit" }}>Mutaxassislik (ixtiyoriy)</span>}>
                  <Select
                    placeholder="Mutaxassislikni tanlang"
                    value={selectedSpeciality}
                    onChange={setSelectedSpeciality}
                    allowClear
                    className="premium-select"
                  >
                    {specialities.map((spec) => (
                      <Option key={spec.id} value={spec.id}>
                        {spec.name} ({spec.code})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <div className="flex gap-4">
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleGenerateBulkTemplates}
                    loading={isGenerating}
                    disabled={isGenerating || !selectedApplication}
                    className="flex-1 rounded-xl h-[42px] border-0"
                    style={{ background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))", boxShadow: "0 8px 25px -8px #7367f0" }}
                  >
                    Ommaviy Shablonlar
                  </Button>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={handlePreviewTemplate}
                    className="flex-1 rounded-xl h-[42px]"
                    style={{ background: theme === "dark" ? "rgb(48, 56, 78)" : "#ffffff", color: theme === "dark" ? "#ffffff" : "inherit" }}
                  >
                    Ko&apos;rish
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </Col>
      </Row>

      {/* Document Types Info */}
      <div
        className="rounded-xl p-6 transition-all duration-300"
        style={{
          background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
          border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
          boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Title level={5} className="!mb-6" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Mavjud Hujjat Turlari</Title>
        <Row gutter={24}>
          {[
            { icon: <FilePdfOutlined />, color: "#ea5455", title: "PDF Sertifikatlar", desc: "Individual natijalar" },
            { icon: <FileWordOutlined />, color: "#7367f0", title: "Word Shablonlar", desc: "Ommaviy hujjatlar" },
            { icon: <PrinterOutlined />, color: "#28c76f", title: "Chop etish", desc: "Tayyor hujjatlar" },
          ].map((type, idx) => (
            <Col span={8} key={idx}>
              <div
                className="p-4 rounded-xl text-center space-y-2 transition-all hover:scale-105 duration-300"
                style={{ background: theme === "dark" ? "rgba(255, 255, 255, 0.02)" : "#f8f9fa" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto text-xl"
                  style={{ background: `${type.color}15`, color: type.color }}
                >
                  {type.icon}
                </div>
                <div className="font-bold" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>{type.title}</div>
                <div className="text-xs text-gray-400">{type.desc}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Recent Documents */}
      <div
        className="rounded-xl overflow-hidden transition-all duration-300"
        style={{
          background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
          border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
          boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}>
          <Title level={5} className="!mb-0" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>So&apos;nggi Yaratilgan Hujjatlar</Title>
          <Button type="text" className="text-[#7367f0] p-0 font-bold">Barchasini ko&apos;rish</Button>
        </div>

        <List
          className="px-6 list-premium"
          dataSource={[
            { id: 1, type: "PDF", name: "Certificate - SUB-2025-001", created: "2025-01-26 14:30", status: "Yuklangan" },
            { id: 2, type: "Word", name: "Bulk Templates - PhD Exam 2025", created: "2025-01-26 13:15", status: "Yaratilgan" },
            { id: 3, type: "PDF", name: "Certificate - SUB-2025-002", created: "2025-01-25 16:45", status: "Yuklangan" },
          ]}
          renderItem={(item) => (
            <List.Item
              className="border-b last:border-0"
              style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}
              actions={[
                <Button key="download" type="text" icon={<DownloadOutlined className="text-[#7367f0]" />} className="font-bold text-[#7367f0]">Yuklash</Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={item.type === "PDF" ? <FilePdfOutlined /> : <FileWordOutlined />}
                    className="rounded-xl"
                    style={{ backgroundColor: item.type === "PDF" ? "#ea545515" : "#7367f015", color: item.type === "PDF" ? "#ea5455" : "#7367f0" }}
                  />
                }
                title={<span className="font-bold" style={{ color: theme === "dark" ? "#e2e8f0" : "#484650" }}>{item.name}</span>}
                description={
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <span>{item.created}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${item.status === "Yuklangan" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                      }`}>{item.status}</span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        <style jsx global>{`
          .premium-select .ant-select-selector {
            background: ${theme === "dark" ? "rgb(30, 38, 60)" : "#f8f8f8"} !important;
            border: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#484650"} !important;
            border-radius: 12px !important;
            height: 42px !important;
            display: flex !important;
            align-items: center !important;
          }
          .premium-select .ant-select-selection-placeholder {
            line-height: 40px !important;
          }
        `}</style>
      </div>
    </div>
  );
}