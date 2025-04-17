import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { SmsGatewayStatus } from "@/components/dashboard/sms-gateway-status";
import { createServerClient } from "@/lib/supabase-server";

export default async function DashboardPage() {
  const supabase = createServerClient();

  // Get stats for the dashboard
  const { data: messagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true });

  const { data: recentMessages } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-3">
          <DashboardOverview
            messagesCount={messagesCount?.count || 0}
            recentMessages={recentMessages || []}
          />
        </div>
        <div className="space-y-6">
          <SmsGatewayStatus />
        </div>
      </div>
    </div>
  );
}
