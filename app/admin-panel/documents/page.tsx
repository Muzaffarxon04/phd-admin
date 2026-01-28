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

const { Title, Text, Paragraph } = Typography;
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
    } catch  {
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
    } catch  {
      message.error("Shablonlar yaratishda xatolik yuz berdi");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewTemplate = async () => {
    try {
      message.info("Shablon preview funksiyasi tez orada qoshiladi");
      } catch  {
      message.error("Preview yaratishda xatolik yuz berdi");
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { href: "/", title: "Bosh sahifa" },
          { href: "/admin-panel", title: "Admin Panel" },
          { title: "Hujjat Generatsiyasi" },
        ]}
        className="mb-4"
      />

      <div className="mb-6">
        <Title level={2} className="mb-2">Hujjat Generatsiyasi</Title>
        <Paragraph className="text-gray-600">
          Sertifikatlar, guvohnomalar va boshqa hujjatlarni yaratish va yuklash
        </Paragraph>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Jami arizalar"
              value={applications.reduce((sum, app) => sum + app.total_submissions, 0)}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Mutaxassisliklar"
              value={specialities.length}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Faol arizalar"
              value={applications.filter(app => app.total_submissions > 0).length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Jami hujjatlar"
              value={1250}
              prefix={<FilePdfOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* PDF Certificates */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                PDF Sertifikatlar
              </Space>
            }
            className="h-full"
          >
            <Alert
              message="Diqqat"
              description="Bu bo'lim hali to'liq amalga oshirilmagan. Namuna funksiyalar ko'rsatilmoqda."
              type="warning"
              showIcon
              className="mb-4"
            />

            <div className="space-y-4">
              <div>
                <Text strong>Abituriyentlar uchun individual sertifikatlar</Text>
                <br />
                <Text type="secondary">
                  Har bir abituriyent uchun alohida PDF sertifikat yaratish
                </Text>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <Text strong>Namuna sertifikat yaratish:</Text>
                <div className="mt-2 space-y-2">
                  <Button
                    type="primary"
                    icon={<FilePdfOutlined />}
                    onClick={() => handleGenerateCertificate("sample-123")}
                    loading={isGenerating}
                    disabled={isGenerating}
                  >
                    Namuna Sertifikat
                  </Button>
                  <br />
                  <Text type="secondary" className="text-sm">
                    Bu namuna sertifikat yaratadi
                  </Text>
                </div>
              </div>

              <div>
                <Text strong className="text-green-600">✅ API Ready:</Text>
                <br />
                <Text type="secondary" className="text-sm">
                  PDF generation API (pdf.ts) tayyor
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Word Templates */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FileWordOutlined style={{ color: '#1890ff' }} />
                Word Shablonlar
              </Space>
            }
            className="h-full"
          >
            <div className="space-y-4">
              <div>
                <Text strong>Guvohnoma va diplom shablonlari</Text>
                <br />
                <Text type="secondary">
                  Ommaviy hujjatlar uchun Word shablonlari
                </Text>
              </div>

              <Form layout="vertical">
                <Form.Item label="Ariza">
                  <Select
                    placeholder="Arizani tanlang"
                    value={selectedApplication}
                    onChange={setSelectedApplication}
                  >
                    {applications.map((app) => (
                      <Option key={app.id} value={app.id}>
                        {app.title} ({app.total_submissions} ta ariza)
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Mutaxassislik (ixtiyoriy)">
                  <Select
                    placeholder="Mutaxassislikni tanlang"
                    value={selectedSpeciality}
                    onChange={setSelectedSpeciality}
                    allowClear
                  >
                    {specialities.map((spec) => (
                      <Option key={spec.id} value={spec.id}>
                        {spec.name} ({spec.code})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Space className="w-full" direction="vertical">
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleGenerateBulkTemplates}
                    loading={isGenerating}
                    disabled={isGenerating || !selectedApplication}
                    block
                  >
                    Ommaviy Shablonlar
                  </Button>

                  <Button
                    icon={<EyeOutlined />}
                    onClick={handlePreviewTemplate}
                    block
                  >
                    Preview Korish
                  </Button>
                </Space>
              </Form>

              <div>
                <Text strong className="text-blue-600">✅ API Ready:</Text>
                <br />
                <Text type="secondary" className="text-sm">
                  Word templates API (words.ts) tayyor
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Document Types Info */}
      <Card className="mt-6" title="Mavjud Hujjat Turlari">
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" className="text-center">
              <FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
              <div className="mt-2">
                <Text strong>PDF Sertifikatlar</Text>
                <br />
                <Text type="secondary" className="text-sm">
                  Individual natijalar
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="text-center">
              <FileWordOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <div className="mt-2">
                <Text strong>Word Shablonlar</Text>
                <br />
                <Text type="secondary" className="text-sm">
                  Ommaviy hujjatlar
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="text-center">
              <PrinterOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
              <div className="mt-2">
                <Text strong>Chop etish</Text>
                <br />
                <Text type="secondary" className="text-sm">
                  Tayyor hujjatlar
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Recent Documents */}
      <Card className="mt-6" title="So'nggi Yaratilgan Hujjatlar">
        <List
          dataSource={[
            {
              id: 1,
              type: "PDF",
              name: "Certificate - SUB-2025-001",
              created: "2025-01-26 14:30",
              status: "Downloaded",
            },
            {
              id: 2,
              type: "Word",
              name: "Bulk Templates - PhD Exam 2025",
              created: "2025-01-26 13:15",
              status: "Generated",
            },
            {
              id: 3,
              type: "PDF",
              name: "Certificate - SUB-2025-002",
              created: "2025-01-25 16:45",
              status: "Downloaded",
            },
          ]}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="download" type="text" icon={<DownloadOutlined />}>
                  Yuklash
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  item.type === "PDF" ? (
                    <Avatar icon={<FilePdfOutlined />} style={{ backgroundColor: '#ff4d4f' }} />
                  ) : (
                    <Avatar icon={<FileWordOutlined />} style={{ backgroundColor: '#1890ff' }} />
                  )
                }
                title={item.name}
                description={`Yaratilgan: ${item.created} | Status: ${item.status}`}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}