const publishedSecrets = new Set([
  'your_jwt_secret_key_change_in_production',
  'fastbuy_jwt_secret_key_2026_super_secure_auth',
  'fastbuy_fallback_secret_key_12345',
]);

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || publishedSecrets.has(secret)) {
    throw new Error('Set JWT_SECRET to a private random value of at least 32 characters.');
  }
  return secret;
};

module.exports = getJwtSecret;
