const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./prisma/dev.db');

db.all('SELECT * FROM Question ORDER BY category, "order"', (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('---START_JSON---');
  console.log(JSON.stringify(rows));
  console.log('---END_JSON---');
  db.close();
});
