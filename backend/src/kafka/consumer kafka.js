import { Kafka } from "kafkajs";
import logSchema from "../models/logSchema.js";
import logger from "../logger/log logger.js";

const kafka = new Kafka({
  clientId: "log-consumer",
  brokers: ["127.0.0.1:9092"],
});

const consumer = kafka.consumer({ groupId: "log-group" });

export default async function startConsumer() {

    // connnect comsumer
  await consumer.connect();
  logger.info("Kafka consumer connected");

  await consumer.subscribe({ topic: "logs", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const logData = JSON.parse(message.value.toString());
        const log = new logSchema(logData);
        await log.save();
      } catch (err) {
        logger.error("Failed to process Kafka log", err);
      }
    },
  });
}