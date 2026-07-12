'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/lib/auth-context';
import { apiRequest, getWsUrl } from '@/lib/api-client';
import { Button, cn } from '@tenantforge/ui';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  data: Notification[];
  unreadCount: number;
}

export function NotificationBell() {
  const { accessToken, activeOrgId, user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications', activeOrgId],
    queryFn: () =>
      apiRequest<NotificationsResponse>('/notifications?page=1&limit=10', {
        token: accessToken,
        orgId: activeOrgId ?? undefined,
      }),
    enabled: Boolean(accessToken && activeOrgId),
    refetchInterval: 60_000,
  });

  const markAllRead = useMutation({
    mutationFn: () =>
      apiRequest('/notifications/read-all', {
        method: 'PATCH',
        token: accessToken,
        orgId: activeOrgId ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', activeOrgId] });
    },
  });

  useEffect(() => {
    if (!accessToken || !user) {
      return;
    }

    let socket: Socket | null = null;
    socket = io(`${getWsUrl()}/notifications`, {
      auth: { token: accessToken },
    });

    socket.on('notification', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', activeOrgId] });
    });

    return () => {
      socket?.disconnect();
    };
  }, [accessToken, user, activeOrgId, queryClient]);

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline"
                onClick={() => markAllRead.mutate()}
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {isLoading && <p className="p-4 text-sm text-slate-500">Loading...</p>}
            {isError && <p className="p-4 text-sm text-red-600">Failed to load notifications</p>}
            {!isLoading && !isError && data?.data.length === 0 && (
              <p className="p-4 text-sm text-slate-500">No notifications yet</p>
            )}
            {data?.data.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'border-b border-slate-50 px-4 py-3 last:border-0',
                  !n.read && 'bg-blue-50/50',
                )}
              >
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-slate-600">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
