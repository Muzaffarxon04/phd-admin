"use client";

import { Breadcrumb, Card, Row, Col, Statistic, Progress, Avatar, Tag, Space, Button, Timeline, Alert } from "antd";
import { 
  HomeOutlined, 
  UserOutlined, 
  // MailOutlined, 
  // PhoneOutlined, 
  SafetyOutlined, 
  // TeamOutlined, 
  CheckCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  DollarOutlined
} from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { tokenStorage } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/themeStore";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";
import { Typography } from "antd";
const { Title, Text } = Typography;
interface User {
  id: number;
  phone_number: string;
  email?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  photo?: string | null;
  profile_completion: number;
  date_joined: string;
  last_login: string;
}

interface RecentActivity {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
  icon: React.ReactNode;
}

// Helper function to generate safe timestamp
const generateTimestamp = (hoursAgo: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

export default function DashboardPage() {
  const user = tokenStorage.getUser() as User | null;
  const { data: userData, isLoading } = useGet<User>("/auth/me/");
  const { theme } = useThemeStore();

  const currentUser = userData || user;

  const fullName = currentUser?.full_name || 
    `${currentUser?.last_name || ""} ${currentUser?.first_name || ""} ${currentUser?.middle_name || ""}`.trim() || 
    "Foydalanuvchi";

  const recentActivities: RecentActivity[] = [
    {
      id: 1,
      action: "Ariza yaratildi",
      description: "Fanlararo PhD dasturiga",
      timestamp: currentUser?.last_login || generateTimestamp(3),
      status: "completed",
      icon: <FileTextOutlined className="text-blue-500" />
    },
    {
      id: 2,
      action: "To'lov jarayoni",
      description: "100 000 UZS to'landi",
      timestamp: generateTimestamp(2),
      status: "completed",
      icon: <DollarOutlined className="text-green-500" />
    },
    {
      id: 3,
      action: "Hujjat yuklandi",
      description: "Ta'lim darajasi haqidgi guvohnoma",
      timestamp: generateTimestamp(5),
      status: "completed",
      icon: <CheckCircleOutlined className="text-green-500" />
    },
    {
      id: 4,
      action: "Oltmasli ariza",
      description: "Nashrlar ro'yxati",
      timestamp: generateTimestamp(24),
      status: "pending",
      icon: <ClockCircleOutlined className="text-orange-500" />
    }
  ];

  const stats = [
    {
      title: "Arizalar soni",
      value: 3,
      suffix: "/5",
      prefix: <FileTextOutlined />,
      valueStyle: { color: theme === "dark" ? "#ffffff" : "#1890ff" }
    },
    {
      title: "Topshirilgan",
      value: 2,
      suffix: "",
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: theme === "dark" ? "#ffffff" : "#52c41a" }
    },
    {
      title: "Kutilmoqda",
      value: 1,
      suffix: "",
      prefix: <ClockCircleOutlined />,
      valueStyle: { color: theme === "dark" ? "#ffffff" : "#faad14" }
    },
    {
      title: "Profil to'liqligi",
      value: currentUser?.profile_completion || 0,
      suffix: "%",
      prefix: <TrophyOutlined />,
      valueStyle: { color: theme === "dark" ? "#ffffff" : "#722ed1" }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "green";
      case "pending": return "orange";
      case "failed": return "red";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string, icon: React.ReactNode) => {
    if (status === "completed") {
      return <CheckCircleOutlined className="text-green-500" />;
    } else if (status === "pending") {
      return <ClockCircleOutlined className="text-orange-500" />;
    }
    return icon;
  };

  if (isLoading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Profil yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            {
              href: "/",
              title: (
                <span className="flex items-center gap-2">
                  <HomeOutlined /> Dashboard
                </span>
              ),
            },
            {
              title: "Bosh sahifa",
            },
          ]}
          className="mb-6"
        />

        {/* Welcome Section */}
        <div className="mb-8">
          <div className={`rounded-2xl p-8 text-white shadow-xl transform hover:scale-[1.02] transition-transform duration-300 ${
            theme === "dark" 
              ? " from-blue-700 to-purple-700" 
              : " from-blue-600 to-purple-600"
          }`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <Avatar
                  size={100}
                  src={currentUser?.photo}
                  icon={<UserOutlined />}
                  className="border-4 border-white shadow-lg"
                />
                <div>
                  <Title level={1} className="text-3xl font-bold mb-2">{fullName}</Title>
                  <Text className="text-blue-100 text-lg">
                    {currentUser?.role === "APPLICANT" ? "Ariza beruvchi" : currentUser?.role || "Foydalanuvchi"}
                  </Text>
                  <div className="flex items-center gap-3 mt-3">
                    {currentUser?.is_verified && (
                      <Tag 
                        icon={<CheckCircleOutlined />} 
                        color="success"
                        className="bg-white/20"
                      >
                        Tasdiqlangan
                      </Tag>
                    )}
                    <Tag className="bg-white/20">
                      <CalendarOutlined /> {formatDistanceToNow(new Date(currentUser?.date_joined || generateTimestamp(24 * 7)), { 
                        addSuffix: true, 
                        locale: uz 
                      })}
                    </Tag>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Progress
                  type="circle"
                  percent={currentUser?.profile_completion || 0}
                  strokeColor={{
                    '0%': theme === "dark" ? '#60a5fa' : '#60a5fa',
                    '100%': theme === "dark" ? '#7c3aed' : '#7c3aed',
                  }}
                  size={100}
                  format={(percent) => `${percent}%`}
                  trailColor={theme === "dark" ? '#1a1d29' : '#f0f0f0'}
                />
                <Text className="text-sm text-blue-100">Profil toliqligi</Text>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="transform hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer"
                bodyStyle={{ 
                  padding: "24px",
                  background: theme === "dark" ? "#1a1d29" : "#ffffff",
                  borderRadius: "16px",
                  color: theme === "dark" ? "#ffffff" : "#333333"
                }}
              >
                <Statistic
                  title={
                    <div className="flex items-center gap-2">
                      {stat.prefix}
                      <span className={`text-gray-600 dark:text-gray-400`}>{stat.title}</span>
                    </div>
                  }
                  value={stat.value}
                  suffix={stat.suffix}
                  valueStyle={stat.valueStyle}
                  prefix={stat.prefix}
                />
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <Row gutter={[24, 24]}>
          {/* Recent Activities */}
          <Col xs={24} lg={24}>
            <Card
              className="h-full transform hover:scale-[1.01] transition-all duration-300"
              bodyStyle={{ 
                padding: "24px",
                background: theme === "dark" ? "#1a1d29" : "#ffffff",
                borderRadius: "16px",
                color: theme === "dark" ? "#ffffff" : "#333333"
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ClockCircleOutlined className="text-blue-500" />
                  So&apos;nggi faoliyat
                </h2>
                <Button type="text" size="small">
                  Barchasini ko&apos;rish
                </Button>
              </div>
              
              <Timeline
                items={recentActivities.map(activity => ({
                  dot: getStatusIcon(activity.status, activity.icon),
                  color: getStatusColor(activity.status),
                  children: (
                    <div className={`p-4 rounded-lg ${theme === "dark" ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{activity.action}</h4>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(activity.timestamp), { 
                            addSuffix: true, 
                            locale: uz 
                          })}
                        </span>
                      </div>
                      <p className={`text-gray-600 dark:text-gray-400`}>{activity.description}</p>
                    </div>
                  )
                }))}
              />
            </Card>
          </Col>

        
        </Row>

     
      </div>
    </div>
  );
}