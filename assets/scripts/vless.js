import { prisma } from "../services/prisma.js";
import { vless } from "../services/vless.js";
import subscriptions from '../db/db.json' with {type: "json"}

let lastPort = 6000; 

export async function createConfig(chatId, type) {
  try {
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

    const settings = {
      clients: [{
        id: chatId.toString(),
        limitIp: 1,
        totalGB: 0,
        expiryTime: 0,
        enable: true,
        tgId: "",
        subId: "rqv5zw1ydutamcp0",
        reset: 0
      }],
      decryption: "none",
      fallbacks: []
    };

    const streamSettings = {
      network: "tcp",
      security: "reality",
      externalProxy: [],
      realitySettings: {
        show: false,
        xver: 0,
        dest: "yahoo.com:443",
        serverNames: ["yahoo.com", "www.yahoo.com"],
        privateKey: "wIc7zBUiTXBGxM7S7wl0nCZ663OAvzTDNqS7-bsxV3A",
        minClient: "",
        maxClient: "",
        maxTimediff: 0,
        shortIds: [
          "47595474", "7a5e30", "810c1efd750030e8", "99", "9c19c134b8", "35fd", "2409c639a707b4", "c98fc6b39f45"
        ],
        settings: {
          publicKey: "2UqLjQFhlvLcY7VzaKRotIDQFOgAJe1dYD1njigp9wk",
          fingerprint: "random",
          serverName: "",
          spiderX: "/"
        }
      },
      tcpSettings: {
        acceptProxyProtocol: false,
        header: {
          type: "none"
        }
      }
    };

    const sniffing = {
      enabled: true,
      destOverride: ["http", "tls", "quic", "fakedns"],
      metadataOnly: false,
      routeOnly: false
    };

    const allocate = {
      strategy: "always",
      refresh: 5,
      concurrency: 3
    };

    const inboundData = {
      up: 0,
      down: 0,
      total: 0,
      remark: chatId.toString(),
      enable: true,
      expiryTime: 0,
      listen: "",
      port: port,
      protocol: "vless",
      settings: JSON.stringify(settings),
      streamSettings: JSON.stringify(streamSettings), 
      sniffing: JSON.stringify(sniffing),
      allocate: JSON.stringify(allocate)
    };

    await vless.addInbound(inboundData);

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

createConfig(7878237823, "year_sub")
// await getConfig()