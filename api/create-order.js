export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { planName, amount, userEmail, userName } = req.body;

  const orderId = 'GRAHIKA_' + Date.now() + '_' + 
    Math.random().toString(36).substr(2, 9).toUpperCase();

  const orderData = {
    order_id: orderId,
    order_amount: amount,
    order_currency: "INR",
    order_note: `Grahika Astro - ${planName} Plan`,
    customer_details: {
      customer_id: "CUST_" + Date.now(),
      customer_email: userEmail || "user@example.com",
      customer_phone: "9999999999",
      customer_name: userName || "Grahika User"
    },
    order_meta: {
      return_url: `https://grahika-astro.vercel.app/payment-success?order_id={order_id}`,
      notify_url: `https://grahika-astro.vercel.app/api/verify-payment`
    }
  };

  const cashfreeUrl = process.env.CASHFREE_ENV === 'PROD'
    ? 'https://api.cashfree.com/pg/orders'
    : 'https://sandbox.cashfree.com/pg/orders';

  try {
    const response = await fetch(cashfreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (data.payment_session_id) {
      return res.status(200).json({
        success: true,
        orderId: orderId,
        paymentSessionId: data.payment_session_id
      });
    } else {
      console.error('Cashfree Error:', data);
      return res.status(500).json({ 
        error: 'Order create karne mein problem' 
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
