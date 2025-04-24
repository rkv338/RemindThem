"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Define the validation schema
const messageSchema = z.object({
  content: z.string().min(1, "Message is required").max(1600, "Message cannot exceed 1600 characters"),
  recipients: z.array(
    z.object({
      name: z.string().optional(),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
      sendAt: z.date().min(new Date(), "Date must be in the future"),
    })
  ).min(1, "At least one recipient is required"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

export default function NewMessagePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
      recipients: [{ name: "", phone: "", sendAt: new Date(Date.now() + 3600000) }], // Default to 1 hour from now
    },
  });

  // Control the recipients array
  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipients",
  });

  // Handle form submission
  const onSubmit = async (data: MessageFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: data.content,
          recipients: data.recipients.map(recipient => ({
            ...recipient,
            sendAt: recipient.sendAt.toISOString(),
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to schedule message");
        return;
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError("Something went wrong. Please try again.");
      console.error("Error scheduling message:", error);
    } finally {
      setIsSubmitting(false);
    }
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
              <Link
                href="/dashboard"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Schedule a New Message</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create a message to be sent at a specific time.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white shadow sm:rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Message Content
              </label>
              <div className="mt-1">
                <textarea
                  id="content"
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter your message here..."
                  {...register("content")}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This message will be sent to all recipients at their scheduled times.
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recipients</h3>
                <button
                  type="button"
                  onClick={() => append({ name: "", phone: "", sendAt: new Date(Date.now() + 3600000) })}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add Recipient
                </button>
              </div>
              {errors.recipients && errors.recipients.root && (
                <p className="mt-1 text-sm text-red-600">{errors.recipients.root.message}</p>
              )}

              <div className="mt-4 space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col space-y-3 rounded-md border border-gray-200 p-4 sm:flex-row sm:space-y-0 sm:space-x-4"
                  >
                    <div className="flex-1">
                      <label
                        htmlFor={`recipients.${index}.name`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Name (Optional)
                      </label>
                      <input
                        type="text"
                        id={`recipients.${index}.name`}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="John Doe"
                        {...register(`recipients.${index}.name`)}
                      />
                    </div>

                    <div className="flex-1">
                      <label
                        htmlFor={`recipients.${index}.phone`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Phone Number
                      </label>
                      <input
                        type="text"
                        id={`recipients.${index}.phone`}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="+12345678901"
                        {...register(`recipients.${index}.phone`)}
                      />
                      {errors.recipients?.[index]?.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.recipients[index]?.phone?.message}
                        </p>
                      )}
                    </div>

                    <div className="flex-1">
                      <label
                        htmlFor={`recipients.${index}.sendAt`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Send At
                      </label>
                      <Controller
                        control={control}
                        name={`recipients.${index}.sendAt`}
                        render={({ field }) => (
                          <DatePicker
                            selected={field.value}
                            onChange={(date: Date | null) => field.onChange(date || new Date())}
                            showTimeSelect
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        )}
                      />
                      {errors.recipients?.[index]?.sendAt && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.recipients[index]?.sendAt?.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-end justify-end">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/dashboard"
                className="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? "Scheduling..." : "Schedule Message"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 