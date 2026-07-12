import {
  PrismaClient,
  MembershipRole,
  SubscriptionStatus,
  TaskStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const PASSWORD = 'Password123!';

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const users = await Promise.all([
    upsertUser('demo@tenantforge.dev', 'Demo User', passwordHash),
    upsertUser('admin@tenantforge.dev', 'Admin User', passwordHash),
    upsertUser('sarah@tenantforge.dev', 'Sarah Chen', passwordHash),
    upsertUser('marcus@tenantforge.dev', 'Marcus Johnson', passwordHash),
    upsertUser('lina@tenantforge.dev', 'Lina Ben Ali', passwordHash),
  ]);

  const [demoUser, adminUser, sarah, marcus, lina] = users;

  const demoOrg = await upsertOrg('demo-org', 'Demo Organization');
  const acmeOrg = await upsertOrg('acme-corp', 'Acme Corporation');

  await upsertMembership(demoUser.id, demoOrg.id, MembershipRole.OWNER);
  await upsertMembership(adminUser.id, demoOrg.id, MembershipRole.ADMIN);
  await upsertMembership(sarah.id, demoOrg.id, MembershipRole.MEMBER);
  await upsertMembership(marcus.id, demoOrg.id, MembershipRole.VIEWER);
  await upsertMembership(demoUser.id, acmeOrg.id, MembershipRole.ADMIN);
  await upsertMembership(lina.id, acmeOrg.id, MembershipRole.OWNER);

  const demoSub = await upsertSubscription(demoOrg.id, {
    status: SubscriptionStatus.ACTIVE,
    stripePriceId: 'price_pro_mock',
    currentPeriodEnd: daysFromNow(30),
  });

  await upsertSubscription(acmeOrg.id, {
    status: SubscriptionStatus.TRIALING,
    currentPeriodEnd: daysFromNow(14),
  });

  await prisma.invoice.upsert({
    where: { stripeInvoiceId: 'in_mock_demo_001' },
    update: {},
    create: {
      subscriptionId: demoSub.id,
      stripeInvoiceId: 'in_mock_demo_001',
      amountDue: 4900,
      currency: 'usd',
      status: 'paid',
      hostedInvoiceUrl: 'https://invoice.stripe.com/mock/demo',
    },
  });

  const projects = await Promise.all([
    upsertProject('seed-project-001', demoOrg.id, 'Platform Launch', 'Q1 launch milestones'),
    upsertProject('seed-project-002', demoOrg.id, 'Mobile App v2', 'React Native redesign'),
    upsertProject('seed-project-003', demoOrg.id, 'Security Audit', 'SOC2 compliance prep'),
    upsertProject('seed-project-004', acmeOrg.id, 'Client Portal', 'Self-service dashboard'),
  ]);

  const [launch, mobile, security, portal] = projects;

  const tasks = await seedTasks([
    { projectId: launch.id, title: 'Set up CI/CD pipeline', status: TaskStatus.DONE, assigneeId: demoUser.id },
    { projectId: launch.id, title: 'Configure Stripe billing', status: TaskStatus.IN_PROGRESS, assigneeId: adminUser.id },
    { projectId: launch.id, title: 'Write API documentation', status: TaskStatus.IN_PROGRESS, assigneeId: sarah.id },
    { projectId: launch.id, title: 'Deploy to production', status: TaskStatus.TODO, assigneeId: demoUser.id },
    { projectId: mobile.id, title: 'Design system tokens', status: TaskStatus.DONE, assigneeId: sarah.id },
    { projectId: mobile.id, title: 'Offline sync module', status: TaskStatus.IN_PROGRESS, assigneeId: adminUser.id },
    { projectId: security.id, title: 'Penetration test report', status: TaskStatus.TODO },
    { projectId: portal.id, title: 'Auth flow integration', status: TaskStatus.IN_PROGRESS, assigneeId: lina.id },
  ]);

  await seedComments(tasks[1]!.id, [
    { authorId: adminUser.id, content: 'Stripe webhook handler is ready for review.' },
    { authorId: demoUser.id, content: 'Looks good — merge after CI passes.' },
  ]);

  await seedNotifications([
    { userId: demoUser.id, orgId: demoOrg.id, title: 'Welcome to TenantForge', message: 'Your demo workspace is ready.' },
    { userId: demoUser.id, orgId: demoOrg.id, title: 'Task assigned', message: 'Configure Stripe billing was assigned to you.', read: true },
    { userId: adminUser.id, orgId: demoOrg.id, title: 'New member joined', message: 'Sarah Chen joined Demo Organization.' },
    { userId: sarah.id, orgId: demoOrg.id, title: 'Task assigned', message: 'You were assigned: Write API documentation.' },
    { userId: demoUser.id, orgId: acmeOrg.id, title: 'Organization invite', message: 'You were added to Acme Corporation.' },
  ]);

  await seedAuditLogs(demoOrg.id, demoUser.id, [
    'organization.created',
    'project.created',
    'member.invited',
    'task.created',
    'billing.checkout_started',
    'task.updated',
    'comment.created',
  ]);

  console.log('Seed completed with rich mock data.');
  console.log('');
  console.log('Demo accounts (password: Password123!):');
  console.log('  demo@tenantforge.dev   — Owner (Demo Organization)');
  console.log('  admin@tenantforge.dev  — Admin');
  console.log('  sarah@tenantforge.dev  — Member');
  console.log('  marcus@tenantforge.dev — Viewer');
  console.log('  lina@tenantforge.dev   — Owner (Acme Corporation)');
}

