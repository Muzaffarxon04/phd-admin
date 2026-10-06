"use client";

import { useMemo, useState } from "react";
import { Button, Input, Skeleton } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/applicant/errors";
import { unwrapApplications } from "@/lib/applicant/applications";
import { PageHeader } from "@/components/applicant/ui/PageHeader";
import { EmptyState } from "@/components/applicant/ui/EmptyState";
import { ApplicationCard } from "@/components/applicant/applications/ApplicationCard";

export default function ApplicationsPage() {
  const { data, isLoading, isError, error, refetch } = useGet<unknown>("/applicant/applications/");
  const [search, setSearch] = useState("");

  const applications = useMemo(() => unwrapApplications(data), [data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter(
      (a) => a.title.toLowerCase().includes(q) || (a.description ?? "").toLowerCase().includes(q)
    );
  }, [applications, search]);

  return (
    <>
      <PageHeader
        title="Arizalar"
        description="Ochiq qabul e'lonlari. Ariza berish uchun shaxsingiz TSMU ID orqali tasdiqlangan bo'lishi kerak."
        actions={
          <Input
            allowClear
            prefix={<SearchOutlined className="text-muted" />}
            placeholder="Ariza nomi bo'yicha izlash"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72"
          />
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-5">
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Arizalarni yuklab bo'lmadi"
          description={getErrorMessage(error)}
          action={<Button onClick={() => refetch()}>Qayta urinish</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? "Hech narsa topilmadi" : "Hozircha ochiq arizalar yo'q"}
          description={search ? "Boshqa so'z bilan izlab ko'ring" : "Yangi qabul e'lon qilinganda shu yerda ko'rinadi"}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </>
  );
}
