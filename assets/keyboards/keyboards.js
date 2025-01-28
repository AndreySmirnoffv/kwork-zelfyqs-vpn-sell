export const adminKeyboard = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: "Доход", callback_data: "admin_users_income"}, {text: "Реферальные выплаты", callback_data: "admin_ref_payments"}],
            [{text: "Заблокировать", callback_data: "admin_block"}, {text: "Сменить цены на подписки", callback_data: "change_vpn_prices"}],
            [{text: "Найти пользователя", callback_data: "find_user"}]
        ]
    })
}      