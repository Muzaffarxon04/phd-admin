"use client";

import { useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Progress,
  Avatar,
  Typography,
} from "antd";
const { Title } = Typography;
import { useThemeStore } from "@/lib/stores/themeStore";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StarOutlined,
  UserOutlined,
  FileTextOutlined,
  SolutionOutlined,
  TrophyOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marksApi, ApplicantMark, ApplicantMarkCreate, ApplicantMarkUpdate } from "@/lib/api/marks";
import { adminApi } from "@/lib/api/admin";

const { Option } = Select;

export default function MarksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ApplicantMark | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Pagination and Filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Fetch Marks
  const { data: marksData, isLoading } = useQuery({
    queryKey: ["marks", page, pageSize],
    queryFn: () => marksApi.getMarks(page, pageSize),
  });

  // Fetch Statistics
  const { data: statistics } = useQuery({
    queryKey: ["marks-statistics"],
    queryFn: () => marksApi.getMarksStatistics(),
  });

  // Fetch Submissions for Select
  const { data: submissionsData } = useQuery({
    queryKey: ["submissions-list"],
    queryFn: () => adminApi.getSubmissions(1, 100), // Fetch 100 for now, improvement: use search/pagination in Select
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: ApplicantMarkCreate) => marksApi.createMark(data),
    onSuccess: () => {
      message.success("Baho muvaffaqiyatli qo'shildi");
      setIsModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["marks"] });
      queryClient.invalidateQueries({ queryKey: ["marks-statistics"] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Xatolik yuz berdi");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApplicantMarkUpdate }) =>
      marksApi.updateMark(id, data),
    onSuccess: () => {
      message.success("Baho muvaffaqiyatli yangilandi");
      setIsModalOpen(false);
      setEditingRecord(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["marks"] });
      queryClient.invalidateQueries({ queryKey: ["marks-statistics"] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Xatolik yuz berdi");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => marksApi.deleteMark(id),
    onSuccess: () => {
      message.success("Baho o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["marks"] });
      queryClient.invalidateQueries({ queryKey: ["marks-statistics"] });
    },
    onError: (error: Error) => {
      message.error(error.message || "O'chirishda xatolik yuz berdi");
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      marksApi.patchMark(id, { is_active: isActive }),
    onSuccess: () => {
      message.success("Status o'zgartirildi");
      queryClient.invalidateQueries({ queryKey: ["marks"] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Statusni o'zgartirishda xatolik");
    }
  });

  const handleCreate = () => {
    form.validateFields().then((values) => {
      const payload: ApplicantMarkCreate = {
        submission: values.submission,
        score: values.score.toString(),
        comments: values.comments
      };
      createMutation.mutate(payload);
    });
  };

  const handleUpdate = () => {
    form.validateFields().then((values) => {
      if (editingRecord) {
        const payload: ApplicantMarkUpdate = {
          score: values.score.toString(),
          comments: values.comments,
          is_active: values.is_active
        };
        updateMutation.mutate({ id: editingRecord.id.toString(), data: payload });
      }
    });
  };

  const handleDelete = (record: ApplicantMark) => {
    deleteMutation.mutate(record.id.toString());
  };

  const toggleMarkStatus = (record: ApplicantMark) => {
    toggleStatusMutation.mutate({
      id: record.id.toString(),
      isActive: !record.is_active
    });
  };

  const openEditModal = (record: ApplicantMark) => {
    setEditingRecord(record);
    form.setFieldsValue({
      submission: record.submission,
      score: parseFloat(record.score),
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
              {record.submission_details?.applicant_name || "Noma'lum"}
            </span>
            <span className="text-xs text-gray-400 font-medium font-mono">
              {record.submission_details?.submission_number || `ID: ${record.submission}`}
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
            {record.submission_details?.speciality_name || "-"}
          </div>
          <div className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">
            {record.submission_details?.application_title || "-"}
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
            percent={record.percentage ? parseFloat(record.percentage) : parseFloat(record.score)}
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
              {record.percentage || record.score}%
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
          {comments || "Izoh yo'q"}
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
            loading={toggleStatusMutation.isPending}
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
            title="O'chirish"
            description="Haqiqatan ham o'chirmoqchimisiz?"
            onConfirm={() => handleDelete(record)}
            okText="Ha"
            cancelText="Yo'q"
            overlayClassName="premium-popconfirm"
          >
            <Button
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 border-0 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
              icon={<DeleteOutlined style={{ fontSize: "18px" }} />}
              loading={deleteMutation.isPending && deleteMutation.variables === record.id.toString()}
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
          <div className="text-gray-400 text-sm font-medium">Abituriyentlarga baho qoyish va natijalarni boshqarish</div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="h-[42px] px-6 rounded-xl border-0 shadow-sm font-bold flex items-center gap-2 transition-all duration-300 hover:shadow-md"
            icon={<BarChartOutlined />}
            onClick={() => setIsStatsModalOpen(true)}
            style={{
              background: theme === "dark" ? "rgb(60, 68, 90)" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#484650",
              border: theme === "dark" ? "1px solid rgb(80, 88, 110)" : "1px solid #e2e8f0",
            }}
          >
            Statistika
          </Button>

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
            Baho qoyish
          </Button>
        </div>
      </div>

      {/* Statistics in Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BarChartOutlined className="text-[#7367f0]" />
            <span>Baholar Statistikasi</span>
          </div>
        }
        open={isStatsModalOpen}
        onCancel={() => setIsStatsModalOpen(false)}
        footer={null}
        width={1000}
        className="premium-modal"
      >
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-4">
            {[
              { title: "Jami baholar", value: statistics.total_marks || 0, icon: <StarOutlined />, color: "#7367f0" },
              { title: "O'rtacha ball", value: statistics.average_score || "0", icon: <TrophyOutlined />, color: "#28c76f" },
              { title: "O'tganlar", value: statistics.passed_count || 0, icon: <CheckCircleOutlined />, color: "#00cfe8" },
              { title: "Yiqilganlar", value: statistics.failed_count || 0, icon: <DeleteOutlined />, color: "#ea5455" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="rounded-xl p-6 transition-all duration-300"
                style={{
                  background: theme === "dark" ? "rgb(30, 38, 60)" : "#f8f9fa",
                  border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
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
        )}
      </Modal>

      <div
        className="rounded-xl overflow-hidden transition-all duration-300"
        style={{
          background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
          border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
          boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Table
          columns={columns}
          dataSource={marksData?.results || []}
          loading={isLoading}
          rowKey="id"
          className="custom-admin-table"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: marksData?.count || 0,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
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
        title={editingRecord ? "Bahoni tahrirlash" : "Yangi baho qo'shish"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Bekor qilish
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={editingRecord ? handleUpdate : handleCreate}
            className="bg-[#7367f0] hover:bg-[#7367f0]/90"
          >
            {editingRecord ? "Saqlash" : "Qo'shish"}
          </Button>,
        ]}
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
            <Select
              placeholder="Arizani tanlang"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
              }
              disabled={!!editingRecord}
            >
              {submissionsData?.results?.map((sub) => (
                <Option key={sub.id} value={parseInt(sub.id)}>
                  {sub.applicant.full_name} ({sub.applicant.pinfl})
                </Option>
              ))}
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
              step={0.1}
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

          {editingRecord && (
            <Form.Item
              name="is_active"
              label="Status"
              valuePropName="checked"
            >
              <Select>
                <Option value={true}>Faol</Option>
                <Option value={false}>Nofaol</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}