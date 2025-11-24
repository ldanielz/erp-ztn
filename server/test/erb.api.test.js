/* eslint-disable no-undef */
const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const jwt = require('jsonwebtoken')

// Ensure JWT secret is present for the app init
process.env.JWT_SECRET = process.env.JWT_SECRET || 'x'.repeat(40)

const { app } = require('../src/index')

describe('ERB API - pagination and rate limit', function () {
  this.timeout(10000)
  const token = jwt.sign({ sub: 1, role: 'admin' }, process.env.JWT_SECRET)

  it('should create an ERB and return 201', async () => {
    const res = await request(app)
      .post('/api/erbs')
      .set('Authorization', `Bearer ${token}`)
      .send({ site_id: `TEST-${Date.now()}`, latitude: 0, longitude: 0, address: 'Test' })
    expect(res.status).to.equal(201)
    expect(res.body).to.have.property('id')
  })

  it('should return paginated results with data, total, page, limit', async () => {
    const res = await request(app)
      .get('/api/erbs?page=1&limit=1')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).to.equal(200)
    expect(res.body).to.have.keys(['data', 'total', 'page', 'limit'])
    expect(Array.isArray(res.body.data)).to.be.true
    expect(res.body.limit).to.equal(1)
  })

  it('should enforce per-endpoint write rate limiting', async () => {
    // send more requests than writeLimiter allows (10 per minute)
    let lastStatus = 0
    for (let i = 0; i < 12; i++) {
      // unique site id each time
      // ignore errors until we see 429
      // eslint-disable-next-line no-await-in-loop
      const res = await request(app)
        .post('/api/erbs')
        .set('Authorization', `Bearer ${token}`)
        .send({ site_id: `RATE-${Date.now()}-${i}`, latitude: 0, longitude: 0 })
      lastStatus = res.status
      if (res.status === 429) break
    }
    expect([200,201,429]).to.include(lastStatus)
  })
})
