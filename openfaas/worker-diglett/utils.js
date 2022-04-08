const mongoose = require('mongoose');
const { Schema, model } = require('mongoose');

const commonVideoSites = [
  'https://www.youtube.com/watch',
  'https://www.youtube.com/c',
  'https://www.youtube.com/channel',
  'https://ted.com',
]

const LinkSchema = new Schema({
  url: {
    type: String,
    required: true
  },
  parentUrl: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
}, { timestamps: true })

const Link = model("Link", LinkSchema);

const isVideoUrl = (url) => {
  // Identify by extensions
  const validExtension = /\.(m4a|webm|mov|3gp|flv|mkv|mp4)$/.test(url);
  // Identify by common video hosting 
  const matchCommonVideoSites = commonVideoSites.some((site) => url.includes(site))
  return validExtension || matchCommonVideoSites
}

const extractAllLinks = (page) => {
  return page.evaluate(() => {
    const urlArray = Array.from(document.links).map((link) => link.href);
    const uniqueUrlArray = [...new Set(urlArray)];
    return uniqueUrlArray;
  });
}

const extractImageLinks = (page) => {
  return page.evaluate(() => {
    const srcs = Array.from(
      document.querySelectorAll("img")
    ).map((image) => image.getAttribute("src"));
    return srcs;
  })
};

const extractVideoLinks = (page, links) => {
  const videoSources = page.evaluate(() => {
    const srcs = Array.from(
      document.querySelectorAll("video")
    ).map((video) => video.getAttribute("src"));
    return srcs;
  });
  return videoSources
}

const initDB = () => {
  const uri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_URI}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
  // const uri = `mongodb://127.0.0.1:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
  console.log('MONGO URI', uri)
  try {
    mongoose.connect(uri, {
      useNewUrlParser: true,
    });
    // mongoose.set("debug", true);
    const db = mongoose.connection;

    const handleOpen = () => console.log('🚀 Connected to MongoDB');
    const handleError = (error) =>
      console.log(`❌ Error on DB connection: ${error}`);

    db.once('open', handleOpen);
    db.on('error', handleError);
    return db
  } catch (error) {
    console.error("MONGODB_FAILED_TO_INITIALIZE", error)
    return false
  }
}

module.exports = {
  extractAllLinks,
  extractImageLinks,
  extractVideoLinks,
  initDB,
  Link,
  isVideoUrl
}
