import { observable } from "@trpc/server/observable";
import { createCallerFactory, router, procedure } from "./trpc";
import { pspGatewayService } from "@/services/psp-gateway";
import { TRPCError } from "@trpc/server";
import { kafkaService } from "@/services/kafka";
import { TOPIC_NAME } from "@/constants";
import { AccountCreationEvent } from "@/types";

export const appRouter = router({
  createAccount: procedure.mutation(async () => {
    // create fake context
    const userId = "123";
    const accountDetails = "456";

    // validations of the action are handled by the mutation
    if (!pspGatewayService.canUserCreateAccount(userId))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Account creation is not allowed for this user",
      });

    // request to create an account
    await pspGatewayService.createAccount(userId, accountDetails);
  }),

  onSuccessfulAccountCreation: procedure.subscription(async ({ ctx }) => {
    await kafkaService.consumer.connect();
    await kafkaService.consumer.subscribe({ topic: TOPIC_NAME });

    return observable<string | undefined>((emit) => {
      kafkaService.consumer.run({
        eachMessage: async ({ topic, message }) => {
          console.log("Received message", { topic, message });
          if (topic !== TOPIC_NAME || !message || !message.value) return;

          const status = message.value.toString() as AccountCreationEvent;

          emit.next(status);

          if (status === AccountCreationEvent.SUCCESS) {
            emit.complete();
          }
        },
      });

      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        kafkaService.consumer.disconnect();
      };
    });
  }),
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
