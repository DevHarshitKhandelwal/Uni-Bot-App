import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-jwt-secret-with-enough-entropy';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = 'a-unique-test-password-12345';

const [{ adminLogin }, { requireAdmin }] = await Promise.all([
  import('../controllers/authController.js'),
  import('../middleware/authMiddleware.js'),
]);

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test('admin login issues an administrator token for configured credentials', async () => {
  const response = createResponse();
  await adminLogin({
    body: {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    },
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.data.user.role, 'admin');
  assert.equal(jwt.verify(response.body.data.token, process.env.JWT_SECRET).role, 'admin');
});

test('admin login rejects the requested weak default password', async () => {
  const response = createResponse();
  await adminLogin({ body: { username: 'admin', password: 'adminadmin' } }, response);

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.success, false);
});

test('admin access rejects non-admin roles', () => {
  const response = createResponse();
  let nextCalled = false;
  requireAdmin({ user: { role: 'student' } }, response, () => {
    nextCalled = true;
  });

  assert.equal(response.statusCode, 403);
  assert.equal(nextCalled, false);
});
