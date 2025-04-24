# RemindThem

RemindThem is a web application that allows users to schedule SMS reminders to be sent at specific dates and times. It's perfect for sending birthday wishes, appointment reminders, follow-ups, and more.

## Features

- User authentication with email/password or Google SSO
- Schedule text messages to be sent at specific dates and times
- Send to multiple recipients with personalized information
- Track message delivery status
- Secure and private

## Tech Stack

- **Framework**: Next.js with App Router
- **Authentication**: NextAuth.js
- **Database**: Prisma ORM with SQLite (can be configured for other databases)
- **SMS Provider**: Twilio
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Twilio account for SMS functionality
- A Google Developer account (for Google SSO)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/remind_them.git
   cd remind_them
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment variables:
   Copy `.env` and update with your credentials:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-generated-secret"
   TWILIO_ACCOUNT_SID="your-twilio-account-sid"
   TWILIO_AUTH_TOKEN="your-twilio-auth-token"
   TWILIO_PHONE_NUMBER="your-twilio-phone-number"
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. Set up the database:
   ```
   npx prisma migrate dev --name init
   ```

5. Run the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setting Up Message Sending

For the scheduled messages to be sent, you'll need to set up a cron job that calls the `/api/cron/send-messages` endpoint regularly. In production, you should secure this endpoint.

Options include:
- Using a service like Vercel Cron Jobs if deploying to Vercel
- Setting up a traditional cron job with curl
- Using a scheduled task service like GitHub Actions

## Production Deployment

For production deployment, it's recommended to:

1. Use a more robust database like PostgreSQL instead of SQLite
2. Set up proper authentication for the cron job endpoint
3. Configure your environment variables in your hosting platform
4. Set up proper monitoring for the message sending process

## License

[MIT](LICENSE)
