import { YooCheckout } from "@a2seven/yoo-checkout";
import dotenv from 'dotenv'

dotenv.config()

export const checkout = new YooCheckout({
    shopId: Number(process.env.YOOKASSA_SHOPID),
    secretKey: process.env.YOOKASSA_SECRET_KEY
})

