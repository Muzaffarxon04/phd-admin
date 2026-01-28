"use client";

import { use } from "react";
import { Card, Spin, Tag, Button, Descriptions, Alert, Space, Table, Typography, Tabs } from "antd";
import { useGet, usePost } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { formatDate, getApplicationStatusLabel, getApplicationStatusColor } from "@/lib/utils";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
interface SubmissionDetail {
  id: number;
  submission_number: string;
  application: unknown;
  application_title?: string;
  applicant: number;
  applicant_name: string;
  applicant_phone: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  review_notes?: string;
  reviewed_by?: number | null;
  reviewed_by_name?: string;
  reviewed_at?: string | null;
  answers: DataObject[];
  documents: unknown[];
  created_at: string;
  updated_at: string;
  submitted_at?: string | null;
}

interface DataObject {
  id: number;
  field_label: string;
  field_type: string;
  answer: string | null;
}

const { Text, Title } = Typography;


const formatAnswer = (item: DataObject) => {
  if (item.field_type === "FILE" && item.answer) {
    return (
      <a href={API_BASE_URL + item.answer || ""} target="_blank" rel="noopener noreferrer">
        📎 Faylni ochish
      </a>
    );
  }

  return item.answer || "—";
};


const CardView = ({ answers }: { answers: DataObject[] }) => (
  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
    {answers.map((item: DataObject) => (
      <Card key={item.id}>
        <Text type="secondary">Savol</Text>
        <Title level={5}>{item.field_label}</Title>

        <Text type="secondary">Javob</Text>
        <div>{formatAnswer(item)}</div>
      </Card>
    ))}
  </Space>
);

const TableView = ({ answers }: { answers: DataObject[] }) => {
  const columns = [
    {
      title: "№",
      dataIndex: "id",
      key: "id",
      render: (text: string, record: DataObject, index: number) => <Text strong>{index + 1}</Text>,
    },
    {
      title: "Savol",
      dataIndex: "field_label",
      key: "field_label",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Javob",
      key: "answer",
      render: (_item: string, record: DataObject) => formatAnswer(record),
    },
  
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={answers}
      pagination={false}
    />
  );
};

export default function AdminSubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: submissionData, isLoading } = useGet<{ data: SubmissionDetail }>(
    `/admin/application/submissions/${id}/`
  );
  const submission = submissionData?.data;

  const { mutate: approveSubmission } = usePost(`/admin/application/submissions/${id}/approve/`, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/admin/application/submissions/${id}/`] });
    },
  });

  const { mutate: rejectSubmission } = usePost(`/admin/application/submissions/${id}/reject/`, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/admin/application/submissions/${id}/`] });
    },
  });

  const handleApprove = () => {
    approveSubmission({ notes: "" });
  };

  const handleReject = () => {
    rejectSubmission({ notes: "Hujjatlar notog'ri" });
  };

  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div>
        <Card>
          <p>Ariza topilmadi</p>
        </Card>
      </div>
    );
  }


  
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin-panel/submissions">
          <Button type="link">← Orqaga</Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Ariza #{submission.submission_number}</h1>

      <Card className="mb-6">
        <Descriptions bordered>
          <Descriptions.Item label="Ariza nomi">{submission.application_title || "-"}</Descriptions.Item>
          <Descriptions.Item label="Talabgor">{submission.applicant_name}</Descriptions.Item>
          <Descriptions.Item label="Telefon">{submission.applicant_phone}</Descriptions.Item>
          <Descriptions.Item label="Holati">
            <Tag color={getApplicationStatusColor(submission.status)}>
              {getApplicationStatusLabel(submission.status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="To&apos;lov">
            <Tag color={submission.payment_status === "PAID" ? "green" : "orange"}>
              {submission.payment_status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Yaratilgan sana">{formatDate(submission.created_at)}</Descriptions.Item>
          {submission.submitted_at && (
            <Descriptions.Item label="Topshirilgan sana">{formatDate(submission.submitted_at)}</Descriptions.Item>
          )}
        </Descriptions>

        {submission.review_notes && (
          <Alert message={submission.review_notes} type="info" className="mt-6" />
        )}

        <div className="mt-6">
          <Space>
            {submission.status === "UNDER_REVIEW" && (
              <>
                <Button type="primary" icon={<CheckOutlined />} onClick={handleApprove}>
                  Qabul qilish
                </Button>
                <Button danger icon={<CloseOutlined />} onClick={handleReject}>
                  Rad etish
                </Button>
              </>
            )}
          </Space>
        </div>
      </Card>

      <Card>
  <h2 className="text-xl font-semibold mb-4">Javoblar</h2>

  <Tabs
  defaultActiveKey="card"
  items={[
    {
      key: "card",
      label: "Card ko‘rinishi",
      children: <CardView answers={submission.answers as unknown as DataObject[]} />,
    },
    {
      key: "table",
      label: "Table ko‘rinishi",
      children: <TableView answers={submission.answers as unknown as DataObject[]} />,
    },
  ]}
/>

</Card>


      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Hujjatlar</h2>
        <pre className="bg-gray-50 p-4 rounded">
          {JSON.stringify(submission.documents, null, 2)}
        </pre>
      </Card>
    </div>
  );
}
