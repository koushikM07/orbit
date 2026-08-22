const express = require("express");

const db = require("../database/database");

const authMiddleware =
    require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// ALL DISCUSSION ROUTES REQUIRE LOGIN
// =====================================================

router.use(authMiddleware);


// =====================================================
// HELPER — CREATE NOTIFICATION
// =====================================================

const createNotification = ({
    userId,
    senderId,
    type,
    referenceId,
    message,
    io
}) => {

    // -------------------------------------------------
    // Don't notify yourself
    // -------------------------------------------------

    if (
        !userId ||
        userId === senderId
    ) {

        return;

    }


    // -------------------------------------------------
    // SAVE NOTIFICATION
    // -------------------------------------------------

    const result = db.prepare(`
        INSERT INTO notifications
        (
            user_id,
            sender_id,
            type,
            reference_id,
            message
        )

        VALUES (?, ?, ?, ?, ?)
    `).run(

        userId,
        senderId,
        type,
        referenceId,
        message

    );


    // -------------------------------------------------
    // GET CREATED NOTIFICATION
    // -------------------------------------------------

    const notification =
        db.prepare(`
            SELECT

                notifications.id,

                notifications.type,

                notifications.reference_id,

                notifications.message,

                notifications.is_read,

                notifications.created_at,

                users.id AS sender_id,

                users.name AS sender_name,

                users.avatar_url AS sender_avatar_url,

                users.orbit_id AS sender_orbit_id

            FROM notifications

            LEFT JOIN users

                ON notifications.sender_id =
                   users.id

            WHERE notifications.id = ?

        `).get(
            result.lastInsertRowid
        );


    // -------------------------------------------------
    // SEND REAL-TIME NOTIFICATION
    // -------------------------------------------------

    if (io) {

        io
            .to(`user-${userId}`)
            .emit(
                "notification-created",
                {

                    id:
                        notification.id,

                    type:
                        notification.type,

                    referenceId:
                        notification.reference_id,

                    message:
                        notification.message,

                    isRead:
                        Boolean(
                            notification.is_read
                        ),

                    createdAt:
                        notification.created_at,

                    sender: {

                        id:
                            notification.sender_id,

                        name:
                            notification.sender_name,

                        avatarUrl:
                            notification.sender_avatar_url,

                        orbitId:
                            notification.sender_orbit_id

                    }

                }
            );

    }

};


// =====================================================
// GET ALL DISCUSSIONS
// =====================================================

router.get("/", (req, res) => {

    try {

        const discussions =
            db.prepare(`

                SELECT

                    discussions.id,

                    discussions.type,

                    discussions.title,

                    discussions.description,

                    discussions.likes,

                    discussions.created_at,

                    users.id AS user_id,

                    users.name AS user_name,

                    users.avatar_url,

                    users.orbit_id

                FROM discussions

                LEFT JOIN users

                    ON discussions.user_id =
                       users.id

                ORDER BY
                    discussions.created_at DESC

            `).all();


        res.json({

            success: true,

            discussions:
                discussions.map(
                    (item) => ({

                        id:
                            item.id,

                        type:
                            item.type,

                        title:
                            item.title,

                        description:
                            item.description,

                        likes:
                            item.likes,

                        createdAt:
                            item.created_at,

                        user: {

                            id:
                                item.user_id,

                            name:
                                item.user_name,

                            avatarUrl:
                                item.avatar_url,

                            orbitId:
                                item.orbit_id

                        }

                    })
                )

        });


    } catch (error) {

        console.error(
            "GET DISCUSSIONS ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to load discussions."

        });

    }

});


// =====================================================
// CREATE DISCUSSION
// =====================================================

router.post("/", (req, res) => {

    const {
        type,
        title,
        description
    } = req.body;


    // =================================================
    // VALIDATION
    // =================================================

    if (
        !title ||
        !title.trim()
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Discussion title cannot be empty."

        });

    }


    if (
        !description ||
        !description.trim()
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Discussion description cannot be empty."

        });

    }


    try {

        const result =
            db.prepare(`

                INSERT INTO discussions
                (
                    user_id,
                    type,
                    title,
                    description
                )

                VALUES (?, ?, ?, ?)

            `).run(

                req.user.id,

                type ||
                    "DISCUSSION",

                title.trim(),

                description.trim()

            );


        const discussion =
            db.prepare(`

                SELECT

                    discussions.id,

                    discussions.type,

                    discussions.title,

                    discussions.description,

                    discussions.likes,

                    discussions.created_at,

                    users.id AS user_id,

                    users.name AS user_name,

                    users.avatar_url,

                    users.orbit_id

                FROM discussions

                LEFT JOIN users

                    ON discussions.user_id =
                       users.id

                WHERE discussions.id = ?

            `).get(
                result.lastInsertRowid
            );


        res.status(201).json({

            success: true,

            discussion: {

                id:
                    discussion.id,

                type:
                    discussion.type,

                title:
                    discussion.title,

                description:
                    discussion.description,

                likes:
                    discussion.likes,

                createdAt:
                    discussion.created_at,

                user: {

                    id:
                        discussion.user_id,

                    name:
                        discussion.user_name,

                    avatarUrl:
                        discussion.avatar_url,

                    orbitId:
                        discussion.orbit_id

                }

            }

        });


    } catch (error) {

        console.error(
            "CREATE DISCUSSION ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to create discussion."

        });

    }

});


