
const express = require('express');
const sessionStore = require('../session/sessionStore');
const authService = require('../services/authService');
const requireSession = require('../middleware/requireSession');
const { cookieOptions } = require('../session/cookieConfig');

const router = express.Router();

const unauthorized = {
  error: {
    code: 'UNAUTHENTICATED',
    message: 'Invalid email or password',
  },
};

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    const user = await authService.login(email, password);

    if (!user) {
      return res.status(401).json(unauthorized);
    }

    const { sessionId } = sessionStore.create(
      user.id,
      cookieOptions.maxAge
    );

    res.cookie('sid', sessionId, cookieOptions);

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireSession, (req, res) => {
  return res.status(200).json({ user: req.user });
});

router.post('/logout', (req, res) => {
  try {
    const sessionId = req.signedCookies?.sid;

    if (typeof sessionId === 'string') {
      sessionStore.destroy(sessionId);
    }

    // Keep cookie attributes aligned with login.
    const { httpOnly, sameSite, secure, path, signed } = cookieOptions;

    res.clearCookie('sid', {
      httpOnly,
      sameSite,
      secure,
      path,
      signed,
    });

    return res.status(204).end();
  } catch {
    return res.status(204).end();
  }
});

module.exports = router;
