"use client";

import { useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  // Breadcrumb,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  BookOutlined,
  LinkOutlined,
  SolutionOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useGet } from "@/lib/hooks"; import type {
  ApplicationSpecialityList,
} from "@/lib/api/app-speciality";
import type { ApplicationListResponse, ApplicationDetail } from "@/lib/api/admin";
import type { SpecialityListResponse } from "@/lib/api/speciality";

import { Typography } from "antd";
const { Title } = Typography;
const { Option } = Select;
import { useThemeStore } from "@/lib/stores/themeStore";

export default function ApplicationSpecialitiesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // API calls
  const { data: appSpecialitiesData, isLoading } = useGet<{
    next: string | null;
    count: number; previous: string | null;
    results: ApplicationSpecialityList[];
  }>("/app-speciality/application-specialities/");

  const { data: applications } = useGet<ApplicationListResponse>("/admin/application/admin/applications/");
  const { data: specialities } = useGet<SpecialityListResponse>("/speciality/list/");

  const appSpecialities = appSpecialitiesData?.results || [];
  const totalCount = appSpecialitiesData?.count || 0;

  const { theme } = useThemeStore();

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2 py-3 px-4">
          <BookOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Ariza</span>
        </div>
      ),
      key: "app_info",
      render: (_: unknown, record: ApplicationSpecialityList) => (
        <div className="font-bold text-sm" style={{ color: theme === "dark" ? "#e2e8f0" : "#484650" }}>
          {record.application_title}
        </div>
      ),
      width: 250,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <LinkOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Mutaxassislik</span>
        </div>
      ),
      key: "spec_info",
      render: (_: unknown, record: ApplicationSpecialityList) => (
        <div className="py-2">
          <div className="font-bold text-sm text-[#7367f0] mb-1">
            {record.speciality_name}
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7367f0]/10 text-[#7367f0] border border-[#7367f0]/20">
            {record.speciality_code}
          </span>
        </div>
      ),
      width: 250,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <UserOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Abituriyentlar</span>
        </div>
      ),
      dataIndex: "max_applicants",
      key: "max_applicants",
      render: (value: number | null) => (
        <div className="font-bold text-sm" style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
          {value ? `${value} ta` : "Cheklanmagan"}
        </div>
      ),
      width: 150,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <SolutionOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Imtihonchilar</span>
        </div>
      ),
      dataIndex: "active_examiners",
      key: "active_examiners",
      render: (text: string) => (
        <span className="px-2 py-1 rounded-lg bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
          {text} ta faol
        </span>
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
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
          }`}>
          {isActive ? "Faol" : "Nofaol"}
        </span>
      ),
      width: 120,
    },
  ];

  return (
    <div className="space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title level={4} className="!mb-1" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
            Ariza-Mutaxassislik Bog&apos;lanishlari
          </Title>
          <div className="text-gray-400 text-sm font-medium">Ariza va mutaxassislik o&apos;rtasidagi bog&apos;lanishlarni boshqaring</div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setIsModalOpen(true);
            }}
            className="h-[42px] px-6 rounded-xl border-0 shadow-lg font-bold flex items-center gap-2"
            style={{
              background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
              boxShadow: "0 8px 25px -8px #7367f0",
            }}
          >
            Yangi bog&apos;lanish
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Jami bog'lanishlar", value: totalCount, icon: <LinkOutlined />, color: "#7367f0" },
          { title: "Faol bog'lanishlar", value: appSpecialities.filter(item => item.is_active).length, icon: <LinkOutlined />, color: "#28c76f" },
          { title: "Faol imtihonchilar", value: appSpecialities.reduce((sum, item) => sum + (parseInt(item.active_examiners) || 0), 0), icon: <UserOutlined />, color: "#ff9f43" },
          { title: "Mutaxassisliklar", value: new Set(appSpecialities.map(item => item.speciality_name)).size, icon: <BookOutlined />, color: "#00cfe8" },
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
        <Table
          columns={columns}
          dataSource={appSpecialities}
          loading={isLoading}
          rowKey="id"
          className="custom-admin-table"
          pagination={{
            total: totalCount,
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
        `}</style>
      </div>

      {/* Create Modal */}
      <Modal
        title="Yangi bog&apos;lanish"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
        className="premium-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            console.log('Form values:', values);
            message.success("Bu funksiya tez orada qo'shiladi");
            setIsModalOpen(false);
          }}
        >
          <Form.Item
            name="application_id"
            label="Ariza"
            rules={[{ required: true, message: "Arizani tanlang" }]}
          >
            <Select placeholder="Arizani tanlang">
              {applications?.results?.map((app: ApplicationDetail) => (
                <Option key={app.id} value={app.id}>
                  {app.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="speciality_id"
            label="Mutaxassislik"
            rules={[{ required: true, message: "Mutaxassislikni tanlang" }]}
          >
            <Select placeholder="Mutaxassislikni tanlang">
              {specialities?.results?.map((spec) => (
                <Option key={spec.id} value={spec.id}>
                  {spec.name} ({spec.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="max_applicants"
            label="Maksimal abituriyentlar soni"
          >
            <InputNumber
              placeholder="Cheklanmagan uchun bo'sh qoldiring"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


