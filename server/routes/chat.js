const express = require("express");

const db = require("../database/database");

const authMiddleware = require("../middleware/authMiddleware");

const {
    checkMessage
} = require("../utils/orbitGurdian");


// =====================================================
// CHAT ROUTES
// =====================================================

const router = express.Router();


// =====================================================
// ALL CHAT ROUTES REQUIRE LOGIN
// =====================================================

router.use(authMiddleware);


// =====================================================
// GET ALL CHAT MESSAGES
// =====================================================

router.get("/", (req, res) => {

    try {

        const messages = db.prepare(`
            SELECT
                messages.id,
                messages.message,
                messages.created_at,

                users.id AS user_id,
                users.name AS user_name,
                users.avatar_url

            FROM messages

            LEFT JOIN users
                ON messages.user_id = users.id

            ORDER BY messages.created_at ASC

            LIMIT 100
        `).all();


        res.json({

            success: true,

            messages: messages.map((item) => ({

                id: item.id,

                message: item.message,

                createdAt:
                    item.created_at,

                user: {

                    id:
                        item.user_id,

                    name:
                        item.user_name,

                    avatarUrl:
                        item.avatar_url

                }

            }))

        });


    } catch (error) {

        console.error(
            "GET CHAT ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to load chat messages."

        });

    }

});


// =====================================================
// SEND CHAT MESSAGE
// =====================================================

router.post("/", (req, res) => {

    const {
        message
    } = req.body;


    // =================================================
    // VALIDATION
    // =================================================

    if (
        !message ||
        !message.trim()
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Message cannot be empty."

        });

    }


    // =================================================
    // MESSAGE LENGTH
    // =================================================

    if (
        message.trim().length > 500
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Message cannot exceed 500 characters."

        });

    }


    // =================================================
    // ORBIT GUARDIAN
    // =================================================

    const moderation =
        checkMessage(message);


    if (!moderation.allowed) {

        return res.status(400).json({

            success: false,

            message:
                "Your message was blocked by Orbit Guardian.",

            reason:
                moderation.reason

        });

    }


    try {

        // =================================================
        // INSERT MESSAGE
        // =================================================

        const result = db.prepare(`
            INSERT INTO messages
            (
                user_id,
                message
            )

            VALUES (?, ?)
        `).run(

            req.user.id,

            message.trim()

        );


        // =================================================
        // GET CREATED MESSAGE
        // =================================================

        const createdMessage =
            db.prepare(`
                SELECT

                    messages.id,

                    messages.message,

                    messages.created_at,

                    users.id AS user_id,

                    users.name AS user_name,

                    users.avatar_url

                FROM messages

                LEFT JOIN users

                    ON messages.user_id =
                       users.id

                WHERE messages.id = ?

            `).get(
                result.lastInsertRowid
            );


        // =================================================
        // FORMAT MESSAGE
        // =================================================

        const formattedMessage = {

            id:
                createdMessage.id,

            message:
                createdMessage.message,

            createdAt:
                createdMessage.created_at,

            user: {

                id:
                    createdMessage.user_id,

                name:
                    createdMessage.user_name,

                avatarUrl:
                    createdMessage.avatar_url

            }

        };


        // =================================================
        // SEND REAL-TIME MESSAGE
        // =================================================
        //
        // io is attached to req by server.js
        //
        // Everyone inside "orbit-chat" receives it.
        //

        if (req.io) {

            req.io
                .to("orbit-chat")
                .emit(
                    "new-message",
                    formattedMessage
                );

        }


        // =================================================
        // RESPONSE TO SENDER
        // =================================================

        res.status(201).json({

            success: true,

            message:
                formattedMessage

        });


    } catch (error) {

        console.error(
            "SEND CHAT ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to send message."

        });

    }

});


module.exports = router;