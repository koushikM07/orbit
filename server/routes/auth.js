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
// GENERATE ORBIT ID
// ======================================================

function generateOrbitId(name) {

    let cleanName =
        name
            .replace(/[^a-zA-Z0-9]/g, "")
            .toLowerCase()
            .substring(0, 10);


    if (!cleanName) {

        cleanName = "orbit";

    }


    let orbitId;


    do {

        const randomNumber =
            Math.floor(
                1000 + Math.random() * 9000
            );


        orbitId =
            `${cleanName}M${randomNumber}`;


        const existing =
            db.prepare(`
                SELECT id
                FROM users
                WHERE orbit_id = ?
            `).get(orbitId);


        if (!existing) {

            return orbitId;

        }

    } while (true);

}


// ======================================================
// REGISTER
// ======================================================

router.post("/register", async (req, res) => {

    console.log(
        "===== REGISTER API CALLED ====="
    );


    const {
        name,
        email,
        password
    } = req.body;


    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (
        !name ||
        !email ||
        !password
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Please fill all the fields."

        });

    }


    try {

        // ==============================================
        // CHECK EXISTING EMAIL
        // ==============================================

        const existingUser =
            db.prepare(`
                SELECT
                    id
                FROM users
                WHERE email = ?
            `).get(email);


        if (existingUser) {

            return res.status(409).json({

                success: false,

                message:
                    "Email already registered."

            });

        }


        // ==============================================
        // GENERATE ORBIT ID
        // ==============================================

        const orbitId =
            generateOrbitId(name);


        console.log(
            "Generated Orbit ID:",
            orbitId
        );


        // ==============================================
        // HASH PASSWORD
        // ==============================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ==============================================
        // SAVE USER
        // ==============================================

        const statement =
            db.prepare(`
                INSERT INTO users
                (
                    name,
                    email,
                    password,
                    orbit_id
                )

                VALUES (?, ?, ?, ?)
            `);


        const result =
            statement.run(

                name.trim(),

                email.trim(),

                hashedPassword,

                orbitId

            );


        console.log(
            "User saved:",
            email
        );


        // ==============================================
        // RESPONSE
        // ==============================================

        res.json({

            success: true,

            message:
                "User registered successfully!",

            userId:
                result.lastInsertRowid,

            orbitId

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

    console.log(
        "===== LOGIN API CALLED ====="
    );


    const {
        email,
        password
    } = req.body;


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
        !email ||
        !password
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Please enter email and password."

        });

    }


    try {

        // ==============================================
        // FIND USER
        // ==============================================

        const user =
            db.prepare(`
                SELECT
                    id,
                    name,
                    email,
                    password,
                    role,
                    orbit_id
                FROM users
                WHERE email = ?
            `).get(email.trim());


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // ==============================================
        // COMPARE PASSWORD
        // ==============================================

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


        // ==============================================
        // CREATE JWT
        // ==============================================

        const token =
            jwt.sign(

                {
                    id:
                        user.id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role,

                    orbitId:
                        user.orbit_id
                },

                JWT_SECRET,

                {
                    expiresIn:
                        "2h"
                }

            );


        console.log(
            "LOGIN SUCCESS:",
            user.email,
            "| ROLE:",
            user.role,
            "| ORBIT ID:",
            user.orbit_id
        );


        // ==============================================
        // RESPONSE
        // ==============================================

        res.json({

            success: true,

            message:
                "Login successful!",

            token,

            user: {

                id:
                    user.id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role,

                orbitId:
                    user.orbit_id

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