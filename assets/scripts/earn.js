import { bonusKeyboard } from "../keyboards/keyboards.js"
import { prisma } from "../services/prisma.js"

export async function refMessage(bot, chatId){
    const user = await prisma.users.findFirst({
        where: {chatId}
    })


    return await bot.sendPhoto(chatId, "./assets/db/images/IMG_5182.JPG", {caption: `🎁 Подарок: 24 часа VPN бесплатно!

Подпишитесь на наш Telegram-канал и получите 1 день полного доступа к SHIELDSURF:



✔️ Высокая скорость и стабильность.

✔️ Полная анонимность и защита данных.

✔️ Безлимитный трафик.



🚀 Начни пользоваться прямо сейчас:

Подписаться на канал



`, reply_markup: bonusKeyboard})
}