"use client";

import { Tag } from "antd";
import { FileTextOutlined, UserOutlined } from "@ant-design/icons";
import { getExaminerRoleLabel } from "@/lib/utils";
import { InfoItem, useAdminSurface } from "./ui";

export interface ApplicationExaminer {
  id: number;
  full_name: string | null;
  title: string;
  department: string;
  academic_degree: string;
  position: string;
  role: "CHAIRMAN" | "PRE_CHAIRMAN" | "SECRETARY" | "MEMBER";
  role_display: string;
}

export interface ApplicationSpecialityDetail {
  id: number;
  name: string;
  code: string;
  description: string;
  examiners: ApplicationExaminer[];
  comment?: string;
  file?: string | null;
  file_speciality_id?: number;
}

const roleColor = (role: ApplicationExaminer["role"]) =>
  role === "CHAIRMAN" ? "gold" : role === "PRE_CHAIRMAN" ? "orange" : role === "SECRETARY" ? "blue" : "green";

/** One speciality of an application with its examiners, comment and file. */
export function SpecialityOverviewCard({
  speciality,
  onPreviewFile,
}: {
  speciality: ApplicationSpecialityDetail;
  onPreviewFile: (path: string) => void;
}) {
  const s = useAdminSurface();

  return (
    <div className="rounded-xl" style={{ background: s.subtleBg, border: `1px solid ${s.subtleBorder}` }}>
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${s.subtleBorder}` }}>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-md px-2 py-0.5 text-xs font-bold"
            style={{ background: "rgba(115, 103, 240, 0.12)", color: "#7367f0" }}
          >
            {speciality.code}
          </span>
          <span className="min-w-0 break-words font-semibold" style={{ color: s.heading }}>
            {speciality.name}
          </span>
        </div>
        {speciality.description && (
          <p className="m-0 mt-1 text-sm" style={{ color: s.muted }}>
            {speciality.description}
          </p>
        )}
      </div>

      <div className="p-4">
        {speciality.examiners && speciality.examiners.length > 0 ? (
          <>
            <h5 className="mb-3 text-sm font-semibold" style={{ color: s.text }}>
              Imtihonchilar:
            </h5>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {speciality.examiners.map((examiner) => (
                <div
                  key={examiner.id}
                  className="rounded-lg p-3"
                  style={{ background: s.cardBg, border: `1px solid ${s.subtleBorder}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "rgba(115, 103, 240, 0.12)", color: "#7367f0" }}
                      >
                        <UserOutlined />
                      </span>
                      <span className="min-w-0 break-words text-sm font-semibold" style={{ color: s.heading }}>
                        {examiner.full_name || "Noma'lum"}
                      </span>
                    </div>
                    <Tag color={roleColor(examiner.role)} className="mr-0! shrink-0">
                      {getExaminerRoleLabel(examiner.role)}
                    </Tag>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <InfoItem label="Unvon">{examiner.title || "Kiritilmagan"}</InfoItem>
                    <InfoItem label="Kafedra">{examiner.department || "Kiritilmagan"}</InfoItem>
                    {!!examiner.academic_degree && <InfoItem label="Ilmiy daraja">{examiner.academic_degree}</InfoItem>}
                    {!!examiner.position && <InfoItem label="Lavozim">{examiner.position}</InfoItem>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-4 text-center text-sm" style={{ color: s.muted }}>
            Imtihonchilar tayinlanmagan
          </div>
        )}

        {(speciality.comment || speciality.file) && (
          <div className="mt-4 space-y-2 border-t pt-3" style={{ borderColor: s.subtleBorder }}>
            {speciality.comment && (
              <div className="text-sm">
                <span className="font-medium" style={{ color: s.muted }}>
                  Izoh:{" "}
                </span>
                <span style={{ color: s.text }}>{speciality.comment}</span>
              </div>
            )}
            {speciality.file && (
              <button
                type="button"
                onClick={() => onPreviewFile(speciality.file!)}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-sm font-medium text-[#7367f0] hover:underline sm:min-h-0"
              >
                <FileTextOutlined />
                Ko&apos;rish
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
