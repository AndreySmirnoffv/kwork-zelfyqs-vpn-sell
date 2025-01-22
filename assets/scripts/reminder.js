import dayjs from "dayjs";
import { prisma } from "../services/prisma.js";

async function sendSubscriptionReminder(bot, chatId, subscriptionEnd) {
    const now = dayjs();
    const daysUntilEnd = dayjs(subscriptionEnd).diff(now, 'days');

    if (daysUntilEnd === 3) {
        await bot.sendMessage(chatId, `Ваш срок подписки истекает через 3 дня! Пожалуйста, продлите подписку.`);
    } else if (daysUntilEnd < 0) {
        await bot.sendMessage(chatId, `Ваша подписка завершена. Пожалуйста, продлите её, чтобы продолжить пользоваться сервисом.`);
    }
}

export async function checkSubscriptions(bot) {
    const usersWithActiveSubscriptions = await prisma.users.findMany({
        where: {
            subStatus: true, 
            subscriptionEnd: {
                gte: dayjs().toDate(), 
                lte: dayjs().add(3, 'day').toDate(),
            },
        },
    });

    for (const user of usersWithActiveSubscriptions) {
        await sendSubscriptionReminder(bot, user.chatId, user.subscriptionEnd);
    }

    const usersWithExpiredSubscriptions = await prisma.users.findMany({
        where: {
            subStatus: true, 
            subscriptionEnd: {
                lt: dayjs().toDate(),
            },
        },
    });

    for (const user of usersWithExpiredSubscriptions) {
        await bot.sendMessage(user.chatId, `Ваша подписка завершена. Пожалуйста, продлите её, чтобы продолжить пользоваться сервисом.`);

        await prisma.users.update({
            where: { id: user.id },
            data: { subStatus: false },
        });
    }
}
