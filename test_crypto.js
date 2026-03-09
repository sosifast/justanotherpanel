const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const gateway = await prisma.paymentGateway.findFirst({
      where: {
        provider: 'CRYPTOMUS',
        status: 'ACTIVE'
      }
    });

    if (!gateway) {
        console.log("No active cryptomus gateway");
        return;
    }

    const config = gateway.api_config;
    if (!config.merchantId || !config.paymentKey) {
        console.log("No merchantId or paymentKey");
        return;
    }

    console.log("Merchant ID:", config.merchantId.substring(0, 10) + "...");

    const payload = {};
    const jsonPayload = JSON.stringify(payload);
    const base64Payload = Buffer.from(jsonPayload).toString('base64');
    const sign = crypto.createHash('md5').update(base64Payload + config.paymentKey).digest('hex');

    const response = await fetch('https://api.cryptomus.com/v1/balance', {
      method: 'POST',
      headers: {
        merchant: config.merchantId,
        sign: sign,
        'Content-Type': 'application/json'
      },
      body: jsonPayload
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
