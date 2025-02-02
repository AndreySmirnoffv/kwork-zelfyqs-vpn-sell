export async function getVpnMessage(bot, chatId) {
    return await bot.sendMessage(chatId, `👨‍💻 Как подключиться:

1️⃣ Выбери нужный период подписки ниже.

2️⃣ Произведи оплату.

3️⃣ Получи приложение и настрой VPN на своём устройстве.

📲 Доступно для установки:

iPhone, Android, ПК, MacOS.

💡 Важно:

Одна подписка действует на одно устройство.

Подписку можно использовать по очереди на разных устройствах, но не одновременно.

Для подключения нескольких устройств — оформите подписку на каждое.
`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🗓 Месяц - 150 руб", callback_data: "one_month_sub" }],
                [{ text: "🗓 3 месяца - 425 руб", callback_data: "three_months_sub" }],
                [{ text: "🗓 6 месяцев - 800 руб", callback_data: "six_months_sub" }],
                [{ text: "🗓 Год - 1550 руб", callback_data: "one_year_sub" }],
                [{ text: "На главную", callback_data: "main" }]
            ]
        }
    });
}
