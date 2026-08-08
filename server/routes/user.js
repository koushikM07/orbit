const express = require("express");

const db = require("../database/database");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// ALL USER ROUTES REQUIRE LOGIN
// =====================================================

router.use(authMiddleware);


// =====================================================
// GET MY PROFILE
// =====================================================

router.get("/me", (req, res) => {

    try {

        const user = db.prepare(`
            SELECT
                id,
                name,
                email,
                role,
                avatar_url,
                created_at
            FROM users
            WHERE id = ?
        `).get(req.user.id);


        // -----------------------------------------------
        // USER NOT FOUND
        // -----------------------------------------------

        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });

        }


        // -----------------------------------------------
        // DISCUSSION COUNT
        // -----------------------------------------------

        const discussions = db.prepare(`
            SELECT COUNT(*) AS count
            FROM discussions
            WHERE user_id = ?
        `).get(req.user.id).count;


        // -----------------------------------------------
        // COMMENT COUNT
        // -----------------------------------------------

        const comments = db.prepare(`
            SELECT COUNT(*) AS count
            FROM comments
            WHERE user_id = ?
        `).get(req.user.id).count;


        // -----------------------------------------------
        // LIKES RECEIVED
        // -----------------------------------------------

        const likesReceived = db.prepare(`
            SELECT COALESCE(SUM(likes), 0) AS count
            FROM discussions
            WHERE user_id = ?
        `).get(req.user.id).count;


        // -----------------------------------------------
        // RESPONSE
        // -----------------------------------------------

        res.json({

            success: true,

            user: {

                id: user.id,

                name: user.name,

                email: user.email,

                role: user.role,

                avatarUrl:
                    user.avatar_url,

                createdAt:
                    user.created_at

            },

            stats: {

                discussions,

                comments,

                likesReceived

            }

        });


    } catch (error) {

        console.error(
            "GET PROFILE ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to load profile."

        });

    }

});


// =====================================================
// UPDATE MY PROFILE
// =====================================================

router.put("/me", (req, res) => {

    const {
        name,
        avatarUrl
    } = req.body;


    // =================================================
    // VALIDATE NAME
    // =================================================

    if (
        !name ||
        !name.trim()
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Name cannot be empty."

        });

    }


    // =================================================
    // VALIDATE NAME LENGTH
    // =================================================

    if (
        name.trim().length > 50
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Name cannot exceed 50 characters."

        });

    }


    // =================================================
    // VALIDATE AVATAR URL
    // =================================================

    let cleanAvatarUrl = null;


    if (
        avatarUrl &&
        avatarUrl.trim()
    ) {

        cleanAvatarUrl =
            avatarUrl.trim();


        // Only allow http/https URLs

        if (
            !cleanAvatarUrl.startsWith(
                "http://"
            ) &&
            !cleanAvatarUrl.startsWith(
                "https://"
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Avatar must be a valid image URL."

            });

        }

    }


    try {

        // =================================================
        // CHECK USER
        // =================================================

        const user = db.prepare(`
            SELECT id
            FROM users
            WHERE id = ?
        `).get(req.user.id);


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });

        }


        // =================================================
        // UPDATE
        // =================================================

        db.prepare(`
            UPDATE users

            SET
                name = ?,
                avatar_url = ?

            WHERE id = ?
        `).run(

            name.trim(),

            cleanAvatarUrl,

            req.user.id

        );


        // =================================================
        // GET UPDATED USER
        // =================================================

        const updatedUser =
            db.prepare(`
                SELECT
                    id,
                    name,
                    email,
                    role,
                    avatar_url,
                    created_at
                FROM users
                WHERE id = ?
            `).get(req.user.id);


        // =================================================
        // RESPONSE
        // =================================================

        res.json({

            success: true,

            message:
                "Profile updated successfully!",

            user: {

                id:
                    updatedUser.id,

                name:
                    updatedUser.name,

                email:
                    updatedUser.email,

                role:
                    updatedUser.role,

                avatarUrl:
                    updatedUser.avatar_url,

                createdAt:
                    updatedUser.created_at

            }

        });


    } catch (error) {

        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to update profile."

        });

    }

});


// =====================================================
// GET MY DISCUSSIONS
// =====================================================

router.get(
    "/me/discussions",
    (req, res) => {

        try {

            const discussions =
                db.prepare(`
                    SELECT
                        id,
                        type,
                        title,
                        description,
                        likes,
                        created_at

                    FROM discussions

                    WHERE user_id = ?

                    ORDER BY created_at DESC
                `).all(req.user.id);


            res.json({

                success: true,

                discussions

            });


        } catch (error) {

            console.error(
                "GET MY DISCUSSIONS ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load your discussions."

            });

        }

    }
);


module.exports = router;