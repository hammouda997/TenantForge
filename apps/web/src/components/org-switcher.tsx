'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api-client';

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export function OrgSwitcher() {
  const { accessToken, activeOrgId, setActiveOrgId } = useAuth();

  const { data: orgs, isLoading, isError } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => apiRequest<Organization[]>('/organizations', { token: accessToken }),
    enabled: Boolean(accessToken),
  });

  useEffect(() => {
    if (orgs?.length && !activeOrgId) {
      setActiveOrgId(orgs[0]!.id);
    }
  }, [orgs, activeOrgId, setActiveOrgId]);

  if (isLoading) {
    return <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-200" />;
  }

  if (isError || !orgs?.length) {
    return <span className="text-sm text-slate-500">No organization</span>;
  }

  return (
    <select
      value={activeOrgId ?? ''}
      onChange={(e) => setActiveOrgId(e.target.value)}
      className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Select organization"
    >
      {orgs.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  );
}
