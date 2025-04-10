import { prisma } from "../services/prisma.js";
import path from 'path'; 
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const subscriptionPhotoPath = path.resolve(__dirname, '../db/images/subscription.jpg');  // Абсолютный путь

export async function earnMessage(bot, chatId) {
    try {
        const user = await prisma.users.findFirst({
            where: { chatId }
        });
    
        if (!user) {
            return await bot.sendMessage(chatId, "Пользователь не найден.");
        }

        if (fs.existsSync(subscriptionPhotoPath)) {
            return await bot.sendPhoto(
                chatId,
                subscriptionPhotoPath,
                {
                    caption: `<b>💰 Реферальная программа NXSTORE+</b>
        
Делитесь уникальной ссылкой и зарабатывайте:

🔗 <b>${user.ref}</b>

🪙 <b>Условия:</b>

50₽ за каждого друга с подпиской (если у вас активная подписка).

25₽, если подписки нет.

💳 <b>Куда тратить деньги:</b>

Выводите их на карту (при активной подписке).

Оплачивайте подписку SHIELDSURF.

📊 <b>Ваш бонусный счет:</b>

💸 <b>${user.balance}</b>

🎯 <b>Преимущества:</b>

Высокая скорость, безопасность и простота настройки.

Мы предоставляем готовые материалы для продвижения (баннеры, тексты).`,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "На главную", callback_data: "main" }]
                        ]
                    }
                }
            );
        }

        console.log("Изооброжение не найдено по пуи ./assets/db/images/");
        return await bot.sendMessage(chatId, "Ошибка обратитесь в поддержку")
        
    } catch (error) {
        console.error("Error in earnMessage:", error);
        throw Error(error);
    }
}
