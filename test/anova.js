const request = require('supertest');
const config = require('../config');
const https = require('https');
const { doesNotMatch } = require('assert');

const agent = new https.Agent({
  rejectUnauthorized: false
});

describe('ApiLayer test', function() {
  this.timeout(10000);
  it('should respond with 200', async function() {
    const { expect } = await import('chai'); 
    const response = await request(config.baseUrl)
      .get('/fixer/latest')
      .set(config.headers)
      .expect(200);
    expect(response.body).to.have.property('success', true);
    expect(response.body).to.have.property('timestamp');
    expect(response.body).to.have.property('base', 'EUR');
    expect(response.body).to.have.property('date');
    expect(response.body).to.have.property('rates');
  });

    it('should respond with 401', async function() {
      const { expect } = await import('chai');
  
      const response = await request(config.baseUrl)
        .get('/fixer/latest')
        .expect(401);
  
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.equal('No API key found in request');
  });

    it('should respond with 404', async function() {
      const { expect } = await import('chai');
  
      const response = await request(config.baseUrl)
        .get('/latest')
        .expect(404);
  
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.equal('no Route matched with those values');
    });
  
  
  it('should respond with 429 Too Many Requests when exceeding rate limit', async function() {
    const { expect } = await import('chai');

    const requests = [];
    const maxRequests = 10;

    for (let i = 0; i < maxRequests; i++) {
      requests.push(request(config.baseUrl)
        .get('/fixer/latest')
        .set(config.headers)
      )
    }
    try {
      await Promise.all(requests);
    } catch (error) {
      const response = error.response;
      expect(response).to.have.property('status', 429);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.equal('Too Many Requests');
    }
  });

  it('should respond with 403 Forbidden', async function() {
    const { expect } = await import('chai');

    const response = await request(config.baseUrl)
      .post('/fixer/latest')
      .set(config.headers)
      .expect(403);

    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('You cannot consume this service');
  });
});