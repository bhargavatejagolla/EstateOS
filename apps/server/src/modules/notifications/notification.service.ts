import { prisma } from "../../lib/prisma.js";
import { NotFoundError, ForbiddenError } from "../../middleware/errors.js";
import type { Prisma } from "@prisma/client";
import type { NotificationType } from "@estateos/shared";

export async function createNotification(
  client: Prisma.TransactionClient | typeof prisma,
  data: {
    userId: string;
    type: NotificationType;
    message: string;
    link?: string | null;
  }
) {
  return client.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      message: data.message,
      link: data.link ?? null,
    },
  });
}

export async function getUserNotifications(userId: string) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      message: n.message,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  };
}

export async function markAsRead(userId: string, id: string) {
  const notif = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notif) {
    throw new NotFoundError("Notification not found");
  }

  if (notif.userId !== userId) {
    throw new ForbiddenError("Forbidden: cannot modify notification for another user");
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return {
    id: updated.id,
    userId: updated.userId,
    type: updated.type,
    message: updated.message,
    link: updated.link,
    isRead: updated.isRead,
    createdAt: updated.createdAt.toISOString(),
  };
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return { success: true };
}
