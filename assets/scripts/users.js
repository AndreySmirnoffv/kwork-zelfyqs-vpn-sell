import { adminKeyboard, userKeyboard } from '../keyboards/keyboards.js'
import {prisma} from '../services/prisma.js'
import dotenv from 'dotenv'

dotenv.config()

export async function createUser(bot, msg){
    console.log(msg.from.firstname)
    const user = await prisma.users.findFirst({
        where: {
            chatId: msg.chat.id
        }
    })

    if(user?.blocked){
        return await bot.sendMessage(msg.chat.id, "Вам сюда нельзя")
    }
    
    if (!user){
        return await prisma.users.create({
            data: {
                firstname: msg.from.first_name || "undefined",
                lastname: msg.from.last_name || "undefined",
                chatId: msg.chat.id,
                username: msg.from.username,
                balance: 0,
                isAdmin: false,
                ref: `${process.env.BOT_LINK}?start=${msg.chat.id}`,
                origin: msg.text.replace("/start ", "") || "0" 
            }
        })
    }
    const adminMessage = user.isAdmin ? "Привет админ" : `Привет, ${msg.from.username}`

    const keyboardAdmin = user.isAdmin ? adminKeyboard : userKeyboard

    return await bot.sendMessage(msg.chat.id, adminMessage, keyboardAdmin)  
}


export async function profile(bot, chatId){
    const user = await prisma.users.findFirst({
        where: {chatId}
    })
    await bot.sendMessage(chatId, `💼 Ваш профиль:

👤 Имя: ${user.firstname} ${user.lastname}
🆔 ID: ${user.chatId}
💸 Баланс: ${user.balance}
♻️ Реф. баланс: ${user.refBalance}

📅 Подписка до: 22.01.2025 18:13
${user.subStatus ? "✅ Подписка действует" :  "❌ Подписка истекла" } `)
}