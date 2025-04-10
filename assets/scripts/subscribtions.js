import { prisma } from "../services/prisma.js";
import dayjs from "dayjs";
import sunscriptionsDb from '../db/db.json' with {type: "json"}

export async function handleSubscription(bot, chatId, subscriptionType) {
    const subscription = sunscriptionsDb[subscriptionType];

    if (!subscription) {
        return await bot.sendMessage(chatId, "Выбран неверный тип подписки.");
    }

    let endDate;
    if (subscription.durationInDays) {
        endDate = dayjs().add(subscription.durationInDays, "day").toDate();
    } else if (subscription.durationInMonths) {
        endDate = dayjs().add(subscription.durationInMonths, "month").toDate();
    }

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

   return subscription
}

export async function extendSubscription(bot, chatId) {
    const user = await prisma.subscription.findFirst({
        where: { chatId },
    });

    if (!user || user.subscriptions.length === 0 ) {
        return await bot.sendMessage(chatId, "У вас нет активной подписки.");
    }

    const currentSubscriptionType = user.type;

    if (currentSubscriptionType === "one_day_subscription") {
        return await bot.sendMessage(chatId, "Подписка на 1 день не подлежит продлению.");
    }

    if (user.paidCard) {
        await bot.sendMessage(chatId, `Ваш срок подписки истекает через 3 дня! Пожалуйста, продлите подписку.`, {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "Продлить с реферального счета", callback_data: "ref_payment"}],
                    [{text: "На главную", callback_data: "main"}]
                ]
            })
        });
    } else {
        await bot.sendPhoto(chatId, "./assets/db/images/IMG_5183.JPG", { caption: "Выбираете на какой период вы хотите приобрести подписку", reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: "🗓 Месяц - 150 руб", callback_data: "one_month_sub" }],
                [{ text: "🗓 3 месяца - 425 руб", callback_data: "three_months_sub" }],
                [{ text: "🗓 6 месяцев - 800 руб", callback_data: "six_months_sub" }],
                [{ text: "🗓 Год - 1550", callback_data: "year_sub" }],
                [{text: "На главную", callback_data: "main"}]

            ]
        })});
    }
}

export async function listMySubscriptions(bot, chatId) {
    try {
        const user = await prisma.users.findUnique({
            where: { chatId },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                balance: true,
                substatus: true,
                subscriptions: {
                    select: {
                        type: true,
                        status: true,
                        endDate: true
                    }
                }
            }
        });

        if (!user.subscriptions || user.subscriptions.length === 0) {
            return await bot.sendMessage(chatId, "У вас нет активных подписок.");
        }

        const chunkSize = 6;
        let messages = [];
        let buttons = [];

        user.subscriptions.forEach(async (sub, index) => {
            const formattedDate = sub.endDate 
                ? new Date(sub.endDate).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                })
                : "Не указана";

            if (index % chunkSize === 0) {
                messages.push(`💼 *Ваши Подписки:\n\n*`)
                  
                buttons.push([]);
            }

            messages[messages.length - 1] += 
                `📅 *Подписка:* ${sub.type} (до ${formattedDate})\n` +
                `${sub.status ? "✅ *Подписка действует*" : "❌ *Подписка истекла*"}\n\n`;

            buttons[buttons.length - 1].push([
                {
                    text: `Продлить ${sub.type}`,
                    callback_data: `pay_${sub.type}`
                }
            ]);
        });

        for (let i = 0; i < messages.length; i++) {
            await bot.sendMessage(chatId, messages[i], {
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: buttons[i] }
            });
        }
    } catch (error) {
        console.error("Ошибка при получении подписок:", error);
        await bot.sendMessage(chatId, "Ошибка при получении подписок. Попробуйте позже.");
    }

}
