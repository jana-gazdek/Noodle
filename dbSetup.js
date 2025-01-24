const db = require('./database/database.js');

async function setupDB() {
  try {
    console.log("Running migrations...");
    await db.migrate.latest();
    
    console.log("Running seeds...");
    await db.seed.run();

    console.log("Database setup complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error setting up database:", err);
    process.exit(1);
  }
}

setupDB();
