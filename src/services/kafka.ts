import { Consumer, Kafka, Producer } from "kafkajs";

export class KafkaService {
  kafka: Kafka;
  producer: Producer;
  consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: "my-app",
      brokers: ["kafka1:9092", "kafka2:9092"],
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: "test-group" });
  }

  public async createEvent(topic: string, message: string) {
    await this.producer.connect();

    await this.producer.send({
      topic,
      messages: [{ value: message }],
    });

    await this.producer.disconnect();
  }

  public getConsumer() {
    return this.consumer;

    // await this.consumer.connect();
    // await this.consumer.subscribe({ topic });
    // await this.consumer.run({
    //   eachMessage: async ({ topic, partition, message }) => {
    //     console.log({
    //       value: message?.value?.toString(),
    //     });
    //   },
    // });
  }
}

export const kafkaService = new KafkaService();
