require('dotenv').config();

const { initializeDatabase, db } = require('./db');

initializeDatabase()
  .then(() => {
    console.log('Database seeded successfully.');
    db.close();
  })
  .catch((error) => {
    console.error('Database seed failed', error);
    db.close();
    process.exit(1);
  });
