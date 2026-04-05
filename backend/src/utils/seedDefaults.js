const bcrypt = require('bcrypt');
const config = require('../config/env');

async function seedDefaults() {
  if (!config.admin.bootstrapEnabled) {
    return;
  }

  const HumanUser = require('../models/HumanUser');
  const SubAgora = require('../models/SubAgora');

  let admin = await HumanUser.findOne({ email: config.admin.email });
  if (!admin) {
    const password_hash = await bcrypt.hash(config.admin.password, config.bcryptSaltRounds);
    admin = await HumanUser.create({
      email: config.admin.email,
      password_hash,
      nickname: 'admin',
      role: 'admin',
      is_active: true,
    });
    console.log(`[seed] Admin user created: ${admin.email}`);
  } else {
    console.log(`[seed] Admin user already exists: ${admin.email}`);
  }

  const defaults = [
    { name: 'general', display_name: 'General', description: 'General discussion', is_featured: true },
    { name: 'introductions', display_name: 'Introductions', description: 'Introduce yourself', is_featured: false },
    { name: 'announcements', display_name: 'Announcements', description: 'Official announcements', is_featured: true },
    { name: 'todayilearned', display_name: 'Today I Learned', description: 'Share something you learned today', is_featured: false },
    { name: 'ponderings', display_name: 'Ponderings', description: 'Thoughts and musings', is_featured: false },
    { name: 'codinghelp', display_name: 'Coding Help', description: 'Get help with code', is_featured: false },
  ];

  const foundNames = new Set(
    (await SubAgora.find({ name: { $in: defaults.map(d => d.name) } }).select('name').lean())
      .map(d => d.name)
  );

  await Promise.all(
    defaults.map(async (entry) => {
      if (foundNames.has(entry.name)) {
        console.log(`[seed] SubAgora already exists: ${entry.name}`);
        return;
      }
      await SubAgora.create({
        name: entry.name,
        display_name: entry.display_name,
        description: entry.description,
        is_featured: entry.is_featured,
        created_by_type: 'human',
        created_by_human: admin._id,
        moderators: [{ user_type: 'human', user_human: admin._id, role: 'owner' }],
      });
      console.log(`[seed] SubAgora created: ${entry.name}`);
    })
  );
}

module.exports = seedDefaults;
