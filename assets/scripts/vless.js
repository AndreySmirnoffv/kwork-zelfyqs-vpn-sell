import { prisma } from "../services/prisma.js";
import { vless } from "../services/vless.js";
import subscriptions from '../db/db.json' with {type: "json"}
import axios from "axios";

let lastPort = 6000;

export async function loginAndCreateConfig(chatId, type) {
  try {
    // Step 1: Perform login
    const loginResponse = await axios.post("http://91.184.243.8:16540/B9UmhnPsRsNvP0q6/login", {
      username: "2v5s9O7btt",
      password: "LJakpxnw94",
    });

    if (loginResponse.status === 200) {
      console.log('Login successful, updating API URL...');
      
      const apiUrl = "http://91.184.243.8:16540/panel";  // New base URL after login
      
      // Step 3: Now proceed with the creation of config
      await createConfig(chatId, type, apiUrl);
    } else {
      console.error('Login failed:', loginResponse.status);
    }
  } catch (error) {
    console.error('Error during login:', error);
  }
}

export async function createConfig(chatId, type, apiUrl) {
  try {
    // Step 1: Get subscription data
    const subscriptionData = subscriptions[type];
    if (!subscriptionData) {
      throw new Error(`Неизвестный тип подписки: ${type}`);
    }

    const endDate = new Date();

    if (subscriptionData.durationInDays) {
      endDate.setDate(endDate.getDate() + subscriptionData.durationInDays);
    } else if (subscriptionData.durationInMonths) {
      endDate.setMonth(endDate.getMonth() + subscriptionData.durationInMonths);
    }

    const port = lastPort++;

    // Step 2: Prepare the inbound data for the config
    const inboundData = {
      up: 0,
      down: 0,
      total: 0,
      remark: chatId.toString(),
      enable: true,
      listen: "91.184.243.8",
      port: 16540,
      settings: JSON.stringify({
        clients: [{ id: chatId.toString(), limitIp: 1, enable: true }],
        decryption: "none",
        fallbacks: []
      }),
      streamSettings: JSON.stringify({
        network: "tcp",
        security: "reality",
        realitySettings: {
          show: false,
          xver: 0,
          dest: "yahoo.com:443",
          serverNames: ["yahoo.com"],
          privateKey: "wIc7zBUiTXBGxM7S7wl0nCZ663OAvzTDNqS7-bsxV3A"
        }
      })
    };

    // Step 3: Send the request to the new API URL
    const response = await axios.post(`${apiUrl}/api/inbounds/add`, inboundData);
    
    console.log(response.data);
    const getResponse = await axios.post(`${apiUrl}/api`)    
    console.log(`Подписка для пользователя ${chatId} успешно создана с типом ${type} на ${subscriptionData.durationInDays || subscriptionData.durationInMonths} ${subscriptionData.durationInDays ? "дней" : "месяцев"}.`);
  } catch (error) {
    console.error("Ошибка при создании подписки:", error);
  }
}


export async function deleteInbound(chatId) {
  try {
    console.log(await vless.deleteInbound(chatId));

    await prisma.subscription.update({
      where: { userId: chatId },
      data: {
        status: false,
        endDate: new Date()
      }
    });

    console.log(`Подписка для пользователя ${chatId} деактивирована.`);
  } catch (error) {
    console.error("Ошибка при удалении подписки:", error);
  }
}

export async function getUserSubscription(chatId) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: chatId },
    });

    if (!subscription) {
      console.log("Подписка не найдена для пользователя", chatId);
    }

    console.log(`Подписка пользователя ${chatId}: ${subscription.status ? "Активна" : "Неактивна"}, срок действия до ${subscription.endDate}`);
  } catch (error) {
    console.error("Ошибка при получении подписки:", error);
  }
}

export async function getConfig(){
  try {
    const response = await vless.getInbound(4)
    console.log(response.settings.clients[0])
  } catch (error) {
    console.error(error)
  }
}

// Example usage
// loginAndCreateConfig(7878237823, "year_sub");