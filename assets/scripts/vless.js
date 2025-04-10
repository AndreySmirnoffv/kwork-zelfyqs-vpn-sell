import axios from "axios";
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
    return console.error("Failed to update token:", error);
  }
}

export async function createVlessConfig(bot, chatId, username) {
  console.log("createVlessConfig")
  try {
    console.log("try catch block")
    const { data } = await axios.post("https://nxstore.online/api/user",{
      "proxies": {
        "vless": {
          "flow": ""
        }
      },
        "data_limit": 0,
        "data_limit_reset_strategy": "month",
        "expire": 0,
              "inbounds": {
              "vless": [
                "Steal",
                "XTLS"
              ]
            },

        "note": "привет",


  "status": "active",
  "username": username
}, {
      headers: {
        Authorization: `Bearer ${tokenStorage.access_token}`
      }
    });

    console.log("sublink error: " + data.subscription_url)
    return { subLink: data.subscription_url }
  } catch (error) {
    if (error.response.status === 401) {
      console.log(401)  
      return await updateToken(async () => await createVlessConfig(username));
    }else if (error.response?.status === 404){
      console.log("404 error: ", error)
      return await updateToken(async () => await createVlessConfig(username));
    }else if (error.response?.status === 409){
      console.log("user exists")
      return await bot.sendMessage(chatId, "Вы уже существуете в системе")
    }  
    
    return console.log("some error", error)
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
      return await updateToken(deleteUser(bot, msg));
    }
    
    return console.error("Error deleting user:", error);
  }
}

export async function getUser(username){
  try {
    const { data } = await axios.get(`https://nxstore.online/api/user/${username}`)
    return data
  }catch(error){
    console.error(error)
  }
}

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

    return console.log(data);
  } catch (error) {
    return console.error('Error:', error.response ? error.response.data : error.message);
  }
}

