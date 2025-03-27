import { prisma } from "../services/prisma.js";
import { waitForText } from "../utils/waitForText.js";
import prices from "../db/db.json" with {type: "json"}

export async function blockUser(bot, chatId){
    await bot.sendMessage(chatId, "Пришли мне имя пользователя которого нужно заблокировать")
    const username =  await waitForText(bot, chatId)


    const isBlockedUser = await prisma.users.findFirst({
        where: {
            username
        }
    })

    if (!isBlockedUser){
        return await bot.sendMessage(chatId, "Пользователь уже забанен")
    }

    const user = await prisma.users.update({
        where: {
            username
        },
        data: {
            blocked: true
        }
    })

    await deleteConfig(user)

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
        select: { amount: true }
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

export async function changeVpnPrices(bot, chatId) {
    await bot.sendMessage(chatId, `Выбери какую цену хочешь изменить:
1. Подписка на месяц - ${prices.one_month_sub.price} руб.
2. Подписка на 3 месяца - ${prices.three_months_sub.price} руб.
3. Подписка на 6 месяцев - ${prices.six_months_sub.price} руб.
4. Подписка на год - ${prices.one_year_sub.price} руб.
Отправь номер подписки (1-4)`);

    let message = await waitForText(bot, chatId);
    let selectedSubscription;

    switch (message) {
        case "1":
            selectedSubscription = "one_month_sub";
            break;
        case "2":
            selectedSubscription = "three_months_sub";
            break;
        case "3":
            selectedSubscription = "six_months_sub";
            break;
        case "4":
            selectedSubscription = "one_year_sub";
            break;
        default:
            await bot.sendMessage(chatId, "Ошибка: выбери число от 1 до 4.");
            return;
    }

    await bot.sendMessage(chatId, `Пришли новую цену для ${prices[selectedSubscription].price} руб.`);

    let newPrice = await waitForText(bot, chatId);

    if (!/^\d+$/.test(newPrice)) {
        await bot.sendMessage(chatId, "Ошибка: введите корректное число.");
        return;
    }

    prices[selectedSubscription].price = Number(newPrice);
    
    return await bot.sendMessage(chatId, `Цена изменена! Новая стоимость ${prices[selectedSubscription].price} руб.`);
}
