import TelegramBot from "node-telegram-bot-api";
import dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config()

export const bot = new TelegramBot(process.env.TOKEN, {polling: true})

const commands = JSON.parse(fs.readFileSync("./assets/db/commands/commands.json", 'utf8'))

bot.setMyCommands(commands)

bot.on('polling_error', console.error)