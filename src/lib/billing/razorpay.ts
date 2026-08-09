import Razorpay from "razorpay";
import crypto from "crypto";

export function isRazorpayConfigured(): boolean {
  return Boolean(
    (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) &&
    process.env.RAZORPAY_KEY_SECRET
  );
}

export function getRazorpayClient(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Verify Razorpay Checkout Payment Signature
 */
export function verifyPaymentSignature(params: {
  orderId?: string;
  subscriptionId?: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  let body = "";
  if (params.subscriptionId) {
    body = `${params.paymentId}|${params.subscriptionId}`;
  } else if (params.orderId) {
    body = `${params.orderId}|${params.paymentId}`;
  } else {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === params.signature;
}

/**
 * Verify Razorpay Webhook Signature
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === signature;
}
