const Database = require("better-sqlite3");

const db = new Database("orbit.db");

console.log("SQLite database connected!");


// =====================================================
// USERS
// =====================================================

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


// =====================================================
// DISCUSSIONS
// =====================================================

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


// =====================================================
// COMMENTS
// =====================================================

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


// =====================================================
// AVATAR MIGRATION
// =====================================================

// Add avatar_url to existing databases.
// If the column already exists, nothing happens.

try {

    db.exec(`
        ALTER TABLE users
        ADD COLUMN avatar_url TEXT
    `);

    console.log("avatar_url column added.");

} catch (error) {

    // SQLITE_ERROR means the column probably already exists.
    // We don't need to do anything in that case.

    if (
        !error.message.includes(
            "duplicate column name"
        )
    ) {
        console.error(
            "Avatar migration error:",
            error
        );
    }

}


console.log("Users table ready!");
console.log("Discussions table ready!");
console.log("Comments table ready!");

module.exports = db;