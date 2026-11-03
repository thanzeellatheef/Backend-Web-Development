
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

async function login(email, password) {
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    email.trim().length === 0 ||
    email.length > 254 ||
    password.length === 0 ||
    password.length > 1024
  ) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await userRepository.findByEmail(normalizedEmail);

  // Use a generic failure for both unknown email and wrong password.
  if (!user) return null;

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

module.exports = { login };
