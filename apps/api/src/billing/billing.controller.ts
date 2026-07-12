import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MembershipRole } from '@prisma/client';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { CheckoutSessionDto } from '../common/dto/validation.dto';
import { CurrentOrg, CurrentUser, RequireRole } from '../common/decorators/tenant.decorators';
import { AuthUser } from '../auth/types/request-with-user';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../common/guards/tenant.guards';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('subscription')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Get current organization subscription' })
  getSubscription(@CurrentOrg() orgId: string) {
    return this.billingService.getSubscription(orgId);
  }

  @Post('checkout')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard, TenantGuard, RolesGuard)
  @RequireRole(MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  checkout(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CheckoutSessionDto,
  ) {
    return this.billingService.createCheckoutSession(orgId, user.id, dto);
  }

  @Post('portal')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard, TenantGuard, RolesGuard)
  @RequireRole(MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'Create Stripe customer portal session' })
  portal(@CurrentOrg() orgId: string, @CurrentUser() user: AuthUser) {
    return this.billingService.createPortalSession(orgId, user.id);
  }

  @Post('cancel')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard, TenantGuard, RolesGuard)
  @RequireRole(MembershipRole.ADMIN, MembershipRole.OWNER)
  @ApiOperation({ summary: 'Cancel subscription' })
  async cancel(@CurrentOrg() orgId: string, @CurrentUser() user: AuthUser): Promise<void> {
    await this.billingService.cancelSubscription(orgId, user.id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<void> {
    const rawBody = req.rawBody ?? Buffer.from('');
    return this.billingService.handleWebhook(rawBody, signature);
  }
}
