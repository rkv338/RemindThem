import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createMessage, getUserMessages } from "@/lib/db";

// Validation schema for creating a message
const createMessageSchema = z.object({
  content: z.string().min(1).max(1600),
  recipients: z.array(
    z.object({
      name: z.string().optional(),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
      sendAt: z.string().datetime(),
    })
  ).min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createMessageSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { content, recipients } = validationResult.data;
    
    // Format recipients with parsed dates
    const formattedRecipients = recipients.map(recipient => ({
      ...recipient,
      sendAt: new Date(recipient.sendAt),
    }));
    
    // Create the message with recipients
    const message = await createMessage(
      session.user.id as string,
      content,
      formattedRecipients
    );
    
    return NextResponse.json(
      { message: "Message scheduled successfully", data: message },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in messages POST route:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Verify the user is authenticated
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get all messages for the user
    const messages = await getUserMessages(session.user.id as string);
    
    return NextResponse.json({ data: messages });
  } catch (error) {
    console.error("Error in messages GET route:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 