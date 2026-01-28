"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Row,
  Col,
  Statistic,
  Breadcrumb,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  BookOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useGet } from "@/lib/hooks";import type {
  ApplicationSpecialityList,
} from "@/lib/api/app-speciality";
import type { ApplicationListResponse, ApplicationDetail } from "@/lib/api/admin";
import type { SpecialityListResponse } from "@/lib/api/speciality";
import { formatDate } from "@/lib/utils";

const { Title } = Typography;
const { Option } = Select;

export default function ApplicationSpecialitiesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // API calls
  const { data: appSpecialitiesData, isLoading } = useGet<{
    next: string | null;
    count: number;    previous: string | null;
    results: ApplicationSpecialityList[];
  }>("/app-speciality/application-specialities/");

  const { data: applications } = useGet<ApplicationListResponse>("/admin/application/admin/applications/");
  const { data: specialities } = useGet<SpecialityListResponse>("/speciality/list/");

  const appSpecialities = appSpecialitiesData?.results || [];
  const totalCount = appSpecialitiesData?.count || 0;

  const columns = [
    {
      title: "Ariza",
      dataIndex: "application_title",
      key: "application_title",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <BookOutlined className="text-blue-500" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "Mutaxassislik",
      dataIndex: "speciality_name",
      key: "speciality_name",
      render: (text: string, record: ApplicationSpecialityList) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.speciality_code}</div>
        </div>
      ),
    },
    {
      title: "Maksimal abituriyentlar",
      dataIndex: "max_applicants",
      key: "max_applicants",
      render: (value: number | null) => value || "Cheklanmagan",
    },
    {
      title: "Faol imtihonchilar",
      dataIndex: "active_examiners",
      key: "active_examiners",
      render: (text: string) => (
        <Tag color="green">{text}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Faol" : "Nofaol"}
        </Tag>
      ),
    },
    {
      title: "Yaratilgan",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => formatDate(date),
    },
  ];

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { href: "/", title: "Bosh sahifa" },
          { href: "/admin-panel", title: "Admin Panel" },
          { title: "Ariza-Mutaxassislik Bog'lanishlari" },
        ]}
        className="mb-4"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="mb-2">Ariza-Mutaxassislik Bog&apos;lanishlari</Title>
          <p className="text-gray-600">Ariza va mutaxassislik o&apos;rtasidagi bog&apos;lanishlarni boshqaring</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Yangi bog&apos;lanish
        </Button>      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Jami bog'lanishlar"
              value={totalCount}
              prefix={<LinkOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Faol bog'lanishlar"
              value={appSpecialities.filter(item => item.is_active).length}
              prefix={<LinkOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Faol imtihonchilar"
              value={appSpecialities.reduce((sum, item) => {
                const count = parseInt(item.active_examiners) || 0;
                return sum + count;
              }, 0)}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Mutaxassisliklar"
              value={new Set(appSpecialities.map(item => item.speciality_name)).size}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={appSpecialities}
          loading={isLoading}
          rowKey="id"
          pagination={{
            total: totalCount,
            pageSize: 20,
            showSizeChanger: false,
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Yangi boglanish"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
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

// Missing imports
import { Typography } from "antd";
