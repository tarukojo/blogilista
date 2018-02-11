const mongoose = require('mongoose')

const Blog = mongoose.model('Blog', {
    title: String,
    author: String,
    url: String,
    likes: Number,
    id: Number
  })
  
module.exports = Blog
