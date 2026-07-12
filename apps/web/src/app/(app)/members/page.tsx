'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api-client';
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  ErrorAlert,
  PageHeader,
  PageSkeleton,
  StatusBadge,
} from '@tenantforge/ui';

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
}

export default function MembersPage() {
  const { accessToken, activeOrgId } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['members', activeOrgId],
    queryFn: () =>
      apiRequest<Member[]>('/members', {
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
      <PageHeader
        title="Team members"
        description="Manage roles and access for your organization"
      />

      {isError && (
        <ErrorAlert message="Failed to load members. You may need Admin or Owner role." />
      )}

      {!isError && data?.length === 0 && (
        <EmptyState title="No members found" description="Invite teammates to collaborate." />
      )}

      <Card>
        <CardHeader>
          <h2 className="font-semibold">{data?.length ?? 0} members</h2>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-slate-100">
            {data?.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={member.user.name} />
                  <div>
                    <p className="font-medium text-slate-900">{member.user.name}</p>
                    <p className="text-sm text-slate-500">{member.user.email}</p>
                  </div>
                </div>
                <StatusBadge status={member.role} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
