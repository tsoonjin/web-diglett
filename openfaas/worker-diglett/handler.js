'use strict'
const assert = require('assert')
const puppeteer = require('puppeteer')
const { extractAllLinks, extractImageLinks, extractVideoLinks } = require('./utils')

module.exports = async (event, context, ...args) => {
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
  if(event.body && event.body.uri) {
    uri = event.body.uri
  } else {
    return context
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

  await browser.close()
  
  return context
    .status(200)
    .succeed(result)
}
