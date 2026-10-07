"use client";

import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Tag,
  Modal,
  Form,
  Select,
  Switch,
  message,
  Avatar,
  Pagination,
  Skeleton,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  SolutionOutlined,
  ClusterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ProjectOutlined,
  BookOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { formatDateTime } from "@/lib/utils";
import { useGet, usePost, useDelete } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import type { Examiner, Speciality } from "@/types";
import type { ExaminerWorkloadResponse, ExaminerStatistics } from "@/lib/api/examiner";
import { EmptyState } from "@/components/EmptyState";
import {
  AdminCard,
  AdminListStyles,
  PageHeader,
  useAdminSurface,
  useIsAdminMobile,
} from "@/components/admin/submissions/AdminUi";
import { FormActions } from "@/components/admin/submissions/FormActions";
import { ExaminerRowActions } from "@/components/admin/examiners/ExaminerRowActions";

const { Option } = Select;

export default function ExaminersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExaminer, setEditingExaminer] = useState<Examiner | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsExaminerId, setStatsExaminerId] = useState<string | null>(null);
  const [isWorkloadModalOpen, setIsWorkloadModalOpen] = useState(false);
  const [workloadExaminerId, setWorkloadExaminerId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Fetch examiners
  const { data: examinersData, refetch: refetchExaminers, isLoading } = useGet<{
    total_elements: number;
    next: string | null;
    previous: string | null;
    page_size: string
    to: number
    from: number
    data: {
      data: Examiner[]
    };
  }>(`/examiner/list/?page=${currentPage}&page_size=${pageSize}&is_active=${isActive}`);

  // Fetch specialities for dropdown
  const { data: specialities } = useGet<{
    data: { data: Speciality[] };
    total_elements: number;
    next: string | null;
    previous: string | null;
    page_size: string
    to: number
    from: number;
  }>("/speciality/list/?page_size=1000&is_active=true");

  // Fetch examiner statistics
  const { data: examinerStats, isLoading: isStatsLoading } = useGet<{ data: ExaminerStatistics }>(
    statsExaminerId ? `/examiner/${statsExaminerId}/statistics/` : "",
    { enabled: !!statsExaminerId }
  );

  // Fetch examiner workload
  const { data: workloadData, isLoading: isWorkloadLoading } = useGet<ExaminerWorkloadResponse>(
    workloadExaminerId ? `/examiner/${workloadExaminerId}/workload/` : "",
    { enabled: !!workloadExaminerId }
  );

  const examiners = examinersData?.data?.data || [];
  const specialitiesList = specialities?.data?.data
  const workloadDataContent = workloadData?.data;
  const workloadStats = workloadDataContent?.workload;
  const workloadAssignments = workloadDataContent?.assignments;

  // Mutations
  const createExaminer = usePost("/examiner/create/", {
    onSuccess: () => {
      message.success("Imtihonchi muvaffaqiyatli yaratildi");
      setIsModalOpen(false);
      form.resetFields();
      refetchExaminers();
    },
    onError: (error) => {
      let errorMessage = error.message || "Xatolik yuz berdi";

      // Agar backenddan array formatida error kelgan bo'lsa
      const errorData = (error as { data?: unknown }).data;
      if (Array.isArray(errorData)) {
        errorMessage = errorData.join(", ");
      }

      message.error(errorMessage);
    },
  });

  const updateExaminer = usePost(`/examiner/${editingExaminer?.id}/update/`, {
    onSuccess: () => {
      message.success("Imtihonchi muvaffaqiyatli yangilandi");
      setIsModalOpen(false);
      setEditingExaminer(null);
      form.resetFields();
      refetchExaminers();
    },
    onError: (error) => {
      let errorMessage = error.message || "Xatolik yuz berdi";

      // Agar backenddan array formatida error kelgan bo'lsa
      const errorData = (error as { data?: unknown }).data;
      if (Array.isArray(errorData)) {
        errorMessage = errorData.join(", ");
      }

      message.error(errorMessage);
    },
  });

  const deleteExaminer = useDelete(`/examiner/${editingExaminer?.id}/delete/`, {
    onSuccess: () => {
      message.success("Imtihonchi muvaffaqiyatli o'chirildi");
      refetchExaminers();
    },
    onError: (error) => {
      console.log(error);

      let errorMessage = error.message || "Xatolik yuz berdi";

      // Agar backenddan array formatida error kelgan bo'lsa
      const errorData = (error as { data?: unknown }).data;
      if (Array.isArray(errorData)) {
        errorMessage = errorData.join(", ");
      }

      message.error(errorMessage);
    },
  });

  const handleCreate = () => {
    setEditingExaminer(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (examiner: Examiner) => {
    setEditingExaminer(examiner);
    form.setFieldsValue({
      full_name: examiner.full_name,
      title: examiner.title,
      specialization_ids: examiner.specialization_ids
        ? [examiner.specialization_ids]
        : [],
      department: examiner.department,
      is_active: examiner.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setEditingExaminer({ id } as Examiner);
    await deleteExaminer.mutateAsync();
  };

  const handleSubmit = (values: Record<string, unknown>) => {
    if (editingExaminer) {
      updateExaminer.mutate(values);
    } else {
      createExaminer.mutate(values);
    }
  };


  const { theme } = useThemeStore();
  const surface = useAdminSurface();
  const isMobile = useIsAdminMobile();

  const openStats = (id: string) => {
    setStatsExaminerId(id);
    setIsStatsModalOpen(true);
  };

  const openWorkload = (id: string) => {
    setWorkloadExaminerId(id);
    setIsWorkloadModalOpen(true);
  };

  const renderActions = (record: Examiner, size = 40, className?: string) => (
    <ExaminerRowActions
      size={size}
      className={className}
      onEdit={() => handleEdit(record)}
      onStats={() => openStats(record.id)}
      onWorkload={() => openWorkload(record.id)}
      onDelete={() => handleDelete(record.id)}
    />
  );

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2 py-3 px-4">
          <UserOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Imtihonchi F.I.O</span>
        </div>
      ),
      key: "name_info",
      render: (_: unknown, record: Examiner) => (
        <div className="flex items-center gap-3 ">
          <Avatar
            icon={<UserOutlined />}
            className="shrink-0 ring-2 ring-[#7367f0]/20"
            style={{ backgroundColor: theme === "dark" ? "#7367f020" : "#7367f010", color: "#7367f0" }}
          />
          <div className="flex flex-col">
            <span className={`font-bold text-sm ${theme === "dark" ? "text-gray-200" : "text-[#484650]"}`}>
              {record.full_name
              } 
            </span>
            <span className="text-xs text-gray-400 font-medium">#{record.id}</span>
          </div>
        </div>
      ),
     
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <SolutionOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Ilmiy unvon</span>
        </div>
      ),
      dataIndex: "title",
      key: "title",
      render: (title: string) => (
        <span className="inline-block px-2 py-px rounded-lg bg-purple-500/10 text-purple-500 text-[10px]! font-bold uppercase border border-purple-500/20 whitespace-normal wrap-break-word max-w-full">
          {title}
        </span>
      ),
      width: 360,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <ClusterOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Lavozim</span>
        </div>
      ),
      dataIndex: "department",
      key: "department",
      render: (department: string) => (
        <div className="text-xs font-medium whitespace-normal wrap-break-word" style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
          {department}
        </div>
      ),
      width: 200,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <StarOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Faollik</span>
        </div>
      ),
      key: "activity",
      render: (_: unknown, record: Examiner) => (
        <div className="flex flex-col gap-1 py-1">
          <div className="text-[10px] flex items-center gap-1">
            <span className="text-green-500 font-bold uppercase tracking-tighter">Ko&apos;rilgan:</span>
            <span className="font-bold">{record.reviews_count || 0}</span>
          </div>
          <div className="text-[10px] flex items-center gap-1">
            <span className="text-orange-500 font-bold uppercase tracking-tighter">Kutilayotgan:</span>
            <span className="font-bold">{record.pending_reviews || 0}</span>
          </div>
        </div>
      ),
      width: 180,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <CheckCircleOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Holati</span>
        </div>
      ),
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) => (
        <div className="py-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
            }`}>
            {isActive ? "Faol" : "Nofaol"}
          </span>
        </div>
      ),
      width: 120,
    },
    {
      title: (
        <div className="flex items-center justify-center py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Amallar</span>
        </div>
      ),
      key: "actions",
      width: 210,
      fixed: "right" as const,
      render: (_: unknown, record: Examiner) => renderActions(record),
    },
  ];

  const filteredExaminers = examiners.filter(examiner =>
    examiner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    examiner.department?.toLowerCase().includes(searchTerm.toLowerCase()) || examiner.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusPill = (active: boolean) => (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${active ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
      }`}>
      {active ? "Faol" : "Nofaol"}
    </span>
  );


  return (
    <div className="space-y-5 sm:space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
      <AdminListStyles />

      {/* Page Header */}
      <PageHeader
        title="Imtihonchilar Boshqaruvi"
        subtitle="PhD imtihonlarida qatnashuvchi imtihonchilarni boshqarish"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="!h-[42px] max-md:!h-11 w-full lg:w-auto px-6 !rounded-xl !border-0 shadow-lg font-bold flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
              boxShadow: "0 8px 25px -8px #7367f0",
            }}
          >
            Yangi imtihonchi
          </Button>
        }
      />

      <AdminCard className="overflow-hidden">
        <div className="p-4 sm:p-6 border-b" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="relative w-full sm:max-w-md flex-1">
              <Input
                allowClear
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder="Imtihonchi nomini qidiring..."
                className="!h-10 max-md:!h-11 w-full !rounded-xl transition-all duration-300"
                style={{
                  background: theme === "dark" ? "rgb(30, 38, 60)" : "#f8f8f8",
                  border: "none",
                  color: theme === "dark" ? "#ffffff" : "#484650",
                }}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-medium" style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
                {isActive ? "Faollar" : "Nofaollar"}
              </span>
              <Switch
                checked={isActive}
                onChange={(val) => {
                  setIsActive(val);
                  setCurrentPage(1);
                }}
                style={{ background: isActive ? "#7367f0" : undefined }}
              />
            </div>
          </div>
        </div>

        {isMobile ? (
          <div className="p-3 space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl p-4" style={{ border: `1px solid ${surface.border}` }}>
                  <Skeleton active avatar paragraph={{ rows: 2 }} />
                </div>
              ))
            ) : filteredExaminers.length === 0 ? (
              <EmptyState />
            ) : (
              filteredExaminers.map((record) => (
                <div
                  key={record.id}
                  className="rounded-xl p-4"
                  style={{ background: surface.subtle, border: `1px solid ${surface.border}` }}
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      icon={<UserOutlined />}
                      className="shrink-0 ring-2 ring-[#7367f0]/20"
                      style={{ backgroundColor: theme === "dark" ? "#7367f020" : "#7367f010", color: "#7367f0" }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`font-bold text-sm break-words ${theme === "dark" ? "text-gray-200" : "text-[#484650]"}`}>
                          {record.full_name}
                        </span>
                        <span className="shrink-0">{statusPill(record.is_active)}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">#{record.id}</span>
                    </div>
                  </div>

                  {record.title ? (
                    <div className="mt-3">
                      <span className="inline-block px-2 py-px rounded-lg bg-purple-500/10 text-purple-500 text-[10px]! font-bold uppercase border border-purple-500/20 whitespace-normal wrap-break-word max-w-full">
                        {record.title}
                      </span>
                    </div>
                  ) : null}
                  {record.department ? (
                    <div className="mt-2 text-xs font-medium break-words" style={{ color: surface.muted }}>
                      {record.department}
                    </div>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                    <span>
                      <span className="text-green-500 font-bold uppercase">Ko&apos;rilgan:</span>{" "}
                      <span className="font-bold">{record.reviews_count || 0}</span>
                    </span>
                    <span>
                      <span className="text-orange-500 font-bold uppercase">Kutilayotgan:</span>{" "}
                      <span className="font-bold">{record.pending_reviews || 0}</span>
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t" style={{ borderColor: surface.divider }}>
                    {renderActions(record, 44, "flex items-center justify-between gap-2")}
                  </div>
                </div>
              ))
            )}
            {(examinersData?.total_elements || 0) > pageSize && (
              <div className="flex justify-center pt-1">
                <Pagination
                  className="admin-pagination"
                  total={examinersData?.total_elements || 0}
                  pageSize={pageSize}
                  current={currentPage}
                  showSizeChanger={false}
                  showLessItems
                  onChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size ?? 20);
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredExaminers}
            loading={isLoading}
            rowKey="id"
            className="custom-admin-table"
            scroll={{ x: 1000 }}
            pagination={{
              total: examinersData?.total_elements || 0,
              pageSize,
              current: currentPage,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total, range) => `${range[0]}-${range[1]} dan ${total} ta`,
              className: "!px-4 sm:!px-6 !py-4",
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size ?? 20);
              },
            }}
          />
        )}
        <style jsx global>{`
          .premium-modal .ant-form-item-label > label {
            color: ${theme === "dark" ? "#94a3b8" : "#64748b"} !important;
          }
          .premium-modal .ant-input, .premium-modal .ant-select-selector {
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
      </AdminCard>

      {/* Create/Edit Modal */}
      <Modal
        title={editingExaminer ? "Imtihonchini tahrirlash" : "Yangi imtihonchi qo'shish"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingExaminer(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
        className="premium-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ is_active: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="full_name"
              label="To'liq ism"
              rules={[{ required: true, message: "To'liq ismni kiriting" }]}
            >
              <Input placeholder="To'liq ism" />
            </Form.Item>
            <Form.Item
              name="title"
              label="Ilmiy unvon"
              rules={[{ required: true, message: "Ilmiy unvoni kiriting" }]}
            >
              <Input placeholder="Ilmiy unvon" />
            </Form.Item>

            <Form.Item
              name="department"
              label="Lavozim"
              rules={[{ required: true, message: "Lavozimni kiriting" }]}
            >
              <Input placeholder="Kafedra, Professor..." />
            </Form.Item>

            <Form.Item
              name="specialization_ids"
              label="Mutaxassisliklar"
              rules={[{ required: true, message: "Kamida bitta mutaxassislik tanlang" }]}
            >
              <Select
                mode="multiple"
                allowClear
                placeholder="Mutaxassisliklarni tanlang"
              >
                {specialitiesList?.map((speciality) => (
                  <Option key={speciality.id} value={speciality.id}>
                    {speciality.code} - {speciality.name}{speciality.is_foreign ? " (Chet tili)" : ""}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="is_active" label="Faollik" valuePropName="checked">
              <input type="checkbox" className="rounded" />
            </Form.Item>
          </div>

          <FormActions className="sm:!mt-6">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setEditingExaminer(null);
                form.resetFields();
              }}
            >
              Bekor qilish
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createExaminer.isPending || updateExaminer.isPending}
            >
              {editingExaminer ? "Yangilash" : "Yaratish"}
            </Button>
          </FormActions>
        </Form>
      </Modal>

      {/* Statistics Modal */}
      <Modal
        title="Imtihonchi Statistikasi"
        open={isStatsModalOpen}
        onCancel={() => {
          setIsStatsModalOpen(false);
          setStatsExaminerId(null);
        }}
        footer={null}
        width={700}
        className="premium-modal"
      >
        <div className="py-2 sm:py-4 overflow-y-auto max-h-[70vh] sm:max-h-[650px]">
          {isStatsLoading ? (
            <div className="flex justify-center py-8">
              <ClockCircleOutlined spin style={{ fontSize: 24, color: "#7367f0" }} />
            </div>
          ) : examinerStats?.data ? (
            <div className="space-y-6">
              {/* Examiner Info */}
              <Card size="small" className="text-center" style={{ background: theme === "dark" ? "rgba(115, 103, 240, 0.05)" : "#f8f9ff" }}>
                <div className="text-gray-400 text-xs mb-1">Imtihonchi</div>
                <div className="font-medium text-sm">{examinerStats.data.examiner.title}</div>
                <div className="text-xs text-gray-500 mt-1">{examinerStats.data.examiner.department}</div>
              </Card>

              {/* Period Info */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
            { !!examinerStats.data.period.start_date &&  <Card size="small" className="text-center" style={{ background: theme === "dark" ? "rgba(115, 103, 240, 0.05)" : "#f8f9ff" }}>
                  <div className="text-gray-400 text-xs mb-1">Boshlanish</div>
                  <div className="text-sm font-medium">
                    {examinerStats.data.period.start_date ? formatDateTime(examinerStats.data.period.start_date) : "-"}
                  </div>
                </Card>}
              { !!examinerStats.data.period.end_date &&  <Card size="small" className="text-center" style={{ background: theme === "dark" ? "rgba(115, 103, 240, 0.05)" : "#f8f9ff" }}>
                  <div className="text-gray-400 text-xs mb-1">Tugash</div>
                  <div className="text-sm font-medium">
                    {examinerStats.data.period.end_date ? formatDateTime(examinerStats.data.period.end_date) : "-"}
                  </div>
                </Card>}
              </div>

              {/* Assignments Statistics */}
              <div>
                <div className="text-sm font-medium mb-3 text-center">Topshiriqlar</div>
                <div className="grid grid-cols-1 gap-3">
                  <Card size="small" className="text-center" style={{ background: theme === "dark" ? "rgba(115, 103, 240, 0.05)" : "#f8f9ff" }}>
                    <div className="text-gray-400 text-xs mb-1">Jami topshiriqlar</div>
                    <div className="text-xl font-bold text-[#7367f0]">{examinerStats.data.assignments.total}</div>
                  </Card>

                  {examinerStats.data.assignments.by_speciality?.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-2">{"Mutaxassisliklar bo'yicha:"}</div>
                      {examinerStats.data.assignments.by_speciality.map((spec, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center gap-3 py-2 px-3 rounded-lg text-sm mb-2"
                          style={{ background: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)" }}
                        >
                          <span className="min-w-0 break-words">
                            <BookOutlined className="mr-2" />
                            {spec.speciality__code} - {spec.speciality__name}
                          </span>
                          <Tag color="blue">{spec.count}</Tag>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Statistics */}
              <div>
                <div className="text-sm font-medium mb-3 text-center">Ko&apos;rib chiqishlar</div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Card size="small" className="text-center" style={{ background: theme === "dark" ? "rgba(40, 199, 111, 0.05)" : "#f6fff9" }}>
                    <div className="text-gray-400 text-xs mb-1">Jami</div>
                    <div className="text-lg font-bold text-[#28c76f]">{examinerStats.data.reviews.total}</div>
                  </Card>
                  <Card size="small" className="text-center" style={{ background: theme === "dark" ? "rgba(255, 159, 67, 0.05)" : "#fffbf6" }}>
                    <div className="text-gray-400 text-xs mb-1">Kutilmoqda</div>
                    <div className="text-lg font-bold text-[#ff9f43]">{examinerStats.data.reviews.pending}</div>
                  </Card>
                  <Card size="small" className="text-center" style={{ background: theme === "dark" ? "rgba(115, 103, 240, 0.05)" : "#f8f9ff" }}>
                    <div className="text-gray-400 text-xs mb-1">Jarayonda</div>
                    <div className="text-lg font-bold text-[#7367f0]">{examinerStats.data.reviews.in_progress}</div>
                  </Card>
                  <Card size="small" className="text-center" style={{ background: theme === "dark" ? "rgba(40, 199, 111, 0.05)" : "#f6fff9" }}>
                    <div className="text-gray-400 text-xs mb-1">Tugagan</div>
                    <div className="text-lg font-bold text-[#28c76f]">{examinerStats.data.reviews.completed}</div>
                  </Card>
                </div>

           { !!examinerStats.data.reviews.average_score &&     <div className="rounded-xl p-4 text-center mt-4" style={{ background: theme === "dark" ? "rgba(115, 103, 240, 0.1)" : "#f4f3ff", border: "1px solid rgba(115, 103, 240, 0.2)" }}>
                  <div className="text-gray-400 text-xs mb-1">{"O'rtacha ball"}</div>
                  <div className="text-2xl font-bold text-[#7367f0]">
                    {examinerStats.data.reviews.average_score != null ? (
                      typeof examinerStats.data.reviews.average_score === "number"
                        ? examinerStats.data.reviews.average_score.toFixed(1)
                        : examinerStats.data.reviews.average_score
                    ) : "-"}
                  </div>
                </div>}
              </div>

              {/* Filters Info */}
              {(examinerStats.data.filters.application_id || examinerStats.data.filters.speciality_id) && (
                <div className="text-xs text-gray-500 text-center">
                  Filtrlar: {examinerStats.data.filters.application_id && `Ariza ID: ${examinerStats.data.filters.application_id}`}
                  {examinerStats.data.filters.application_id && examinerStats.data.filters.speciality_id && " | "}
                  {examinerStats.data.filters.speciality_id && `Mutaxassislik ID: ${examinerStats.data.filters.speciality_id}`}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Statistika ma&apos;lumotlari topilmadi
            </div>
          )}
        </div>
      </Modal>

      {/* Workload Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ProjectOutlined className="text-[#7367f0]" />
            <span>{"Imtihonchi Yuklamasi"}</span>
          </div>
        }
        open={isWorkloadModalOpen}
        onCancel={() => {
          setIsWorkloadModalOpen(false);
          setWorkloadExaminerId(null);
        }}
        footer={null}
        width={700}
        className="premium-modal"
      >
        <div className="py-2 sm:py-4 overflow-y-auto max-h-[70vh] sm:max-h-[650px]">
          {isWorkloadLoading ? (
            <div className="flex justify-center py-8">
              <ClockCircleOutlined spin style={{ fontSize: 24, color: "#7367f0" }} />
            </div>
          ) : workloadDataContent ? (
            <div className="space-y-6">
              {/* Examiner Info */}
              <Card size="small" className="text-center" style={{ background: theme === "dark" ? "rgba(115, 103, 240, 0.05)" : "#f8f9ff", marginBottom:16 }}>
                <div className="text-gray-400 text-xs mb-1">Imtihonchi</div>
                <div className="font-medium text-sm">{workloadDataContent.examiner.title}</div>
                <div className="text-xs text-gray-500 mt-1">{workloadDataContent.examiner.department}</div>
              </Card>

              {/* Workload Stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Card size="small" className="text-center" style={{ background: theme === "dark" ? "rgba(115, 103, 240, 0.05)" : "#f8f9ff" }}>
                  <div className="text-gray-400 text-xs mb-1">Jami biriktirilgan</div>
                  <div className="text-xl font-bold text-[#7367f0]">{workloadStats?.total_assignments || 0}</div>
                </Card>
                <Card size="small" className="text-center" style={{ background: theme === "dark" ? "rgba(40, 199, 111, 0.05)" : "#f6fff9" }}>
                  <div className="text-gray-400 text-xs mb-1">Yakunlangan</div>
                  <div className="text-xl font-bold text-[#28c76f]">{workloadStats?.completed_reviews || 0}</div>
                </Card>
                <Card size="small" className="text-center" style={{ background: theme === "dark" ? "rgba(255, 159, 67, 0.05)" : "#fffbf6" }}>
                  <div className="text-gray-400 text-xs mb-1">Jarayonda</div>
                  <div className="text-xl font-bold text-[#ff9f43]">{workloadStats?.in_progress_reviews || 0}</div>
                </Card>
                <Card size="small" className="text-center" style={{ background: theme === "dark" ? "rgba(234, 84, 85, 0.05)" : "#fff8f8" }}>
                  <div className="text-gray-400 text-xs mb-1">Kutilmoqda</div>
                  <div className="text-xl font-bold text-[#ea5455]">{workloadStats?.pending_reviews || 0}</div>
                </Card>
                <Card size="small" className="text-center col-span-2" style={{ background: theme === "dark" ? "rgba(115, 103, 240, 0.05)" : "#f8f9ff" }}>
                  <div className="text-gray-400 text-xs mb-1">Jami ko&apos;rib chiqishlar</div>
                  <div className="text-xl font-bold text-[#7367f0]">{workloadStats?.total_reviews || 0}</div>
                </Card>
              </div>

              {/* Assignments List */}
              {workloadAssignments && workloadAssignments.length > 0 && (
                <div>
                  <div className="font-bold mb-3 text-sm">Biriktirilganlar</div>
                  <div className="space-y-2">
                    {workloadAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-3 rounded-xl flex flex-col gap-2"
                        style={{ background: theme === "dark" ? "rgba(255, 255, 255, 0.03)" : "#f8f9fa" }}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium text-sm">{assignment.application.title}</span>
                          <Tag color="blue">{assignment.speciality.name}</Tag>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-gray-500">
                          <span>Biriktirilgan: {formatDateTime(assignment.assigned_at)}</span>
                          <span>Kutilmoqda: {assignment.pending_reviews}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Yuklama ma&apos;lumotlari topilmadi
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}