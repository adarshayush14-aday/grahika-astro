import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];
  const rawBody = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(timestamp + rawBody)
    .digest('base64');

  if (signature !== expectedSignature) {
    console.error('Invalid webhook signature!');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { data, type } = req.body;

  if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
    const orderId = data.order.order_id;
    const amount = data.order.order_amount;
    console.log(`Payment SUCCESS: Order ${orderId}, Amount Rs.${amount}`);
    return res.status(200).json({ success: true });
  }

  if (type === 'PAYMENT_FAILED_WEBHOOK') {
    console.log(`Payment FAILED: Order ${data.order.order_id}`);
    return res.status(200).json({ success: true });
  }

  return res.status(200).json({ received: true });
}