// =====================================================
// LIKE DISCUSSION
// =====================================================

router.post(
    "/:id/like",
    (req, res) => {

        const {
            id
        } = req.params;


        try {

            // =========================================
            // FIND DISCUSSION
            // =========================================

            const discussion =
                db.prepare(`

                    SELECT

                        id,
                        user_id,
                        title,
                        likes

                    FROM discussions

                    WHERE id = ?

                `).get(id);


            if (!discussion) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Discussion not found."

                });

            }


            // =========================================
            // INCREMENT LIKE
            // =========================================

            db.prepare(`

                UPDATE discussions

                SET likes = likes + 1

                WHERE id = ?

            `).run(id);


            // =========================================
            // CREATE NOTIFICATION
            // =========================================

            createNotification({

                userId:
                    discussion.user_id,

                senderId:
                    req.user.id,

                type:
                    "LIKE",

                referenceId:
                    discussion.id,

                message:
                    `${req.user.name} liked your discussion.`,

                io:
                    req.io

            });


            // =========================================
            // GET UPDATED COUNT
            // =========================================

            const updatedDiscussion =
                db.prepare(`

                    SELECT likes

                    FROM discussions

                    WHERE id = ?

                `).get(id);


            res.json({

                success: true,

                likes:
                    updatedDiscussion.likes

            });


        } catch (error) {

            console.error(
                "LIKE DISCUSSION ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to like discussion."

            });

        }

    }
);


// =====================================================
// GET COMMENTS
// =====================================================

router.get(
    "/:id/comments",
    (req, res) => {

        const {
            id
        } = req.params;


        try {

            const comments =
                db.prepare(`

                    SELECT

                        comments.id,

                        comments.discussion_id,

                        comments.comment,

                        comments.created_at,

                        users.id AS user_id,

                        users.name AS user_name,

                        users.avatar_url,

                        users.orbit_id

                    FROM comments

                    LEFT JOIN users

                        ON comments.user_id =
                           users.id

                    WHERE comments.discussion_id = ?

                    ORDER BY
                        comments.created_at ASC

                `).all(id);


            res.json({

                success: true,

                comments:
                    comments.map(
                        (item) => ({

                            id:
                                item.id,

                            discussionId:
                                item.discussion_id,

                            comment:
                                item.comment,

                            createdAt:
                                item.created_at,

                            user: {

                                id:
                                    item.user_id,

                                name:
                                    item.user_name,

                                avatarUrl:
                                    item.avatar_url,

                                orbitId:
                                    item.orbit_id

                            }

                        })
                    )

            });


        } catch (error) {

            console.error(
                "GET COMMENTS ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load comments."

            });

        }

    }
);


// =====================================================
// ADD COMMENT
// =====================================================

router.post(
    "/:id/comments",
    (req, res) => {

        const {
            id
        } = req.params;

        const {
            comment
        } = req.body;


        // =============================================
        // VALIDATION
        // =============================================

        if (
            !comment ||
            !comment.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Comment cannot be empty."

            });

        }


        try {

            // =========================================
            // FIND DISCUSSION
            // =========================================

            const discussion =
                db.prepare(`

                    SELECT

                        id,
                        user_id,
                        title

                    FROM discussions

                    WHERE id = ?

                `).get(id);


            if (!discussion) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Discussion not found."

                });

            }


            // =========================================
            // INSERT COMMENT
            // =========================================

            const result =
                db.prepare(`

                    INSERT INTO comments
                    (
                        discussion_id,
                        user_id,
                        comment
                    )

                    VALUES (?, ?, ?)

                `).run(

                    discussion.id,

                    req.user.id,

                    comment.trim()

                );


            // =========================================
            // GET CREATED COMMENT
            // =========================================

            const createdComment =
                db.prepare(`

                    SELECT

                        comments.id,

                        comments.discussion_id,

                        comments.comment,

                        comments.created_at,

                        users.id AS user_id,

                        users.name AS user_name,

                        users.avatar_url,

                        users.orbit_id

                    FROM comments

                    LEFT JOIN users

                        ON comments.user_id =
                           users.id

                    WHERE comments.id = ?

                `).get(
                    result.lastInsertRowid
                );


            // =========================================
            // CREATE NOTIFICATION
            // =========================================

            createNotification({

                userId:
                    discussion.user_id,

                senderId:
                    req.user.id,

                type:
                    "COMMENT",

                referenceId:
                    discussion.id,

                message:
                    `${req.user.name} commented on your discussion.`,

                io:
                    req.io

            });


            // =========================================
            // RESPONSE
            // =========================================

            res.status(201).json({

                success: true,

                comment: {

                    id:
                        createdComment.id,

                    discussionId:
                        createdComment.discussion_id,

                    comment:
                        createdComment.comment,

                    createdAt:
                        createdComment.created_at,

                    user: {

                        id:
                            createdComment.user_id,

                        name:
                            createdComment.user_name,

                        avatarUrl:
                            createdComment.avatar_url,

                        orbitId:
                            createdComment.orbit_id

                    }

                }

            });


        } catch (error) {

            console.error(
                "ADD COMMENT ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to add comment."

            });

        }

    }
);


module.exports = router;