async function upsertUser(email: string, name: string, passwordHash: string) {
  return prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name, passwordHash },
  });
}

async function upsertOrg(slug: string, name: string) {
  return prisma.organization.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  });
}

async function upsertMembership(userId: string, organizationId: string, role: MembershipRole) {
  return prisma.membership.upsert({
    where: { userId_organizationId: { userId, organizationId } },
    update: { role },
    create: { userId, organizationId, role },
  });
}

async function upsertSubscription(
  organizationId: string,
  data: {
    status: SubscriptionStatus;
    stripePriceId?: string;
    currentPeriodEnd?: Date;
  },
) {
  return prisma.subscription.upsert({
    where: { organizationId },
    update: data,
    create: { organizationId, ...data },
  });
}

async function upsertProject(
  id: string,
  organizationId: string,
  name: string,
  description: string,
) {
  return prisma.project.upsert({
    where: { id },
    update: { name, description },
    create: { id, organizationId, name, description },
  });
}

async function seedTasks(
  items: Array<{
    projectId: string;
    title: string;
    status: TaskStatus;
    assigneeId?: string;
  }>,
) {
  const tasks = [];
  for (const item of items) {
    const existing = await prisma.task.findFirst({
      where: { projectId: item.projectId, title: item.title },
    });
    if (existing) {
      tasks.push(existing);
      continue;
    }
    const task = await prisma.task.create({ data: item });
    tasks.push(task);
  }
  return tasks;
}

async function seedComments(
  taskId: string,
  comments: Array<{ authorId: string; content: string }>,
) {
  for (const comment of comments) {
    const exists = await prisma.comment.findFirst({
      where: { taskId, content: comment.content },
    });
    if (!exists) {
      await prisma.comment.create({ data: { taskId, ...comment } });
    }
  }
}

async function seedNotifications(
  items: Array<{
    userId: string;
    orgId: string;
    title: string;
    message: string;
    read?: boolean;
  }>,
) {
  for (const item of items) {
    const exists = await prisma.notification.findFirst({
      where: { userId: item.userId, title: item.title, organizationId: item.orgId },
    });
    if (!exists) {
      await prisma.notification.create({
        data: {
          userId: item.userId,
          organizationId: item.orgId,
          title: item.title,
          message: item.message,
          read: item.read ?? false,
        },
      });
    }
  }
}

async function seedAuditLogs(
  organizationId: string,
  actorId: string,
  actions: string[],
) {
  for (const action of actions) {
    const exists = await prisma.auditLog.findFirst({
      where: { organizationId, action },
    });
    if (!exists) {
      await prisma.auditLog.create({
        data: {
          organizationId,
          actorId,
          action,
          entityType: 'Seed',
          metadata: { source: 'seed-script' },
        },
      });
    }
  }
}

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
