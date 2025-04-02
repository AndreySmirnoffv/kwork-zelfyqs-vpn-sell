import { adminIncome, blockUser, getUser, refPayments } from "./assets/scripts/admin.js"
import { createUser, profile, subscribtions } from "./assets/scripts/users.js"
import { createPayment } from "./assets/scripts/payments.js"
import { checkSubscriptions } from "./assets/scripts/reminder.js";
import { refMessage } from "./assets/scripts/earn.js";
import { refPaymentBalance } from "./assets/scripts/ref.js";
import { prisma } from "./assets/services/prisma.js";
import { checkChannelSubscription } from "./assets/scripts/checkSubscribtion.js";
import { earnMessage } from "./assets/scripts/earnMessage.js";
import { vpnMessage } from "./assets/scripts/vpnMessage.js";
import { getVpnMessage } from "./assets/scripts/getVpnMessage.js";
import * as fs from 'fs'
import { faqMessage } from "./assets/scripts/faqMessage.js";
import { listMySubscriptions } from "./assets/scripts/subscribtions.js";
import { createSubscriptionOPayment } from "./assets/scripts/subscriptionsPayment.js";
import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.TOKEN, {polling: true})

const commands = JSON.parse(fs.readFileSync("./assets/db/commands/commands.json", 'utf-8'))
console.log(commands)
bot.setMyCommands(commands)

setInterval(async () => {
    await checkSubscriptions(bot); 
}, 24 * 60 * 60 * 1000); 


bot.on("message", async msg => {
    try {
        const chatId = msg.chat.id
        console.log(msg)
        const user = await prisma.users.findFirst({
            where: {chatId: chatId}
        })

        if(user?.blocked){
            return await bot.sendMessage(msg.chat.id, "Вам сюда нельзя")
        }

        if (msg.text.includes("/start") || msg.text === "/start" ){
            console.log(msg)
            await createUser(bot, msg)
        }
    
        switch(msg.text){
            case "/profile":
                await profile(bot, chatId)
                break
            case "/subscription":
                await bot.sendPhoto(chatId, "./assets/db/images/IMG_5183.JPG", {caption: `чтобы оформить подписку, выберите удобный для вас период.
    
    ❗После покупки мы сразу предоставим:
    
    1⃣Произведите оплату подписки
    2⃣Приложения для всех ваших устройств.
    3⃣Получите ключ и подробные инструкции по настройке и подключению.
    ‼ Внимание 1 подписка даёт возможно подключить только одно устройство !`, reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{text: "🗓 Месяц - 150 руб", callback_data: "one_month_sub"}],
                        [{text: "🗓 3 месяца - 425 руб", callback_data: "three_months_sub"}],
                        [{text: "🗓 6 месяцев - 800 руб", callback_data: "six_months_sub"}],
                        [{text: "🗓 Год - 1550", callback_data: "year_sub"}],
                        [{text: "На главную", callback_data: "main"}]
                    ]
                })})
                break
            case "/earn":
                await earnMessage(bot, chatId)
                break
            case "/bonus":
                await refMessage(bot, chatId)
                break
    
            case "/subscriptions":
                await subscribtions(bot, chatId)
                break
            case "/aboutvpn":
                await vpnMessage(bot, chatId)
                break
        }

        const chatMember = await bot.getChatMember(process.env.CHANNEL_ID, chatId)
        console.log(chatMember)
    } catch (error) {
        console.error(error)
    }
   
})

bot.on('callback_query', async msg => {
    const data = msg.data
    const chatId = msg.message.chat.id
    const username = msg.message.from.username
    const messageId = msg.message.message_id

    const user = await prisma.users.findFirst({
        where: {chatId: chatId}
    })

    if(user.blocked){
        return await bot.sendMessage(msg.chat.id, "Вам сюда нельзя")
    }

    switch(data){
        case "admin_ref_payments":
            //await bot.deleteMessage(chatId, messageId)
            await refPayments(bot, chatId)
            break
        case "admin_users_income":
            //await bot.deleteMessage(chatId, messageId)
            await adminIncome(bot, chatId)
            break
        case "admin_subscriptions":
            break          
        case "admin_block_user":
            //await bot.deleteMessage(chatId, messageId)
            await blockUser(bot, chatId)
            break
        case "one_month_sub":
            //await bot.deleteMessage(chatId, messageId)
            await createPayment(bot, chatId, data, username)
            break
        case "three_months_sub":
            //await bot.deleteMessage(chatId, messageId)
            await createPayment(bot, chatId, data, username)
            break
        case "six_months_sub":
            //await bot.deleteMessage(chatId, messageId)
            await createPayment(bot, chatId, data, username)
        case "year_sub":
            //await bot.deleteMessage(chatId, messageId)
            await createPayment(bot, chatId, data, username)
            break
        case "ref_payment":
            //await bot.deleteMessage(chatId, messageId)
            await refPaymentBalance()
            break
        case "get_user":
            //await bot.deleteMessage(chatId, messageId)
            await getUser(bot, chatId)
            break
        case "change_vpn_prices":
            //await bot.deleteMessage(chatId, messageId)
            await changeVpnPrices(bot, chatId)
            break
        case "check_channel_subscription":
            //await bot.deleteMessage(chatId, messageId)
            await checkChannelSubscription(bot, chatId)
            break
        case "profile":
            //await bot.deleteMessage(chatId, messageId)
            // await profile(bot, chatId)
            await subscribtions(bot, chatId)

            break
        case "bonus":
            //await bot.deleteMessage(chatId, messageId)
            await refMessage(bot, chatId)
            break
        case "get_vpn":
            //await bot.deleteMessage(chatId, messageId)
            await getVpnMessage(bot, chatId)
            break
        case "info_vpn":
            //await bot.deleteMessage(chatId, messageId)
            await vpnMessage(bot, chatId)
            break
        case "main":
            //await bot.deleteMessage(chatId, messageId)
            await createUser(bot, msg.message)
            break
        case "faq":
            //await bot.deleteMessage(chatId, messageId)
            await faqMessage(bot, chatId)
            break
        case "my_subscriptions":
            //await bot.deleteMessage(chatId, messageId)
            await listMySubscriptions(bot, chatId)
            break
        case "earn":
            //await bot.deleteMessage(chatId, messageId)
            await earnMessage(bot, chatId)
            break
        default:
            const subType = data.split('_')[1];
            console.log("Тип подписки:", subType)
            console.log(data)
            await createSubscriptionOPayment(bot, chatId, data.replace("pay_", ""), msg.from.username)
            break
        }
})
