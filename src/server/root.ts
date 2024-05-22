import { observable } from "@trpc/server/observable";
import { createCallerFactory, router, procedure } from "./trpc";
import { pspGatewayService } from "@/services/psp-gateway";
import { TRPCError } from "@trpc/server";
import { kafkaService } from "@/services/kafka";

type Test = string | undefined;

export const appRouter = router({
  createCreateAccountEvent: procedure.mutation(async () => {
    const userId = "123";
    const accountDetails = {};

    if (!pspGatewayService.checkUserAccountCreationAbility(userId))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User account creation is not allowed",
      });

    // call kafka to create an event or directly call service that creates event
    await pspGatewayService.createAccount(userId, accountDetails);
  }),

  onSuccessfulAccountCreation: procedure.subscription(async ({ ctx }) => {
    const consumer = kafkaService.getConsumer();
    await consumer.connect();
    await consumer.subscribe({ topic: "topic" });

    return observable<Test>((emit) => {
      consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log({
            value: message?.value?.toString(),
          });
          emit.next(message?.value?.toString());
        },
      });

      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        consumer.disconnect();
      };
    });
  }),
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
