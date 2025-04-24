import { NextResponse } from "next/server";
import { getMessagesToSend, markMessageAsSent } from "@/lib/db";
import { sendSMS } from "@/lib/twilio";

export async function GET(request: Request) {
  // This endpoint should be secured in production, using a cron job secret
  // Check for authorization header in production environments
  
  try {
    // Get all messages that need to be sent now
    const messagesToSend = await getMessagesToSend();
    
    if (messagesToSend.length === 0) {
      return NextResponse.json({ message: "No messages to send at this time" });
    }
    
    const results = [];
    
    // Send each message
    for (const recipient of messagesToSend) {
      try {
        // Send the SMS via Twilio
        const smsResult = await sendSMS(
          recipient.phone,
          recipient.message.content
        );
        
        // Mark as sent regardless of result to prevent retries
        // In production, you might want more sophisticated retry logic
        await markMessageAsSent(recipient.id);
        
        results.push({
          recipientId: recipient.id,
          phone: recipient.phone,
          success: smsResult.success,
          ...(smsResult.success ? { messageId: smsResult.messageId } : { error: smsResult.error }),
        });
      } catch (error) {
        console.error(`Error sending message to ${recipient.phone}:`, error);
        results.push({
          recipientId: recipient.id,
          phone: recipient.phone,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
    
    return NextResponse.json({
      message: `Processed ${messagesToSend.length} messages`,
      results,
    });
  } catch (error) {
    console.error("Error in send-messages cron job:", error);
    return NextResponse.json(
      { error: "Failed to process messages" },
      { status: 500 }
    );
  }
}

// This route should only be accessible via GET requests
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5-minute maximum duration 