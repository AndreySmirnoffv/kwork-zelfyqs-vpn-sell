import { adminIncome, blockUser, refPayments } from "./assets/scripts/admin.js"
import { createUser, profile } from "./assets/scripts/users.js"
import { createPayment } from "./assets/scripts/payments.js"
import { bot } from "./bot.js"
import { checkSubscriptions } from "./assets/scripts/reminder.js";
import { refMessage } from "./assets/scripts/earn.js";

setInterval(async () => {
    await checkSubscriptions(bot); 
}, 24 * 60 * 60 * 1000); 


bot.on("message", async msg => {
    const chatId = msg.chat.id


    if (msg.text.includes("/start")){
        console.log(msg.from.first_name)
        await createUser(bot, msg)
    }

    switch(msg.text){
        case "🧑‍💻 Личный кабинет":
            await profile(bot, chatId)
            break
        case "Подписка 📅":
            await bot.sendVideo(chatId, "./assets/db/images/jwycat.mp4", {caption: "Выбираете на какой период вы хотите приобрести подписку", reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "🗓 Месяц - 150 руб", callback_data: "one_month_sub"}],
                    [{text: "🗓 3 месяца - 425 руб", callback_data: "three_months_sub"}],
                    [{text: "🗓 6 месяцев - 800 руб", callback_data: "six_months_sub"}],
                    [{text: "🗓 Год - 1550", callback_data: "one_year_sub"}]
                ]
            })})
            break
        case "Подключить VPN 🌐":
            break
        case "💰 Заработать":
            break
        case "Бонус 🎁":
            await refMessage(bot, chatId)
            break
        case "Узнать о VPN ℹ️":
            break
    }
})


bot.on('callback_query', async msg => {
    const data = msg.data
    const chatId = msg.message.chat.id

    switch(data){
        case "admin_active_users":
            break
        case "admin_ref_payments":
            await refPayments(bot, chatId)
            break
        case "admin_users_income":
            await adminIncome(bot, chatId)
            break
        case "admin_subscriptions":
            break
        case "admin_block":
            await blockUser(bot, chatId)
            break
        case "one_month_sub":
            await createPayment(bot, chatId, data)
            break
        case "three_months_sub":
            await createPayment(bot, chatId, data)
            break
        case "one_year_sub":
            await createPayment(bot, chatId, data)
            break
    }
})