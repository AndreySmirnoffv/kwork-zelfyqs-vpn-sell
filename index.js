import { userKeyboard } from "./assets/keyboards/keyboards"
import { createUser } from "./assets/scripts/createUser"
import { bot } from "./bot"

bot.on("message", async msg => {
    if (msg.text === "/start"){
        await bot.sendMessage(msg.chat.id, `Привет, ${msg.from.username}`, userKeyboard)
        await createUser(bot, msg)
    }
})


bot.on('callback_query', async msg => {

})