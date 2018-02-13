const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs.map(Blog.format))
})

blogsRouter.post('/', async (request, response) => {
    try {
        const body = request.body
  
        if (body.title === undefined || body.url === undefined) {
            return response.status(400).json({ error: 'title missing' })
        }
        // to be added later from token
        //const user = await User.findById(body.userId)
        const users = await User.find({})
          
        if (users.length === 0) {
            return response.status(400).json({ error: 'cannot add blog without user'})
        } 

        const user = users.pop()

        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: (body.likes === undefined) ? 0 : body.likes,
            user: user._id
        })

        const savedBlog = await blog.save()

        if (user.blogs === undefined || user.blogs.length === 0) {
            user.blogs = new Array(savedBlog._id) 
        } else {
            user.blogs = user.blogs.concat(savedBlog._id)
        }

        await user.save()

        response.json(Blog.format(savedBlog))
    } catch (exception) {
        console.log(exception)
        response.status(500).json({ error: 'something went wrong...' })
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    try {
        const reqid = request.params.id

        await Blog.findByIdAndRemove({ _id: reqid })
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

        const updatedBlog = await Blog.findByIdAndUpdate({ _id: reqid }, blogToUpdate, { upsert:false, new: true })
        response.json(Blog.format(updatedBlog))

    } catch (exception) {
        console.log(exception)
        response.status(500).json({ error: 'something went wrong...' })
    }
})


module.exports = blogsRouter
