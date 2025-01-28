import { prisma } from "../services/prisma.js";
import { waitForText } from "../utils/waitForText.js";

export async function blockUser(bot, chatId){
    await bot.sendMessage(chatId, "Пришли мне имя пользователя которого нужно заблокировать")
    const username =  await waitForText(bot, chatId)


    const blockingUser = await prisma.users.findFirst({
        where: {
            username
        }
    })

    if (!blockingUser){
        return await bot.sendMessage(chatId, "Пользователь уже забанен")
    }

    await prisma.users.update({
        where: {
            username
        },
        data: {
            blocked: true
        }
    })

    return await bot.sendMessage(chatId, "Вы успешно заблокировали пользователя")
}

export async function adminIncome(bot, chatId) {
    const incomeResponse = await prisma.payments.findMany({
        where: { status: "succeeded" },
        select: { amount: true },
    });

    const totalIncome = incomeResponse
        .map(payment => parseFloat(payment.amount))
        .reduce((sum, current) => sum + current, 0);

    return await bot.sendMessage(chatId, `Ваш доход составил: ${totalIncome} RUB`);
}

export async function refPayments(bot, chatId){
    const refPayments = await prisma.refpayments.findMany({
        select: {amount: true}
    })

    const totalRefIncome = refPayments.map(payment => parseFloat(payment.amount)).reduce((sum, current) => sum + current, 0)

    return await bot.sendMessage(chatId, `Выплата по рефералам составила: ${totalRefIncome} RUB`)
}

export async function getUser(bot, chatId){

    await bot.sendMessage(chatId, "Пришлите мне имя пользователя которого хотите просмотреть")

    const username = await waitForText(bot, chatId)

    const user = await prisma.users.findFirst({
        where: username,
    })
    
    return await bot.sendMessage(chatId, `💼 Ваш профиль:

        👤 Имя: ${user.firstname} ${user.lastname}
        🆔 ID: ${user.chatId}
        💸 Баланс: ${user.balance}
        ♻️ Реф. баланс: ${user.balance}
        
        📅 Подписка до: 22.01.2025 18:13
        ${user.subStatus ? "✅ Подписка действует" :  "❌ Подписка истекла" } `)
}