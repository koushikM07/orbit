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
// ORBIT ID MIGRATION
// =====================================================

try {

    db.exec(`
        ALTER TABLE users
        ADD COLUMN orbit_id TEXT
    `);

    console.log("orbit_id column added.");

} catch (error) {

    if (
        !error.message.includes(
            "duplicate column name"
        )
    ) {

        console.error(
            "Orbit ID migration error:",
            error
        );

    }

}


// =====================================================
// AVATAR MIGRATION
// =====================================================

try {

    db.exec(`
        ALTER TABLE users
        ADD COLUMN avatar_url TEXT
    `);

    console.log("avatar_url column added.");

} catch (error) {

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


// =====================================================
// GENERATE ORBIT IDS FOR EXISTING USERS
// =====================================================

const usersWithoutOrbitId = db.prepare(`
    SELECT
        id,
        name
    FROM users
    WHERE orbit_id IS NULL
       OR orbit_id = ''
`).all();


const generateOrbitId = (name, id) => {

    let cleanName =
        name
            .replace(
                /[^a-zA-Z0-9]/g,
                ""
            )
            .toLowerCase();


    if (!cleanName) {

        cleanName = "orbit";

    }


    cleanName =
        cleanName.substring(
            0,
            10
        );


    return `${cleanName}M${String(id).padStart(2, "0")}`;

};


const updateOrbitId =
    db.prepare(`
        UPDATE users
        SET orbit_id = ?
        WHERE id = ?
    `);


for (
    const user
    of usersWithoutOrbitId
) {

    const orbitId =
        generateOrbitId(
            user.name,
            user.id
        );


    updateOrbitId.run(
        orbitId,
        user.id
    );


    console.log(
        `Generated Orbit ID: ${orbitId}`
    );

}


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
// CHAT MESSAGES
// =====================================================

db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
        REFERENCES users(id)
    )
`);

console.log("Messages table ready!");


// =====================================================
// NOTIFICATIONS
// =====================================================
//
// type examples:
//
// LIKE
// COMMENT
// REPLY
// CHAT_REQUEST
// CHAT_ACCEPTED
//
// user_id      = person receiving notification
// sender_id    = person who caused notification
// reference_id = related discussion/comment/request
//

db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER NOT NULL,

        sender_id INTEGER,

        type TEXT NOT NULL,

        reference_id INTEGER,

        message TEXT NOT NULL,

        is_read INTEGER NOT NULL DEFAULT 0,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
        REFERENCES users(id),

        FOREIGN KEY (sender_id)
        REFERENCES users(id)

    )
`);

console.log("Notifications table ready!");


// =====================================================
// STATUS
// =====================================================

console.log("Users table ready!");

console.log("Discussions table ready!");

console.log("Comments table ready!");

console.log("Orbit ID system ready!");

console.log("Notification system ready!");


// =====================================================
// EXPORT
// =====================================================

module.exports = db;