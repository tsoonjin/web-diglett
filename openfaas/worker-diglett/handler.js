'use strict'
const puppeteer = require('puppeteer')
const { isVideoUrl, Link, initDB, extractAllLinks, extractImageLinks, extractVideoLinks } = require('./utils')

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
  let uri;
  let browser
  let page

  try {
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
    const pageUrls = await extractAllLinks(page)
    const [imageUrls, videoUrls] = await Promise.allSettled([extractImageLinks(page), extractVideoLinks(page, pageUrls)])
    // Extract video links from all links
    const videoFromLink = pageUrls.filter(url => isVideoUrl(url))
    const vidLinks =  videoUrls.status === "fulfilled" ? [...videoUrls.value, ...videoFromLink] : videoFromLink

    const result = {
      'imageUrls': imageUrls.status === "fulfilled" ? imageUrls.value: [],
      'videoUrls': vidLinks
    }
    const imageLinks = result.imageUrls.map(url => ({
      url,
      type: 'image',
      parentUrl: uri
    }))

    const videoLinks = result.videoUrls.map(url => ({
      url,
      type: 'video',
      parentUrl: uri
    }))

    const scrapedLinks = [...imageLinks, ...videoLinks]
    if (scrapedLinks.length > 0) {
      await Link.insertMany(scrapedLinks);
    }

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
  } catch (error) {
    console.error(error)
    return context
      .headers(
        {
          'Content-type': 'application/json',
          "Access-Control-Allow-Origin": "*"
        }
      )
      .status(500)
      .succeed({ errorCode: 'INTERNAL_SERVER_ERROR', errorDetail: `Failed to retrieve/process site: ${uri}` })
  }
}
