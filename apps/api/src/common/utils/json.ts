import { Prisma } from '@prisma/client';

export type JsonValue = Prisma.InputJsonValue;

export function asJson(value: Record<string, unknown>): JsonValue {
  return value as JsonValue;
}
