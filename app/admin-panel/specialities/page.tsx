"use client";

import { useState } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Pagination,
  Skeleton,
  Divider,
  Space,
  List,
  Avatar,
  Switch,
  Select,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  CodeOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { formatDateTime } from "@/lib/utils";
import { useGet, usePost, useDelete } from "@/lib/hooks";
import type { Speciality, SpecialityStatistics } from "@/types";
import { EmptyState } from "@/components/EmptyState";
import {
  AdminTableStyles,
  ColumnTitle,
  IconAction,
  ModalActions,
  PageHeader,
  useAdminSurface,
} from "@/components/admin/applications/ui";

/** List rows carry aggregate counters that are not part of the shared Speciality type. */
const countOf = (record: Speciality, key: "applications_count" | "examiners_count") =>
  (record as unknown as Record<string, number | undefined>)[key] ?? 0;

interface SpecialitiesListResponse {
  next: string | null;
  previous: string | null;
  total_elements: number;
  page_size: number;
  data: {
    message?: string;
    error?: string | null;
    status?: number;
    data: Speciality[];
  };
  from?: number;
  to?: number;
}

export default function SpecialitiesPage() {
  const surface = useAdminSurface();
  const [searchTerm, setSearchTerm] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpeciality, setEditingSpeciality] = useState<Speciality | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsSpecialityId, setStatsSpecialityId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const specialitiesUrl = `/speciality/list/?page=${currentPage}&page_size=${pageSize}&is_active=${isActive}${searchTerm.trim() ? `&search=${encodeURIComponent(searchTerm.trim())}` : ""}`;

  // Fetch specialities for table (paginated)
  const { data: specialitiesData, refetch: refetchSpecialities, isLoading } = useGet<SpecialitiesListResponse>(specialitiesUrl);

  // Fetch all specialities for selects (use large page_size to avoid multiple pages)
  const { data: allSpecialitiesData } = useGet<{ data: { data: Speciality[] } }>("/speciality/list/?page=1&page_size=999&is_active=true");

  // Fetch speciality statistics
  const { data: specialityStats, isLoading: isStatsLoading } = useGet<{ data: SpecialityStatistics }>(
    statsSpecialityId ? `/speciality/specialities/${statsSpecialityId}/statistics/` : "",
    { enabled: !!statsSpecialityId }
  );

  const specialities = specialitiesData?.data?.data || [];
  const allSpecialities = allSpecialitiesData?.data?.data || [];
  const totalElements = specialitiesData?.total_elements ?? 0;

  // Mutations
  const createSpeciality = usePost("/speciality/create/", {
    onSuccess: () => {
      message.success("Mutaxassislik muvaffaqiyatli yaratildi");
      setIsModalOpen(false);
      form.resetFields();
      refetchSpecialities();
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

  const updateSpeciality = usePost(`/speciality/update/${editingSpeciality?.id}/`, {
    onSuccess: () => {
      message.success("Mutaxassislik muvaffaqiyatli yangilandi");
      setIsModalOpen(false);
      setEditingSpeciality(null);
      form.resetFields();
      refetchSpecialities();
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

  const deleteSpeciality = useDelete(`/speciality/delete/${editingSpeciality?.id}/`, {
    onSuccess: () => {
      message.success("Mutaxassislik muvaffaqiyatli o'chirildi");
      refetchSpecialities();
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

  const handleCreate = () => {
    setEditingSpeciality(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (speciality: Speciality) => {
    setEditingSpeciality(speciality);
    form.setFieldsValue({
      code: speciality.code,
      name: speciality.name,
      description: speciality.description,
      field_of_science: speciality.field_of_science,
      is_active: speciality.is_active,
      is_foreign: speciality.is_foreign ?? false,
      parent: (speciality as unknown as { parent?: { id: string | number } }).parent?.id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setEditingSpeciality({ id } as Speciality);
    await deleteSpeciality.mutateAsync();
  };

  const handleSubmit = (values: Record<string, unknown>) => {
    if (editingSpeciality) {
      updateSpeciality.mutate(values);
    } else {
      createSpeciality.mutate(values);
    }
  };

  const getDisplayName = (record: Speciality) => {
    const parentName = (record as unknown as { parent?: { name?: string } }).parent?.name || undefined;
    return parentName ? `${record.name} -> (${parentName})` : record.name;
  };

  const openStats = (record: Speciality) => {
    setStatsSpecialityId(record.id);
    setIsStatsModalOpen(true);
  };

  const countBadge = (count: number, tone: "green" | "blue") => (
    <span
      className={`whitespace-nowrap rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${
        count > 0
          ? tone === "green"
            ? "border-green-500/20 bg-green-500/10 text-green-500"
            : "border-blue-500/20 bg-blue-500/10 text-blue-500"
          : "border-gray-500/10 bg-gray-500/5 text-gray-400"
      }`}
    >
      {count} ta
    </span>
  );

  const activeBadge = (active: boolean) => (
    <span
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
        active ? "border-green-500/20 bg-green-500/10 text-green-500" : "border-red-500/20 bg-red-500/10 text-red-500"
      }`}
    >
      {active ? "Faol" : "Nofaol"}
    </span>
  );

  const renderActions = (record: Speciality, mobile = false) => (
    <div className={mobile ? "grid grid-cols-3 gap-2" : "flex items-center justify-center gap-2 py-2"}>
      <IconAction tone="primary" icon={<EditOutlined />} label="Tahrirlash" showLabel={mobile} onClick={() => handleEdit(record)} />
      <IconAction tone="info" icon={<LineChartOutlined />} label="Statistika" showLabel={mobile} onClick={() => openStats(record)} />
      <Popconfirm
        title="O&apos;chirish"
        description="Haqiqatan ham o&apos;chirmoqchimisiz?"
        onConfirm={() => handleDelete(record.id)}
        okText="Ha"
        cancelText="Yo&apos;q"
        overlayClassName="premium-popconfirm"
      >
        <span className={mobile ? "block" : "inline-flex"}>
          <IconAction tone="danger" icon={<DeleteOutlined />} label="O'chirish" showLabel={mobile} />
        </span>
      </Popconfirm>
    </div>
  );

  const columns = [
    {
      title: <ColumnTitle icon={<BookOutlined />}>Mutaxassislik nomi</ColumnTitle>,
      dataIndex: "name",
      key: "name",
      render: (_name: string, record: Speciality) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold" style={{ color: surface.text }}>
            {getDisplayName(record)}
          </span>
          {record.is_foreign && <Tag color="blue">Chet tili</Tag>}
        </div>
      ),
      width: 300,
    },
    {
      title: <ColumnTitle icon={<CodeOutlined />}>Kodi</ColumnTitle>,
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <span className="whitespace-nowrap rounded-lg border border-[#7367f0]/20 bg-[#7367f0]/10 px-2 py-1 text-xs font-bold text-[#7367f0]">
          {code}
        </span>
      ),
      width: 150,
    },
    {
      title: <ColumnTitle icon={<FileTextOutlined />}>Arizalar</ColumnTitle>,
      dataIndex: "applications_count",
      key: "applications_count",
      render: (count: number) => <div className="py-2">{countBadge(count, "green")}</div>,
      width: 120,
    },
    {
      title: <ColumnTitle icon={<TeamOutlined />}>Imtihonchilar</ColumnTitle>,
      dataIndex: "examiners_count",
      key: "examiners_count",
      render: (count: number) => <div className="py-2">{countBadge(count, "blue")}</div>,
      width: 150,
    },
    {
      title: <ColumnTitle icon={<CheckCircleOutlined />}>Holati</ColumnTitle>,
      dataIndex: "is_active",
      key: "is_active",
      render: (active: boolean) => <div className="py-2">{activeBadge(active)}</div>,
      width: 120,
    },
    {
      title: <ColumnTitle center>Amallar</ColumnTitle>,
      key: "actions",
      width: 170,
      render: (_: unknown, record: Speciality) => renderActions(record),
    },
  ];

  const onPageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    setPageSize(size ?? 20);
  };

  const statTile = (label: React.ReactNode, value: React.ReactNode, color: string, bg: string, big = false) => (
    <div className="rounded-lg p-3 text-center" style={{ background: bg, border: `1px solid ${surface.subtleBorder}` }}>
      <div className="mb-1 text-xs text-gray-400">{label}</div>
      <div className={`${big ? "text-xl" : "text-lg"} font-bold`} style={{ color }}>
        {value}
      </div>
    </div>
  );

  const tintBg = (rgb: string, light: string) => (surface.isDark ? `rgba(${rgb}, 0.05)` : light);

  return (
    <div className="space-y-6" style={{ color: surface.text }}>
      <PageHeader
        title="Mutaxassisliklar Boshqaruvi"
        subtitle="PhD dasturlari uchun mutaxassisliklar ro'yxati va ularni boshqarish"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            block
            className="h-11! rounded-xl! border-0 px-6 font-bold shadow-lg md:w-auto!"
            style={{
              background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
              boxShadow: "0 8px 25px -8px #7367f0",
            }}
          >
            Yangi mutaxassislik
          </Button>
        }
      />

      <div
        className="overflow-hidden rounded-xl transition-all duration-300"
        style={{
          background: surface.cardBg,
          border: `1px solid ${surface.cardBorder}`,
          boxShadow: surface.isDark ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Filters */}
        <div className="border-b p-4 sm:p-6" style={{ borderColor: surface.divider }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Input
              allowClear
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Mutaxassislik nomini qidiring..."
              className="h-11 w-full rounded-xl! sm:max-w-md"
              style={{
                background: surface.isDark ? "rgb(30, 38, 60)" : "#f8f8f8",
                border: "none",
                color: surface.isDark ? "#ffffff" : "#484650",
              }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <label className="flex min-h-[44px] shrink-0 cursor-pointer items-center justify-between gap-3 sm:justify-start">
              <span className="text-sm font-medium" style={{ color: surface.muted }}>
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
            </label>
          </div>
        </div>

        {/* Phones: card list */}
        <div className="sm:hidden">
          {isLoading ? (
            <div className="p-4">
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          ) : specialities.length === 0 ? (
            <div className="p-4">
              <EmptyState />
            </div>
          ) : (
            <ul className="m-0 list-none divide-y p-0" style={{ borderColor: surface.divider }}>
              {specialities.map((record) => (
                <li key={record.id} className="p-4" style={{ borderColor: surface.divider }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="mb-1 inline-block rounded-lg border border-[#7367f0]/20 bg-[#7367f0]/10 px-2 py-0.5 text-xs font-bold text-[#7367f0]">
                        {record.code}
                      </span>
                      <div className="break-words text-base font-bold leading-snug" style={{ color: surface.heading }}>
                        {getDisplayName(record)}
                      </div>
                    </div>
                    {activeBadge(record.is_active)}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs" style={{ color: surface.muted }}>
                    <span className="inline-flex items-center gap-1">
                      <FileTextOutlined /> Arizalar: {countBadge(countOf(record, "applications_count"), "green")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <TeamOutlined /> Imtihonchilar: {countBadge(countOf(record, "examiners_count"), "blue")}
                    </span>
                    {record.is_foreign && <Tag color="blue">Chet tili</Tag>}
                  </div>
                  <div className="mt-3">{renderActions(record, true)}</div>
                </li>
              ))}
            </ul>
          )}
          {totalElements > 0 && (
            <div className="flex flex-col items-center gap-2 border-t px-4 py-4" style={{ borderColor: surface.divider }}>
              <Pagination
                className="admin-mobile-pagination"
                simple
                current={currentPage}
                pageSize={pageSize}
                total={totalElements}
                onChange={onPageChange}
              />
              <span className="text-xs" style={{ color: surface.muted }}>
                {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalElements)} dan {totalElements} ta
              </span>
            </div>
          )}
        </div>

        {/* Tablet & desktop: table */}
        <div className="hidden sm:block">
          <Table
            columns={columns}
            dataSource={specialities}
            loading={isLoading}
            rowKey="id"
            className="custom-admin-table"
            scroll={{ x: "max-content" }}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalElements,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total, range) => `${range[0]}-${range[1]} dan ${total} ta`,
              className: "px-4 py-4 sm:px-6",
              onChange: onPageChange,
            }}
          />
        </div>
        <AdminTableStyles />
        <style jsx global>{`
          .premium-modal .ant-modal-content {
            background: ${surface.isDark ? "rgb(40, 48, 70)" : "#ffffff"} !important;
            color: ${surface.isDark ? "#ffffff" : "#000000"} !important;
            border: ${surface.isDark ? "1px solid rgb(59, 66, 83)" : "none"} !important;
            border-radius: 16px !important;
          }
          .premium-modal .ant-modal-header {
            background: transparent !important;
            border-bottom: ${surface.isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)"} !important;
          }
          .premium-modal .ant-modal-title {
            color: ${surface.isDark ? "#ffffff" : "#000000"} !important;
          }
          .premium-modal .ant-modal-close {
            color: ${surface.isDark ? "#ffffff" : "#000000"} !important;
          }
          .premium-modal .ant-form-item-label > label {
            color: ${surface.isDark ? "#94a3b8" : "#64748b"} !important;
          }
          .premium-modal .ant-input,
          .premium-modal .ant-select-selector {
            background: ${surface.isDark ? "rgb(30, 38, 60)" : "#f8f8f8"} !important;
            border: ${surface.isDark ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)"} !important;
            color: ${surface.isDark ? "#ffffff" : "#484650"} !important;
            border-radius: 12px !important;
            padding: 6px 11px !important;
          }
          .premium-modal input.ant-input,
          .premium-modal .ant-select-selector {
            height: 40px !important;
          }
        `}</style>
      </div>

      <Modal
        title={editingSpeciality ? "Mutaxassislikni tahrirlash" : "Yangi mutaxassislik qo'shish"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingSpeciality(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        centered
        className="premium-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ is_active: true, is_foreign: false }}>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <Form.Item name="code" label="Kod" rules={[{ required: true, message: "Kodni kiriting" }]}>
              <Input placeholder="Masalan: 03.00.01" />
            </Form.Item>

            <Form.Item name="name" label="Nomi" rules={[{ required: true, message: "Nomni kiriting" }]}>
              <Input placeholder="Biokimyo" />
            </Form.Item>
          </div>

          <Form.Item name="parent" label="Asosiy mutaxassislik">
            <Select placeholder="Asosiy mutaxassislikni tanlang" allowClear showSearch optionFilterProp="children">
              {allSpecialities.map((s: Speciality) => {
                const parentName = (s as unknown as { parent?: { name?: string } }).parent?.name || undefined;
                return (
                  <Select.Option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                    {parentName ? ` (${parentName})` : ""}
                    {s.is_foreign ? " (Chet tili)" : ""}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Tavsif">
            <Input.TextArea placeholder="Mutaxassislik haqida qisqacha ma'lumot" rows={3} />
          </Form.Item>

          <Form.Item name="is_foreign" label="Chet tili" valuePropName="checked">
            <Switch checkedChildren="Ha" unCheckedChildren="Yo'q" />
          </Form.Item>

          <ModalActions>
            <Button
              className="rounded-xl"
              onClick={() => {
                setIsModalOpen(false);
                setEditingSpeciality(null);
                form.resetFields();
              }}
            >
              Bekor qilish
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="rounded-xl"
              loading={createSpeciality.isPending || updateSpeciality.isPending}
              style={{
                background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
                border: "none",
              }}
            >
              {editingSpeciality ? "Yangilash" : "Yaratish"}
            </Button>
          </ModalActions>
        </Form>
      </Modal>

      {/* Statistics Modal */}
      <Modal
        title="Mutaxassislik Statistikasi"
        open={isStatsModalOpen}
        onCancel={() => {
          setIsStatsModalOpen(false);
          setStatsSpecialityId(null);
        }}
        footer={null}
        width={800}
        style={{ top: 24 }}
        className="premium-modal"
      >
        <div className="max-h-[75vh] overflow-y-auto py-2 sm:py-4">
          {isStatsLoading ? (
            <div className="flex justify-center py-8">
              <ClockCircleOutlined spin style={{ fontSize: 24, color: "#7367f0" }} />
            </div>
          ) : specialityStats?.data ? (
            <div className="space-y-6">
              {/* Speciality Info */}
              <div
                className="rounded-lg p-3 text-center"
                style={{ background: tintBg("115, 103, 240", "#f8f9ff"), border: `1px solid ${surface.subtleBorder}` }}
              >
                <div className="mb-1 text-xs text-gray-400">Mutaxassislik</div>
                <div className="break-words text-sm font-medium">
                  {specialityStats.data.speciality.code} - {specialityStats.data.speciality.name}
                </div>
              </div>

              {/* Period Info */}
              {(!!specialityStats.data.period.start_date || !!specialityStats.data.period.end_date) && (
                <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
                  {!!specialityStats.data.period.start_date &&
                    statTile(
                      "Boshlanish sanasi",
                      <span className="text-sm">{formatDateTime(specialityStats.data.period.start_date)}</span>,
                      surface.text,
                      tintBg("115, 103, 240", "#f8f9ff"),
                    )}
                  {!!specialityStats.data.period.end_date &&
                    statTile(
                      "Tugash sanasi",
                      <span className="text-sm">{formatDateTime(specialityStats.data.period.end_date)}</span>,
                      surface.text,
                      tintBg("115, 103, 240", "#f8f9ff"),
                    )}
                </div>
              )}

              {/* Submissions Statistics */}
              <div>
                <div className="mb-3 text-center text-sm font-medium">Topshiriqlar</div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {statTile("Jami", specialityStats.data.submissions.total, "#7367f0", tintBg("115, 103, 240", "#f8f9ff"), true)}
                  {statTile("Qoralama", specialityStats.data.submissions.draft, "#ff9f43", tintBg("255, 159, 67", "#fffbf6"))}
                  {statTile("Yuborilgan", specialityStats.data.submissions.submitted, "#7367f0", tintBg("115, 103, 240", "#f8f9ff"))}
                  {statTile(
                    <>{"Ko'rib"} chiqilmoqda</>,
                    specialityStats.data.submissions.under_review,
                    "#28c76f",
                    tintBg("40, 199, 111", "#f6fff9"),
                  )}
                  {statTile("Tasdiqlangan", specialityStats.data.submissions.approved, "#28c76f", tintBg("40, 199, 111", "#f6fff9"))}
                  {statTile("Rad etilgan", specialityStats.data.submissions.rejected, "#ea5455", tintBg("234, 84, 85", "#fff8f8"))}
                </div>
              </div>

              {/* Reviews Statistics */}
              <div>
                <div className="mb-3 text-center text-sm font-medium">{"Ko'rib chiqishlar"}</div>
                <div className="grid grid-cols-3 gap-3">
                  {statTile("Jami", specialityStats.data.reviews.total, "#7367f0", tintBg("115, 103, 240", "#f8f9ff"))}
                  {statTile("Kutilmoqda", specialityStats.data.reviews.pending, "#ff9f43", tintBg("255, 159, 67", "#fffbf6"))}
                  {statTile("Tugagan", specialityStats.data.reviews.completed, "#28c76f", tintBg("40, 199, 111", "#f6fff9"))}
                </div>

                {/* Average Score */}
                <div
                  className="mt-4 rounded-xl p-4 text-center"
                  style={{
                    background: surface.isDark ? "rgba(115, 103, 240, 0.1)" : "#f4f3ff",
                    border: "1px solid rgba(115, 103, 240, 0.2)",
                  }}
                >
                  <div className="mb-1 text-xs text-gray-400">{"O'rtacha ball"}</div>
                  <div className="text-2xl font-bold text-[#7367f0]">
                    {specialityStats.data.reviews.average_score
                      ? typeof specialityStats.data.reviews.average_score === "number"
                        ? specialityStats.data.reviews.average_score.toFixed(2)
                        : specialityStats.data.reviews.average_score
                      : "-"}
                  </div>
                </div>
              </div>

              {/* Examiners List */}
              {specialityStats.data.examiners.total > 0 && (
                <div>
                  <Divider orientation="left">
                    <Space>
                      <TeamOutlined />
                      <span>Imtihonchilar ({specialityStats.data.examiners.total})</span>
                    </Space>
                  </Divider>
                  <List
                    dataSource={specialityStats.data.examiners.list}
                    renderItem={(examiner) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={<span className="break-words">{examiner.name}</span>}
                          description={
                            <Space direction="vertical" size="small">
                              <div>
                                <strong>Unvon:</strong> {examiner.title}
                              </div>
                              <div>
                                <strong>Kafedra:</strong> {examiner.department}
                              </div>
                              <div className="text-xs text-gray-500">
                                <CalendarOutlined /> Tayinlangan: {formatDateTime(examiner.assigned_at)}
                              </div>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )}

              {/* Applications List */}
              {specialityStats.data.applications.total > 0 && (
                <div>
                  <Divider orientation="left">
                    <Space>
                      <FileTextOutlined />
                      <span>Arizalar ({specialityStats.data.applications.total})</span>
                    </Space>
                  </Divider>
                  <List
                    dataSource={specialityStats.data.applications.list}
                    renderItem={(app) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<FileTextOutlined />} />}
                          title={<span className="break-words">{app.title}</span>}
                          description={
                            <Space>
                              <Tag
                                color={
                                  app.status === "PUBLISHED"
                                    ? "green"
                                    : app.status === "DRAFT"
                                      ? "orange"
                                      : app.status === "CLOSED"
                                        ? "red"
                                        : "default"
                                }
                              >
                                {app.status}
                              </Tag>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">Statistika ma&apos;lumotlari topilmadi</div>
          )}
        </div>
      </Modal>
    </div>
  );
}
