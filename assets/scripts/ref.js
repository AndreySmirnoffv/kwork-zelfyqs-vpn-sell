import { prisma } from "../services/prisma";
import pricesDb from '../db/db.json' with {type: "json"}

export async function refPaymentBalance(bot, chatId, subscriptionType){
    const user = await prisma.users.findFirst({
        where: {chatId}
    })

    await prisma.users.update({
        where: {chatId},
        data: {
            refBalance: user.balance - pricesDb[subscriptionType]
        }
    })

    await prisma.refpayments.create({
        amount: pricesDb[subscriptionType],
        userId: chatId
    })
    
}