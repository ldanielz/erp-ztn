const request = require('supertest')
const { app } = require('../src/index')
const { expect } = require('chai')

describe('Auth validation', () => {
  it('register missing fields should return 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' })
    expect(res.status).to.equal(400)
    expect(res.body).to.have.property('message')
  })

  it('login missing fields should return 400', async () => {
    const res = await request(app).post('/api/auth/login').send({})
    expect(res.status).to.equal(400)
    expect(res.body).to.have.property('message')
  })

  it('register invalid email should return 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'Test', email: 'invalid-email', password: '123456' })
    expect(res.status).to.equal(400)
    expect(res.body).to.have.property('message')
  })
})
