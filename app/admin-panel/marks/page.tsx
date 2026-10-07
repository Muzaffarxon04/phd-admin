"use client";

import { useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Progress,
  Avatar,
} from "antd";
import { useThemeStore } from "@/lib/stores/themeStore";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StarOutlined,
  UserOutlined,
  FileTextOutlined,
  SolutionOutlined,
  TrophyOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  PercentageOutlined
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marksApi, ApplicantMark, ApplicantMarkCreate, ApplicantMarkUpdate } from "@/lib/api/marks";
import { adminApi, type ApplicationSubmissionListResponse } from "@/lib/api/admin";
import {
  AdminCard,
  DonutChart,
  HorizontalBarChart,
  PageHeader,
  ResponsiveModal,
  ResponsiveTable,
  StatCard,
  StatGrid,
} from "@/components/admin/ui";

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

  // Fetch approved submissions for Select
  const { data: submissionsData } = useQuery({
    queryKey: ["approved-submissions-list"],
    queryFn: () => adminApi.getApprovedSubmissions(),
  });

  type SubItem = { id: number | string; status?: string; submission_number?: string; applicant_name?: string; applicant?: { full_name?: string; pinfl?: string } };
  const submissionsList: SubItem[] = Array.isArray((submissionsData as unknown as { data?: { data?: SubItem[] } })?.data?.data)
    ? (submissionsData as unknown as { data: { data: SubItem[] } }).data.data
    : Array.isArray((submissionsData as ApplicationSubmissionListResponse)?.results)
      ? ((submissionsData as ApplicationSubmissionListResponse).results as unknown as SubItem[])
      : [];

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


  const getSpecialityInfo = (record: ApplicantMark) => {
    const details = record.submission_details as unknown as {
      speciality_name?: string;
      speciality?: { name?: string; parent?: { name?: string } };
      speciality_parent_name?: string;
      application_title?: string;
    } | undefined;
    const baseName =
      details?.speciality_name ||
      details?.speciality?.name ||
      "-";
    const parentName =
      details?.speciality?.parent?.name ||
      details?.speciality_parent_name ||
      "";
    const displayName = parentName ? `${baseName} (${parentName})` : baseName;
    return { displayName, applicationTitle: details?.application_title || "-" };
  };

  const renderScore = (record: ApplicantMark) => (
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
        <div className="font-bold text-sm whitespace-nowrap" style={{ color: getScoreColor(record.score) }}>
          {record.score} ball
        </div>
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
          {record.percentage || record.score}%
        </div>
      </div>
    </div>
  );

  const renderStatus = (isActive: boolean) => (
    <span className={`inline-block whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
      }`}>
      {isActive ? "Faol" : "Bekor"}
    </span>
  );

  const renderActions = (record: ApplicantMark) => (
    <div className="flex items-center justify-center gap-2 py-2">
      <Button
        aria-label="Tahrirlash"
        className="marks-action-btn marks-action-btn--edit"
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
          aria-label="O'chirish"
          className="marks-action-btn marks-action-btn--delete"
          icon={<DeleteOutlined style={{ fontSize: "18px" }} />}
          loading={deleteMutation.isPending && deleteMutation.variables === record.id.toString()}
        />
      </Popconfirm>
    </div>
  );

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
      render: (_: unknown, record: ApplicantMark) => {
        const { displayName, applicationTitle } = getSpecialityInfo(record);
        return (
          <div className="py-2">
            <div className="font-bold text-xs text-[#7367f0] mb-1">
              {displayName}
            </div>
            <div className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">
              {applicationTitle}
            </div>
          </div>
        );
      },
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
      render: (_: unknown, record: ApplicantMark) => renderScore(record),
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
      render: (isActive: boolean) => <div className="flex items-center gap-2">{renderStatus(isActive)}</div>,
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
      render: (_: unknown, record: ApplicantMark) => renderActions(record),
    },
  ];

  const renderMarkCard = (record: ApplicantMark) => {
    const { displayName, applicationTitle } = getSpecialityInfo(record);
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar
            icon={<UserOutlined />}
            className="shrink-0"
            style={{ backgroundColor: theme === "dark" ? "#7367f020" : "#7367f010", color: "#7367f0" }}
          />
          <div className="min-w-0 flex-1">
            <div className="admin-heading font-semibold text-[14px] leading-snug break-words">
              {record.submission_details?.applicant_name || "Noma'lum"}
            </div>
            <div className="admin-muted font-mono text-[12px]">
              {record.submission_details?.submission_number || `ID: ${record.submission}`}
            </div>
          </div>
          {renderStatus(record.is_active)}
        </div>
        <div className="text-[13px] leading-snug">
          <div className="font-semibold text-[#7367f0] break-words">{displayName}</div>
          <div className="admin-muted text-[12px] break-words">{applicationTitle}</div>
        </div>
        {record.comments ? <div className="admin-muted text-[12px] break-words">{record.comments}</div> : null}
        <div
          className="flex items-center justify-between gap-3 pt-2"
          style={{ borderTop: "1px solid var(--admin-border)" }}
        >
          {renderScore(record)}
          {renderActions(record)}
        </div>
      </div>
    );
  };

  const statItems = statistics
    ? [
        { title: "O'rtacha ball", value: statistics.average_score != null ? Number(statistics.average_score).toFixed(1) : "0", icon: <TrophyOutlined />, color: "#28c76f" },
        { title: "O'rtacha foiz", value: statistics.average_percentage ? `${statistics.average_percentage}%` : "0%", icon: <PercentageOutlined />, color: "#ff9f43" },
        { title: "Eng yuqori ball", value: statistics.highest_score || "0", icon: <RiseOutlined />, color: "#28c76f" },
        { title: "Eng past ball", value: statistics.lowest_score || "0", icon: <FallOutlined />, color: "#ea5455" },
        { title: "Tasdiqlangan baholar", value: statistics.approved_marks || 0, icon: <CheckCircleOutlined />, color: "#00cfe8" },
        { title: "Kutilayotgan baholar", value: statistics.pending_marks || 0, icon: <ClockCircleOutlined />, color: "#ff9f43" },
        { title: "Jami baholar", value: statistics.total_marks || 0, icon: <StarOutlined />, color: "#7367f0" },
      ]
    : [];

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Baholar Boshqaruvi"
        subtitle="Abituriyentlarga baho qoyish va natijalarni boshqarish"
        actions={
          <Button
            size="large"
            icon={<BarChartOutlined />}
            onClick={() => setIsStatsModalOpen(true)}
            className="font-semibold"
          >
            Statistika
          </Button>
        }
      />

      {/* Statistics in Modal */}
      <ResponsiveModal
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
          <div className="space-y-4 sm:space-y-6 py-2">
            {/* Main Statistics */}
            <StatGrid columns={4}>
              {statItems.map((stat) => (
                <StatCard key={stat.title} label={stat.title} value={stat.value} icon={stat.icon} color={stat.color} variant="sunken" />
              ))}
            </StatGrid>

            {/* Active / Inactive — Pie chart (by_mark_type tepasida) */}
            {(() => {
              const statsRecord = statistics as { active_marks?: number; inactive_marks?: number };
              let active = Number(statsRecord.active_marks);
              let inactive = Number(statsRecord.inactive_marks);
              if (!Number.isFinite(active)) active = 0;
              if (!Number.isFinite(inactive)) inactive = 0;
              if (active === 0 && inactive === 0 && marksData?.results?.length) {
                active = marksData.results.filter((m) => m.is_active === true).length;
                inactive = marksData.results.filter((m) => m.is_active === false).length;
              }
              const pieData = [
                { name: "Faol (active)", value: active, color: "#52c41a" },
                { name: "Nofaol (inactive)", value: inactive, color: "#8b8b8b" },
              ].filter((d) => d.value > 0);
              if (pieData.length === 0) return null;
              return (
                <AdminCard variant="sunken" title="Faol / Nofaol baholar">
                  <DonutChart
                    data={pieData}
                    legend="side"
                    showSliceLabels
                    sliceLabel={(name, percent) => `${name.split(" ")[0] || "—"} ${(percent * 100).toFixed(0)}%`}
                  />
                </AdminCard>
              );
            })()}

            {/* By Mark Type — alohida chart */}
            {statistics.by_mark_type && Object.keys(statistics.by_mark_type).length > 0 && (() => {
              const byMarkTypeChartData = Object.entries(statistics.by_mark_type).map(([name, value]) => ({
                name: name.length > 32 ? `${name.slice(0, 29)}…` : name,
                fullName: name,
                value: Number(value) || 0,
              })).filter((d) => d.value > 0);
              return (
                <AdminCard
                  variant="sunken"
                  icon={<BarChartOutlined />}
                  title="Baholar turi bo'yicha"
                  subtitle="Alohida diagramma — har bir tur bo'yicha son"
                >
                  <HorizontalBarChart data={byMarkTypeChartData} color="#7367f0" valueLabel="Baholar soni" maxHeight={400} />
                </AdminCard>
              );
            })()}
          </div>
        )}
      </ResponsiveModal>

      <AdminCard padding="none" className="overflow-hidden">
        <ResponsiveTable<ApplicantMark>
          columns={columns}
          dataSource={marksData?.results || []}
          loading={isLoading}
          rowKey="id"
          className="custom-admin-table"
          renderCard={(record) => renderMarkCard(record)}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: marksData?.count || 0,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps ?? pageSize);
            },
            showSizeChanger: false,
            showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} dan ${total} ta`,
            className: "px-4 sm:px-6 py-4",
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
          }
          .premium-modal:not(.admin-sheet-modal) .ant-modal-content {
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
          .marks-action-btn.ant-btn {
            width: 40px;
            height: 40px;
            border: 0;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }
          @media (max-width: 639px) {
            .marks-action-btn.ant-btn {
              width: 44px;
              height: 44px;
            }
          }
          .marks-action-btn--edit.ant-btn {
            background: rgba(115, 103, 240, 0.1);
            color: #7367f0;
          }
          .marks-action-btn--edit.ant-btn:hover {
            background: #7367f0 !important;
            color: #fff !important;
          }
          .marks-action-btn--delete.ant-btn {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
          }
          .marks-action-btn--delete.ant-btn:hover {
            background: #ef4444 !important;
            color: #fff !important;
          }
        `}</style>
      </AdminCard>

      {/* Create/Edit Modal */}
      <ResponsiveModal
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
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              disabled={!!editingRecord}
              options={submissionsList.map((sub) => {
                const label = sub.applicant?.full_name != null
                  ? `${sub.applicant.full_name}${sub.applicant.pinfl ? ` (${sub.applicant.pinfl})` : ""}`
                  : `${sub.applicant_name ?? "Ariza"} #${sub.submission_number ?? sub.id}`;
                return { value: Number(sub.id), label };
              })}
            />
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
      </ResponsiveModal>
    </div>
  );
}
