import { adminKeyboard, profileKeyboard, startKeyboard } from '../keyboards/keyboards.js';
import { prisma } from '../services/prisma.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function sendErrorMessage(bot, chatId, errorMessage) {
    console.error(errorMessage);
    return await bot.sendMessage(chatId, "Ошибка: " + errorMessage);
}

export async function createUser(bot, msg) {
    try {
        const user = await prisma.users.findFirst({
            where: { chatId: msg.chat.id }
        });
        
        if (user?.blocked) {
            return await bot.sendMessage(msg.chat.id, "Вам сюда нельзя");
        }

        if (!user) {
            await prisma.users.create({
                data: {
                    firstname: msg.from.first_name || "undefined",
                    lastname: msg.from.last_name || "undefined",
                    chatId: msg.chat.id,
                    username: msg?.from?.username || "undefined",
                    balance: 0,
                    isAdmin: false,
                    ref: `${process.env.BOT_LINK}?start=${msg.chat.id}`,
                    origin: msg.text.replace("/start", "")
                }
            });
        }

        if (user?.isAdmin) {
            return await bot.sendMessage(msg.chat.id, "Привет админ", adminKeyboard);
        }

        const videoPath = path.resolve(__dirname, '../db/images/start.gif');
        if (!fs.existsSync(videoPath)) {
            return await sendErrorMessage(bot, msg.chat.id, "Файл не найден: " + videoPath);
        }

        return await bot.sendVideo(msg.chat.id, videoPath, {
            caption: `Добро пожаловать в NXSTORE VPN!
Ты оказался в правильном месте — здесь начинается твой безопасный, свободный и быстрый интернет.

Мы — современный VPN-сервис, построенный на собственных технологиях и протоколах NX.
⚡ Максимальная скорость
🔐 Полная конфиденциальность
📱 Поддержка всех устройств — от смартфона до ТВ

Без сложных настроек, без ограничения по трафику. Только ты и свобода в сети.

Здесь ты можешь:
✔️ Подключиться к VPN
✔️ Управлять своей подпиской
✔️ Продлевать доступ в пару кликов
✔️ Получить помощь, если что-то пойдет не так

Мы верим, что интернет должен быть доступным, защищённым и без границ — и делаем всё, чтобы ты это почувствовал с первых секунд.

Готов подключиться? Действуй 👇

`,
            reply_markup: startKeyboard
        });
        
        
    } catch (error) {
        console.log(error)
        return await sendErrorMessage(bot, msg.chat.id, "Ошибка при отправке видео: " + error.message);
    }
}

export async function profile(bot, chatId) {
    try {
        const user = await prisma.users.findFirst({
            where: { chatId }
        });

        const substatus = user?.substatus ? "✅ Подписка действует" : "❌ Подписка истекла";
        const profileMessage = `💼 Ваш профиль:\n\n
        👤 Имя: ${user?.firstname} ${user?.lastname}\n
        🆔 ID: ${user?.chatId}\n
        ♻️ Реф баланс: ${user?.balance}\n\n
        📅 Подписка до: 22 01 2025 18:13\n
        ${substatus}`;

        await bot.sendMessage(chatId, profileMessage, {
            parse_mode: "HTML",
            reply_markup: profileKeyboard
        });
    } catch (error) {
        return await sendErrorMessage(bot, chatId, "Ошибка при получении профиля: " + error.message);
    }
}

export async function subscribtions(bot, chatId) {
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
            return await bot.sendMessage(chatId, "У вас нет активных подписок");
        }

        const chunkSize = 6;
        let messages = [];
        let buttons = [];

        user.subscriptions.forEach((sub, index) => {
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
                messages.push(`💼 <b>Ваш профиль:</b>\n\n` +
                    `<b>Имя:</b> ${user.firstname ?? "Не указано"} ${user.lastname ?? "Не указано"}\n` +
                    `<b>ID:</b> ${chatId}\n` +
                    `<b>Реф баланс:</b> ${user.balance} ₽\n\n`);
                buttons.push([]);
            }

            messages[messages.length - 1] +=
                `<b>Подписка:</b> ${sub.type} (до ${formattedDate})\n` +
                `${sub.status ? "<b>✅ Подписка действует</b>" : "<b>❌ Подписка истекла</b>"}\n\n`;

            buttons[buttons.length - 1].push([
                {
                    text: `Продлить ${sub.type}`,
                    callback_data: `pay_${sub.type}`
                }
            ]);
        });

        for (let i = 0; i < messages.length; i++) {
            await bot.sendMessage(chatId, messages[i], {
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: buttons[i] }
            });
        }
    } catch (error) {
        return await sendErrorMessage(bot, chatId, "Ошибка при получении подписок: " + error.message);
    }
}
