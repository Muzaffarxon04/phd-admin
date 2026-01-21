"use client";

import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
  BookOutlined,
  BarChartOutlined,
  NotificationOutlined,
  SettingOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";

const { Sider } = Layout;

const menuItems = [
  {
    key: "/admin-panel",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/admin-panel/applications",
    icon: <FileTextOutlined />,
    label: "Arizalar",
  },
  {
    key: "/admin-panel/exams",
    icon: <CalendarOutlined />,
    label: "Imtihonlar",
  },
  {
    key: "/admin-panel/payments",
    icon: <DollarOutlined />,
    label: "To'lovlar",
  },
  {
    key: "/admin-panel/specializations",
    icon: <BookOutlined />,
    label: "Mutaxassisliklar",
  },
  {
    key: "/admin-panel/reports",
    icon: <BarChartOutlined />,
    label: "Hisobotlar",
  },
  {
    key: "/admin-panel/notifications",
    icon: <NotificationOutlined />,
    label: "Xabarnomalar",
  },
  {
    key: "/admin-panel/settings",
    icon: <SettingOutlined />,
    label: "Sozlamalar",
  },
  {
    key: "/",
    icon: <HomeOutlined />,
    label: "Bosh Sahifa",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  return (
    <Sider
      width={250}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
      theme="light"
    >
      <div className="p-4 text-xl font-bold border-b mb-2">
        Admin Panel
      </div>
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
}
