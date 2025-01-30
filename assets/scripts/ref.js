import { prisma } from "../services/prisma.js";
import pricesDb from '../db/db.json' with {type: "json"}

export async function refPaymentBalance(bot, chatId){
    const user = await prisma.users.findFirst({
        where: {chatId}
    })

    const acitveSubscriptions = await prisma.subscription.findFirst({
        where: {userId: user.id}
    })

    if (!subscriptions){
        await bot.sendMessage(chatId, "У вас нет активных подписок")
    }

    await prisma.users.update({
        where: {chatId},
        data: {
            balance: user.balance - pricesDb[acitveSubscriptions.type],
            paidCard: false
        }
    })

    await prisma.refpayments.create({
        amount: pricesDb[acitveSubscriptions.type],
        userId: chatId
    })
    
}