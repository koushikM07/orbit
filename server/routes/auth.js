const express = require("express");
const db = require("../database/database");

const router = express.Router();


// ======================================================
// REGISTER
// ======================================================

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
            INSERT INTO users
            (name, email, password)
            VALUES (?, ?, ?)
        `);

        statement.run(
            name,
            email,
            password
        );

        console.log("User saved:", email);

        res.json({
            success: true,
            message: "User registered successfully!"
        });

    } catch (error) {

        console.error("REGISTER ERROR:", error);

        // Duplicate email
        if (
            error.code ===
            "SQLITE_CONSTRAINT_UNIQUE"
        ) {

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


// ======================================================
// LOGIN
// ======================================================

router.post("/login", (req, res) => {

    console.log("===== LOGIN API CALLED =====");

    const { email, password } = req.body;

    console.log("Email:", email);

    // Don't log passwords
    // console.log("Password:", password);

    // Basic validation
    if (!email || !password) {

        return res.status(400).json({
            success: false,
            message: "Please enter email and password."
        });

    }

    try {

        // Find user
        const user = db.prepare(`
            SELECT
                id,
                name,
                email,
                password,
                role
            FROM users
            WHERE email = ?
        `).get(email);


        // User doesn't exist
        if (!user) {

            console.log("USER NOT FOUND:", email);

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }


        // Check password
        if (user.password !== password) {

            console.log(
                "PASSWORD DOES NOT MATCH:",
                email
            );

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }


        // ==============================================
        // LOGIN SUCCESS
        // ==============================================

        console.log(
            "LOGIN SUCCESS:",
            user.email,
            "| ROLE:",
            user.role
        );


        // Never send password to frontend
        res.json({

            success: true,

            message: "Login successful!",

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Login failed."
        });

    }

});


module.exports = router;