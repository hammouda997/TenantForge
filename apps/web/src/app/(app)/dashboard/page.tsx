'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api-client';
import {
  ErrorAlert,
  PageHeader,
  PageSkeleton,
  StatCard,
  StatusBadge,
} from '@tenantforge/ui';

interface OrganizationDetail {
  id: string;
  name: string;
  slug: string;
  _count: { memberships: number; projects: number };
  subscription: { status: string } | null;
}

export default function DashboardPage() {
  const { accessToken, activeOrgId } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['organization', activeOrgId],
    queryFn: () =>
      apiRequest<OrganizationDetail>('/organizations/current', {
        token: accessToken,
        orgId: activeOrgId ?? undefined,
      }),
    enabled: Boolean(accessToken && activeOrgId),
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError) {
    return <ErrorAlert message="Failed to load dashboard. Please try again." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={data?.name ?? 'Dashboard'}
        description="Organization overview and quick stats"
        action={
          data?.subscription?.status ? (
            <StatusBadge status={data.subscription.status} />
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Members" value={data?._count.memberships ?? 0} hint="Active in this org" />
        <StatCard label="Projects" value={data?._count.projects ?? 0} hint="Across all teams" />
        <StatCard
          label="Subscription"
          value={data?.subscription?.status?.toLowerCase() ?? 'none'}
          hint="Billing status"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Quick tips</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>Switch organizations using the header dropdown (Demo Organization / Acme Corporation).</li>
          <li>Open Projects to manage tasks with assignees and status badges.</li>
          <li>Check Audit Log for immutable activity history.</li>
        </ul>
      </div>
    </div>
  );
}
