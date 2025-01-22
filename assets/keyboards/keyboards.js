export const userKeyboard = {
    reply_markup: JSON.stringify({
        keyboard: [
            [{text: "🧑‍💻 Личный кабинет"}],
            [{text: "Подписка 📅"}, {text: "Подключить VPN 🌐"}],
            [{text: "💰 Заработать"}, {text: "Бонус 🎁"}],
            [{text: "Узнать о VPN ℹ️"}]
        ]
    })
}


export const adminKeyboard = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: "Доход", callback_data: "admin_users_income"}, {text: "Реферальные выплаты", callback_data: "admin_ref_payments"}],
            [{text: "Активные пользователи", callback_data: "admin_active_users"}, {text: "Заблокировать", callback_data: "admin_block"} ]
        ]
    })
}      