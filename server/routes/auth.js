const express = require("express");
const db = require("../database/database");

const router = express.Router();

router.post("/register", (req, res) => {

    console.log("===== REGISTER API CALLED =====");

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields."
        });
    }

    try {

        const statement = db.prepare(`
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `);

        statement.run(name, email, password);

        console.log("User saved:", email);

        res.json({
            success: true,
            message: "User registered successfully!"
        });const express = require("express");

const router = express.Router();

const db = require("../database/database");

// ===============================
// REGISTER
// ===============================

router.post("/register", (req, res) => {

    console.log("===== REGISTER API CALLED =====");

    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields."
        });
    }

    try {

        const statement = db.prepare(`
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `);

        statement.run(name, email, password);

        console.log("User saved:", email);

        res.json({
            success: true,
            message: "User registered successfully!"
        });

    } catch (error) {

        console.error(error);

        // Duplicate email
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });
        }

        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });
    }
});


// ===============================
// LOGIN
// ===============================

router.post("/login", (req, res) => {

    console.log("===== LOGIN API CALLED =====");

    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields."
        });
    }

    try {

        // Find user by email
        const statement = db.prepare(`
            SELECT * FROM users
            WHERE email = ?
        `);

        const user = statement.get(email);

        // User doesn't exist
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Check password
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        console.log("Login successful:", user.email);

        res.json({
            success: true,
            message: "Login successful!"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });
    }
});


module.exports = router;

    } catch (error) {

        console.error(error);

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });
        }

        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });
    }
});

router.post("/login", (req, res) => {

    console.log("===== LOGIN API CALLED =====");
    console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields."
        });
    }

    // Temporary V1 login
    if (email === "koushik@gmail.com" && password === "123456") {
        return res.json({
            success: true,
            message: "Login successful!"
        });
    }

    res.status(401).json({
        success: false,
        message: "Invalid email or password."
    });
});

module.exports = router;