import AMQP from "amqplib"
import { Buffer } from "node/buffer.ts"

async function run() {
  const conn = await AMQP.connect("amqp://localhost")
  const queue = "queue"
  const exchangeType = "fanout"
  const exchangeName = "logs"

  // Sender
  const ch1 = await conn.createChannel()
  ch1.assertExchange(exchangeName, exchangeType)
  setInterval(() => {
    ch1.publish(exchangeName, "", Buffer.from(`Timestamp: ${Date.now()}`))
  }, 1_000)

  // Consumer
  const ch2 = await conn.createChannel()
  ch2.assertQueue(queue, {
    durable: false,
    exclusive: true,
    autoDelete: true
  })
  ch2.bindQueue(queue, exchangeName, "")
  ch2.consume(queue, msg => {
    console.log(msg?.content.toString())
  })
}

run()