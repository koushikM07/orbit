const db = require("./database/database");

const adminName = "Orbit Admin";
const adminEmail = "admin@orbit.com";
const adminPassword = "admin123";

try {
    // Check if admin already exists
    const existingAdmin = db.prepare(`
        SELECT id, email, role
        FROM users
        WHERE email = ?
    `).get(adminEmail);

    if (existingAdmin) {

        console.log("Admin already exists!");

        // Make sure this account is actually ADMIN
        db.prepare(`
            UPDATE users
            SET role = 'ADMIN'
            WHERE email = ?
        `).run(adminEmail);

        console.log("Admin role verified.");

    } else {

        db.prepare(`
            INSERT INTO users
            (name, email, password, role)
            VALUES (?, ?, ?, 'ADMIN')
        `).run(
            adminName,
            adminEmail,
            adminPassword
        );

        console.log("================================");
        console.log("ADMIN CREATED SUCCESSFULLY");
        console.log("================================");
        console.log("Name:", adminName);
        console.log("Email:", adminEmail);
        console.log("Password:", adminPassword);
        console.log("Role: ADMIN");
        console.log("================================");
    }

} catch (error) {

    console.error(
        "Failed to create admin:",
        error
    );

} finally {

    db.close();

}