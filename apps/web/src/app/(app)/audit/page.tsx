'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api-client';
import { Card, CardContent, CardHeader, PageSkeleton } from '@tenantforge/ui';

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  actor: { name: string; email: string } | null;
}

interface PaginatedAudit {
  data: AuditEntry[];
  meta: { total: number };
}

export default function AuditPage() {
  const { accessToken, activeOrgId } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit', activeOrgId],
    queryFn: () =>
      apiRequest<PaginatedAudit>('/audit?page=1&limit=50', {
        token: accessToken,
        orgId: activeOrgId ?? undefined,
      }),
    enabled: Boolean(accessToken && activeOrgId),
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-slate-600">Immutable activity trail for your organization</p>
      </div>

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load audit logs. Admin or Owner role required.
        </div>
      )}

      {!isError && data?.data.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
          No audit entries yet.
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Recent activity ({data?.meta.total ?? 0})</h2>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-slate-100">
            {data?.data.map((entry) => (
              <li key={entry.id} className="py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{entry.action}</p>
                    <p className="text-xs text-slate-500">
                      {entry.entityType}
                      {entry.entityId ? ` · ${entry.entityId}` : ''}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>{entry.actor?.name ?? 'System'}</p>
                    <p>{new Date(entry.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
