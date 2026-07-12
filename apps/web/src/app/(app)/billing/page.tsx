'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiRequest, ApiClientError } from '@/lib/api-client';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  ErrorAlert,
  PageHeader,
  PageSkeleton,
  StatusBadge,
} from '@tenantforge/ui';

interface BillingPlan {
  priceId: string;
  name: string;
  amountCents: number;
  interval: string;
}

interface Subscription {
  status: string;
  stripePriceId: string | null;
  currentPeriodEnd: string | null;
  mockMode: boolean;
  plans: BillingPlan[];
  invoices: Array<{
    id: string;
    amountDue: number;
    currency: string;
    status: string;
    hostedInvoiceUrl: string | null;
    createdAt: string;
  }>;
}

function formatMoney(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

export default function BillingPage() {
  const { accessToken, activeOrgId } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const success = searchParams.get('success');
  const plan = searchParams.get('plan');
  const manage = searchParams.get('manage') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['subscription', activeOrgId],
    queryFn: () =>
      apiRequest<Subscription>('/billing/subscription', {
        token: accessToken,
        orgId: activeOrgId ?? undefined,
      }),
    enabled: Boolean(accessToken && activeOrgId),
  });

  useEffect(() => {
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['subscription', activeOrgId] });
    }
  }, [success, activeOrgId, queryClient]);

  const checkout = useMutation({
    mutationFn: (priceId: string) =>
      apiRequest<{ url: string }>('/billing/checkout', {
        method: 'POST',
        body: { priceId },
        token: accessToken,
        orgId: activeOrgId ?? undefined,
      }),
    onMutate: () => setActionError(null),
    onSuccess: (result) => {
      if (result.url.startsWith('http')) {
        window.location.href = result.url;
      } else {
        router.push(result.url);
      }
    },
    onError: (err) => {
      setActionError(err instanceof ApiClientError ? err.message : 'Checkout failed');
    },
  });

  const portal = useMutation({
    mutationFn: () =>
      apiRequest<{ url: string }>('/billing/portal', {
        method: 'POST',
        token: accessToken,
        orgId: activeOrgId ?? undefined,
      }),
    onMutate: () => setActionError(null),
    onSuccess: (result) => {
      if (result.url.includes('manage=true')) {
        router.push('/billing?manage=true');
      } else {
        window.location.href = result.url;
      }
    },
    onError: (err) => {
      setActionError(err instanceof ApiClientError ? err.message : 'Could not open billing portal');
    },
  });

  const cancelSub = useMutation({
    mutationFn: () =>
      apiRequest('/billing/cancel', {
        method: 'POST',
        token: accessToken,
        orgId: activeOrgId ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', activeOrgId] });
      router.push('/billing?canceled=true');
    },
    onError: (err) => {
      setActionError(err instanceof ApiClientError ? err.message : 'Cancel failed');
    },
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  const activePlan = data?.plans.find((p) => p.priceId === data.stripePriceId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your subscription and invoices"
        action={
          data?.mockMode ? (
            <Badge variant="warning">Demo mode — no real charges</Badge>
          ) : undefined
        }
      />

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {plan
            ? `Successfully subscribed to the ${plan} plan.`
            : 'Subscription updated successfully.'}
        </div>
      )}

      {canceled && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Subscription canceled.
        </div>
      )}

      {isError && <ErrorAlert message="Failed to load billing information." />}
      {actionError && <ErrorAlert message={actionError} title="Action failed" />}

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Current plan</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-lg">
              Status:{' '}
              {data?.status ? <StatusBadge status={data.status} /> : <strong>unknown</strong>}
            </p>
            {activePlan && (
              <span className="text-sm text-slate-600">
                {activePlan.name} — {formatMoney(activePlan.amountCents, 'usd')}/mo
              </span>
            )}
          </div>
          {data?.currentPeriodEnd && (
            <p className="text-sm text-slate-600">
              Current period ends: {new Date(data.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {data?.plans.map((planOption) => (
              <Button
                key={planOption.priceId}
                variant={planOption.name === 'Pro' ? 'default' : 'outline'}
                onClick={() => checkout.mutate(planOption.priceId)}
                disabled={checkout.isPending}
              >
                {checkout.isPending ? 'Processing...' : `Subscribe ${planOption.name}`}
                <span className="ml-1 text-xs opacity-80">
                  ({formatMoney(planOption.amountCents, 'usd')}/mo)
                </span>
              </Button>
            ))}
            <Button variant="ghost" onClick={() => portal.mutate()} disabled={portal.isPending}>
              {portal.isPending ? 'Opening...' : 'Manage billing'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {manage && data?.mockMode && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Manage subscription (demo)</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              In production this opens the Stripe Customer Portal. In demo mode you can cancel
              below.
            </p>
            <Button
              variant="destructive"
              onClick={() => cancelSub.mutate()}
              disabled={cancelSub.isPending || data.status === 'CANCELED'}
            >
              {cancelSub.isPending ? 'Canceling...' : 'Cancel subscription'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Recent invoices</h2>
        </CardHeader>
        <CardContent>
          {!data?.invoices?.length ? (
            <p className="text-sm text-slate-500">No invoices yet. Subscribe to generate one.</p>
          ) : (
            <ul className="space-y-2">
              {data.invoices.map((invoice) => (
                <li
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {formatMoney(invoice.amountDue, invoice.currency)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(invoice.createdAt).toLocaleDateString()} — {invoice.status}
                    </p>
                  </div>
                  {invoice.hostedInvoiceUrl && (
                    <a
                      href={invoice.hostedInvoiceUrl}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
