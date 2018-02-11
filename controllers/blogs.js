const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

const formatBlog = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    id: blog._id
  }
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs.map(formatBlog))
})
  
blogsRouter.post('/', async (request, response) => {
  try {
    const body = request.body
  
    if (body.title === undefined || body.url === undefined) {
      return response.status(400).json({ error: 'title missing' })
    }

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: (body.likes === undefined) ? 0 : body.likes
    })
  
    const savedBlog = await blog.save()
    response.json(formatBlog(savedBlog))
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
     const reqid = request.params.id

     const blog = await Blog.findByIdAndRemove({ _id: reqid })
     response.status(204).end()

  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  try {
     const reqid = request.params.id
     const blogToUpdate = request.body

     const updatedBlog = await Blog.findByIdAndUpdate({ _id: reqid }, blogToUpdate, {upsert:false, new: true})
     response.json(formatBlog(updatedBlog))

  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})


module.exports = blogsRouter