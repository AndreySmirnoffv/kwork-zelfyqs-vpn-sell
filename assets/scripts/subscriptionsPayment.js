import { v4 } from "uuid";
import { checkout } from "../services/payment.js";
import { prisma } from "../services/prisma.js";
import prices from '../db/db.json' with {type: "json"}
import { createConfig } from "./vless.js";

let paymentIntervals = {}; 

export async function createSubscriptionOPayment(bot, userId, data, username){
    try {
        const payload = {
            amount: {
                value: prices[data].price,
                currency: "RUB",
            },
            confirmation: {
                type: "redirect",
                return_url: "https://fastfood-tips.ru/auth",
            },
        };
    
        const {id, amount, status, paid, confirmation} = await checkout.createPayment(payload, v4())
        await prisma.payments.create({
            data: {
                paymentId: id,
                userId,
                amount: amount.value,
                status,
                paid
            }
    
        })
        const intervalId = setInterval(
            async () => await captureSupscriptionPayment(bot, userId, id, amount.value, data, username),
            10000
        );
    
        paymentIntervals[id] = intervalId;
    
        return await bot.sendMessage(userId, `Вы можете оплатить по данной ссылке `, {
            reply_markup: {
                inline_keyboard: [
                    [{text: "Оплатить", url: confirmation.confirmation_url}]
                ]
            }
        })
    } catch (error) {
        throw Error(error)
    }
   
}

export async function captureSupscriptionPayment(bot, chatId, paymentId, data, username){
    try {
        const {status, created_at, amount} = await checkout.getPayment(paymentId)

        if (status !== "waiting_for_capture" || (Date.now() - new Date(created_at).getTime()) > 600000) {
            clearInterval(paymentIntervals[paymentId]);
            return delete paymentIntervals[paymentId];
        }
    
        const payload = {
            amount: {
                value: amount.value,
                currency: "RUB",
            },
        };
    
        const paymentResponsee = await checkout.capturePayment(paymentId, payload);
        console.log(paymentResponsee);
    
        await prisma.payments.update({
            where: { paymentId },
            data: { status },
        });
    
        return await succeededSubpscriptionPayment(bot, chatId, paymentId, data);
    } catch (error) {
        throw Error(error)
    }
  
}

export async function succeededSubpscriptionPayment(bot, chatId, paymentId, type) {
    try {
        const { status } = await checkout.getPayment(paymentId);

        if (status !== "succeeded") {
            throw new Error("Платеж не был завершен успешно");
        }

        const user = await prisma.users.findUnique({
            where: { chatId: BigInt(chatId) },
        });

        if (!user) {
            throw new Error(`Пользователь с chatId ${chatId} не найден`);
        }

        const subscriptionDuration = type?.duration || 30;
        const startDate = new Date()
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + subscriptionDuration);

        const existingSubscription = await prisma.subscription.findFirst({
            where: { userId: user.id, status: true },
        });

        if (!existingSubscription) {
            await prisma.subscription.create({
                data: {
                    userId: user.id,
                    status: true,
                    type,
                    startDate,
                    endDate,
                },
            });
            return await bot.sendMessage(chatId, `Вы успешно оформили подписку, она будет действовать до ${endDate.toLocaleDateString()}`);
        }

        await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: {
                status: true,
                type: type.name,
                endDate,
            },
        });

        await prisma.users.update({
            where: { id: user.id },
            data: {
                paidCard: true,
            },
        });

        await createConfig(chatId, type)

        return await bot.sendMessage(chatId, `Вы успешно продлили подписку до ${endDate.toLocaleDateString()}`);

    } catch (error) {
        console.error("Ошибка при обновлении подписки:", error);
        throw new Error(error.message || "Неизвестная ошибка");
    }
}
