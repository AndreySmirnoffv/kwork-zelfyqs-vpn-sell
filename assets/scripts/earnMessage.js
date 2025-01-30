import { prisma } from "../services/prisma.js";

export async function earnMessage(bot, chatId){
    const user = await prisma.users.findFirst({
        where: {chatId}
    })

    return await bot.sendMessage(chatId, `💰 Реферальная программа SHIELDSURF+



Делитесь уникальной ссылкой и зарабатывайте:

🔗 ${user.ref}


🪙 Условия:

50₽ за каждого друга с подпиской (если у вас активная подписка).

25₽, если подписки нет.


💳 Куда тратить деньги:

Выводите их на карту (при активной подписке).

Оплачивайте подписку SHIELDSURF.


📊 Ваш бонусный счет:

💸 ${user.balance}


🎯 Преимущества:

Высокая скорость, безопасность и простота настройки.

Мы предоставляем готовые материалы для продвижения (баннеры, тексты).
`)
}