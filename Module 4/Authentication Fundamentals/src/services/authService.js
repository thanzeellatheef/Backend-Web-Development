
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const SALT_ROUNDS = Number(process.env.BCRYPT_COST) || 12;

function makeError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function register(name, email, password) {
  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(password)
  ) {
    throw makeError(400, 'INVALID_INPUT', 'Invalid input');
  }

  const normalizedEmail = normalizeEmail(email);

  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    throw makeError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await userRepository.createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    return safeUser(user);
  } catch (error) {
    // Handle a duplicate email created by a concurrent request.
    if (error.code === 'P2002') {
      throw makeError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists');
    }

    throw error;
  }
}

async function login(email, password) {
  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    throw makeError(400, 'INVALID_INPUT', 'Invalid input');
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    throw makeError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password'
    );
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw makeError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password'
    );
  }

  return safeUser(user);
}

module.exports = {
  register,
  login,
};
