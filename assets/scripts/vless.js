import { prisma } from "../services/prisma.js";
import axios from "axios";
import subscriptions from '../db/db.json' with { type: "json" };
import tokenStorage from '../db/token.json' with { type: "json" };
import * as fs from 'fs';


async function updateToken(callback) {
  try {
    const params = new URLSearchParams();

    params.append("username", process.env.ADMIN_USERNAME);
    params.append("password", process.env.ADMIN_PASS);

    const { data } = await axios.post("https://nxstore.online/api/admin/token", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    
    tokenStorage.access_token = data.access_token;
    fs.writeFileSync("./assets/db/token.json", JSON.stringify(tokenStorage, null, '\t'));
    console.log("Token updated:", data);
    
    if (callback) {
      await callback();
    }
  } catch (error) {
    console.error("Failed to update token:", error);
  }
}

export async function createVlessConfig(bot, username) {
  try {
    const { data } = await axios.post("https://nxstore.online/api/user", {
      "expire": 1,
      "proxies": {
        "vless": {
          "flow": ""
        }
      },
      "data_limit_reset_strategy": "reset",
      "data_limit": 1,
      "auto_delete_in_days": 1,
      "expire": 0,
      "inbounds": {
        "vless": [
          "Steal",
          "XTLS"
        ]
      },
      "note": "Спасибо что купили наш впн)",
      "status": "active",
      "username": username
    }, {
      headers: {
        Authorization: `Bearer ${tokenStorage.access_token}`
      }
    });
    console.log(data);
    return data;
  } catch (error) {
    if (error.response && error.response.status === 401 || error.response.status === 404) {
      console.log("Token expired, updating...");
      await updateToken(() => createVlessConfig(bot, msg));
    } else {
      console.error("Error creating VLESS config:", error);
    }
  }
}

export async function deleteUser(bot, msg) {
  try {
    const { data } = await axios.delete(`https://nxstore.online/api/user/${msg.from.username}`, {
      headers: {
        Authorization: `Bearer ${tokenStorage.access_token}`
      }
    });
    console.log(data);
    console.log("User deleted");
  } catch (error) {
    if (error.response && error.response.status === 401 || error.response.status === 404) {
      console.log("Token expired, updating...");
      await updateToken(deleteUser);
    } else {
      console.error("Error deleting user:", error);
    }
  }
}

// await createVlessConfig();

export async function disableUser(username) {
  try {
    const { data } = await axios.put(
      `https://nxstore.online/api/user/${username}`,
      {
        data_limit: 0,
        data_limit_reset_strategy: "day",
        expire: 1,
        status: "disabled"
      },
      {
        headers: {
          'Accept': 'application/json',
          Authorization: `Bearer ${tokenStorage.access_token}`
        },
      }
    );
    console.log(data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

