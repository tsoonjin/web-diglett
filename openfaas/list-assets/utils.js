const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { Schema, model } = require('mongoose');

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
})

LinkSchema.plugin(mongoosePaginate)
const Link = model("Link", LinkSchema);

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

/**
 * Map link for display
 * @param {object} link
 * @return {object} mappedItem
 */
const LinkDTO = (link) => {
  return {
    id: link._id,
    type: link.type,
    url: link.url,
    parentUrl: link.parentUrl,
    createdAt: link._id.getTimestamp().toISOString()
  }
}

module.exports = {
  initDB,
  Link,
  LinkDTO
}
