"use client";

import { Layout, Dropdown, Avatar, Space, Badge } from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

const { Header: AntHeader } = Layout;

const userMenuItems: MenuProps["items"] = [
  {
    key: "profile",
    icon: <UserOutlined />,
    label: "Profil",
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "Sozlamalar",
  },
  {
    type: "divider",
  },
  {
    key: "logout",
    icon: <LogoutOutlined />,
    label: "Chiqish",
    danger: true,
  },
];

export default function Header() {
  const handleUserMenuClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "logout":
        // Handle logout
        console.log("Logout");
        break;
      case "profile":
        // Handle profile
        console.log("Profile");
        break;
      case "settings":
        // Handle settings
        console.log("Settings");
        break;
    }
  };

  return (
    <AntHeader
      style={{
        padding: "0 24px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="text-lg font-semibold">PhD Imtihonlar Tizimi</div>
      <Space size="large">
        <Badge count={5}>
          <BellOutlined
            style={{ fontSize: "20px", cursor: "pointer" }}
            onClick={() => console.log("Notifications")}
          />
        </Badge>
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
          placement="bottomRight"
        >
          <Space style={{ cursor: "pointer" }}>
            <Avatar icon={<UserOutlined />} />
            <span>Admin User</span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
