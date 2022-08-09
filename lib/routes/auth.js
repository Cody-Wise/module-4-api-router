const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const { sign } = require('../utils/jwtToken.js');
const User = require('../models/User');
const HttpError = require('../utils/httpError.js');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;
const isSecure = process.env.SECURE_COOKIES === 'true';
const COOKIE_NAME = process.env.COOKIE_NAME;
const cookieOptions = {
  httpOnly: true,
  secure: isSecure,
  sameSite: isSecure ? 'none' : 'strict',
  maxAge: ONE_DAY_IN_MS,
};

module.exports = Router()
  .get('/verify', authenticate, (req, res) => {
    res.json(req.user);
  })

  .post('/signup', async ({ body }, res, next) => {
    try {
      const user = await User.insert(body);

      const token = sign({ ...user });

      res.cookie(COOKIE_NAME, token, cookieOptions).json(user);
    } catch (error) {
      next(error);
    }
  })

  .post('/signin', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.getByEmail(email);

      if (!user || !user.isValidPassword(password)) {
        throw new HttpError('Invalid credentials', 400);
      }

      const token = sign({ ...user });

      res.cookie(COOKIE_NAME, token, cookieOptions).json(user);
    } catch (error) {
      next(error);
    }
  })

  .delete('/signout', (req, res) => {
    res.clearCookie(COOKIE_NAME, cookieOptions).json({ success: true });
  });
