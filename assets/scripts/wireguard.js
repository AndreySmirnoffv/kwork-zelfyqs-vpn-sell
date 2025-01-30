import * as fs from "fs";
import { execSync } from "child_process";
import path from "path";
import QRCode from "qrcode";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_PUBLIC_KEY_PATH = "/etc/wireguard/server_public.key";
const WG_INTERFACE = "wg0";
const LISTEN_PORT = 51820;
const SERVER_IP = "172.31.45.176";

function generateKeys() {
  const privateKey = execSync("wg genkey").toString().trim();
  const publicKey = execSync(`echo "${privateKey}" | wg pubkey`).toString().trim();
  const presharedKey = execSync("wg genpsk").toString().trim();
  return { privateKey, publicKey, presharedKey };
}

function createClientConfig(clientPrivateKey, presharedKey, clientIP) {
  const serverPublicKey = fs.readFileSync(SERVER_PUBLIC_KEY_PATH, "utf-8").trim();

  return `
  [Interface]
  PrivateKey = ${clientPrivateKey}
  Address = ${clientIP}/24
  DNS = 1.1.1.1

  [Peer]
  PublicKey = ${serverPublicKey}
  PresharedKey = ${presharedKey}
  AllowedIPs = 0.0.0.0/0, ::/0
  PersistentKeepalive = 25
  Endpoint = ${SERVER_IP}:${LISTEN_PORT}
  `.trim();
}

async function generateQRCode(config, outputPath) {
  try {
    await QRCode.toFile(outputPath, config);
    console.log(`QR-код создан: ${outputPath}`);
  } catch (err) {
    console.error("Ошибка при генерации QR-кода:", err);
  }
}

function addClientToServer(clientPublicKey, clientIP) {
  const peerConfig = `
[Peer]
PublicKey = ${clientPublicKey}
AllowedIPs = ${clientIP}/32
  `.trim();

  const serverConfigPath = `/etc/wireguard/${WG_INTERFACE}.conf`;
  fs.appendFileSync(serverConfigPath, `\n${peerConfig}\n`);
  console.log(`Клиент с публичным ключом ${clientPublicKey} добавлен в конфигурацию сервера.`);
}

function restartWireGuardInterface() {
  execSync(`wg-quick down ${WG_INTERFACE}`);
  execSync(`wg-quick up ${WG_INTERFACE}`);
  console.log(`Интерфейс ${WG_INTERFACE} перезапущен.`);
}

export async function createConfig(bot, chatId, username) {
  const clientName = username;

  if (!fs.existsSync(SERVER_PUBLIC_KEY_PATH)) {
    console.error("Публичный ключ сервера не найден! Убедитесь, что сервер настроен.");
    return;
  }

  const { privateKey: clientPrivateKey, publicKey: clientPublicKey, presharedKey } = generateKeys();

  const clientIP = `10.0.0.${Math.floor(Math.random() * 254) + 2}`;

  const clientConfig = createClientConfig(clientPrivateKey, presharedKey, clientIP);

  const clientConfigPath = path.join(__dirname, `${clientName}-wg.conf`);
  fs.writeFileSync(clientConfigPath, clientConfig);
  console.log(`Конфигурация клиента сохранена: ${clientConfigPath}`);

  const qrCodePath = path.join(__dirname, `${clientName}-wg.png`);
  await generateQRCode(clientConfig, qrCodePath);

  addClientToServer(clientPublicKey, clientIP);

  restartWireGuardInterface();
  await bot.sendDocument(chatId, `/etc/wireguard/${clientName}-wg.conf`)
  await bot.sendPhoto(chatId, `/etc/wireguard/${clientName}-wg.png`)
  console.log("Готово!");
  console.log(`- Конфигурация клиента: ${clientConfigPath}`);
  console.log(`- QR-код клиента: ${qrCodePath}`);
}

export function deleteConfig(user) {
  const clientName = user.username;
  const filePath = `/etc/wireguard/${clientName}-wg.conf`;

  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error(`Ошибка: файл ${filePath} не найден`);
      } else {
        console.error(`Ошибка при удалении файла:`, err);
      }
      return;
    }
    console.log(`Файл ${filePath} успешно удалён`);
  });
}