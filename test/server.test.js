const test = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../server');

const request = require('supertest');

test('GET / returns the landing page HTML', async () => {
  const response = await request(app).get('/');
  assert.equal(response.status, 200);
  assert.match(response.text, /Quick-Dukaan/i);
});

test('GET /health returns ok', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok' });
});
