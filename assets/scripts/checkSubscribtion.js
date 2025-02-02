import dotenv from 'dotenv'
import { handleSubscription } from './subscribtions.js';
import { prisma } from '../services/prisma.js';

dotenv.config()

export async function checkChannelSubscription(bot, chatId) {

    try {
        const user = await prisma.users.findFirst({
            where: {chatId}
        })

        if(user.earnedBonus){
            return await bot.sendMessage(chatId, "Вы уже забрали свой бонус, мы блогадорим вас за сотрудничество")
        }
        const chatMember = await bot.getChatMember(process.env.CHANNEL_ID, chatId);

        if (chatMember.status === "left" || chatMember.status === "kicked") {
            return bot.sendMessage(chatId, "Вы не подписаны на канал. Подпишитесь, чтобы получить бонус.");
        }

        await bot.sendMessage(chatId, "Спасибо за подписку! Вот ваш бонус.");
        await bot.sendMessage(chatId, `1️⃣ Установите приложение WireGuard

Android: Зайдите в Google Play и скачайте WireGuard.
iOS: Откройте App Store и установите WireGuard.
Windows: Скачайте приложение с официального сайта.
macOS: Установите через App Store или с официального сайта.
Linux: Установите через терминал (например, apt install wireguard для Debian/Ubuntu).
Android TV: Найдите WireGuard в Google Play на вашем телевизоре.


2️⃣ Получите конфигиттимтиит
После покупки подписки в нашем боте вы получите персональный конфигурационный файл или QR-код для настройки.


3️⃣ Импортируйте конфиг
1. Откройте приложение WireGuard.
2 .Нажмите “Добавить туннель”.
3. Выберите “Импортировать из файла” или “Сканировать QR-код”.
4. Загрузите конфигурационный файл или отсканируйте QR-код из бота.


4️⃣ Подключитесь
1. Найдите добавленный туннель в списке.
2. Включите его, нажав на переключатель.
3. Убедитесь, что статус показывает “Активно”.
4. Теперь ваш интернет защищён и свободен!

Если возникнут вопросы, наша поддержка 24/7 всегда готова помочь. 💬`)
        await prisma.users.update({
            where: {chatId},
            data: {
                earnedBonus: true
            }
        })
        return await handleSubscription(bot, chatId, "one_day_subscription")
    } catch (error) {
        console.error("Ошибка при проверке подписки:", error);
        await bot.sendMessage(chatId, "Произошла ошибка при проверке подписки. Попробуйте позже.");
    }
}