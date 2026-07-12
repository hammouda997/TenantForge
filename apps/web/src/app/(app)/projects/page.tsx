'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api-client';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  ErrorAlert,
  Input,
  PageHeader,
  PageSkeleton,
  StatusBadge,
} from '@tenantforge/ui';

interface Project {
  id: string;
  name: string;
  description: string | null;
  _count: { tasks: number };
}

interface PaginatedProjects {
  data: Project[];
  meta: { total: number };
}

export default function ProjectsPage() {
  const { accessToken, activeOrgId } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects', activeOrgId],
    queryFn: () =>
      apiRequest<PaginatedProjects>('/projects?page=1&limit=50', {
        token: accessToken,
        orgId: activeOrgId ?? undefined,
      }),
    enabled: Boolean(accessToken && activeOrgId),
  });

  const createProject = useMutation({
    mutationFn: (body: { name: string; description?: string }) =>
      apiRequest('/projects', {
        method: 'POST',
        body,
        token: accessToken,
        orgId: activeOrgId ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', activeOrgId] });
      setName('');
      setDescription('');
    },
  });

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    createProject.mutate({ name, description: description || undefined });
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description={`${data?.meta.total ?? 0} projects in this organization`}
      />

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Create project</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
            <Input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="min-w-[200px] flex-1"
            />
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-w-[200px] flex-1"
            />
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? 'Creating...' : 'Create'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isError && <ErrorAlert message="Failed to load projects." />}

      {!isError && data?.data.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking tasks."
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.data.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <h3 className="font-semibold">{project.name}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {project.description ?? 'No description'}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge status="IN_PROGRESS" />
                  <span className="text-xs text-slate-500">{project._count.tasks} tasks</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
