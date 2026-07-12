import request from 'supertest';
import app from '../server.js';
import sequelize from '../config/db.js';

describe('AssetFlow MVC Server Endpoint Tests', () => {
  // Gracefully close database connection pool after all tests
  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /ping', () => {
    it('should return 200 OK and online status parameters', async () => {
      const res = await request(app).get('/ping');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toEqual('online');
    });
  });

  describe('POST /api/auth/register validation', () => {
    it('should return 400 Bad Request if email parameter is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Clark Kent',
          password: 'password'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 Bad Request if password length is under 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Clark Kent',
          email: 'clark.k@assetflow.com',
          password: '123'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login validation', () => {
    it('should fail with 400 if credentials are empty', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});
      expect(res.statusCode).toEqual(400);
    });
  });
});
