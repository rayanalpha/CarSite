import { prisma } from "@/lib/prisma";

export interface LogInput {
  action: string;
  entityType: string;
  entityId?: string | number;
  entityName?: string;
  details?: string;
}

export async function logActivity(input: LogInput) {
  try {
    await prisma.activityLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId?.toString() || null,
        entityName: input.entityName || null,
        details: input.details || null,
      },
    });
  } catch {
    // fail silently – logging should never break the main flow
  }
}
