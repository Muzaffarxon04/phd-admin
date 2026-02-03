"use client";

import { useState } from "react";
import {
  Button,
  Table,
  Select,
  DatePicker,
  message,
  Alert,
} from "antd";
import {
  SyncOutlined,
  EyeOutlined,
  BookOutlined,
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Typography } from "antd";
const { Title } = Typography;
import { useThemeStore } from "@/lib/stores/themeStore";
import { formatDate } from "@/lib/utils";
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
    } catch {
      message.error("Xatolik yuz berdi");
    }
  };

  const { theme } = useThemeStore();

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2 py-3 px-4">
          <FileTextOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Ariza ma&apos;lumotlari</span>
        </div>
      ),
      key: "submission_info",
      render: (_: unknown, record: PaymentRecord) => (
        <div className="px-4 py-2">
          <div className="font-bold text-sm text-[#7367f0] mb-1 font-mono">
            {record.submission_number}
          </div>
          <div className={`text-xs font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {record.applicant_name}
          </div>
        </div>
      ),
      width: 250,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <BookOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Ariza nomi</span>
        </div>
      ),
      dataIndex: "application_title",
      key: "application_title",
      render: (text: string) => (
        <div className="text-xs font-bold truncate max-w-[200px]" style={{ color: theme === "dark" ? "#e2e8f0" : "#484650" }}>
          {text}
        </div>
      ),
      width: 200,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <DollarOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Summa</span>
        </div>
      ),
      dataIndex: "amount",
      key: "amount",
      render: (amount: string) => (
        <div className="py-2">
          <span className="text-sm font-bold text-green-500">
            {parseFloat(amount).toLocaleString()} UZS
          </span>
        </div>
      ),
      width: 150,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <CheckCircleOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Status</span>
        </div>
      ),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <div className="py-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 w-fit ${status === "PAID" ? "bg-green-500/10 text-green-500 border-green-500/20" :
            status === "PENDING" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
              "bg-red-500/10 text-red-500 border-red-500/20"
            }`}>
            {getStatusIcon(status)}
            {getStatusText(status)}
          </span>
        </div>
      ),
      width: 150,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <ClockCircleOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Sana</span>
        </div>
      ),
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (
        <div className="text-xs font-medium text-gray-400">
          {formatDate(date)}
        </div>
      ),
      width: 150,
    },
    {
      title: (
        <div className="flex items-center justify-center py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Amallar</span>
        </div>
      ),
      key: "actions",
      width: 120,
      render: (_: unknown, record: PaymentRecord) => (
        <div className="flex items-center justify-center gap-2 py-2">
          <Button
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#7367f0]/10 text-[#7367f0] border-0 hover:bg-[#7367f0] hover:text-white transition-all duration-300 shadow-sm"
            icon={<EyeOutlined style={{ fontSize: "18px" }} />}
            onClick={() => message.info("Tafsilotlarni ko'rish funksiyasi tez orada qo'shiladi")}
          />
          {record.status === "PENDING" && (
            <Button
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#7367f0]/10 text-[#7367f0] border-0 hover:bg-[#7367f0] hover:text-white transition-all duration-300 shadow-sm"
              icon={<SyncOutlined style={{ fontSize: "18px" }} />}
              onClick={() => handleCheckStatus(record.id)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title level={4} className="!mb-1" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
            To&apos;lovlar Boshqaruvi
          </Title>
          <div className="text-gray-400 text-sm font-medium">Abituriyentlar to&apos;lovlarini kuzatib boring va tekshiring</div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="h-[42px] px-6 rounded-xl border font-bold flex items-center gap-2 transition-all duration-300 shadow-sm"
            style={{
              background: theme === "dark" ? "rgb(48, 56, 78)" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#484650",
              borderColor: theme === "dark" ? "rgb(59, 66, 83)" : "rgb(235, 233, 241)",
            }}
            icon={<SyncOutlined />}
            onClick={() => window.location.reload()}
          >
            Yangilash
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Jami to'lovlar", value: paymentsData.count, icon: <DollarOutlined />, color: "#7367f0" },
          { title: "Muvaffaqiyatli", value: statusCounts.PAID, icon: <CheckCircleOutlined />, color: "#28c76f" },
          { title: "Kutilmoqda", value: statusCounts.PENDING, icon: <ClockCircleOutlined />, color: "#ff9f43" },
          { title: "Jami summa", value: `${totalAmount.toLocaleString()} UZS`, icon: <DollarOutlined />, color: "#00cfe8" },
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

      <div
        className="rounded-xl overflow-hidden transition-all duration-300"
        style={{
          background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
          border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
          boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Filters */}
        <div className="p-6 border-b flex flex-wrap gap-4" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}>
          <Select
            placeholder="Status bo&apos;yicha"
            className="w-full md:w-[200px] premium-select"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="PAID">To&apos;langan</Option>
            <Option value="PENDING">Kutilmoqda</Option>
            <Option value="FAILED">Muvaffaqiyatsiz</Option>
            <Option value="REFUNDED">Qaytarilgan</Option>
          </Select>

          <RangePicker
            className="w-full md:w-[300px] premium-datepicker"
            placeholder={["Boshlanish", "Tugash"]}
            onChange={setDateRange}
          />

          <Button
            className="rounded-xl transition-all duration-300"
            onClick={() => {
              setStatusFilter("");
              setDateRange(null);
            }}
          >
            Tozalash
          </Button>
        </div>

        <div className="px-6 py-4">
          <Alert
            message="E&apos;tibor bering"
            description="To&apos;lovlar tizimi hozirda test rejimida ishlamoqda. Ko&apos;rsatilgan ma&apos;lumotlar namunaviy hisoblanadi."
            type="info"
            showIcon
            className="rounded-xl mb-4 border-0"
            style={{ background: theme === "dark" ? "rgba(0, 207, 232, 0.1)" : "#e0f7fa" }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredPayments}
          rowKey="id"
          className="custom-admin-table"
          pagination={{
            total: paymentsData.count,
            pageSize: 20,
            showTotal: (total, range) => `${range[0]}-${range[1]} dan ${total} ta`,
            className: "px-6 py-4",
          }}
        />
        <style jsx global>{`
          .custom-admin-table .ant-table {
            background: transparent !important;
            color: ${theme === "dark" ? "#e2e8f0" : "#484650"} !important;
          }
          .custom-admin-table .ant-table-thead > tr > th {
            background: ${theme === "dark" ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)"} !important;
            border-bottom: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)"} !important;
            color: ${theme === "dark" ? "#94a3b8" : "#64748b"} !important;
            font-weight: 700 !important;
          }
          .custom-admin-table .ant-table-tbody > tr > td {
            border-bottom: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.03)" : "1px solid rgba(0, 0, 0, 0.03)"} !important;
            padding: 12px 16px !important;
          }
          .custom-admin-table .ant-table-tbody > tr:hover > td {
            background: ${theme === "dark" ? "rgba(115, 103, 240, 0.05)" : "rgba(115, 103, 240, 0.02)"} !important;
          }
          .custom-admin-table .ant-pagination-item-active {
            border-color: #7367f0 !important;
            background: #7367f0 !important;
          }
          .custom-admin-table .ant-pagination-item-active a {
            color: #fff !important;
          }
          
          .premium-select .ant-select-selector, .premium-datepicker {
            background: ${theme === "dark" ? "rgb(30, 38, 60)" : "#f8f8f8"} !important;
            border: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#484650"} !important;
            border-radius: 12px !important;
          }
          .premium-datepicker .ant-picker-input > input {
            color: ${theme === "dark" ? "#ffffff" : "#484650"} !important;
          }
          .premium-datepicker .ant-picker-suffix {
            color: #7367f0 !important;
          }
        `}</style>
      </div>
    </div>
  );
}
