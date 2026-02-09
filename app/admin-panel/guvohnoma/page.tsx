"use client";

import { useState } from "react";
import { Card, Button, Select, Typography, message } from "antd";
import { DownloadOutlined, FileWordOutlined } from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import { wordsApi } from "@/lib/api/words";
import type { Speciality } from "@/types";

const { Title } = Typography;
const { Option } = Select;

interface Application {
    id: number;
    title: string;
    application_specialities: Speciality[];
}

export default function GuvohnomaPage() {
    const { theme } = useThemeStore();
    const [selectedApplication, setSelectedApplication] = useState<string | undefined>(undefined);
    const [selectedSpeciality, setSelectedSpeciality] = useState<string | undefined>(undefined);
    const [isDownloading, setIsDownloading] = useState(false);
    const [selectedApplications, setSelectedApplications] = useState<Speciality[] | []>([]);
    // Fetch applications
    const { data: applicationsData, isLoading: isAppsLoading } = useGet<{
        data:  Application[] ;
    }>("/admin/application/approved/submissions/");



    const applications = applicationsData?.data || [];

    const handleDownload = async () => {
        if (!selectedApplication && !selectedSpeciality) {
            message.warning("Iltimos, kamida bitta-sini tanlang (Ariza yoki Mutaxassislik)");
            return;
        }

        setIsDownloading(true);
        try {
            const blob = await wordsApi.generateBulkTemplates(selectedApplication, selectedSpeciality);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            // Set filename
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute("download", `guvohnomalar_${date}.zip`); // Assuming it returns a zip or docx

            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            message.success("Fayl muvaffaqiyatli yuklab olindi");
        } catch (error) {
            console.error("Download error:", error);
            message.error("Faylni yuklashda xatolik yuz berdi");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
            {/* Page Header */}
            <div>
                <Title level={4} className="!mb-1" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
                    Guvohnoma Yuklash
                </Title>
                <div className="text-gray-400 text-sm font-medium">
                    Talabgorlar uchun guvohnoma shablonlarini yuklab olish
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card

                    style={{
                        background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                        border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                        boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
                    }}
                >
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="w-full md:w-1/3">
                            <div className="mb-2 font-medium" style={{ color: theme === "dark" ? "#cfcfcf" : "#4b5563" }}>
                                Ariza turi
                            </div>
                            <Select
                                placeholder="Ariza turini tanlang"
                                className="w-full h-[42px] premium-select"
                                loading={isAppsLoading}
                                allowClear
                                onChange={(value) => {
                                    setSelectedApplication(value);
                                    setSelectedSpeciality(undefined);
                                    setSelectedApplications(applications?.find(spec => spec.id  == value)?.application_specialities || []);
                                }}
                                dropdownStyle={{
                                    backgroundColor: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff"
                                }}
                            >
                                {applications.map((app) => (
                                    <Option key={app.id} value={app.id.toString()}>
                                        {app.title}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <div className="w-full md:w-1/3">
                            <div className="mb-2 font-medium" style={{ color: theme === "dark" ? "#cfcfcf" : "#4b5563" }}>
                                Mutaxassislik
                            </div>
                            <Select
                                placeholder="Mutaxassislikni tanlang"
                                className="w-full h-[42px] premium-select"
                                loading={isAppsLoading}
                                allowClear
                                onChange={(value) => {
                                    setSelectedSpeciality(value);
                                 
                                }}
                                showSearch
                                optionFilterProp="children"
                                dropdownStyle={{
                                    backgroundColor: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff"
                                }}
                            >
                                {selectedApplications.map((spec) => (
                                    <Option key={spec.id} value={spec.id.toString()}>
                                        {spec.speciality_code} - {spec.speciality_name}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <div className="w-full md:w-1/3">
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                className="w-full h-[42px] rounded-xl font-bold"
                                onClick={handleDownload}
                                loading={isDownloading}
                                disabled={!selectedApplication && !selectedSpeciality}
                                style={{
                                    background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
                                    border: "none",
                                    boxShadow: "0 8px 25px -8px #7367f0",
                                }}
                            >
                                Yuklab olish
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Info Card */}
                <Card
                    className="md:col-span-2"
                    style={{
                        background: theme === "dark" ? "rgba(115, 103, 240, 0.1)" : "#f4f3ff",
                        border: "1px solid rgba(115, 103, 240, 0.2)",
                    }}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-[#7367f0]/20 text-[#7367f0]">
                            <FileWordOutlined style={{ fontSize: "24px" }} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#7367f0] mb-1">Yoriqnoma</h3>
                            <p className="text-sm opacity-80" style={{ color: theme === "dark" ? "#e2e8f0" : "#484650" }}>
                                Ushbu sahifa orqali siz tanlangan ariza yoki mutaxassislik boyicha barcha talabgorlarning guvohnomalarini Word formatida yuklab olishingiz mumkin.
                            </p>
                        </div>
                    </div>
                </Card>

            </div>

            <style jsx global>{`
        .premium-select .ant-select-selector {
          background: ${theme === "dark" ? "rgb(30, 38, 60)" : "#f8f8f8"} !important;
          border: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)"} !important;
          color: ${theme === "dark" ? "#ffffff" : "#484650"} !important;
          border-radius: 12px !important;
          display: flex !important;
          align-items: center !important;
        }
        .premium-select .ant-select-selection-placeholder {
          color: ${theme === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"} !important;
        }
      `}</style>
        </div>
    );
}
