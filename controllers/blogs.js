const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs.map(Blog.format))
})

blogsRouter.post('/', async (request, response) => {
    try {
        const body = request.body
  
        if (!request.token) {
            return response.status(401).json({ error: 'token missing'})
        }

        const decodedToken = jwt.verify(request.token, process.env.SECRET)
    
        if (!decodedToken.id) {
            return response.status(401).json({ error: 'token invalid' })
        }

        if (body.title === undefined || body.url === undefined) {
            return response.status(400).json({ error: 'title missing' })
        }
         
        const user = await User.findById(decodedToken.id)

        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: (body.likes === undefined) ? 0 : body.likes,
            user: user._id
        })

        const savedBlog = await blog.save()
        
        if (Array.isArray(user.blogs)) {
            user.blogs.push(savedBlog._id)
        } else {
            var newUserBlogs = []
            newUserBlogs.push(user.blogs)            
            newUserBlogs.push(savedBlog._id)
            user.blogs = newUserBlogs          
        }

        await user.save()

        response.json(Blog.format(savedBlog))
    } catch (exception) {
        if (exception.name === 'JsonWebTokenError' ) {
            response.status(401).json({ error: exception.message })
        } else {
            console.log(exception)
            response.status(500).json({ error: 'something went wrong...' })
        }
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    try {
        if (!request.token) {
            return response.status(401).json({ error: 'token missing'})
        }

        const decodedToken = jwt.verify(request.token, process.env.SECRET)
    
        if (!decodedToken.id) {
            return response.status(401).json({ error: 'token invalid' })
        }

        const reqid = request.params.id

        const blogToDelete = await Blog.findById({ _id: reqid })
        const user = await User.findById(decodedToken.id)

        if (blogToDelete.user.toString().length() > 0 && blogToDelete.user.toString() !== user.id.toString()) {
            response.status(401).json({ error: 'Unauthorized' })
        }

        await Blog.findByIdAndRemove({ _id: reqid })
        response.status(204).end()

    } catch (exception) {
        if (exception.name === 'JsonWebTokenError' ) {
            response.status(401).json({ error: exception.message })
        } else {
            console.log(exception)
            response.status(500).json({ error: 'something went wrong...' })
        }    
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
