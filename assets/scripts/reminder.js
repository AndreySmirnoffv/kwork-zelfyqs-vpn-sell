import dayjs from "dayjs";
import { prisma } from "../services/prisma.js";

async function sendSubscriptionReminder(bot, chatId, subscriptionEnd) {
    const now = dayjs();
    const daysUntilEnd = dayjs(subscriptionEnd).diff(now, 'days');

    const user = await prisma.users.findFirst({
        where: {chatId},
    })
    
    if (daysUntilEnd === 3) {
        user.paidCard 
        ? 
        await bot.sendMessage(chatId, `Ваш срок подписки истекает через 3 дня! Пожалуйста, продлите подписку.`, {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "Продлить с реферального счета", callback_data: "ref_payment"}]
                ]
            })
        })
        : 
        await bot.sendPhoto(chatId, "./assets/db/images/IMG_5183.JPG", {caption: "Выбираете на какой период вы хотите приобрести подписку", reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{text: "🗓 Месяц - 150 руб", callback_data: "one_month_sub"}],
                            [{text: "🗓 3 месяца - 425 руб", callback_data: "three_months_sub"}],
                            [{text: "🗓 6 месяцев - 800 руб", callback_data: "six_months_sub"}],
                            [{text: "🗓 Год - 1550", callback_data: "one_year_sub"}]
                        ]
                    })})
                    
    } else if (daysUntilEnd === 0) {
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
        user.paidCard 
        ? 
        await bot.sendMessage(chatId, `Ваша подписка завершена. Пожалуйста, продлите её, чтобы продолжить пользоваться сервисом! Пожалуйста, продлите подписку.`, {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "Продлить с реферального счета", callback_data: "ref_payment"}]
                ]
            })
        })
        : 
        await bot.sendPhoto(chatId, "./assets/db/images/IMG_5183.JPG", {caption: "Ваша подписка завершена. Пожалуйста, продлите её, чтобы продолжить пользоваться сервисом.", reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{text: "🗓 Месяц - 150 руб", callback_data: "one_month_sub"}],
                            [{text: "🗓 3 месяца - 425 руб", callback_data: "three_months_sub"}],
                            [{text: "🗓 6 месяцев - 800 руб", callback_data: "six_months_sub"}],
                            [{text: "🗓 Год - 1550", callback_data: "one_year_sub"}],
                            [{text: "Назад", callback_data: "main"}]
                        ]
                    })})
        await bot.sendMessage(user.chatId, `Ваша подписка завершена. Пожалуйста, продлите её, чтобы продолжить пользоваться сервисом.`) 

        if (user.currentSubCount < 1){
            return await prisma.users.update({
                where: { id: user.id },
                data: { subStatus: false, currentSubCount: 0 },
            });
        } 
        
        return await prisma.users.update({
            where: {id: user.id},
            data: {subStatus: true, currentSubCount: user.currentSubCount - 1}
        })
    }
}
