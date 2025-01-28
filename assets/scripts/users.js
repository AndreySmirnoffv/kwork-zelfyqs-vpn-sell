import { adminKeyboard } from '../keyboards/keyboards.js'
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
   
    if (user.isAdmin){
        return await bot.sendMessage(msg.chat.id, "Привет админ", adminKeyboard)
    }

    return await bot.sendMessage(msg.chat.id, `Привет, ${msg.from.username}`)  
}


export async function profile(bot, chatId){
    const user = await prisma.users.findFirst({
        where: {chatId}
    })
    await bot.sendMessage(chatId, `💼 Ваш профиль:
        
👤 Имя: ${user?.firstname} ${user?.lastname}
🆔 ID: ${user?.chatId}
♻️ Реф. баланс: ${user?.balance}

📅 Подписка до: 22.01.2025 18:13
${user?.subStatus ? "✅ Подписка действует" :  "❌ Подписка истекла" } `)
}