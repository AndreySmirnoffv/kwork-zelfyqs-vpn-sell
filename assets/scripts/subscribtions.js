import { prisma } from "../services/prisma.js";
import dayjs from "dayjs";

export async function handleSubscription(bot, chatId, subscriptionType) {
    const subscriptionOptions = {
        one_month_sub: { price: 150, durationInMonths: 1 },
        three_months_sub: { price: 425, durationInMonths: 3 },
        one_year_sub: { price: 1550, durationInMonths: 12 },
    };

    const subscribtion = subscriptionOptions[subscriptionType];

    if (!subscribtion) {
        return await bot.sendMessage(chatId, "Выбран неверный тип подписки.");
    }

    const endDate = dayjs().add(subscribtion.durationInMonths, "month").toDate();
    const user = await prisma.users.findFirst({
        where: {chatId}
    })

    await prisma.users.update({
        where: { chatId },
        data: { subStatus: true, subscriptionEnd: endDate, currentSubCount: user.currentSubCount + 1, subScriptionType: "" },
    });

    return await bot.sendMessage(chatId, `Подписка оформлена! Действует до ${endDate.toLocaleDateString()}`);
}