import {prisma} from '../services/prisma.js'

export async function createUser(msg){
    const user = prisma.user.findFirst({
        where: {
            chatId: msg.chat.id
        }
    })

    if (!user){
        return prisma.user.create({
            data: {
                firstname: msg.from.firstname,
                lastname: msg.from.lastname,
                chatId: msg.chat.id,
                balance: 0,
                isAdmin: false,
                ref: "",
                origin: ""
            }
        })
    }

}