"use client";

import { Table, Button, Tag, Space, Card, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
} from "@ant-design/icons";

interface ApplicationData {
  key: string;
  id: string;
  applicantName: string;
  specialization: string;
  status: string;
  submittedDate: string;
}

const columns: ColumnsType<ApplicationData> = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Talabgor",
    dataIndex: "applicantName",
    key: "applicantName",
  },
  {
    title: "Mutaxassislik",
    dataIndex: "specialization",
    key: "specialization",
  },
  {
    title: "Holati",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const colorMap: Record<string, string> = {
        submitted: "blue",
        under_review: "processing",
        accepted: "success",
        rejected: "error",
      };
      const labelMap: Record<string, string> = {
        submitted: "Topshirilgan",
        under_review: "Ko'rib chiqilmoqda",
        accepted: "Qabul qilingan",
        rejected: "Rad etilgan",
      };
      return <Tag color={colorMap[status]}>{labelMap[status] || status}</Tag>;
    },
  },
  {
    title: "Topshirilgan sana",
    dataIndex: "submittedDate",
    key: "submittedDate",
  },
  {
    title: "Amallar",
    key: "actions",
    render: (_, record) => (
      <Space>
        <Button icon={<EyeOutlined />} type="link">
          Ko'rish
        </Button>
        <Button icon={<CheckOutlined />} type="link" style={{ color: "#52c41a" }}>
          Qabul qilish
        </Button>
        <Button icon={<CloseOutlined />} type="link" danger>
          Rad etish
        </Button>
      </Space>
    ),
  },
];

const tabItems = [
  {
    key: "all",
    label: "Barchasi",
  },
  {
    key: "under_review",
    label: "Ko'rib chiqilmoqda",
  },
  {
    key: "accepted",
    label: "Qabul qilingan",
  },
  {
    key: "rejected",
    label: "Rad etilgan",
  },
];

export default function AdminApplicationsPage() {
  // Mock data
  const data: ApplicationData[] = [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Arizalar</h1>
      <Card>
        <Tabs items={tabItems} defaultActiveKey="all" className="mb-4" />
        <Table
          columns={columns}
          dataSource={data}
          locale={{ emptyText: "Hozircha arizalar mavjud emas" }}
        />
      </Card>
    </div>
  );
}
