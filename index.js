import { adminIncome, blockUser, refPayments } from "./assets/scripts/admin.js"
import { createUser, profile } from "./assets/scripts/users.js"
import { createPayment } from "./assets/scripts/payments.js"
import { bot } from "./bot.js"
import { checkSubscriptions } from "./assets/scripts/reminder.js";
import { refMessage } from "./assets/scripts/earn.js";
import { prisma } from "./assets/services/prisma.js";

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
            await bot.sendPhoto(chatId, "./assets/db/images/IMG_5183.JPG", {caption: "Выбираете на какой период вы хотите приобрести подписку", reply_markup: JSON.stringify({
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
            await bot.sendPhoto(chatId, "./assets/db/images/IMG_5181.JPG", {caption: ` 🛡 VPN SHIELDSURF  

 SHIELDSURF — современный и надёжный VPN-сервис для полного доступа к свободному интернету.  

🔹 Ваши данные под защитой  
Мы гарантируем полную анонимность. Ваши данные не используются и не хранятся.  

🔹 Скорость и стабильность  
Высокая скорость соединения и стабильная работа даже в сложных условиях.  

🔹 Обход блокировок  
Доступ ко всем сервисам, заблокированным в РФ, быстро и без перебоев.  

🔹 Безлимитный трафик  
Скачивайте сколько угодно, включая торренты. Никаких ограничений.  

🔹 Передовые технологии  
Мы используем протокол WireGuard, который обеспечивает высочайший уровень безопасности и скорости. В будущем мы добавим поддержку других современных протоколов.  

🔹 Поддержка всех устройств  
SHIELDSURF работает на Windows, macOS, iOS, Android и даже на телевизорах с Android TV.  

🔹 Круглосуточная поддержка 24/7  
Наша добрая и профессиональная команда всегда готова помочь, но вы будете обращаться к нам редко, ведь наш сервис работает безупречно.  

🔹 Лучшая реферальная система  
Реферальная система SHIELDSURF+ — одна из самых выгодных на рынке! Приглашайте друзей, зарабатывайте на их подписках и выводите деньги.  

VPN SHIELDSURF — это свобода интернета, передовые технологии и абсолютная надёжность. Присоединяйтесь к лучшим!`})
            break
    }
})


bot.on('callback_query', async msg => {
    const data = msg.data
    const chatId = msg.message.chat.id

    switch(data){
        //! Если нужно будет то вернуть
        // case "admin_active_users":
        //     break
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
        case "ref_payment":
            await prisma.users.update({
                where: {chatId},
                data: {
                    paidCard: true
                }
            })
            break
    }
})