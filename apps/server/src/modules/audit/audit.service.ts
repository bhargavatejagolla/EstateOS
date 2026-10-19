import type { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";

export interface LogAuditParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  metadata?: any;
  ipAddress?: string | null;
}

export async function logAudit(
  client: Prisma.TransactionClient | typeof prisma,
  params: LogAuditParams
) {
  try {
    return await client.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata ?? undefined,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
