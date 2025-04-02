import { checkout } from "../services/payment.js";
import { prisma } from "../services/prisma.js";
import { v4 } from "uuid";
import { handleSubscription } from "./subscribtions.js";
import prices from '../db/db.json' with {type: "json"}
import axios from "axios";
import { createVlessConfig } from "./vless.js";

let paymentIntervals = {}; 

export async function createPayment(bot, userId, data, username) {

    console.log(prices[data].price)

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

        const {id, status, paid, amount, confirmation} = await checkout.createPayment(payload, v4());

        await prisma.payments.create({
            data: {
                paymentId: id,
                status,
                paid,
                userId,
                amount: amount.value,
            },
        });


        const intervalId = setInterval(
            async () => await capturePayment(bot, userId, id, payload.amount.value, data, username),
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
        const paymentResponse = await checkout.getPayment(paymentId);

        if (paymentResponse.status === "succeeded") {
            await prisma.payments.update({
                where: { paymentId },
                data: {
                    status: paymentResponse.status,
                    paid: paymentResponse.paid,
                },
            });

            const subscriptionDuration = data.duration || 30;
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + subscriptionDuration);

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
                    where: { chatId: BigInt(user.origin) }, 
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

            await bot.sendMessage(chatId, `1️⃣ Установите приложение WireGuard

Android: Зайдите в Google Play и скачайте WireGuard: <a href="https://play.google.com/store/search?q=wireguard&c=apps">Google Play</a>.
iOS: Откройте App Store и установите WireGuard: <a href="https://apps.apple.com/app/id1441195209">App Store</a>.
Windows: Скачайте приложение с <a href="https://www.wireguard.com/install/">официального сайта</a>.
macOS: Установите через <a href="https://apps.apple.com/app/id1441195209">App Store</a> или с <a href="https://www.wireguard.com/install/">официального сайта</a>.
Linux: Установите через терминал (например, <code>apt install wireguard</code> для Debian/Ubuntu).
Android TV: Найдите WireGuard в <a href="https://play.google.com/store/search?q=wireguard&c=apps">Google Play</a> на вашем телевизоре.

2️⃣ Получите конфиг
После покупки подписки в нашем боте вы получите персональный конфигурационный файл или QR-код для настройки.

3️⃣ Импортируйте конфиг
1. Откройте приложение WireGuard.
2. Нажмите “Добавить туннель”.
3. Выберите “Импортировать из файла” или “Сканировать QR-код”.
4. Загрузите конфигурационный файл или отсканируйте QR-код из бота.

4️⃣ Подключитесь
1. Найдите добавленный туннель в списке.
2. Включите его, нажав на переключатель.
3. Убедитесь, что статус показывает “Активно”.
4. Теперь ваш интернет защищён и свободен!

Если возникнут вопросы, наша поддержка 24/7 всегда готова помочь. 💬`, { parse_mode: 'HTML' });;

            await handleSubscription(bot, chatId, data);
            await createVlessConfig(bot, username);
            await bot.sendDocuments(chatId, "./vless-" + username  + ".conf")
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
