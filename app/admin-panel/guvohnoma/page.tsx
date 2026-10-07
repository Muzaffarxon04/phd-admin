"use client";

import { useState } from "react";
import { Button, Select, App } from "antd";
import { DownloadOutlined, FileWordOutlined } from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import { wordsApi } from "@/lib/api/words";
import type { Speciality } from "@/types";
import { AdminCard, PageHeader } from "@/components/admin/ui";

const { Option } = Select;

interface Application {
    application_id: number;
    application_title: string;
    title: string;
    specialities: Speciality[];
}

export default function GuvohnomaPage() {
    const { message } = App.useApp();
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
            link.setAttribute("download", `guvohnomalar_${date}.docx`);

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

    const dropdownStyle = { backgroundColor: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff" };

    return (
        <div className="space-y-5 sm:space-y-6">
            <PageHeader
                title="Guvohnoma Yuklash"
                subtitle="Talabgorlar uchun guvohnoma shablonlarini yuklab olish"
            />

            <AdminCard>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(180px,240px)] lg:items-end lg:gap-6">
                    <div className="block min-w-0">
                        <span className="admin-heading mb-2 block text-[14px] font-medium">Ariza turi</span>
                        <Select
                            placeholder="Ariza turini tanlang"
                            className="w-full premium-select"
                            size="large"
                            loading={isAppsLoading}
                            allowClear
                            onChange={(value) => {
                                setSelectedApplication(value);
                                setSelectedSpeciality(undefined);
                                setSelectedApplications(applications?.find(app => app.application_id.toString() === value)?.specialities || []);
                            }}
                            value={selectedApplication}
                            dropdownStyle={dropdownStyle}
                            popupMatchSelectWidth
                        >
                            {applications.map((app) => (
                                <Option key={app.application_id} value={app.application_id.toString()}>
                                    {app.application_title}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="block min-w-0">
                        <span className="admin-heading mb-2 block text-[14px] font-medium">Mutaxassislik</span>
                        <Select
                            placeholder="Mutaxassislikni tanlang"
                            className="w-full premium-select"
                            size="large"
                            loading={isAppsLoading}
                            allowClear
                            value={selectedSpeciality}
                            onChange={(value) => {
                                setSelectedSpeciality(value);
                            }}
                            disabled={!selectedApplication}
                            showSearch
                            optionFilterProp="children"
                            dropdownStyle={dropdownStyle}
                            popupMatchSelectWidth
                        >
                            {selectedApplications.map((spec) => {
                                const parentName =
                                    (spec as unknown as { parent?: { name?: string }; parent_name?: string }).parent?.name ||
                                    (spec as unknown as { parent_name?: string }).parent_name ||
                                    undefined;
                                const baseName = spec.speciality_name || spec.name;
                                return (
                                    <Option key={spec.id} value={spec.speciality?.toString()}>
                                        {spec.speciality_code || spec.code} - {baseName}
                                        {parentName ? ` (${parentName})` : ""}
                                        {spec.is_foreign ? " (Chet tili)" : ""}
                                    </Option>
                                );
                            })}
                        </Select>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                        <Button
                            type="primary"
                            size="large"
                            icon={<DownloadOutlined />}
                            block
                            className="guvohnoma-download-btn font-bold"
                            onClick={handleDownload}
                            loading={isDownloading}
                            disabled={!selectedApplication && !selectedSpeciality}
                        >
                            Yuklab olish
                        </Button>
                    </div>
                </div>
            </AdminCard>

            {/* Info Card */}
            <AdminCard variant="tinted" padding="sm">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-[#7367f0]/20 text-[#7367f0]">
                        <FileWordOutlined style={{ fontSize: "22px" }} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="m-0 mb-1 text-base font-bold text-[#7367f0]">Yoriqnoma</h3>
                        <p className="m-0 text-[14px] leading-relaxed" style={{ color: "var(--admin-text)" }}>
                            Ushbu sahifa orqali siz tanlangan ariza yoki mutaxassislik boyicha barcha talabgorlarning guvohnomalarini Word formatida yuklab olishingiz mumkin.
                        </p>
                    </div>
                </div>
            </AdminCard>

            <style jsx global>{`
        .premium-select .ant-select-selector {
          background: ${theme === "dark" ? "rgb(30, 38, 60)" : "#f8f8f8"} !important;
          border: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)"} !important;
          color: ${theme === "dark" ? "#ffffff" : "#484650"} !important;
          border-radius: 12px !important;
          display: flex !important;
          align-items: center !important;
        }
        .premium-select.ant-select-lg {
          min-height: 44px;
        }
        .premium-select .ant-select-selection-placeholder {
          color: ${theme === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"} !important;
        }
        .guvohnoma-download-btn.ant-btn {
          height: 44px;
          border-radius: 12px;
        }
        .guvohnoma-download-btn.ant-btn:not(:disabled) {
          background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7));
          border: none;
          box-shadow: 0 8px 25px -8px #7367f0;
        }
      `}</style>
        </div>
    );
}
