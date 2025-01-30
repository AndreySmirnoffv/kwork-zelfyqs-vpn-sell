import dotenv from 'dotenv'

dotenv.config()

export async function checkChannelSubscription(bot, chatId) {
    try {
        const chatMember = await bot.getChatMember(process.env.CHANNEL_ID, chatId);

        if (chatMember.status === "left" || chatMember.status === "kicked") {
            return bot.sendMessage(chatId, "Вы не подписаны на канал. Подпишитесь, чтобы получить бонус.");
        }

        await bot.sendMessage(chatId, "Спасибо за подписку! Вот ваш бонус.");
    } catch (error) {
        console.error("Ошибка при проверке подписки:", error);
        bot.sendMessage(chatId, "Произошла ошибка при проверке подписки. Попробуйте позже.");
    }
}
