import AMQP from "amqplib"
import { Buffer } from "node/buffer.ts"

const sleep = (ms: number) => new Promise(_ => setTimeout(_, ms))

async function workerTask(worker: string, ch: AMQP.Channel, msg: AMQP.ConsumeMessage | null) {
  if (!msg) return

  const content = msg.content.toString()
  const count = content.split(".").length - 1
  await sleep(count * 1_000)
  console.log(`${worker} completed a task with content: ${content}`)
  ch.ack(msg)
}

async function run() {
  const conn = await AMQP.connect("amqp://localhost")
  const queue = "hello"

  // Sender
  const ch1 = await conn.createChannel()
  setInterval(() => {
    // Message contains between 1-4 dots
    const msg = ".".repeat(Math.floor(1 + Math.random() * 4))
    ch1.sendToQueue(queue, Buffer.from(msg))
  }, 5_000)

  // Workers
  const ch2 = await conn.createChannel()
  const ch3 = await conn.createChannel()
  ch2.assertQueue(queue)
  ch3.assertQueue(queue)

  ch2.consume(queue, msg => workerTask("Worker 1", ch2, msg))
  ch3.consume(queue, msg => workerTask("Worker 2", ch3, msg))
}

run()