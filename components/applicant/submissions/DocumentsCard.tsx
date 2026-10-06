"use client";

import { DownloadOutlined, FileTextOutlined } from "@ant-design/icons";
import { fileNameFromPath, type SubmissionDocument } from "@/lib/applicant/submissions";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/applicant/ui/Card";
import { StatusBadge } from "@/components/applicant/ui/StatusBadge";
import { downloadFile, type PreviewFile } from "@/components/applicant/application-form/FilePreview";

interface DocumentsCardProps {
  documents: SubmissionDocument[];
  resolve: (path: string) => string | null;
  onPreview: (file: PreviewFile) => void;
}

const docTone = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" } as const;
const docLabel = { PENDING: "Tekshirilmoqda", APPROVED: "Tasdiqlangan", REJECTED: "Rad etilgan" } as const;

export function DocumentsCard({ documents, resolve, onPreview }: DocumentsCardProps) {
  return (
    <Card title="Hujjatlar" flush>
      {documents.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted sm:px-5">Hujjatlar yo&apos;q</p>
      ) : (
        <ul className="divide-y divide-border">
          {documents.map((doc) => {
            const url = resolve(doc.file);
            const name = doc.file_name || fileNameFromPath(doc.file || "");
            return (
              <li key={doc.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
                  <FileTextOutlined />
                </span>
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => url && onPreview({ name, url })}
                  disabled={!url}
                >
                  <span className="block truncate text-sm font-medium text-text">{doc.document_type || name}</span>
                  <span className="tabular block text-xs text-muted">{formatDate(doc.uploaded_at)}</span>
                </button>
                {doc.status && <StatusBadge tone={docTone[doc.status]}>{docLabel[doc.status]}</StatusBadge>}
                {url && (
                  <button
                    type="button"
                    aria-label="Yuklab olish"
                    onClick={() => downloadFile({ name, url })}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text"
                  >
                    <DownloadOutlined />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
