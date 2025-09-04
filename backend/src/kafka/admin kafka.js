import { Kafka } from "kafkajs";
import logger from "../logger/log logger.js";

const kafka = new Kafka({
  clientId: "admin-service",
  brokers: ["127.0.0.1:9092"],
});

const admin = kafka.admin();

export default async function createTopics() {
  try {

    // admin connect
    await admin.connect();
    logger.info("Kafka admin connected");

    await admin.createTopics({
      topics: [
        {
          topic: "logs",
          numPartitions: 1,
          replicationFactor: 1,
           configEntries: [
            {
              name: "retention.ms", // 10 days
              value: String(10 * 24 * 60 * 60 * 1000),
            },
            {
              name: "cleanup.policy",
              value: "delete", // delete old messages
            },
          ],
        },
      ],
    });

    logger.info("Kafka topics ensured");
  } catch (err) {
    logger.error("Error ensuring Kafka topics", err);
  } finally {

    // admin disconnect
    await admin.disconnect();
    logger.info("Kafka admin disconnected");
  }
}