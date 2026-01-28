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
  Typography
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StarOutlined,
  UserOutlined,
  // BookOutlined,
} from "@ant-design/icons";
// import { useGet, usePost, usePut, useDelete } from "@/lib/hooks";
import type {
  ApplicantMark,
  // ApplicantMarkCreate,
  // ApplicantMarkUpdate,
  // MarksStatistics,
} from "@/lib/api/marks";
import { formatDate } from "@/lib/utils";

const { Title, Text } = Typography;
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
    form.validateFields().then((values) => {
      console.log('Form values:', values);
      message.success("Baho muvaffaqiyatli qo'shildi");
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const handleUpdate = () => {
    form.validateFields().then((values) => {
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

  const columns = [
    {
      title: "Abituriyent",
      dataIndex: "submission_details",
      key: "applicant",
      render: (details: { applicant_name: string; submission_number: string }) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} size="small" className="shrink-0"/>
          <div>
            <div className="font-medium">{details?.applicant_name}</div>
            <div className="text-xs text-gray-500">
              {details?.submission_number}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Mutaxassislik",
      dataIndex: "submission_details",
      key: "speciality",
      render: (details: { speciality_name: string; application_title: string }) => (
        <div>
          <div className="font-medium">{details?.speciality_name}</div>
          <div className="text-xs text-gray-500">
            {details?.application_title}
          </div>
        </div>
      ),
    },
    {
      title: "Ball",
      dataIndex: "score",
      key: "score",
      render: (score: string, record: ApplicantMark) => (
        <div className="flex items-center gap-2">
          <Progress
            type="circle"
            percent={parseFloat(record.percentage || "0")}
            size={40}
            strokeColor={getScoreColor(score)}
            format={() => getGradeText(score)}
          />
          <div>
            <div className="font-bold text-lg" style={{ color: getScoreColor(score) }}>
              {score}
            </div>
            <div className="text-xs text-gray-500">
              {record.percentage}%
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Izohlar",
      dataIndex: "comments",
      key: "comments",
      ellipsis: true,
      render: (comments: string) => (
        <div title={comments}>
          <Text ellipsis style={{ maxWidth: 150 }}>
            {comments || "Izoh yo'q"}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean, record: ApplicantMark) => (
        <Space>
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Faol" : "Bekor qilingan"}
          </Tag>
          <Button
            type="text"
            size="small"
            onClick={() => toggleMarkStatus(record)}
            icon={isActive ? <DeleteOutlined /> : <CheckCircleOutlined />}
            title={isActive ? "Bekor qilish" : "Faollashtirish"}
          />
        </Space>
      ),
    },
    {
      title: "Baholagan",
      dataIndex: "marked_by",
      key: "marked_by",
      render: (markedBy: number) => (
        <div className="text-sm text-gray-600">
          Imtihonchi #{markedBy}
        </div>
      ),
    },
    {
      title: "Sana",
      dataIndex: "marked_at",
      key: "marked_at",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_itm:string, record: ApplicantMark) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Haqiqatan ham o'chirmoqchimisiz?"
            onConfirm={() => handleDelete(record)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
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
          { title: "Baholar" },
        ]}
        className="mb-4"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="mb-2">Baholar Boshqaruvi</Title>
          <p className="text-gray-600">Abituriyentlarga baho qoyish va boshqarish</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingRecord(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Baho qoshish
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Jami baholar"
              value={statistics.total_marks}
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="O'rtacha ball"
              value={statistics.average_score}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="O'tganlar"
              value={statistics.passed_count}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Yiqilganlar"
              value={statistics.failed_count}
              prefix={<DeleteOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <Alert
          message="Diqqat"
          description="Baholar API'si hali to'liq amalga oshirilmagan. Namuna ma'lumotlar ko'rsatilmoqda."
          type="warning"
          showIcon
          className="mb-4"
        />
        <Table
          columns={columns}
          dataSource={marks as unknown as ApplicantMark[]}
          rowKey="id"
          pagination={{
            total: totalCount,
            pageSize: 20,
            showSizeChanger: false,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingRecord ? "Bahoni tahrirlash" : "Yangi baho"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        onOk={editingRecord ? handleUpdate : handleCreate}
        width={600}
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