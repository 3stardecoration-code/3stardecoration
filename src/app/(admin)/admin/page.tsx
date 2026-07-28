import { getDataService } from "@/lib/services";
import { DashboardMetrics } from "@/components/admin/DashboardMetrics";
import { RecentEnquiries } from "@/components/admin/RecentEnquiries";

// The dashboard is dynamic since it shows live mock DB data
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const db = getDataService();
  
  // Fetch mock data
  const { data: allEnquiries } = await db.enquiries.list({ limit: 100 });
  
  const totalEnquiries = allEnquiries.length;
  const newEnquiries = allEnquiries.filter((e) => e.status === "new").length;
  
  // Top 5 most recent for the table
  const recentEnquiries = allEnquiries.slice(0, 5);

  return (
    <div className="space-y-12">
      <DashboardMetrics
        totalEnquiries={totalEnquiries}
        newEnquiries={newEnquiries}
      />
      <RecentEnquiries enquiries={recentEnquiries} />
    </div>
  );
}
