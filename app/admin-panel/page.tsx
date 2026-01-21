"use client";

import { Row, Col, Card, Statistic, Spin } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,

} from "@ant-design/icons";
import { useGet } from "@/lib/hooks";

interface Submission {
  status: string;
  [key: string]: unknown;
}

export default function AdminPanelPage() {
  const { data: applications, isLoading: isLoadingApps } = useGet<unknown[]>("/admin/application/");
  const { data: submissions, isLoading: isLoadingSubs } = useGet<unknown[]>("/admin/application/submissions/");

  const totalApplications = applications?.length || 0;
  const totalSubmissions = submissions?.length || 0;
  const approvedCount = (submissions as Submission[])?.filter((s) => s.status === "APPROVED").length || 0;
  const rejectedCount = (submissions as Submission[])?.filter((s) => s.status === "REJECTED").length || 0;

  if (isLoadingApps || isLoadingSubs) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Jami Arizalar"
              value={totalApplications}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Topshirilgan Arizalar"
              value={totalSubmissions}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Qabul qilingan"
              value={approvedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Rad etilgan"
              value={rejectedCount}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
}
