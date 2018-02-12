const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const User = require('../models/user')
const { formatUser, usersInDb } = require('./test_helper')

beforeAll(async () => {
    await User.remove({})
    const user = new User({ username: 'root', password: 'sekret', name: 'Mikko Mallikas', adult: 'true' })
    await user.save()
})

describe.only('when there is initially one user at db', () => {

  test('POST /api/users succeeds with a fresh username', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
      adult: 'true'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
    const usernames = usersAfterOperation.map(u=>u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('POST /api/users fails with proper statuscode and message if username already taken', async () => {
    const usersBeforeOperation = await usersInDb()
  
    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
      adult: 'false'
    }
  
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    expect(result.body).toEqual({ error: 'username must be unique'})
  
    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
  })

  test('POST /api/users fails with statuscode and message if password too short', async () => {
    const usersBeforeOperation = await usersInDb()
  
    const newUser = {
      username: 'test',
      name: 'Testi User',
      password: 'sa',
      adult: 'true'
    }
  
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    expect(result.body).toEqual({ error: 'password must be at least 3 characters long'})
  
    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
  })

  test('POST /api/users succeeds with an empty adult field', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'adultuser1',
      name: 'Anne Adult',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
    const useradult = usersAfterOperation.filter(function(u) {
        return u.username === 'adultuser1'
    })
    expect(useradult[0].username).toBe(newUser.username)
    expect(useradult[0].adult).toBe(true)

  })

  
})

afterAll( async () => {
    await server.close()
})

