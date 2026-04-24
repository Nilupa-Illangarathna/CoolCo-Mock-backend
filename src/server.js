require('dotenv').config();
const http    = require('http');
const app     = require('./app');
const store   = require('./config/store');
const { seed }   = require('./utils/seeder');
const { load }   = require('./utils/persist');
const { port }   = require('./config/app.config');

(async () => {
  const restored = load(store);
  if (restored) {
    console.log(`✅  Store restored from disk — users: ${store.users.length}`);
  } else {
    await seed();
    console.log('📦  No saved data found — seeded fresh defaults.');
  }

  http.createServer(app).listen(port, () => {
    console.log(`\n🌬️   CoolCo backend running on http://localhost:${port}`);
    console.log(`📱   Android emulator → http://10.0.2.2:${port}/api\n`);
    console.log('   Seeded accounts (password / default PIN):');
    console.log('   superadmin / Super@1234 / PIN: 1234  (super_admin)');
    console.log('   admin      / Admin@1234 / PIN: 1234  (manager)');
    console.log('   kamal      / Ware@1234  / PIN: 1234  (warehouse)');
    console.log('   nimal      / Sales@1234 / PIN: 1234  (sales)');
    console.log('   sunil      / Cash@1234  / PIN: 1234  (cashier)\n');
  });
})();
