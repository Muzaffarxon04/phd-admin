"use client";

import { useState } from "react";
import { Table, Button, Popconfirm, App, Modal, Form, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  EyeOutlined,
  PlusOutlined,
  CalendarOutlined,
  TrophyOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  RollbackOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useGet, usePatch } from "@/lib/hooks";
import { apiRequest } from "@/lib/hooks/useUniversalFetch";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import {
  AdminTableStyles,
  ApplicationStatusPill,
  ColumnTitle,
  IconAction,
  InfoItem,
  ModalActions,
  PageHeader,
  useAdminSurface,
} from "@/components/admin/applications/ui";
import { ApplicationEditFields } from "@/components/admin/applications/ApplicationEditFields";

interface Application {
  id: number;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  start_date: string;
  end_date: string;
  exam_date?: string | null;
  application_fee?: string;
  total_submissions: number;
  is_open?: boolean;
  is_upcoming?: boolean;
  is_closed?: boolean;
  created_by_name: string;
  created_at: string;
}

export default function AdminApplicationsPage() {
  const { message } = App.useApp();
  const surface = useAdminSurface();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: applicationsData, isLoading, error } = useGet<{
    next: string | null;
    previous: string | null;
    total_elements: number;
    page_size: number;
    data: {
      message: string;
      error: string | null;
      status: number;
      data: Application[];
    };
    from: number;
    to: number;
  }>(`/admin/application/?page=${currentPage}&page_size=${pageSize}`);

  const applicationsEndpoint = `/admin/application/?page=${currentPage}&page_size=${pageSize}`;

  // Extract applications from nested response structure
  const applications = applicationsData?.data?.data || [];
  const totalElements = applicationsData?.total_elements || 0;

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [archivingId, setArchivingId] = useState<number | null>(null);
  const [unarchivingId, setUnarchivingId] = useState<number | null>(null);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [editForm] = Form.useForm();

  const editId = editingApplication?.id ?? 0;
  const { mutate: updateApplication, isPending: isUpdatingApplication } = usePatch<{ data: Application }>(
    `/admin/application/${editId}/update/`,
    {
      onSuccess: () => {
        message.success("Ariza muvaffaqiyatli yangilandi!");
        const updatedId = editingApplication?.id;
        setEditingApplication(null);
        editForm.resetFields();
        queryClient.invalidateQueries({ queryKey: [applicationsEndpoint] });
        queryClient.refetchQueries({ queryKey: [applicationsEndpoint] });
        if (updatedId) {
          queryClient.invalidateQueries({ queryKey: [`/admin/application/${updatedId}/`] });
        }
      },
      onError: (error) => {
        message.error(error.message || "Arizani yangilashda xatolik");
      },
    }
  );

  const handleEdit = (record: Application) => {
    setEditingApplication(record);
    editForm.setFieldsValue({
      title: record.title,
      description: record.description,
      start_date: record.start_date ? dayjs(record.start_date) : null,
      end_date: record.end_date ? dayjs(record.end_date) : null,
      exam_date: record.exam_date ? dayjs(record.exam_date) : null,
      status: record.status,
    });
  };

  const handleUpdateApplication = (values: {
    title: string;
    description: string;
    start_date: Dayjs | null;
    end_date: Dayjs | null;
    exam_date?: Dayjs | null;
    status: string;
  }) => {
    if (!editingApplication) return;
    updateApplication({
      title: values.title,
      description: values.description,
      start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : editingApplication.start_date,
      end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : editingApplication.end_date,
      exam_date: values.exam_date ? values.exam_date.format("YYYY-MM-DD") : null,
      status: values.status as Application["status"],
    });
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await apiRequest(`/admin/application/${id}/delete/`, { method: "DELETE" });
      message.success("Ariza muvaffaqiyatli o'chirildi");
      queryClient.invalidateQueries({ queryKey: [applicationsEndpoint] });
      queryClient.refetchQueries({ queryKey: [applicationsEndpoint] });
    } catch (err) {
      message.error((err as Error).message || "Arizani o'chirishda xatolik");
    } finally {
      setDeletingId(null);
    }
  };

  const invalidateApplications = () => {
    queryClient.invalidateQueries({ queryKey: [applicationsEndpoint] });
    queryClient.refetchQueries({ queryKey: [applicationsEndpoint] });
  };

  const { mutate: archiveApplication } = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/admin/application/${id}/archive/`, { method: "POST" }),
    onMutate: (id) => setArchivingId(id),
    onSuccess: () => {
      message.success("Ariza arxivga olindi");
      invalidateApplications();
    },
    onError: (error) => {
      message.error(error.message || "Arxivlashda xatolik");
    },
    onSettled: () => setArchivingId(null),
  });

  const { mutate: unarchiveApplication } = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/admin/application/${id}/unarchive/`, { method: "POST" }),
    onMutate: (id) => setUnarchivingId(id),
    onSuccess: () => {
      message.success("Ariza arxivdan chiqarildi");
      invalidateApplications();
    },
    onError: (error) => {
      message.error(error.message || "Arxivdan chiqarishda xatolik");
    },
    onSettled: () => setUnarchivingId(null),
  });

  const { mutate: publishApplication } = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/admin/application/${id}/update/`, {
        method: "PATCH",
        body: JSON.stringify({ status: "PUBLISHED" }),
      }),
    onMutate: (id) => setPublishingId(id),
    onSuccess: () => {
      message.success("Ariza e'lon qilindi");
      invalidateApplications();
    },
    onError: (error) => {
      message.error((error as Error).message || "E'lon qilishda xatolik");
    },
    onSettled: () => setPublishingId(null),
  });

  const { mutate: closeApplication } = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/admin/application/${id}/update/`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CLOSED" }),
      }),
    onMutate: (id) => setClosingId(id),
    onSuccess: () => {
      message.success("Ariza yopildi");
      invalidateApplications();
    },
    onError: (error) => {
      message.error((error as Error).message || "Yopishda xatolik");
    },
    onSettled: () => setClosingId(null),
  });

  const renderActions = (record: Application, mobile = false) => (
    <div className={mobile ? "grid grid-cols-2 gap-2" : "flex flex-wrap items-center justify-center gap-2 py-2"}>
      <Link href={`/admin-panel/applications/${record.id}`} className={mobile ? "contents" : undefined}>
        <IconAction tone="primary" icon={<EyeOutlined />} label="Ko'rish" showLabel={mobile} />
      </Link>
      <IconAction
        tone="success"
        icon={<EditOutlined />}
        label="Tahrirlash"
        showLabel={mobile}
        onClick={() => handleEdit(record)}
      />
      {record.status !== "PUBLISHED" && record.status !== "ARCHIVED" && (
        <IconAction
          tone="info"
          icon={<CheckCircleOutlined />}
          label="E'lon qilish"
          showLabel={mobile}
          loading={publishingId === record.id}
          onClick={() => publishApplication(record.id)}
        />
      )}
      {record.status === "PUBLISHED" && (
        <IconAction
          tone="warning"
          icon={<StopOutlined />}
          label="Yopish"
          showLabel={mobile}
          loading={closingId === record.id}
          onClick={() => closeApplication(record.id)}
        />
      )}
      {record.status !== "ARCHIVED" ? (
        <IconAction
          tone="neutral"
          icon={<InboxOutlined />}
          label="Arxivlash"
          showLabel={mobile}
          loading={archivingId === record.id}
          onClick={() => archiveApplication(record.id)}
        />
      ) : (
        <IconAction
          tone="amber"
          icon={<RollbackOutlined />}
          label="Arxivdan chiqarish"
          showLabel={mobile}
          loading={unarchivingId === record.id}
          onClick={() => unarchiveApplication(record.id)}
        />
      )}
      <Popconfirm
        title="O'chirish"
        description="Haqiqatan ham bu arizani o'chirmoqchimisiz?"
        onConfirm={() => handleDelete(record.id)}
        okText="Ha"
        cancelText="Yo'q"
        overlayClassName="premium-popconfirm"
      >
        <span className={mobile ? "block" : "inline-flex"}>
          <IconAction
            tone="danger"
            icon={<DeleteOutlined />}
            label="O'chirish"
            showLabel={mobile}
            loading={deletingId === record.id}
          />
        </span>
      </Popconfirm>
    </div>
  );

  const columns: ColumnsType<Application> = [
    {
      title: "#",
      key: "id",
      width: 64,
      render: (_, record) => <div className="text-sm font-bold text-[#7367f0]">#{record.id}</div>,
    },
    {
      title: <ColumnTitle>Ariza nomi</ColumnTitle>,
      key: "title_info",
      render: (_, record) => (
        <Link
          href={`/admin-panel/applications/${record.id}`}
          className="block max-w-[320px] text-sm font-bold hover:text-[#7367f0]!"
          style={{ color: surface.text }}
        >
          {record.title}
        </Link>
      ),
    },
    {
      title: <ColumnTitle icon={<CalendarOutlined />}>Muddati</ColumnTitle>,
      key: "dates",
      render: (_, record) => (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 whitespace-nowrap text-xs font-bold">
          <span className="text-green-500">{formatDateTime(record.start_date)}</span>
          <span style={{ color: surface.muted }}>—</span>
          <span className="text-red-500">{formatDateTime(record.end_date)}</span>
        </div>
      ),
    },
    {
      title: <ColumnTitle icon={<CalendarOutlined />}>Imtihon sanasi</ColumnTitle>,
      key: "exam_date",
      render: (_, record) => (
        <div className="whitespace-nowrap text-xs font-bold text-[#7367f0]">
          {record.exam_date ? formatDateTime(record.exam_date) : "—"}
        </div>
      ),
    },
    {
      title: <ColumnTitle icon={<TrophyOutlined />}>Arizalar</ColumnTitle>,
      dataIndex: "total_submissions",
      key: "total_submissions",
      render: (total: number) => (
        <div className="whitespace-nowrap py-2 text-sm font-bold text-[#7367f0]">{total} ta</div>
      ),
    },
    {
      title: <ColumnTitle>Holati</ColumnTitle>,
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string) => (
        <div className="py-2">
          <ApplicationStatusPill status={status} />
        </div>
      ),
    },
    {
      title: <ColumnTitle center>Amallar</ColumnTitle>,
      key: "actions",
      width: 280,
      render: (_, record) => renderActions(record),
    },
  ];

  const header = (
    <PageHeader
      title="Arizalar tizimi"
      subtitle="Barcha e'lon qilingan arizalar va loyihalar boshqaruvi"
      actions={
        <Link href="/admin-panel/applications/create" className="block">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            block
            className="h-11! rounded-xl! border-0 px-6 font-bold shadow-lg md:w-auto!"
            style={{
              background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
              boxShadow: "0 8px 25px -8px #7367f0",
            }}
          >
            Yangi ariza yaratish
          </Button>
        </Link>
      }
    />
  );

  if (isLoading) {
    return (
      <div className="space-y-6" style={{ color: surface.text }}>
        {header}
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    let errorMessage = error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi";
    const errorData = (error as { data?: unknown }).data;
    if (Array.isArray(errorData)) {
      errorMessage = errorData.join(", ");
    }

    return (
      <div className="space-y-6" style={{ color: surface.text }}>
        {header}
        <ErrorState description={errorMessage} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const onPageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <div className="space-y-6" style={{ color: surface.text }}>
      {header}

      {/* Phones: card list */}
      <div className="space-y-3 sm:hidden">
        {applications.length === 0 ? (
          <EmptyState description="Hozircha arizalar mavjud emas" />
        ) : (
          applications.map((record) => (
            <article
              key={record.id}
              className="rounded-xl p-4"
              style={{
                background: surface.cardBg,
                border: `1px solid ${surface.cardBorder}`,
                boxShadow: surface.isDark ? "none" : "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/admin-panel/applications/${record.id}`}
                  className="min-w-0 flex-1 break-words text-base font-bold leading-snug"
                  style={{ color: surface.heading }}
                >
                  <span className="mr-1 text-[#7367f0]">#{record.id}</span>
                  {record.title}
                </Link>
                <ApplicationStatusPill status={record.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <InfoItem label="Boshlanish">
                  <span className="font-semibold text-green-500">{formatDateTime(record.start_date)}</span>
                </InfoItem>
                <InfoItem label="Tugash">
                  <span className="font-semibold text-red-500">{formatDateTime(record.end_date)}</span>
                </InfoItem>
                <InfoItem label="Imtihon sanasi">
                  <span className="font-semibold text-[#7367f0]">
                    {record.exam_date ? formatDateTime(record.exam_date) : "—"}
                  </span>
                </InfoItem>
                <InfoItem label="Arizalar">
                  <span className="font-semibold text-[#7367f0]">{record.total_submissions} ta</span>
                </InfoItem>
              </div>

              <div className="mt-4 border-t pt-3" style={{ borderColor: surface.divider }}>
                {renderActions(record, true)}
              </div>
            </article>
          ))
        )}

        {totalElements > 0 && (
          <div className="flex flex-col items-center gap-2 pt-2">
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

      {/* Tablet & desktop: table (scrolls horizontally inside the card when needed) */}
      <div
        className="hidden overflow-hidden rounded-xl transition-all duration-300 sm:block"
        style={{
          background: surface.cardBg,
          border: `1px solid ${surface.cardBorder}`,
          boxShadow: surface.isDark ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Table
          columns={columns}
          dataSource={applications || []}
          rowKey="id"
          locale={{ emptyText: "Hozircha arizalar mavjud emas" }}
          className="custom-admin-table"
          scroll={{ x: "max-content" }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalElements,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dan ${total} ta`,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: onPageChange,
            className: "px-4 py-4 sm:px-6",
          }}
        />
      </div>
      <AdminTableStyles />

      <Modal
        title="Arizani Tahrirlash"
        open={!!editingApplication}
        onCancel={() => {
          setEditingApplication(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
        centered
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateApplication} autoComplete="off">
          <ApplicationEditFields />

          <ModalActions>
            <Button
              onClick={() => {
                setEditingApplication(null);
                editForm.resetFields();
              }}
            >
              Bekor qilish
            </Button>
            <Button type="primary" htmlType="submit" loading={isUpdatingApplication}>
              Yangilash
            </Button>
          </ModalActions>
        </Form>
      </Modal>
    </div>
  );
}
