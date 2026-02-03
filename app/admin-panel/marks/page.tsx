"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Breadcrumb,
  Progress,
  Avatar,
  Alert,
  Typography,
} from "antd";
const { Title, Text } = Typography;
import { useThemeStore } from "@/lib/stores/themeStore";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StarOutlined,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  SolutionOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
// import { useGet, usePost, usePut, useDelete } from "@/lib/hooks";
import type {
  ApplicantMark,
  // ApplicantMarkCreate,
  // ApplicantMarkUpdate,
  // MarksStatistics,
} from "@/lib/api/marks";
import { formatDate } from "@/lib/utils";

// const { Option } = Select;

export default function MarksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ApplicantMark | null>(null);
  const [form] = Form.useForm();

  // Mock data - would come from API
  const marksData = {
    count: 245,
    results: [
      {
        id: 1,
        submission: 123,
        submission_details: {
          submission_number: "SUB-2025-001",
          applicant_name: "Ali Valiyev",
          speciality_name: "Kompyuter fanlari",
          application_title: "PhD Entrance Exam 2025"
        },
        score: "85.50",
        percentage: "85.50",
        comments: "Yaxshi natija, lekin matematika bo'yicha kamchiliklar bor",
        is_active: true,
        marked_by: 5,
        marked_at: "2025-01-20T14:30:00Z",
        created_at: "2025-01-20T14:30:00Z",
        updated_at: "2025-01-20T14:30:00Z",
      },
      {
        id: 2,
        submission: 124,
        submission_details: {
          submission_number: "SUB-2025-002",
          applicant_name: "Gulnora Karimova",
          speciality_name: "Matematika",
          application_title: "PhD Entrance Exam 2025"
        },
        score: "92.00",
        percentage: "92.00",
        comments: "A'lo darajada, barcha fanlardan yaxshi natija",
        is_active: true,
        marked_by: 3,
        marked_at: "2025-01-21T10:15:00Z",
        created_at: "2025-01-21T10:15:00Z",
        updated_at: "2025-01-21T10:15:00Z",
      },
      {
        id: 3,
        submission: 125,
        submission_details: {
          submission_number: "SUB-2025-003",
          applicant_name: "Rustam Abdullayev",
          speciality_name: "Fizika",
          application_title: "Master Program 2025"
        },
        score: "67.25",
        percentage: "67.25",
        comments: "Qoniqarsiz, qayta topshirish tavsiya etiladi",
        is_active: false,
        marked_by: 7,
        marked_at: "2025-01-22T16:45:00Z",
        created_at: "2025-01-22T16:45:00Z",
        updated_at: "2025-01-22T16:45:00Z",
      },
    ]
  };

  const statistics = {
    total_marks: 245,
    average_score: "78.5",
    passed_count: 192,
    failed_count: 53,
  };

  const marks = marksData.results;
  const totalCount = marksData.count;

  const handleCreate = () => {
    form.validateFields().then((values: { score: number; submission: number; comments?: string }) => {
      console.log('Form values:', values);
      message.success("Baho muvaffaqiyatli qo'shildi");
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const handleUpdate = () => {
    form.validateFields().then((values: { score: number; submission: number; comments?: string }) => {
      console.log('Update values:', values);
      message.success("Baho muvaffaqiyatli yangilandi");
      setIsModalOpen(false);
      setEditingRecord(null);
      form.resetFields();
    });
  };

  const handleDelete = (record: ApplicantMark) => {
    console.log('Delete record:', record);
    message.success("Baho o'chirildi");
  };

  const toggleMarkStatus = (record: ApplicantMark) => {
    console.log('Toggle status:', record);
    message.success(`Baho ${!record.is_active ? 'faollashtirildi' : 'bekor qilindi'}`);
  };

  const openEditModal = (record: ApplicantMark) => {
    setEditingRecord(record);
    form.setFieldsValue({
      submission: record.submission,
      score: record.score,
      comments: record.comments,
      is_active: record.is_active,
    });
    setIsModalOpen(true);
  };

  const getScoreColor = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore >= 90) return "#52c41a"; // Green - A
    if (numScore >= 80) return "#389e0d"; // Dark Green - B
    if (numScore >= 70) return "#faad14"; // Yellow - C
    if (numScore >= 60) return "#fa8c16"; // Orange - D
    return "#ff4d4f"; // Red - F
  };

  const getGradeText = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore >= 90) return "A";
    if (numScore >= 80) return "B";
    if (numScore >= 70) return "C";
    if (numScore >= 60) return "D";
    return "F";
  };

  const { theme } = useThemeStore();

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2 py-3 px-4">
          <UserOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Abituriyent</span>
        </div>
      ),
      key: "applicant_info",
      render: (_: unknown, record: ApplicantMark) => (
        <div className="flex items-center gap-3 px-4 py-2">
          <Avatar
            icon={<UserOutlined />}
            className="shrink-0 ring-2 ring-[#7367f0]/20"
            style={{ backgroundColor: theme === "dark" ? "#7367f020" : "#7367f010", color: "#7367f0" }}
          />
          <div className="flex flex-col">
            <span className={`font-bold text-sm ${theme === "dark" ? "text-gray-200" : "text-[#484650]"}`}>
              {record.submission_details?.applicant_name}
            </span>
            <span className="text-xs text-gray-400 font-medium font-mono">
              {record.submission_details?.submission_number}
            </span>
          </div>
        </div>
      ),
      width: 250,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <SolutionOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Mutaxassislik</span>
        </div>
      ),
      key: "speciality_info",
      render: (_: unknown, record: ApplicantMark) => (
        <div className="py-2">
          <div className="font-bold text-xs text-[#7367f0] mb-1">
            {record.submission_details?.speciality_name}
          </div>
          <div className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">
            {record.submission_details?.application_title}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <TrophyOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Natija</span>
        </div>
      ),
      key: "score_info",
      render: (_: unknown, record: ApplicantMark) => (
        <div className="flex items-center gap-3 py-1">
          <Progress
            type="circle"
            percent={parseFloat(record.percentage || "0")}
            size={36}
            strokeWidth={10}
            strokeColor={getScoreColor(record.score)}
            trailColor={theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}
            format={() => (
              <span className="text-[10px] font-bold" style={{ color: getScoreColor(record.score) }}>
                {getGradeText(record.score)}
              </span>
            )}
          />
          <div>
            <div className="font-bold text-sm" style={{ color: getScoreColor(record.score) }}>
              {record.score} ball
            </div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              {record.percentage}%
            </div>
          </div>
        </div>
      ),
      width: 180,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <FileTextOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Izoh</span>
        </div>
      ),
      dataIndex: "comments",
      key: "comments",
      render: (comments: string) => (
        <div className="text-xs text-gray-400 font-medium max-w-[150px] truncate" title={comments}>
          {comments || "Izoh yo&apos;q"}
        </div>
      ),
      width: 180,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <CheckCircleOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Status</span>
        </div>
      ),
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean, record: ApplicantMark) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
            }`}>
            {isActive ? "Faol" : "Bekor"}
          </span>
          <Button
            className={`w-6 h-6 rounded-lg flex items-center justify-center border-0 bg-transparent transition-all duration-300 ${isActive ? "text-red-400 hover:bg-red-500/10 hover:text-red-500" : "text-green-400 hover:bg-green-500/10 hover:text-green-500"
              }`}
            size="small"
            onClick={() => toggleMarkStatus(record)}
            icon={isActive ? <DeleteOutlined style={{ fontSize: "12px" }} /> : <CheckCircleOutlined style={{ fontSize: "12px" }} />}
          />
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
      render: (_: unknown, record: ApplicantMark) => (
        <div className="flex items-center justify-center gap-2 py-2">
          <Button
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#7367f0]/10 text-[#7367f0] border-0 hover:bg-[#7367f0] hover:text-white transition-all duration-300 shadow-sm"
            icon={<EditOutlined style={{ fontSize: "18px" }} />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="O&apos;chirish"
            description="Haqiqatan ham o&apos;chirmoqchimisiz?"
            onConfirm={() => handleDelete(record)}
            okText="Ha"
            cancelText="Yo&apos;q"
            overlayClassName="premium-popconfirm"
          >
            <Button
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 border-0 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
              icon={<DeleteOutlined style={{ fontSize: "18px" }} />}
            />
          </Popconfirm>
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
            Baholar Boshqaruvi
          </Title>
          <div className="text-gray-400 text-sm font-medium">Abituriyentlarga baho qo&apos;yish va natijalarni boshqarish</div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRecord(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
            className="h-[42px] px-6 rounded-xl border-0 shadow-lg font-bold flex items-center gap-2"
            style={{
              background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
              boxShadow: "0 8px 25px -8px #7367f0",
            }}
          >
            Baho qo&apos;shish
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Jami baholar", value: statistics.total_marks, icon: <StarOutlined />, color: "#7367f0" },
          { title: "O'rtacha ball", value: statistics.average_score, icon: <TrophyOutlined />, color: "#28c76f" },
          { title: "O'tganlar", value: statistics.passed_count, icon: <CheckCircleOutlined />, color: "#00cfe8" },
          { title: "Yiqilganlar", value: statistics.failed_count, icon: <DeleteOutlined />, color: "#ea5455" },
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
        <div className="px-6 py-4">
          <Alert
            message="E&apos;tibor bering"
            description="Baholar tizimi hozirda test rejimida ishlamoqda. Ko&apos;rsatilgan ma&apos;lumotlar namunaviy hisoblanadi."
            type="info"
            showIcon
            className="rounded-xl mb-4 border-0"
            style={{ background: theme === "dark" ? "rgba(115, 103, 240, 0.1)" : "#f0f0ff" }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={marks as unknown as ApplicantMark[]}
          rowKey="id"
          className="custom-admin-table"
          pagination={{
            total: totalCount,
            pageSize: 20,
            showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} dan ${total} ta`,
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
          
          .premium-modal .ant-modal-content {
            background: ${theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
            border: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "none"} !important;
            border-radius: 16px !important;
          }
          .premium-modal .ant-modal-header {
            background: transparent !important;
            border-bottom: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)"} !important;
          }
          .premium-modal .ant-modal-title {
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
          }
          .premium-modal .ant-form-item-label > label {
            color: ${theme === "dark" ? "#94a3b8" : "#64748b"} !important;
          }
          .premium-modal .ant-input, .premium-modal .ant-select-selector, .premium-modal .ant-input-number {
            background: ${theme === "dark" ? "rgb(30, 38, 60)" : "#f8f8f8"} !important;
            border: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#484650"} !important;
            border-radius: 12px !important;
          }
          .premium-popconfirm .ant-popover-inner {
            background: ${theme === "dark" ? "rgb(50, 58, 80)" : "#ffffff"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
          }
        `}</style>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        title={editingRecord ? "Bahoni tahrirlash" : "Yangi baho qo&apos;shish"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        className="premium-modal"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ is_active: true }}
        >
          <Form.Item
            name="submission"
            label="Ariza"
            rules={[{ required: true, message: "Arizani tanlang" }]}
          >
            <Select placeholder="Arizani tanlang">
              {/* This would need submission data */}
            </Select>
          </Form.Item>

          <Form.Item
            name="score"
            label="Ball (0-100)"
            rules={[
              { required: true, message: "Ballni kiriting" },
              { type: 'number', min: 0, max: 100, message: 'Ball 0-100 orasida bo\'lishi kerak' }
            ]}
          >
            <InputNumber
              placeholder="Ballni kiriting"
              style={{ width: '100%' }}
              min={0}
              max={100}
            />
          </Form.Item>

          <Form.Item
            name="comments"
            label="Izohlar"
          >
            <Input.TextArea
              placeholder="Qo'shimcha izohlar"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}