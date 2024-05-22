import { TOPIC_NAME } from "@/constants";
import { KafkaService, kafkaService } from "./kafka";
import { AccountCreationEvent } from "@/types";

export class PSPGatewayService {
  private kafkaService: KafkaService;

  constructor(kafkaService: KafkaService) {
    this.kafkaService = kafkaService;
  }

  public canUserCreateAccount(userId: string): boolean {
    return true;
  }

  // in case of dipocket, this would just call their API and if everything went successfully
  // we would create an event, which is then consumed by the subscription handler
  // ---
  // in case of galileo, we would call their API and if everything went successfully
  // a webhook would be called from their side, which would then create an event
  public async createAccount(userId: string, accountDetails: string) {
    /// ...
    if (!this.didEverythingGoWell()) {
      return await this.kafkaService.createEvent(
        TOPIC_NAME,
        AccountCreationEvent.FAILED
      );
    }

    await this.kafkaService.createEvent(
      TOPIC_NAME,
      AccountCreationEvent.SUCCESS
    );
  }

  private didEverythingGoWell() {
    return Math.random() < 0.5;
  }
}

export const pspGatewayService = new PSPGatewayService(kafkaService);
