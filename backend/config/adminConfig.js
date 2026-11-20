const DEFAULT_ADMIN = Object.freeze({
  name: 'Store Administrator',
  username: 'admin',
  email: 'admin@fastbuy.com',
  password: 'FastbuyAdmin123!',
});

const getAdminConfig = () => ({
  name: process.env.ADMIN_NAME?.trim() || DEFAULT_ADMIN.name,
  username: process.env.ADMIN_USERNAME?.trim().toLowerCase() || DEFAULT_ADMIN.username,
  email: process.env.ADMIN_EMAIL?.trim().toLowerCase() || DEFAULT_ADMIN.email,
  password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN.password,
});

module.exports = {
  DEFAULT_ADMIN,
  getAdminConfig,
};
