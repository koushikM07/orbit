const express = require("express");

const db = require("../database/database");

const authMiddleware = require("../middleware/authMiddleware");

const {
    checkMessage
} = require("../utils/orbitGurdian");

const router = express.Router();


// =====================================================
// ALL CHAT ROUTES REQUIRE LOGIN
// =====================================================

router.use(authMiddleware);


// =====================================================
// FORMAT CHAT MESSAGE
// =====================================================

function formatMessage(item) {

    return {

        id:
            item.id,

        message:
            item.message,

        createdAt:
            item.created_at,

        user: {

            id:
                item.user_id,

            name:
                item.user_name,

            orbitId:
                item.orbit_id,

            avatarUrl:
                item.avatar_url

        }

    };

}


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

                users.orbit_id,

                users.avatar_url

            FROM messages

            LEFT JOIN users
                ON messages.user_id = users.id

            ORDER BY messages.created_at ASC

            LIMIT 100
        `).all();


        res.json({

            success: true,

            messages:
                messages.map(formatMessage)

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

        const result =
            db.prepare(`
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

                    users.orbit_id,

                    users.avatar_url

                FROM messages

                LEFT JOIN users
                    ON messages.user_id =
                       users.id

                WHERE messages.id = ?

            `).get(
                result.lastInsertRowid
            );


        const formattedMessage =
            formatMessage(
                createdMessage
            );


        // =================================================
        // REAL-TIME UPDATE
        // =================================================

        if (req.io) {

            req.io
                .to("orbit-chat")
                .emit(
                    "new-message",
                    formattedMessage
                );

        }


        // =================================================
        // RESPONSE
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


// =====================================================
// EDIT CHAT MESSAGE
// =====================================================

router.put("/:id", (req, res) => {

    const {
        id
    } = req.params;

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
        // FIND MESSAGE
        // =================================================

        const existingMessage =
            db.prepare(`
                SELECT
                    id,
                    user_id,
                    message
                FROM messages
                WHERE id = ?
            `).get(id);


        if (!existingMessage) {

            return res.status(404).json({

                success: false,

                message:
                    "Message not found."

            });

        }


        // =================================================
        // OWNERSHIP CHECK
        // =================================================

        if (
            existingMessage.user_id !==
            req.user.id
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You can only edit your own messages."

            });

        }


        // =================================================
        // UPDATE MESSAGE
        // =================================================

        db.prepare(`
            UPDATE messages
            SET message = ?
            WHERE id = ?
        `).run(

            message.trim(),

            id

        );


        // =================================================
        // GET UPDATED MESSAGE
        // =================================================

        const updatedMessage =
            db.prepare(`
                SELECT

                    messages.id,

                    messages.message,

                    messages.created_at,

                    users.id AS user_id,

                    users.name AS user_name,

                    users.orbit_id,

                    users.avatar_url

                FROM messages

                LEFT JOIN users
                    ON messages.user_id =
                       users.id

                WHERE messages.id = ?

            `).get(id);


        const formattedMessage =
            formatMessage(
                updatedMessage
            );


        // =================================================
        // REAL-TIME UPDATE
        // =================================================

        if (req.io) {

            req.io
                .to("orbit-chat")
                .emit(
                    "message-updated",
                    formattedMessage
                );

        }


        // =================================================
        // RESPONSE
        // =================================================

        res.json({

            success: true,

            message:
                formattedMessage

        });


    } catch (error) {

        console.error(
            "EDIT CHAT ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to edit message."

        });

    }

});


module.exports = router;