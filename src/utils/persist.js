const fs   = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../../data/store.json');

function save(store) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('⚠️  persist.save failed:', e.message);
  }
}

function load(store) {
  if (!fs.existsSync(FILE)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    Object.assign(store, data);
    return true;
  } catch (e) {
    console.error('⚠️  persist.load failed — starting fresh:', e.message);
    return false;
  }
}

module.exports = { save, load };
