import twilio from "twilio";

// Initialize Twilio client with environment variables
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, body: string) {
  try {
    const message = await client.messages.create({
      body,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error) {
    console.error("Error sending SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default client; 