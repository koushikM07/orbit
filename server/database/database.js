const Database = require("better-sqlite3");

const db = new Database("orbit.db");

console.log("SQLite database connected!");


// ==========================================
// USERS TABLE
// ==========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);


// ==========================================
// ADD ROLE TO EXISTING USERS
// ==========================================

try {

    db.exec(`
        ALTER TABLE users
        ADD COLUMN role TEXT NOT NULL DEFAULT 'USER'
    `);

    console.log("Role column added to users!");

} catch (error) {

    // This happens if the column already exists.
    if (!error.message.includes("duplicate column name")) {

        console.error(
            "Error adding role column:",
            error
        );

    }

}


// ==========================================
// DISCUSSIONS TABLE
// ==========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS discussions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT NOT NULL DEFAULT 'DISCUSSION',
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
        REFERENCES users(id)
    )
`);


// ==========================================
// COMMENTS TABLE
// ==========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        discussion_id INTEGER NOT NULL,
        user_id INTEGER,
        comment TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (discussion_id)
        REFERENCES discussions(id),

        FOREIGN KEY (user_id)
        REFERENCES users(id)
    )
`);


console.log("Users table ready!");
console.log("Discussions table ready!");
console.log("Comments table ready!");


module.exports = db;