export const adminKeyboard = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: "Доход", callback_data: "admin_users_income"}, {text: "Реферальные выплаты", callback_data: "admin_ref_payments"}],
            [{text: "Заблокировать", callback_data: "admin_block_user"}, {text: "Сменить цены на подписки", callback_data: "change_vpn_prices"}],
            [{text: "Найти пользователя", callback_data: "get_user"}],
            [{text: "На главную", callback_data: "main"}]
        ]
    })
}      

export const startKeyboard = {
    inline_keyboard: [
        [{ text: "Личный кабинет 🧑‍💻", callback_data: "profile" }],
        [{ text: "Подключить VPN 🔒", callback_data: "get_vpn" }],
        [{ text: "Заработать💸", callback_data: "earn" }],
        [{ text: "Бонус 🎁", callback_data: "bonus" }],
        [{ text: "Поддержка", url: "https://t.me/zelfyq" }],
        [{ text: "О VPN 🛡", callback_data: "info_vpn" }] 
    ]
};


export const profileKeyboard = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: "Мои подписки 🔄", callback_data: "my_subscriptions"}],
            [{text: "На главную", callback_data: "main"}]
        ]
    })
}

export const bonusKeyboard = JSON.stringify({
        inline_keyboard: [
            [{text: "Подписаться", url: "https://t.me/ShieldSurf"}],
            [{text: "Я подписался", callback_data: "check_channel_subscription"}],
            [{text: "На главную", callback_data: "main"}]
        ]
    })

export const faqKeyboard = JSON.stringify({
    inline_keyboard: [
        [{text: "faq", callback_data: "faq"}],
        [{text: "На главную", callback_data: "main"}]
    ]
})

export const onMainKeyboard = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: "На главную", callback_data: "main"}]
        ]
    })
}