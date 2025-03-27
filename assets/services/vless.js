import { XuiApi } from "3x-ui";

export const vless = new XuiApi("http://2v5s9O7btt:LJakpxnw94@91.184.243.8:16540/B9UmhnPRsNvP0q6/")
vless.debug = true
vless.stdTTL = 60


// const chatId = 7878237823

// // const"year_sub"

// const simpleConfig = {
//     up: 0,
//     down: 0,
//     total: 0,
//     remark: chatId.toString(),
//     enable: true,
//     listen: "91.184.243.8",
//     port: 6000,
//     // protocol: "vless",
//     // protocol: "dokomedo-door",
//     settings: JSON.stringify({
//       clients: [{ id: chatId.toString(), limitIp: 1, enable: true }],
//       decryption: "none",
//       fallbacks: []
//     }),
//     streamSettings: JSON.stringify({
//       network: "tcp",
//       security: "reality",
//       realitySettings: {
//         show: true,
//         xver: 0,
//         dest: "yahoo.com:443",
//         serverNames: ["yahoo.com"],
//         privateKey: "wIc7zBUiTXBGxM7S7wl0nCZ663OAvzTDNqS7-bsxV3A"
//       }
// })
// }

// vless.addInbound(simpleConfig)