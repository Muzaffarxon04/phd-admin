"use client";

import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Progress,
  Table,
  Select,
  DatePicker,
  Button,
  Space,
  Breadcrumb,
  Tabs,
  List,
  Avatar,
  Tag,
} from "antd";
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

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [, setDateRange] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");

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

  const statusColors = {
    PUBLISHED: "green",
    DRAFT: "orange",
    CLOSED: "red",
    ARCHIVED: "gray",
  };

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { href: "/", title: "Bosh sahifa" },
          { href: "/admin-panel", title: "Admin Panel" },
          { title: "Hisobotlar" },
        ]}
        className="mb-4"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="mb-2">Hisobotlar va Statistika</Title>
          <p className="text-gray-600">Tizim faoliyati boyicha toliq malumotlar</p>
        </div>
        <Space>
          <Select
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            style={{ width: 120 }}
          >
            <Option value="week">Haftalik</Option>
            <Option value="month">Oylik</Option>
            <Option value="quarter">Choraklik</Option>
            <Option value="year">Yillik</Option>
          </Select>
          <RangePicker
            onChange={setDateRange}
            placeholder={["Boshlanish", "Tugash"]}
          />
          <Button icon={<DownloadOutlined />} onClick={() => handleExportReport("pdf")}>
            PDF
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => handleExportReport("excel")}>
            Excel
          </Button>
        </Space>
      </div>

      <Tabs defaultActiveKey="overview" type="card">
        {/* Overview Tab */}
        <TabPane
          tab={
            <Space>
              <BarChartOutlined />
              Umumiy
            </Space>
          }
          key="overview"
        >
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Jami Arizalar"
                  value={reportData.total_applications}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Jami Arizachilar"
                  value={reportData.total_submissions}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Jami To'lovlar"
                  value={reportData.total_payments.toLocaleString()}
                  prefix={<DollarOutlined />}
                  suffix="UZS"
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="O'rtacha Ball"
                  value={reportData.average_score}
                  prefix={<TrophyOutlined />}
                  suffix="/100"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Ariza Statuslari">
                <div className="space-y-3">
                  {Object.entries(reportData.applications_by_status).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Tag color={statusColors[status as keyof typeof statusColors]}>
                          {status}
                        </Tag>
                        <span>{count} ta</span>
                      </div>
                      <Progress
                        percent={(count / reportData.total_applications) * 100}
                        size="small"
                        showInfo={false}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="O'tish Foizi">
                <div className="text-center">
                  <Progress
                    type="circle"
                    percent={reportData.pass_rate}
                    format={(percent) => `${percent}%`}
                    strokeColor="#52c41a"
                    size={120}
                  />
                  <div className="mt-4">
                    <Text strong>Abituriyentlar otish foizi</Text>
                    <br />
                    <Text type="secondary">
                      Jami abituriyentlarning {reportData.pass_rate}% imtihondan otdi
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Submissions Tab */}
        <TabPane
          tab={
            <Space>
              <UserOutlined />
              Arizachilar
            </Space>
          }
          key="submissions"
        >
          <Row gutter={[16, 16]} className="mb-6">
            <Col span={24}>
              <Card title="Oylik Arizalar Statistikas">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {reportData.submissions_by_month.map((item) => (
                    <Card key={item.month} size="small" className="text-center">
                      <Statistic
                        title={item.month}
                        value={item.count}
                        valueStyle={{ fontSize: '18px' }}
                      />
                    </Card>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>

          <Card title="Top Mutaxassisliklar">
            <List
              dataSource={reportData.top_specialities}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: '#1890ff' }}>
                        {index + 1}
                      </Avatar>
                    }
                    title={item.name}
                    description={`${item.count} ta ariza`}
                  />
                  <div className="ml-4">
                    <Progress percent={(item.count / Math.max(...reportData.top_specialities.map(s => s.count))) * 100} size="small" />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        {/* Payments Tab */}
        <TabPane
          tab={
            <Space>
              <DollarOutlined />
              Tolovlar
            </Space>
          }
          key="payments"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Tolov Statuslari">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <span>Tolangan</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{reportData.payments_by_status.PAID}</div>
                      <div className="text-sm text-gray-500">
                        {((reportData.payments_by_status.PAID / reportData.total_submissions) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ClockCircleOutlined style={{ color: '#faad14' }} />
                      <span>Kutilmoqda</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{reportData.payments_by_status.PENDING}</div>
                      <div className="text-sm text-gray-500">
                        {((reportData.payments_by_status.PENDING / reportData.total_submissions) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      <span>Muvaffaqiyatsiz</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{reportData.payments_by_status.FAILED}</div>
                      <div className="text-sm text-gray-500">
                        {((reportData.payments_by_status.FAILED / reportData.total_submissions) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="To'lovlar Taqvimi">
                <div className="text-center py-8">
                  <LineChartOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                  <div className="mt-4">
                    <Text strong>Grafik korinish</Text>
                    <br />
                    <Text type="secondary">
                      Tolovlar dinamikasini korish uchun grafik
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Performance Tab */}
        <TabPane
          tab={
            <Space>
              <TrophyOutlined />
              Natijalar
            </Space>
          }
          key="performance"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Imtihon Natijalari">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Ortacha ball</span>
                      <span className="font-bold">{reportData.average_score}/100</span>
                    </div>
                    <Progress percent={reportData.average_score} strokeColor="#722ed1" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Otish foizi</span>
                      <span className="font-bold">{reportData.pass_rate}%</span>
                    </div>
                    <Progress percent={reportData.pass_rate} strokeColor="#52c41a" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Yiqilish foizi</span>
                      <span className="font-bold">{(100 - reportData.pass_rate).toFixed(1)}%</span>
                    </div>
                    <Progress percent={100 - reportData.pass_rate} strokeColor="#ff4d4f" />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Reyting Jadvali">
                <Table
                  dataSource={reportData.top_specialities.slice(0, 5)}
                  columns={[
                    {
                      title: "O'rin",
                      dataIndex: "index",
                      render: (_, __, index) => (
                        <Tag color="gold">{index + 1}</Tag>
                      ),
                    },
                    {
                      title: "Mutaxassislik",
                      dataIndex: "name",
                    },
                    {
                      title: "Arizalar",
                      dataIndex: "count",
                      render: (count) => <Text strong>{count}</Text>,
                    },
                  ]}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
}