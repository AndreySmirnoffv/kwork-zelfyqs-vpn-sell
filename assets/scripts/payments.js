import { checkout } from "../services/payment.js";
import { prisma } from "../services/prisma.js";
import { v4 } from "uuid";
import { handleSubscription } from "./subscribtions.js";

let paymentIntervals = {}; 

export async function createPayment(bot, chatId, data) {
    const prices = {
        one_month_sub: 150,
        three_months_sub: 425,
        one_year_sub: { price: 1550, durationInMonths: 12 },
    };
    try {
        const payload = {
            amount: {
                value: prices[data],
                currency: "RUB",
            },
            confirmation: {
                type: "redirect",
                return_url: "https://fastfood-tips.ru/auth",
            },
        };

        const paymentResponse = await checkout.createPayment(payload, v4());

        await prisma.payments.create({
            data: {
                paymentId: paymentResponse.id,
                status: paymentResponse.status,
                isPaid: paymentResponse.paid,
                userId: String(chatId),
                amount: paymentResponse.amount.value,
            },
        });

        console.log(paymentResponse);

        const intervalId = setInterval(
            async () => await capturePayment(bot, chatId, paymentResponse.id, payload.amount.value, data),
            10000
        );

        paymentIntervals[paymentResponse.id] = intervalId;

        return await bot.sendMessage(chatId, `Вы можете оплатить по данной ссылке `, {
            reply_markup: {
                inline_keyboard: [
                    [{text: "Оплатить", url: paymentResponse.confirmation.confirmation_url}]
                ]
            }
        })
    } catch (error) {
        console.error(error);
    }
}

async function capturePayment(bot, chatId, paymentId, price, data) {
    try {
        const paymentResponse = await checkout.getPayment(paymentId);
        console.log(paymentResponse);


        if (paymentResponse.status !== "waiting_for_capture" || (Date.now() - new Date(paymentResponse.created_at).getTime()) > 600000) {
            clearInterval(paymentIntervals[paymentId]);
            return delete paymentIntervals[paymentId];
        }

        const payload = {
            amount: {
                value: price,
                currency: "RUB",
            },
        };

        const paymentResponsee = await checkout.capturePayment(paymentResponse.id, payload);
        console.log(paymentResponsee);

        await prisma.payments.update({
            where: { paymentId },
            data: { status: paymentResponse.status },
        });

        return await succeedPayment(bot, chatId, paymentId, data);
    } catch (error) {
        console.error(error);
    }
}

async function succeedPayment(bot, chatId, paymentId, data) {
    try {
        const paymentResponse = await checkout.getPayment(paymentId);

        if (paymentResponse.status === "succeeded") {
            await prisma.payments.update({
                where: { paymentId },
                data: {
                    status: paymentResponse.status,
                    isPaid: paymentResponse.paid,
                },
            });
            return await handleSubscription(bot, chatId, data)
        }
    } catch (error) {
        console.error(error);
    }
}

export async function createPayout(){
    return ""
}