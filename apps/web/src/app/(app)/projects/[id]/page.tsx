'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api-client';
import {
  Avatar,
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

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee: { id: string; name: string } | null;
}

interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  tasks: Task[];
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { accessToken, activeOrgId } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['project', params.id, activeOrgId],
    queryFn: () =>
      apiRequest<ProjectDetail>(`/projects/${params.id}`, {
        token: accessToken,
        orgId: activeOrgId ?? undefined,
      }),
    enabled: Boolean(accessToken && activeOrgId && params.id),
  });

  const createTask = useMutation({
    mutationFn: (body: { title: string }) =>
      apiRequest(`/projects/${params.id}/tasks`, {
        method: 'POST',
        body,
        token: accessToken,
        orgId: activeOrgId ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', params.id, activeOrgId] });
      setTitle('');
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: Task['status'] }) =>
      apiRequest(`/projects/${params.id}/tasks/${taskId}`, {
        method: 'PATCH',
        body: { status },
        token: accessToken,
        orgId: activeOrgId ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', params.id, activeOrgId] });
    },
  });

  const handleCreateTask = (e: FormEvent) => {
    e.preventDefault();
    createTask.mutate({ title });
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data) {
    return <ErrorAlert message="Project not found or failed to load." />;
  }

  const doneCount = data.tasks.filter((t) => t.status === 'DONE').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.name}
        description={data.description ?? 'No description'}
        action={
          <span className="text-sm text-slate-500">
            {doneCount}/{data.tasks.length} tasks done
          </span>
        }
      />

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Add task</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTask} className="flex gap-3">
            <Input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={createTask.isPending}>
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {data.tasks.length === 0 ? (
        <EmptyState title="No tasks yet" description="Add your first task above." />
      ) : (
        <ul className="space-y-3">
          {data.tasks.map((task) => (
            <li key={task.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {task.assignee && <Avatar name={task.assignee.name} size="sm" />}
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.assignee && (
                      <p className="text-xs text-slate-500">{task.assignee.name}</p>
                    )}
                  </div>
                </div>
                <select
                  value={task.status}
                  onChange={(e) =>
                    updateTask.mutate({
                      taskId: task.id,
                      status: e.target.value as Task['status'],
                    })
                  }
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                  aria-label={`Status for ${task.title}`}
                >
                  <option value="TODO">Todo</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div className="mt-2">
                <StatusBadge status={task.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
