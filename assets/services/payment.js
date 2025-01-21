import { YooCheckout } from "@a2seven/yoo-checkout";
import dotenv from 'dotenv'

dotenv.config()

export const checkout = new YooCheckout({
    shopId: 486116,
    secretKey: "test_iU7WuytmxSZNm0hnnkAFFC2SC-5KK_QBeheAvuLCu18"
})

