import { bonusKeyboard } from "../keyboards/keyboards.js"

export async function refMessage(bot, chatId){
    return await bot.sendPhoto(chatId, "./assets/db/images/IMG_5182.JPG", {caption: `🎁 Подарок — 24 часа VPN бесплатно!

Просто подпишись на наш Telegram-канал и получи 1 день полного доступа к VPN NXSTORE — без ограничений и условий.

Что ты получаешь:
✔️ Высокую скорость и стабильную работу
✔️ Полную анонимность и защиту личных данных
✔️ Безлимитный трафик на всех устройствах

🔐 VPN NXSTORE — это твой безопасный интернет без границ.

🚀 Начни пользоваться прямо сейчас:
👉 Подписаться на канал
`, reply_markup: bonusKeyboard})
}