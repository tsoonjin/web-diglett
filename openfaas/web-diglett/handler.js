'use strict'

module.exports = async (event, context) => {
  let nc;
  const { isAuthenticated } = require('./utils');
  const { connect, StringCodec } = require('nats')
  const sc = StringCodec();
  const natsUrl = process.env.NATS_URL || "localhost:4222"
  const { body } = event
  console.log("NATS URL", natsUrl);
  console.log("BODY", event.body, Object.values(event.body), Object.keys(event.body));
  nc = await connect({ servers: [process.env.NATS_URL] })

  const result = {
    'body': JSON.stringify(event.body),
    'content-type': event.headers["content-type"]
  }

  try {
    if (isAuthenticated(event)) {
      console.log("Authenticated");
      const res = await Promise.all(body.urls.map(url => nc.publish("targetUrls", sc.encode(url))))
      await nc.drain()
      console.log("Streamed", res)
      return context
        .headers(
          {
            'Content-type': 'application/json',
            "Access-Control-Allow-Origin": "*"
          }
        )
        .status(200)
        .succeed(result)
    } else {
      throw new Error("Forbidden");
      return context
        .status(403)
    }
  } catch (error) {
    console.error(error);
    return context
      .headers(
        {
          'Content-type': 'application/json',
          "Access-Control-Allow-Origin": "*"
        }
      )
      .status(500)
      .succeed({ body: JSON.stringify({ errorCode: "Internal Server Error", errorDetail: error }) })
  }
}
