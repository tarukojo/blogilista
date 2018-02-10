const mongoose = require('mongoose')

require('dotenv').config()

let url = ""

if ( process.env.NODE_ENV !== 'production' ) {
  url = process.env.MONGODB_URI
} else {
  url = process.env.MONGODB_URIPROD
}


mongoose.connect(url)
mongoose.Promise = global.Promise

const Blog = mongoose.model('Blog', {
    title: String,
    author: String,
    url: String,
    likes: Number
  })
  
module.exports = Blog