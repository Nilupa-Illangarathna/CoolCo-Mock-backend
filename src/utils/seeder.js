const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const store  = require('../config/store');
const { bcrypt: cfg } = require('../config/app.config');
const { save }        = require('./persist');

const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');
const hash = (v) => bcrypt.hashSync(sha256(v), cfg.rounds);
const hashPin = (v) => bcrypt.hashSync(v, cfg.rounds); // PIN stored directly (short, already numeric)

async function seed() {
  // Seeded users — email is the login identifier, all pre-verified (is_active: true)
  store.users = [
    { user_id: 1, email: 'superadmin@coolco.lk', name: 'Super Admin',    phone: '', password: hash('Super@1234'), role: 'super_admin',  is_active: true, created_at: new Date().toISOString() },
    { user_id: 2, email: 'admin@coolco.lk',       name: 'Admin User',     phone: '', password: hash('Admin@1234'), role: 'manager',      is_active: true, created_at: new Date().toISOString() },
    { user_id: 3, email: 'kamal@coolco.lk',       name: 'Kamal Perera',   phone: '', password: hash('Ware@1234'), role: 'warehouse',    is_active: true, created_at: new Date().toISOString() },
    { user_id: 4, email: 'nimal@coolco.lk',       name: 'Nimal Silva',    phone: '', password: hash('Sales@1234'),role: 'sales',        is_active: true, created_at: new Date().toISOString() },
    { user_id: 5, email: 'sunil@coolco.lk',       name: 'Sunil Fernando', phone: '', password: hash('Cash@1234'), role: 'cashier',      is_active: true, created_at: new Date().toISOString() },
    { user_id: 6, email: 'roshan@coolco.lk',      name: 'Roshan Bandara', phone: '', password: hash('Tech@1234'), role: 'technician',   is_active: true, created_at: new Date().toISOString() },
    { user_id: 7, email: 'saman@dealer.lk',       name: 'Saman Dealers',  phone: '', password: hash('Deal@1234'), role: 'dealer',       is_active: true, created_at: new Date().toISOString() },
    { user_id: 8, email: 'shop@coolco.lk',        name: 'Colombo AC Shop',phone: '', password: hash('Shop@1234'), role: 'shop',         is_active: true, created_at: new Date().toISOString() },
    { user_id: 9, email: 'amal@gmail.com',         name: 'Amal Perera',    phone: '', password: hash('Cust@1234'), role: 'customer',     is_active: true, created_at: new Date().toISOString() },
  ];

  // Seed PINs for all users (default: 1234)
  store.pins = store.users.map((u) => ({
    user_id: u.user_id,
    pin_hash: hashPin('1234'),
    created_at: new Date().toISOString(),
  }));

  save(store);
  console.log(`✅  CoolCo store seeded — users: ${store.users.length}`);
}

module.exports = { seed };
