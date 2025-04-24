import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function createUser(name: string, email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function createMessage(userId: string, content: string, recipients: { name?: string; phone: string; sendAt: Date }[]) {
  return prisma.message.create({
    data: {
      content,
      userId,
      recipients: {
        create: recipients.map((recipient) => ({
          name: recipient.name,
          phone: recipient.phone,
          sendAt: recipient.sendAt,
        })),
      },
    },
    include: {
      recipients: true,
    },
  });
}

export async function getUserMessages(userId: string) {
  return prisma.message.findMany({
    where: {
      userId,
    },
    include: {
      recipients: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getMessagesToSend() {
  const now = new Date();

  return prisma.recipient.findMany({
    where: {
      sendAt: {
        lte: now,
      },
      sent: false,
    },
    include: {
      message: true,
    },
  });
}

export async function markMessageAsSent(recipientId: string) {
  return prisma.recipient.update({
    where: {
      id: recipientId,
    },
    data: {
      sent: true,
    },
  });
}

export default prisma; 