import { checkout } from "../services/payment.js";
import { prisma } from "../services/prisma.js";
import { v4 } from "uuid";
import { handleSubscription } from "./subscribtions.js";
import axios from "axios";
import { createConfig } from "./wireguard.js";

let paymentIntervals = {}; 

export async function createPayment(bot, chatId, data, username) {
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
            async () => await capturePayment(bot, chatId, paymentResponse.id, payload.amount.value, data, username),
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

async function capturePayment(bot, chatId, paymentId, price, data, username) {
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

        return await succeedPayment(bot, chatId, paymentId, data, username);
    } catch (error) {
        console.error(error);
    }
}

async function succeedPayment(bot, chatId, paymentId, data, username) {
    try {
        // Получение информации о платеже
        const paymentResponse = await checkout.getPayment(paymentId);

        if (paymentResponse.status === "succeeded") {
            // Обновление данных о платеже в базе данных
            await prisma.payments.update({
                where: { paymentId },
                data: {
                    status: paymentResponse.status,
                    isPaid: paymentResponse.paid,
                },
            });

            const subscriptionDuration = data.duration || 30;
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + subscriptionDuration);

            // Преобразуем chatId в BigInt
            const chatIdBigInt = BigInt(chatId);

            console.log("Проверка пользователя с chatId:", chatIdBigInt);
            const user = await prisma.users.findFirst({
                where: { chatId: chatIdBigInt },
            });

            if (!user) {
                throw new Error("Пользователь не найден");
            }
            console.log("Найден пользователь:", user);

            await prisma.subscription.create({
                data: {
                    userId: user.id,
                    status: true,
                    type: data.type || "default",
                    startDate: new Date(),
                    endDate: endDate,
                },
            });

            await prisma.users.update({
                where: { chatId: chatIdBigInt },
                data: {
                    paidCard: true,
                },
            });

            if (user.origin !== null && user.origin !== "start") {
                const originUserSubscription = await prisma.users.findFirst({
                    where: { chatId: BigInt(user.origin) },  // Преобразуем origin в BigInt
                });
                console.log("originUserSubscription:", originUserSubscription);

                if (!originUserSubscription) {
                    console.error("Подписка originUser не найдена");
                } else if (!originUserSubscription.status) {
                    await prisma.users.update({
                        where: { chatId: BigInt(user.origin) },
                        data: {
                            balance: 25,
                        },
                    });
                } else {
                    await prisma.users.update({
                        where: { chatId: BigInt(user.origin) },
                        data: {
                            balance: 50,
                        },
                    });
                }
            }

            await bot.sendMessage(chatId, "Оплата прошла успешно! Ваша подписка активирована.");

            await handleSubscription(bot, chatId, data);
            return await createConfig(bot, chatId, username);
        }
    } catch (error) {
        console.error("Ошибка при обработке успешной оплаты:", error);
        await bot.sendMessage(chatId, "Произошла ошибка при обработке оплаты. Пожалуйста, обратитесь в поддержку.");
    }
}



export async function createPayout(){
      try {
    
        const response = await axios.post(
          'https://api.yookassa.ru/v3/payouts',
          {
            amount: {
              value: amount,
              currency: "RUB"
            },
            payout_destination_data: {
              type: "sbp",
              phone: phone,
              bank_id: bankId
            },
            description: "Вывод",
            metadata: {
              order_id: "37"
            }
          },
          {
            headers: {
              'Idempotence-Key': uuid.v4(),
              'Content-Type': 'application/json'
            },
            auth: {
              username: process.env.YOOKASSA_SHOPID,
              password: process.env.YOOKASSA_SECRET_KEY
            }
          }
        );

        console.log(response.data)
      } catch (error) {
        res.status(500).json(error)
        console.error('Error making payout:', error);
      }
    }
