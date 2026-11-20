const User = require('../models/User');
const { getAdminConfig } = require('./adminConfig');

const ensureAdmin = async () => {
  try {
    const { name, username, email, password } = getAdminConfig();

    if (!email || !password || password.length < 12) {
      console.warn('Admin access is locked until a valid administrator email and 12+ character password are configured.');
      return;
    }

    let admin = await User.findOne({ email });
    if (admin && admin.role !== 'admin') {
      throw new Error('ADMIN_EMAIL already belongs to a non-admin account; choose a dedicated administrator email.');
    }

    await User.updateMany(
      { role: 'admin', email: { $ne: email } },
      { $set: { role: 'user' } }
    );

    if (!admin) {
      admin = new User({
        name,
        username,
        email,
        password,
        role: 'admin',
      });
      await admin.save();
    } else {
      let changed = false;
      if (!(await admin.matchPassword(password))) {
        admin.password = password;
        changed = true;
      }
      if (admin.username !== username) {
        admin.username = username;
        changed = true;
      }
      if (admin.name !== name) {
        admin.name = name;
        changed = true;
      }
      if (changed) await admin.save();
    }
    console.log('Configured administrator account is ready.');
  } catch (error) {
    console.error('Admin provisioning failed. Check administrator configuration and database availability.');
  }
};

module.exports = ensureAdmin;
