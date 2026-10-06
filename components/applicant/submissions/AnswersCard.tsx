"use client";

import { Button } from "antd";
import { EditOutlined, EyeOutlined, PaperClipOutlined } from "@ant-design/icons";
import { answerDisplay, answerRaw, fileNameFromPath, type SubmissionAnswer } from "@/lib/applicant/submissions";
import { Card } from "@/components/applicant/ui/Card";
import type { PreviewFile } from "@/components/applicant/application-form/FilePreview";

interface AnswersCardProps {
  answers: SubmissionAnswer[];
  resolve: (path: string) => string | null;
  onPreview: (file: PreviewFile) => void;
  onEdit?: () => void;
}

/** The applicant's answers to the announcement's fields. */
export function AnswersCard({ answers, resolve, onPreview, onEdit }: AnswersCardProps) {
  return (
    <Card
      title="Javoblar"
      actions={
        onEdit && (
          <Button icon={<EditOutlined />} onClick={onEdit}>
            Tahrirlash
          </Button>
        )
      }
      flush
    >
      {answers.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted sm:px-5">Javoblar yo&apos;q</p>
      ) : (
        <dl className="divide-y divide-border">
          {answers.map((a) => {
            const raw = answerRaw(a);
            const path = a.field_type === "FILE" && typeof raw === "string" ? raw : "";
            const url = path ? resolve(path) : null;
            return (
              <div key={a.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4 sm:px-5">
                <dt className="text-xs font-medium text-muted sm:pt-0.5 sm:text-[13px]">{a.field_label}</dt>
                <dd className="min-w-0 break-words text-sm text-text">
                  {a.field_type === "FILE" ? (
                    url ? (
                      <button
                        type="button"
                        onClick={() => onPreview({ name: fileNameFromPath(path), url })}
                        className="inline-flex max-w-full items-center gap-1.5 text-primary hover:underline"
                      >
                        <PaperClipOutlined />
                        <span className="truncate">{fileNameFromPath(path)}</span>
                        <EyeOutlined className="text-[12px]" />
                      </button>
                    ) : (
                      <span className="text-muted">Fayl yuklanmagan</span>
                    )
                  ) : (
                    answerDisplay(a)
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </Card>
  );
}
