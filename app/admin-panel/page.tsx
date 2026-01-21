"use client";

import { Row, Col, Card, Statistic } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import Link from "next/link";

export default function AdminPanelPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Jami Arizalar"
              value={1128}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Qabul qilingan"
              value={856}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Rad etilgan"
              value={93}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="To'lovlar"
              value={1128}
              prefix={<DollarOutlined />}
              suffix="UZS"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Link href="/admin-panel/applications">
            <Card hoverable>
              <h3 className="text-xl font-semibold mb-2">Arizalarni Ko'rish</h3>
              <p className="text-gray-600">Talabgor arizalarini ko'rish va tekshirish</p>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Link href="/admin-panel/exams">
            <Card hoverable>
              <h3 className="text-xl font-semibold mb-2">Imtihonlar</h3>
              <p className="text-gray-600">Imtihon yaratish va boshqarish</p>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Link href="/admin-panel/payments">
            <Card hoverable>
              <h3 className="text-xl font-semibold mb-2">To'lovlar</h3>
              <p className="text-gray-600">To'lovlarni tekshirish va tasdiqlash</p>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Link href="/admin-panel/specializations">
            <Card hoverable>
              <h3 className="text-xl font-semibold mb-2">Mutaxassisliklar</h3>
              <p className="text-gray-600">Mutaxassislik qo'shish va tahrirlash</p>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Link href="/admin-panel/reports">
            <Card hoverable>
              <h3 className="text-xl font-semibold mb-2">Hisobotlar</h3>
              <p className="text-gray-600">Kunlik/oylik statistika va hisobotlar</p>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Link href="/admin-panel/notifications">
            <Card hoverable>
              <h3 className="text-xl font-semibold mb-2">Xabarnomalar</h3>
              <p className="text-gray-600">Xabarnomalarni boshqarish</p>
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
}
