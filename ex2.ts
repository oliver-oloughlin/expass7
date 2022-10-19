import AMQP from "amqplib"
import { Buffer } from "node/buffer.ts"

async function run() {
  const conn = await AMQP.connect("amqp://localhost")
  const queue = "hello"

  // Consumer
  const ch1 = await conn.createChannel()
  await ch1.assertQueue(queue)
  ch1.consume(queue, msg => {
    if (msg) {
      console.log(`RECEIVED:  ${msg.content.toString()}`)
      ch1.ack(msg)
    }
  })

  // Sender
  const ch2 = await conn.createChannel()
  setInterval(() => {
    ch2.sendToQueue(queue, Buffer.from("Hello World"))
  }, 1_000)
}

run()