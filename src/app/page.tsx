"use client";

import Image from "next/image";
import { api } from "./trpc";

export default function Home() {
  const mutation = api.createCreateAccountEvent.useMutation();

  api.onSuccessfulAccountCreation.useSubscription(undefined, {
    onData(data) {
      console.log(data);
    },
  });

  return (
    <div className="p-4">
      <button onClick={() => mutation.mutate()}>Create Account</button>
    </div>
  );
}
