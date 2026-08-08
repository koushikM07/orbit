require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/database");

const router = express.Router();


// ======================================================
// JWT SECRET
// ======================================================

const JWT_SECRET = process.env.JWT_SECRET;


// ======================================================
// REGISTER
// ======================================================

router.post("/register", async (req, res) => {

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

        // ==========================================
        // CHECK EXISTING USER
        // ==========================================

        const existingUser = db.prepare(`
            SELECT id
            FROM users
            WHERE email = ?
        `).get(email);

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });

        }


        // ==========================================
        // HASH PASSWORD
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // ==========================================
        // SAVE USER
        // ==========================================

        const statement = db.prepare(`
            INSERT INTO users
            (name, email, password)
            VALUES (?, ?, ?)
        `);

        const result = statement.run(
            name,
            email,
            hashedPassword
        );


        console.log(
            "User saved:",
            email
        );


        res.json({

            success: true,

            message:
                "User registered successfully!",

            userId: result.lastInsertRowid

        });


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Something went wrong."

        });

    }

});


// ======================================================
// LOGIN
// ======================================================

router.post("/login", async (req, res) => {

    console.log("===== LOGIN API CALLED =====");

    const { email, password } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!email || !password) {

        return res.status(400).json({

            success: false,

            message:
                "Please enter email and password."

        });

    }


    try {

        // ==========================================
        // FIND USER
        // ==========================================

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


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // ==========================================
        // COMPARE PASSWORD
        // ==========================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            console.log(
                "PASSWORD DOES NOT MATCH:",
                email
            );

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // ==========================================
        // CREATE JWT
        // ==========================================

        const token = jwt.sign(

            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },

            JWT_SECRET,

            {
                expiresIn: "2h"
            }

        );


        console.log(
            "LOGIN SUCCESS:",
            user.email,
            "| ROLE:",
            user.role
        );


        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({

            success: true,

            message:
                "Login successful!",

            token,

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

            message:
                "Login failed."

        });

    }

});


module.exports = router;