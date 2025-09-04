import Transport from "winston-transport";
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "logger-service",
  brokers: ["127.0.0.1:9092"], // replace with your Kafka brokers
});

const producer = kafka.producer();

await producer.connect();

export default class KafkaProducer extends Transport {
  constructor(opts) {
    super(opts);
    this.topic = opts.topic || "logs";
  }

  async log(info, callback) {
    setImmediate(() => this.emit("logged", info));

    await producer.send({
      topic: this.topic,
      messages: [{ value: JSON.stringify(info) }],
    });

    callback();
  }
}