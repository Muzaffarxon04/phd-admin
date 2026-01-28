"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Breadcrumb,
  Select,
  DatePicker,
  message,
  Alert,
} from "antd";
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  EyeOutlined,
} from "@ant-design/icons";
// import { useGet } from "@/lib/hooks";
import { formatDate } from "@/lib/utils";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface PaymentRecord {
  id: number;
  submission_id: number;
  submission_number: string;
  applicant_name: string;
  application_title: string;
  amount: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  transaction_id?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [, setDateRange] = useState<any>(null);

  // Mock data - would come from API
  const paymentsData = {
    count: 156,
    results: [
      {
        id: 1,
        submission_id: 123,
        submission_number: "SUB-2025-001",
        applicant_name: "Ali Valiyev",
        application_title: "PhD Entrance Exam 2025",
        amount: "150000.00",
        status: "PAID" as const,
        transaction_id: "TXN-123456789",
        paid_at: "2025-01-15T10:30:00Z",
        created_at: "2025-01-15T09:00:00Z",
        updated_at: "2025-01-15T10:30:00Z",
      },
      {
        id: 2,
        submission_id: 124,
        submission_number: "SUB-2025-002",
        applicant_name: "Gulnora Karimova",
        application_title: "PhD Entrance Exam 2025",
        amount: "150000.00",
        status: "PENDING" as const,
        created_at: "2025-01-16T14:20:00Z",
        updated_at: "2025-01-16T14:20:00Z",
      },
      {
        id: 3,
        submission_id: 125,
        submission_number: "SUB-2025-003",
        applicant_name: "Rustam Abdullayev",
        application_title: "Master Program 2025",
        amount: "100000.00",
        status: "FAILED" as const,
        transaction_id: "TXN-987654321",
        created_at: "2025-01-17T11:15:00Z",
        updated_at: "2025-01-17T11:20:00Z",
      },
    ]
  };

  const payments = paymentsData.results;
  const filteredPayments = payments.filter(payment => {
    if (statusFilter && payment.status !== statusFilter) return false;
    return true;
  });

  const totalAmount = filteredPayments
    .filter(p => p.status === "PAID")
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const statusCounts = {
    PAID: filteredPayments.filter(p => p.status === "PAID").length,
    PENDING: filteredPayments.filter(p => p.status === "PENDING").length,
    FAILED: filteredPayments.filter(p => p.status === "FAILED").length,
    // REFUNDED: filteredPayments.filter(p => p.status === "REFUNDED").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "green";
      case "PENDING": return "orange";
      case "FAILED": return "red";
      case "REFUNDED": return "blue";
      default: return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PAID": return "To'langan";
      case "PENDING": return "Kutilmoqda";
      case "FAILED": return "Muvaffaqiyatsiz";
      case "REFUNDED": return "Qaytarilgan";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID": return <CheckCircleOutlined />;
      case "PENDING": return <ClockCircleOutlined />;
      case "FAILED": return <CloseCircleOutlined />;
      case "REFUNDED": return <SyncOutlined />;
      default: return null;
    }
  };

  const handleCheckStatus = async (paymentId: number) => {
    try {
      console.log(paymentId);
      
      // This would call the actual API
      message.info("To'lov statusini tekshirish funksiyasi tez orada qo'shiladi");
    } catch  {
      message.error("Xatolik yuz berdi");
    }
  };

  const columns = [
    {
      title: "Ariza raqami",
      dataIndex: "submission_number",
      key: "submission_number",
      render: (text: string) => (
        <Text strong className="font-mono">{text}</Text>
      ),
    },
    {
      title: "Abituriyent",
      dataIndex: "applicant_name",
      key: "applicant_name",
    },
    {
      title: "Ariza",
      dataIndex: "application_title",
      key: "application_title",
      ellipsis: true,
    },
    {
      title: "Summa",
      dataIndex: "amount",
      key: "amount",
      render: (amount: string) => (
        <Text strong className="text-green-600">
          {parseFloat(amount).toLocaleString()} UZS
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Sana",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_item: string, record: PaymentRecord) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => message.info("Tafsilotlarni ko'rish funksiyasi tez orada qo'shiladi")}
            title="Tafsilotlarni ko'rish"
          />
          {record.status === "PENDING" && (
            <Button
              type="text"
              icon={<SyncOutlined />}
              onClick={() => handleCheckStatus(record.id)}
              title="Statusni tekshirish"
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { href: "/", title: "Bosh sahifa" },
          { href: "/admin-panel", title: "Admin Panel" },
          { title: "To'lovlar" },
        ]}
        className="mb-4"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="mb-2">Tolovlar Boshqaruvi</Title>
          <p className="text-gray-600">Abituriyentlar tolovlarini kuzatib boring</p>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Jami to'lovlar"
              value={paymentsData.count}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Muvaffaqiyatli"
              value={statusCounts.PAID}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Kutilmoqda"
              value={statusCounts.PENDING}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Jami summa"
              value={totalAmount.toLocaleString()}
              prefix={<DollarOutlined />}
              suffix="UZS"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Select
              placeholder="Status bo'yicha filtr"
              style={{ width: '100%' }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="PAID">Tolangan</Option>
              <Option value="PENDING">Kutilmoqda</Option>
              <Option value="FAILED">Muvaffaqiyatsiz</Option>
              <Option value="REFUNDED">Qaytarilgan</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={["Boshlanish", "Tugash"]}
              style={{ width: '100%' }}
              onChange={setDateRange}
            />
          </Col>
          <Col span={6}>
            <Button type="primary" onClick={() => {
              setStatusFilter("");
              setDateRange(null);
            }}>
              Filtrlarni tozalash
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Payments Table */}
      <Card>
        <Alert
          message="Diqqat"
          description="To'lovlar API'si hali to'liq amalga oshirilmagan. Namuna ma'lumotlar ko'rsatilmoqda."
          type="warning"
          showIcon
          className="mb-4"
        />
        <Table
          columns={columns}
          dataSource={filteredPayments}
          rowKey="id"
          pagination={{
            total: paymentsData.count,
            pageSize: 20,
            showSizeChanger: false,
          }}
        />
      </Card>
    </div>
  );
}

// Missing imports
import { Typography } from "antd";