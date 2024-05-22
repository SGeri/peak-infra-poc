"use client";

import { useState } from "react";
import { api } from "./trpc";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);

  const createAccountMutation = api.createAccount.useMutation();

  api.onSuccessfulAccountCreation.useSubscription(undefined, {
    enabled: createAccountMutation.isSuccess,
    onData(data) {
      console.log("Something came from the server:", data);
      if (data) {
        setMessages((prev) => [...prev, data]);
      }
    },
    onError(err) {
      console.error("Something went wrong", err);
    },
    onStarted() {
      console.log("Subscription started");
    },
  });

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={() => createAccountMutation.mutate()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Create Account
      </button>

      <h1 className="text-2xl">Messages</h1>
      <ul className="text-lg">
        {messages.map((msg, i) => (
          <li key={i}>
            {i + 1}#: {msg}
          </li>
        ))}
      </ul>
    </div>
  );
}
