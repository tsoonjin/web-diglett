'use strict'
const puppeteer = require('puppeteer')
const { Link, initDB, extractAllLinks, extractImageLinks, extractVideoLinks } = require('./utils')

module.exports = async (event, context) => {
  console.log("Request", JSON.stringify(event));
  const db = initDB()
  if (!db) {
    return context
      .headers(
        {
          'Content-type': 'application/json',
          "Access-Control-Allow-Origin": "*"
        }
      )
      .status(500)
      .succeed({ errorCode: 'INTERNAL_SERVER_ERROR', errorDetail: "Failed to connect to DB" })
  }
  let browser
  let page
  
  browser = await puppeteer.launch({
    args: [
      // Required for Docker version of Puppeteer
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--no-zygote',
      '--single-process',
      // This will write shared memory files into /tmp instead of /dev/shm,
      // because Docker’s default for /dev/shm is 64MB
      '--disable-dev-shm-usage'
    ]
  })

  const browserVersion = await browser.version()
  console.log(`Started ${browserVersion}`)
  page = await browser.newPage()
  let uri;
  if(event.body) {
    const parsedBody = typeof event.body === 'string' ? JSON.parse(event.body): event.body
    console.log("Parsed Body", parsedBody)
    uri = parsedBody.uri
  } else {
    return context
      .headers(
        {
          'Content-type': 'application/json',
          "Access-Control-Allow-Origin": "*"
        }
      )
      .status(401)
      .succeed({ errorCode: 'VALIDATION_ERROR', errorDetail: "Url not found" })
  }

  const response = await page.goto(uri)
  const [pageUrls, imageUrls, videoUrls] = await Promise.allSettled([extractAllLinks(page), extractImageLinks(page), extractVideoLinks(page)])
  console.log("OK","for",uri,response.ok())

  let title = await page.title()
  const result = {
    "title": title,
    'links': pageUrls.status === "fulfilled" ? pageUrls.value : [],
    'imageUrls': imageUrls.status === "fulfilled" ? imageUrls.value: [],
    'videoUrls': videoUrls.status === "fulfilled" ? videoUrls.value : []
  }
  console.log("Result", result)
  const imageLinks = result.imageUrls.map(url => ({
    url,
    type: 'image',
    parentUrl: uri
  }))
  await Link.insertMany(imageLinks);

  await browser.close()
  
  return context
    .headers(
      {
        'Content-type': 'application/json',
        "Access-Control-Allow-Origin": "*"
      }
    )
    .status(200)
    .succeed(result)
}
