import { adminKeyboard, profileKeyboard, startKeyboard } from '../keyboards/keyboards.js'
import {prisma} from '../services/prisma.js'
import dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config()

export async function createUser(bot, msg) {
    const user = await prisma.users.findFirst({
        where: { chatId: msg.chat.id }
    });
    if (user?.blocked) {
        console.log("Пользователь заблокирован");
        return await bot.sendMessage(msg.chat.id, "Вам сюда нельзя");
    }

    if (!user) {
        await prisma.users.create({
            data: {
                firstname: msg.from.first_name || "undefined",
                lastname: msg.from.last_name || "undefined",
                chatId: msg.chat.id,
                username: msg.from.username,
                balance: 0,
                isAdmin: false,
                ref: `${process.env.BOT_LINK}?start=${msg.chat.id}`,
                origin: msg.text.replace("/start", "")
            }
        });
    }

    if (user?.isAdmin) {
        console.log("Отправка сообщения администратору");
        return await bot.sendMessage(msg.chat.id, "Привет админ", { reply_markup: adminKeyboard });
    }

    const videoPath = "./assets/db/images/start.gif";
    
    if (!fs.existsSync(videoPath)) {
        console.log(`❌ Файл не найден: ${videoPath}`);
        return await bot.sendMessage(msg.chat.id, "Ошибка: Видео недоступно, обратитесь в поддержку.");
    }

    console.log(`✅ Файл найден: ${videoPath}, отправляю видео...`);

    return await bot.sendVideo(msg.chat.id, videoPath, {
        caption: `Привет! 👋 Добро пожаловать в ShieldSurf!
    
Ты только что сделал первый шаг к свободному и безопасному интернету. С нами ты получаешь:

✅ Максимальную защиту данных и приватности
✅ Стабильное и быстрое соединение без лагов
✅ Доступ к любимым сервисам в любых условиях
✅ Полную анонимность без лишних настроек
✅ Минимальную нагрузку на батарею и трафик

ShieldSurf — самый быстрый и доступный VPN на рынке! 🔥

Нажимай «Подключиться» и наслаждайся безопасным интернетом!`,
        reply_markup: startKeyboard
    });
}
 

export async function profile(bot, chatId){
    const user = await prisma.users.findFirst({
        where: {chatId}
    })

    console.log(user.substatus)

    await bot.sendMessage(chatId, `💼 Ваш профиль:
        
👤 Имя: ${user?.firstname} ${user?.lastname}
🆔 ID: ${user?.chatId}
♻️ Реф. баланс: ${user?.balance}

📅 Подписка до: 22.01.2025 18:13
${user?.substatus ? "✅ Подписка действует" :  "❌ Подписка истекла" } `, profileKeyboard)
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
            return await bot.sendMessage(chatId, "У вас нет активных подписок.");
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
                messages.push(`💼 *Ваш профиль:*\n\n` +
                    `👤 *Имя:* ${user.firstname ?? "Не указано"} ${user.lastname ?? "Не указано"}\n` +
                    `🆔 *ID:* ${chatId}\n` +
                    `♻️ *Реф. баланс:* ${user.balance} ₽\n\n`);
                buttons.push([]);
            }

            messages[messages.length - 1] += 
                `📅 *Подписка:* ${sub.type} (до ${formattedDate})\n` +
                `${sub.status ? "✅ *Подписка действует*" : "❌ *Подписка истекла*"}\n\n`;

            buttons[buttons.length - 1].push([
                {
                    text: `Продлить ${sub.type}`,
                    callback_data: `pay_${sub.type}`
                }
            ]);
        });

        for (let i = 0; i < messages.length; i++) {
            await bot.sendMessage(chatId, messages[i], {
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: buttons[i] }
            });
        }
    } catch (error) {
        console.error("Ошибка при получении подписок:", error);
        await bot.sendMessage(chatId, "Ошибка при получении подписок. Попробуйте позже.");
    }
}
