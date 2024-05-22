import { TOPIC_NAME } from "@/constants";
import { Consumer, Kafka, Producer } from "kafkajs";

export class KafkaService {
  kafka: Kafka;
  producer: Producer;
  consumer: Consumer;

  // setup kafka, create topic if it doesn't exist
  constructor() {
    this.kafka = new Kafka({
      clientId: "my-app",
      brokers: ["localhost:9093"],
    });

    this.producer = this.kafka.producer({ allowAutoTopicCreation: true });
    this.consumer = this.kafka.consumer({ groupId: "test-group" });

    this.kafka
      .admin()
      .connect()
      .then(() =>
        this.kafka.admin().createTopics({
          topics: [{ topic: TOPIC_NAME }],
        })
      )
      .then((topicCreated) => {
        if (topicCreated) {
          console.log(TOPIC_NAME + " was created");
        }
      })
      .finally(() => {
        this.kafka.admin().disconnect();
      });
  }

  public async createEvent(topic: string, message: any) {
    await this.producer.connect();

    await this.producer.send({
      topic,
      messages: [{ value: message }],
    });

    await this.producer.disconnect();
  }
}

export const kafkaService = new KafkaService();
