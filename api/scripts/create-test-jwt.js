const jwt = require('jsonwebtoken');

const payload = {
  sub: process.env.USER_ID || '22222222-2222-2222-2222-222222222222',
  email: process.env.USER_EMAIL || 'passenger.test@unisabana.edu.co',
  roles: (process.env.USER_ROLES || 'passenger').split(',').map((role) => role.trim()).filter(Boolean),
};

const secret = process.env.JWT_SECRET || 'nexus-secret-key-change-in-production';
const expiresIn = process.env.JWT_EXPIRATION || '7d';

console.log(jwt.sign(payload, secret, { expiresIn }));
