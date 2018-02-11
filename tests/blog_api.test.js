const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { format, initialBlogs, blogsInDb } = require('./test_helper')

beforeAll(async () => {
    await Blog.remove({})
  
    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

describe('blogs are returned ok', () => {

    test('blogs are returned as json', async () => {
        await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('there are six blogs', async () => {
        const response = await api
        .get('/api/blogs')
    
        expect(response.body.length).toBe(6)
    })
    
    test('the first blog is about React patterns', async () => {
        const response = await api
        .get('/api/blogs')
    
        expect(response.body[0].title).toBe('React patterns')
    })

    test('all blogs are returned', async () => {
        const response = await api
        .get('/api/blogs')
    
        expect(response.body.length).toBe(initialBlogs.length)
    })
    
    test('a specific blog is within the returned blogs', async () => {
        const response = await api
        .get('/api/blogs')
    
        const titles = response.body.map(r => r.title)
    
        expect(titles).toContain('TDD harms architecture')
    })
})
describe('blogs are added ok', () => {

    test('a valid blog can be added ', async () => {
        const newBlog = {
            title: "Testblog title here",
            author: "Martin Tester",
            url: "http://blogspot.fi/testblog",
            likes: 1
        }
        const blogsBefore = await blogsInDb()
        
        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
        const blogsAfter = await blogsInDb()
    
        const titles = blogsAfter.map(r => r.title)
    
        expect(blogsAfter.length).toBe(blogsBefore.length + 1)
        expect(titles).toContain('Testblog title here')
    })

    test('blog without title is not added ', async () => {
        const newBlog = {
            author: "Testi Bloggaaja",
            url: "http://www.test.fi",
            likes: 1
        }
    
        const blogsBefore = await blogsInDb()
    
        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    
        const blogsAfter = await blogsInDb()
    
        const titles = blogsAfter.map(r => r.title)
    
        expect(blogsAfter.length).toBe(blogsBefore.length)
    })

    test('blog without url is not added ', async () => {
        const newBlog = {
            title: "New Blog title",
            author: "Testi Bloggaaja",
            likes: 10
        }
    
        const blogsBefore = await blogsInDb()
    
        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    
        const blogsAfter = await blogsInDb()
    
        const titles = blogsAfter.map(r => r.title)
    
        expect(blogsAfter.length).toBe(blogsBefore.length)
    })

    test('blog without likes is added with zero likes ', async () => {
        const newBlog = {
            title: "Zero likes blog",
            author: "Testi Bloggaaja",
            url: "http://www.bloggers.com/bloglikes"
        }
    
        const blogsBefore = await blogsInDb()
    
        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
        const blogsAfter = await blogsInDb()
    
        const likes = blogsAfter.map(r => r.likes)
    
        expect(blogsAfter.length).toBe(blogsBefore.length + 1)
        expect(likes).toContain(0)
    })
})

describe('blogs are deleted ok', () => {
    test('first blog is deleted ok', async () => {

        const blogsBefore = await blogsInDb()

        const blogToDelete = blogsBefore[0]
        
        await api
        .delete('/api/blogs/'+ blogToDelete.id)
        .expect(204)
    
        const blogsAfter = await blogsInDb()
    
        const titles = blogsAfter.map(r => r.titles)
    
        expect(blogsAfter.length).toBe(blogsBefore.length - 1)
        expect(titles).not.toContain(blogToDelete.title)
    })
})

describe('blogs are updated ok', () => {
    test('one blog is updated ok', async () => {

        const blogsBefore = await blogsInDb()

        const blogToUpdate = blogsBefore[0]
        blogToUpdate.title = "!!! Uusi !!!"
        blogToUpdate.likes = 21
        const idOfBlog = blogToUpdate.id

        await api
        .put('/api/blogs/'+ blogToUpdate.id)
        .send(blogToUpdate)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
        const blogsAfter = await blogsInDb()
    
        const blogAfterUpdate = blogsAfter.map(r => {
            if (r.title === blogToUpdate.title) {
                return r
            }
        })

        expect(blogsAfter.length).toBe(blogsBefore.length)
        expect(blogAfterUpdate[0].title).toBe("!!! Uusi !!!")
        expect(blogAfterUpdate[0].likes).toBe(21)
    })
})


afterAll(() => {
  server.close()
})