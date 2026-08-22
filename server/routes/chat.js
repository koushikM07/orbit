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
// HELPER — FORMAT MESSAGE
// =====================================================

function formatMessage(item) {

    return {

        id: item.id,

        message: item.message,

        createdAt: item.created_at,

        user: {

            id: item.user_id,

            name: item.user_name,

            avatarUrl: item.avatar_url

        },

        replyTo: item.reply_to_id
            ? {
                id: item.reply_to_id,
                message: item.reply_message,
                user: {
                    id: item.reply_user_id,
                    name: item.reply_user_name,
                    avatarUrl: item.reply_avatar_url
                }
            }
            : null

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
                messages.reply_to_id,

                users.id AS user_id,
                users.name AS user_name,
                users.avatar_url,

                reply.message AS reply_message,
                reply_user.id AS reply_user_id,
                reply_user.name AS reply_user_name,
                reply_user.avatar_url AS reply_avatar_url

            FROM messages

            LEFT JOIN users
                ON messages.user_id = users.id

            LEFT JOIN messages AS reply
                ON messages.reply_to_id = reply.id

            LEFT JOIN users AS reply_user
                ON reply.user_id = reply_user.id

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
        message,
        replyToId
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
        // CHECK REPLY MESSAGE
        // =================================================

        if (replyToId) {

            const replyMessage =
                db.prepare(`
                    SELECT id
                    FROM messages
                    WHERE id = ?
                `).get(replyToId);


            if (!replyMessage) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Message you are replying to was not found."

                });

            }

        }


        // =================================================
        // INSERT
        // =================================================

        const result = db.prepare(`
            INSERT INTO messages
            (
                user_id,
                message,
                reply_to_id
            )

            VALUES (?, ?, ?)
        `).run(

            req.user.id,

            message.trim(),

            replyToId || null

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
                    messages.reply_to_id,

                    users.id AS user_id,
                    users.name AS user_name,
                    users.avatar_url,

                    reply.message AS reply_message,
                    reply_user.id AS reply_user_id,
                    reply_user.name AS reply_user_name,
                    reply_user.avatar_url AS reply_avatar_url

                FROM messages

                LEFT JOIN users
                    ON messages.user_id = users.id

                LEFT JOIN messages AS reply
                    ON messages.reply_to_id = reply.id

                LEFT JOIN users AS reply_user
                    ON reply.user_id = reply_user.id

                WHERE messages.id = ?

            `).get(
                result.lastInsertRowid
            );


        const formattedMessage =
            formatMessage(createdMessage);


        // =================================================
        // REAL-TIME BROADCAST
        // =================================================

        if (req.io) {

            req.io
                .to("orbit-chat")
                .emit(
                    "new-message",
                    formattedMessage
                );

        }


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

        const existingMessage =
            db.prepare(`
                SELECT
                    id,
                    user_id
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
        // OWNERSHIP
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
        // UPDATE
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
                    messages.reply_to_id,

                    users.id AS user_id,
                    users.name AS user_name,
                    users.avatar_url,

                    reply.message AS reply_message,
                    reply_user.id AS reply_user_id,
                    reply_user.name AS reply_user_name,
                    reply_user.avatar_url AS reply_avatar_url

                FROM messages

                LEFT JOIN users
                    ON messages.user_id = users.id

                LEFT JOIN messages AS reply
                    ON messages.reply_to_id = reply.id

                LEFT JOIN users AS reply_user
                    ON reply.user_id = reply_user.id

                WHERE messages.id = ?

            `).get(id);


        const formattedMessage =
            formatMessage(updatedMessage);


        // =================================================
        // REAL-TIME
        // =================================================

        if (req.io) {

            req.io
                .to("orbit-chat")
                .emit(
                    "message-updated",
                    formattedMessage
                );

        }


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


// =====================================================
// DELETE CHAT MESSAGE
// =====================================================

router.delete("/:id", (req, res) => {

    const {
        id
    } = req.params;


    try {

        const existingMessage =
            db.prepare(`
                SELECT
                    id,
                    user_id
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
        // OWNERSHIP
        // =================================================

        if (
            existingMessage.user_id !==
            req.user.id
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You can only delete your own messages."

            });

        }


        // =================================================
        // DELETE
        // =================================================

        db.prepare(`
            DELETE FROM messages
            WHERE id = ?
        `).run(id);


        // =================================================
        // REAL-TIME DELETE
        // =================================================

        if (req.io) {

            req.io
                .to("orbit-chat")
                .emit(
                    "message-deleted",
                    {
                        id: Number(id)
                    }
                );

        }


        res.json({

            success: true,

            message:
                "Message deleted successfully.",

            messageId:
                Number(id)

        });

    } catch (error) {

        console.error(
            "DELETE CHAT ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to delete message."

        });

    }

});


module.exports = router;