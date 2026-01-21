"use client";

import { Card, Spin, Empty, Button } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface AvailableApplication {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  exam_date?: string | null;
  application_fee: string;
  can_apply: boolean;
  can_apply_message: string;
  requires_oneid_verification?: boolean;
  max_submissions?: number;
  instructions?: string;
  required_documents?: unknown[];
  user_submission_count?: number;
}

interface ApplicationsResponse {
  next: string | null;
  previous: string | null;
  total_elements: number;
  page_size: number;
  data: {
    message: string;
    error: string | null;
    status: number;
    data: AvailableApplication[];
  };
  from: number;
  to: number;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const { data: applicationsData, isLoading, error } = useGet<ApplicationsResponse | AvailableApplication[]>("/applicant/applications/");
  
  // Handle different response formats
  let applications: AvailableApplication[] = [];
  if (applicationsData) {
    if (Array.isArray(applicationsData)) {
      applications = applicationsData;
    } else if (applicationsData.data && applicationsData.data.data && Array.isArray(applicationsData.data.data)) {
      applications = applicationsData.data.data;
    } else if (applicationsData.data && Array.isArray(applicationsData.data)) {
      applications = applicationsData.data;
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <p className="text-red-600">Xatolik: {error.message}</p>
        </Card>
      </div>
    );
  }

  // Ensure applications is always an array
  const tableData = Array.isArray(applications) ? applications : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mavjud Arizalar</h1>
      </div>

      {!tableData || tableData.length === 0 ? (
        <Card>
          <Empty description="Hozircha mavjud arizalar yo&apos;q" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tableData.map((app) => (
            <Card
              key={app.id}
              hoverable
              title={app.title}
              extra={
                <Link href={`/applications/${app.id}`} onClick={(e) => e.stopPropagation()}>
                  <Button type="primary">Batafsil</Button>
                </Link>
              }
              onClick={() => router.push(`/applications/${app.id}`)}
              style={{ cursor: "pointer" }}
            >
              <p className="text-gray-600 mb-4 line-clamp-3">{app.description}</p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Boshlanish:</strong> {formatDate(app.start_date)}
                </p>
                <p>
                  <strong>Tugash:</strong> {formatDate(app.end_date)}
                </p>
                {app.exam_date && (
                  <p>
                    <strong>Imtihon sana:</strong> {formatDate(app.exam_date)}
                  </p>
                )}
                <p>
                  <strong>To&apos;lov:</strong> {app.application_fee} UZS
                </p>
              </div>
              {app.can_apply === false && (
                <div className="mt-4 p-2 bg-yellow-50 rounded text-yellow-800 text-sm">
                  {app.can_apply_message}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

