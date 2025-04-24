"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { z } from "zod";

// Type definitions
type Recipient = {
  id: string;
  name?: string;
  phone: string;
  sendAt: string;
  sent: boolean;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  recipients: Recipient[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/messages");
        
        if (!response.ok) {
          if (response.status === 401) {
            // User is not authenticated, redirect to sign-in
            router.push("/auth/signin");
            return;
          }
          throw new Error("Failed to fetch messages");
        }
        
        const data = await response.json();
        setMessages(data.data || []);
      } catch (error) {
        setError("Failed to load your messages. Please try again.");
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [router]);

  // Handle sign out
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-blue-600">RemindThem</h1>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/dashboard/new" className="mr-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                New Message
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Scheduled Messages</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your scheduled message reminders.
          </p>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">Loading your messages...</p>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-md bg-gray-50 p-8 text-center">
            <p className="text-gray-600 mb-4">You haven't scheduled any messages yet.</p>
            <Link href="/dashboard/new" className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Create your first message
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {messages.map((message) => (
                <li key={message.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-blue-600">
                        {message.content.length > 50
                          ? message.content.substring(0, 50) + "..."
                          : message.content}
                      </p>
                      <div className="ml-2 flex flex-shrink-0">
                        <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                          {message.recipients.length} recipient(s)
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Created on {formatDate(message.createdAt)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {message.recipients.filter(r => r.sent).length} of {message.recipients.length} sent
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
} 