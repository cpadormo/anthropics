import { TopBar } from "@/components/layout/topbar";
import { DashboardGrid } from "@/components/layout/dashboard-grid";

export default function Page() {
  return (
    <main className="min-h-screen">
      <TopBar />
      <div className="px-4 pb-10">
        <DashboardGrid />
      </div>
    </main>
  );
}
