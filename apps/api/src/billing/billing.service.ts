import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { CheckoutSessionDto } from '../common/dto/validation.dto';
import { asJson } from '../common/utils/json';

export interface BillingPlan {
  priceId: string;
  name: string;
  amountCents: number;
  interval: 'month';
}

export interface CheckoutResult {
  url: string;
  sessionId?: string;
  mock?: boolean;
}

export interface PortalResult {
  url: string;
  mock?: boolean;
}

const MOCK_PLANS: Record<string, Omit<BillingPlan, 'priceId'>> = {
  price_starter_mock: { name: 'Starter', amountCents: 2900, interval: 'month' },
  price_pro_mock: { name: 'Pro', amountCents: 4900, interval: 'month' },
};

@Injectable()
export class BillingService {
  private readonly stripe: Stripe | null;
  private readonly logger = new Logger(BillingService.name);
  private readonly mockMode: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY') ?? '';
    this.mockMode = this.resolveMockMode(secretKey);
    this.stripe = this.mockMode ? null : new Stripe(secretKey);
    if (this.mockMode) {
      this.logger.log('Billing running in MOCK mode (no Stripe API calls)');
    }
  }

  isMockMode(): boolean {
    return this.mockMode;
  }

  getPlans(): BillingPlan[] {
    const starterId =
      this.configService.get<string>('STRIPE_PRICE_ID_STARTER') ?? 'price_starter_mock';
    const proId = this.configService.get<string>('STRIPE_PRICE_ID_PRO') ?? 'price_pro_mock';

    return [
      { priceId: starterId, ...MOCK_PLANS.price_starter_mock! },
      { priceId: proId, ...MOCK_PLANS.price_pro_mock! },
    ];
  }

  async getSubscription(orgId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId: orgId },
      include: { invoices: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return {
      ...subscription,
      mockMode: this.mockMode,
      plans: this.getPlans(),
    };
  }

  async createCheckoutSession(
    orgId: string,
    userId: string,
    dto: CheckoutSessionDto,
  ): Promise<CheckoutResult> {
    if (this.mockMode) {
      return this.mockCheckout(orgId, userId, dto.priceId);
    }
    return this.stripeCheckout(orgId, userId, dto.priceId);
  }

  async createPortalSession(orgId: string, userId: string): Promise<PortalResult> {
    if (this.mockMode) {
      return this.mockPortal(orgId, userId);
    }
    return this.stripePortal(orgId, userId);
  }

  async cancelSubscription(orgId: string, userId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId: orgId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (this.mockMode) {
      await this.prisma.subscription.update({
        where: { organizationId: orgId },
        data: {
          status: SubscriptionStatus.CANCELED,
          stripePriceId: null,
          currentPeriodEnd: new Date(),
        },
      });

      await this.auditService.log({
        organizationId: orgId,
        actorId: userId,
        action: 'billing.subscription_canceled',
        entityType: 'Subscription',
        metadata: asJson({ mock: true }),
      });
      return;
    }

    if (!subscription.stripeSubscriptionId || !this.stripe) {
      throw new BadRequestException('No active Stripe subscription');
    }

    await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    await this.prisma.subscription.update({
      where: { organizationId: orgId },
      data: { status: SubscriptionStatus.CANCELED },
    });

    await this.auditService.log({
      organizationId: orgId,
      actorId: userId,
      action: 'billing.subscription_canceled',
      entityType: 'Subscription',
      entityId: subscription.stripeSubscriptionId,
    });
  }

  private async mockCheckout(
    orgId: string,
    userId: string,
    priceId: string,
  ): Promise<CheckoutResult> {
    const plan = this.resolvePlan(priceId);
    const origin = this.getOrigin();
    const periodEnd = daysFromNow(30);

    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId: orgId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    await this.prisma.organization.update({
      where: { id: orgId },
      data: { stripeCustomerId: `cus_mock_${orgId.slice(0, 8)}` },
    });

    await this.prisma.subscription.update({
      where: { organizationId: orgId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        stripePriceId: priceId,
        stripeSubscriptionId: `sub_mock_${orgId.slice(0, 8)}`,
        currentPeriodEnd: periodEnd,
      },
    });

    const invoiceId = `in_mock_${Date.now()}`;
    await this.prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        stripeInvoiceId: invoiceId,
        amountDue: plan.amountCents,
        currency: 'usd',
        status: 'paid',
        hostedInvoiceUrl: `${origin}/billing?invoice=${invoiceId}`,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      actorId: userId,
      action: 'billing.checkout_completed',
      entityType: 'Subscription',
      metadata: asJson({ mock: true, plan: plan.name, priceId }),
    });

    return {
      url: `${origin}/billing?success=true&plan=${encodeURIComponent(plan.name)}`,
      sessionId: `cs_mock_${Date.now()}`,
      mock: true,
    };
  }

  private async mockPortal(orgId: string, userId: string): Promise<PortalResult> {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    if (!org.stripeCustomerId) {
      await this.prisma.organization.update({
        where: { id: orgId },
        data: { stripeCustomerId: `cus_mock_${orgId.slice(0, 8)}` },
      });
    }

    await this.auditService.log({
      organizationId: orgId,
      actorId: userId,
      action: 'billing.portal_opened',
      entityType: 'Subscription',
      metadata: asJson({ mock: true }),
    });

    const origin = this.getOrigin();
    return {
      url: `${origin}/billing?manage=true`,
      mock: true,
    };
  }

  private async stripeCheckout(
    orgId: string,
    userId: string,
    priceId: string,
  ): Promise<CheckoutResult> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    let customerId = org.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        name: org.name,
        metadata: { organizationId: orgId },
      });
      customerId = customer.id;
      await this.prisma.organization.update({
        where: { id: orgId },
        data: { stripeCustomerId: customerId },
      });
    }

    const origin = this.getOrigin();

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing?success=true`,
      cancel_url: `${origin}/billing?canceled=true`,
      metadata: { organizationId: orgId },
    });

    await this.auditService.log({
      organizationId: orgId,
      actorId: userId,
      action: 'billing.checkout_started',
      entityType: 'Subscription',
      metadata: asJson({ priceId, sessionId: session.id }),
    });

    return { url: session.url ?? `${origin}/billing`, sessionId: session.id };
  }

  private async stripePortal(orgId: string, userId: string): Promise<PortalResult> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org?.stripeCustomerId) {
      throw new BadRequestException('No billing account found. Subscribe to a plan first.');
    }

    const origin = this.getOrigin();

    const session = await this.stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${origin}/billing`,
    });

    await this.auditService.log({
      organizationId: orgId,
      actorId: userId,
      action: 'billing.portal_opened',
      entityType: 'Subscription',
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined): Promise<void> {
    if (this.mockMode) {
      throw new BadRequestException('Webhooks disabled in mock billing mode');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret || !signature || !this.stripe) {
      throw new BadRequestException('Webhook not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Webhook signature verification failed', error);
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const orgId = session.metadata?.organizationId;
    if (!orgId || !session.subscription || !this.stripe) {
      return;
    }

    const subscription = await this.stripe.subscriptions.retrieve(String(session.subscription));
    const priceId = subscription.items.data[0]?.price.id;

    await this.prisma.subscription.update({
      where: { organizationId: orgId },
      data: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        status: this.mapStripeStatus(subscription.status),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      action: 'billing.subscription_activated',
      entityType: 'Subscription',
      entityId: subscription.id,
    });
  }

  private async handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
    const org = await this.prisma.organization.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    });
    if (!org) {
      return;
    }

    await this.prisma.subscription.update({
      where: { organizationId: org.id },
      data: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
        status: this.mapStripeStatus(subscription.status),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription) {
      return;
    }

    const sub = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: String(invoice.subscription) },
    });
    if (!sub) {
      return;
    }

    await this.prisma.invoice.upsert({
      where: { stripeInvoiceId: invoice.id },
      create: {
        subscriptionId: sub.id,
        stripeInvoiceId: invoice.id,
        amountDue: invoice.amount_due,
        currency: invoice.currency,
        status: invoice.status ?? 'paid',
        hostedInvoiceUrl: invoice.hosted_invoice_url ?? undefined,
      },
      update: {
        amountDue: invoice.amount_due,
        status: invoice.status ?? 'paid',
        hostedInvoiceUrl: invoice.hosted_invoice_url ?? undefined,
      },
    });
  }

  private resolvePlan(priceId: string): BillingPlan {
    const plans = this.getPlans();
    const match = plans.find((p) => p.priceId === priceId);
    if (match) {
      return match;
    }

    const mockFallback = MOCK_PLANS[priceId];
    if (mockFallback) {
      return { priceId, ...mockFallback };
    }

    return {
      priceId,
      name: 'Custom',
      amountCents: 4900,
      interval: 'month',
    };
  }

  private resolveMockMode(secretKey: string): boolean {
    const explicit = this.configService.get<string>('BILLING_MOCK_MODE');
    if (explicit === 'true') {
      return true;
    }
    if (explicit === 'false') {
      return false;
    }
    return (
      !secretKey ||
      secretKey.includes('replace_me') ||
      secretKey === 'sk_test_placeholder' ||
      !secretKey.startsWith('sk_')
    );
  }

  private getOrigin(): string {
    return this.configService.get<string>('CORS_ORIGIN')?.split(',')[0] ?? 'http://localhost:3000';
  }

  private mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    const map: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      trialing: SubscriptionStatus.TRIALING,
      past_due: SubscriptionStatus.PAST_DUE,
      canceled: SubscriptionStatus.CANCELED,
      incomplete: SubscriptionStatus.INCOMPLETE,
    };
    return map[status] ?? SubscriptionStatus.INCOMPLETE;
  }
}

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
