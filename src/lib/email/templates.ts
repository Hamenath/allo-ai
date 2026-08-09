export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

function baseHtmlWrapper(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
    .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; padding: 24px; text-align: center; }
    .header h1 { font-family: monospace; color: #ffffff; font-size: 24px; margin: 0; letter-spacing: -0.5px; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .button { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px; }
    .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ALLO AI</h1>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ALLO AI Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getWelcomeEmailTemplate(name?: string) {
  const greetingName = name || "there";
  const body = `
    <h2>Welcome to ALLO, ${greetingName}!</h2>
    <p>We're excited to have you onboard. ALLO is your all-in-one AI workspace for Career, Business, Developer, and Learning tools.</p>
    <p>You start with 5 complimentary AI generations every month on your Free plan.</p>
    <a href="${APP_URL}/dashboard" class="button">Go to Dashboard</a>
  `;
  return {
    subject: "Welcome to ALLO AI Workspace",
    html: baseHtmlWrapper("Welcome to ALLO", body),
    text: `Welcome to ALLO, ${greetingName}! Explore your AI workspace at ${APP_URL}/dashboard`,
  };
}

export function getPaymentSuccessEmailTemplate(data: { planName: string; amount: number; date: string }) {
  const body = `
    <h2>Payment Successful 🎉</h2>
    <p>Thank you for upgrading! We've received your payment of <strong>₹${data.amount}</strong> for the <strong>${data.planName}</strong> plan.</p>
    <p>Date: ${data.date}</p>
    <p>Your subscription is now active with increased AI generation quota.</p>
    <a href="${APP_URL}/billing" class="button">View Subscription</a>
  `;
  return {
    subject: `Payment Confirmed - ALLO ${data.planName}`,
    html: baseHtmlWrapper("Payment Successful", body),
    text: `Payment of ₹${data.amount} for ALLO ${data.planName} was successful. View details at ${APP_URL}/billing`,
  };
}

export function getPaymentFailureEmailTemplate(planName: string) {
  const body = `
    <h2>Payment Action Required</h2>
    <p>We were unable to process your payment for the <strong>${planName}</strong> plan.</p>
    <p>Please update your payment method to avoid uninterrupted access to your paid quota.</p>
    <a href="${APP_URL}/billing" class="button">Manage Payment Method</a>
  `;
  return {
    subject: "Payment Action Required - ALLO AI",
    html: baseHtmlWrapper("Payment Failure", body),
    text: `We were unable to process your payment for ALLO ${planName}. Please update details at ${APP_URL}/billing`,
  };
}

export function getSubscriptionActivatedEmailTemplate(planName: string, quota: number) {
  const body = `
    <h2>Subscription Activated!</h2>
    <p>Your <strong>${planName}</strong> plan is now fully active. You now have access to <strong>${quota} AI generations</strong> per month.</p>
    <a href="${APP_URL}/dashboard" class="button">Start Creating</a>
  `;
  return {
    subject: `Subscription Activated - ALLO ${planName}`,
    html: baseHtmlWrapper("Subscription Activated", body),
    text: `Your ${planName} plan is active with ${quota} generations/mo. Start at ${APP_URL}/dashboard`,
  };
}

export function getSubscriptionCancelledEmailTemplate(planName: string, endDate: string) {
  const body = `
    <h2>Subscription Cancellation Confirmation</h2>
    <p>Your <strong>${planName}</strong> plan has been set to cancel.</p>
    <p>You will continue to enjoy your full plan benefits until <strong>${endDate}</strong>, after which your account will automatically transition to the Free plan.</p>
    <a href="${APP_URL}/billing" class="button">Manage Subscription</a>
  `;
  return {
    subject: "Subscription Cancellation - ALLO AI",
    html: baseHtmlWrapper("Subscription Cancelled", body),
    text: `Your ${planName} plan subscription will cancel on ${endDate}. Details at ${APP_URL}/billing`,
  };
}

export function getUsageWarningEmailTemplate(used: number, limit: number) {
  const body = `
    <h2>Usage Warning: Approaching Quota Limit</h2>
    <p>You have used <strong>${used} of your ${limit}</strong> monthly AI generations (80%).</p>
    <p>Need more quota? You can upgrade your plan at any time.</p>
    <a href="${APP_URL}/billing" class="button">Upgrade Plan</a>
  `;
  return {
    subject: "Usage Warning: 80% AI Quota Used - ALLO",
    html: baseHtmlWrapper("Usage Warning", body),
    text: `You have used ${used} of ${limit} monthly AI generations. Upgrade at ${APP_URL}/billing`,
  };
}

export function getUsageLimitEmailTemplate(used: number, limit: number) {
  const body = `
    <h2>Monthly AI Quota Reached</h2>
    <p>You have used all <strong>${used} of ${limit}</strong> monthly AI generations for this billing period.</p>
    <p>Your quota will reset on the 1st of next month, or you can upgrade to get instant access to more generations.</p>
    <a href="${APP_URL}/billing" class="button">Upgrade Now</a>
  `;
  return {
    subject: "Quota Reached: 100% Monthly AI Generations Used - ALLO",
    html: baseHtmlWrapper("Quota Reached", body),
    text: `You have used all ${used}/${limit} AI generations for this month. Upgrade at ${APP_URL}/billing`,
  };
}
