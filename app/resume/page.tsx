import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Download, FileBadge } from "lucide-react";

export default async function ResumePage() {
  const profile = await prisma.profile.findFirst();

  return (
    <div>
      <PageHeader
        title="Resume Center"
        description="Academic resume, CV, and professional resume — viewable inline and downloadable."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <ResumeCard label="Academic Resume" url={profile?.resumePdfUrl} filename="resume.pdf" />
        <ResumeCard label="Curriculum Vitae" url={profile?.cvPdfUrl} filename="cv.pdf" />
      </div>

      {(profile?.resumePdfUrl || profile?.cvPdfUrl) && (
        <div className="card mt-6 p-4">
          <h2 className="text-base font-semibold">Inline preview</h2>
          {profile?.cvPdfUrl ? (
            <iframe src={profile.cvPdfUrl} className="mt-3 h-[800px] w-full rounded-md border" style={{ borderColor: "var(--border)" }} />
          ) : profile?.resumePdfUrl ? (
            <iframe src={profile.resumePdfUrl} className="mt-3 h-[800px] w-full rounded-md border" style={{ borderColor: "var(--border)" }} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function ResumeCard({ label, url, filename }: { label: string; url?: string | null; filename: string }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
          <FileBadge className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold">{label}</div>
          <div className="text-xs" style={{ color: "var(--text-soft)" }}>
            {url ? "Latest version uploaded" : "No file uploaded yet"}
          </div>
        </div>
      </div>
      {url && (
        <a href={url} download={filename} target="_blank" rel="noreferrer" className="btn-primary mt-4">
          <Download className="h-4 w-4" /> Download
        </a>
      )}
    </div>
  );
}
