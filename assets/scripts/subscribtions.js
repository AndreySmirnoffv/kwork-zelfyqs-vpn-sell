import { prisma } from "../services/prisma.js";
import dayjs from "dayjs";

export async function handleSubscription(bot, chatId, subscriptionType) {
    const subscriptionOptions = {
        one_month_sub: { price: 150, durationInMonths: 1 },
        three_months_sub: { price: 425, durationInMonths: 3 },
        one_year_sub: { price: 1550, durationInMonths: 12 },
    };

    const subscription = subscriptionOptions[subscriptionType];

    if (!subscription) {
        return await bot.sendMessage(chatId, "Выбран неверный тип подписки.");
    }

    const endDate = dayjs().add(subscription.durationInMonths, "month").toDate();

    const user = await prisma.users.findFirst({
        where: { chatId },
    });

    if (!user) {
        return await bot.sendMessage(chatId, "Пользователь не найден. Пожалуйста, зарегистрируйтесь.");
    }

    await prisma.subscription.create({
        data: {
            userId: user.id,
            status: true,
            type: subscriptionType,
            startDate: new Date(),
            endDate: endDate,
        },
    });

    return await bot.sendMessage(
        chatId,
        `Подписка оформлена! Действует до ${endDate.toLocaleDateString()}`
    );
}
