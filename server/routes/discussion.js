const express = require("express");

const router = express.Router();

const db = require("../database/database");

const authMiddleware = require("../middleware/authMiddleware");


// =====================================================
// ALL DISCUSSION ROUTES REQUIRE LOGIN
// =====================================================

router.use(authMiddleware);


// =====================================================
// GET ALL DISCUSSIONS
// =====================================================

router.get("/", (req, res) => {

    try {

        const discussions = db.prepare(`
            SELECT
                discussions.id,
                discussions.type,
                discussions.title,
                discussions.description,
                discussions.likes,
                discussions.created_at,
                discussions.user_id,
                users.name AS user
            FROM discussions
            LEFT JOIN users
                ON discussions.user_id = users.id
            ORDER BY discussions.created_at DESC
        `).all();


        // ==========================================
        // COMMENTS
        // ==========================================

        const commentStatement = db.prepare(`
            SELECT
                comments.id,
                comments.comment AS text,
                comments.user_id,
                users.name AS user,
                comments.created_at
            FROM comments
            LEFT JOIN users
                ON comments.user_id = users.id
            WHERE comments.discussion_id = ?
            ORDER BY comments.created_at ASC
        `);


        // ==========================================
        // CHECK WHETHER CURRENT USER LIKED
        // ==========================================

        const likeStatement = db.prepare(`
            SELECT id
            FROM discussion_likes
            WHERE discussion_id = ?
            AND user_id = ?
        `);


        const result = discussions.map((discussion) => {

            const comments =
                commentStatement.all(
                    discussion.id
                );


            const liked =
                !!likeStatement.get(
                    discussion.id,
                    req.user.id
                );


            return {
                ...discussion,
                liked,
                comments
            };

        });


        res.json({
            success: true,
            discussions: result
        });


    } catch (error) {

        console.error(
            "GET DISCUSSIONS ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch discussions."
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


    if (!title || !description) {

        return res.status(400).json({
            success: false,
            message: "Title and description are required."
        });

    }


    try {

        const statement = db.prepare(`
            INSERT INTO discussions
            (
                user_id,
                type,
                title,
                description
            )
            VALUES (?, ?, ?, ?)
        `);


        const result = statement.run(
            req.user.id,
            type || "DISCUSSION",
            title.trim(),
            description.trim()
        );


        res.json({
            success: true,
            message: "Discussion created successfully!",
            discussionId: result.lastInsertRowid
        });


    } catch (error) {

        console.error(
            "CREATE DISCUSSION ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to create discussion."
        });

    }

});


// =====================================================
// UPDATE DISCUSSION
// =====================================================

router.put("/:id", (req, res) => {

    const { id } = req.params;

    const {
        title,
        description
    } = req.body;


    if (!title || !description) {

        return res.status(400).json({
            success: false,
            message: "Title and description are required."
        });

    }


    try {

        // ==========================================
        // FIND DISCUSSION
        // ==========================================

        const discussion = db.prepare(`
            SELECT
                id,
                user_id
            FROM discussions
            WHERE id = ?
        `).get(id);


        if (!discussion) {

            return res.status(404).json({
                success: false,
                message: "Discussion not found."
            });

        }


        // ==========================================
        // ONLY OWNER OR ADMIN CAN EDIT
        // ==========================================

        const isOwner =
            discussion.user_id === req.user.id;

        const isAdmin =
            req.user.role === "ADMIN";


        if (!isOwner && !isAdmin) {

            return res.status(403).json({
                success: false,
                message: "You cannot edit this discussion."
            });

        }


        // ==========================================
        // UPDATE
        // ==========================================

        db.prepare(`
            UPDATE discussions
            SET
                title = ?,
                description = ?
            WHERE id = ?
        `).run(
            title.trim(),
            description.trim(),
            id
        );


        res.json({
            success: true,
            message: "Discussion updated successfully!"
        });


    } catch (error) {

        console.error(
            "UPDATE DISCUSSION ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update discussion."
        });

    }

});


// =====================================================
// DELETE DISCUSSION
// =====================================================

router.delete("/:id", (req, res) => {

    const { id } = req.params;


    try {

        // ==========================================
        // FIND DISCUSSION
        // ==========================================

        const discussion = db.prepare(`
            SELECT
                id,
                user_id
            FROM discussions
            WHERE id = ?
        `).get(id);


        if (!discussion) {

            return res.status(404).json({
                success: false,
                message: "Discussion not found."
            });

        }


        // ==========================================
        // ONLY OWNER OR ADMIN CAN DELETE
        // ==========================================

        const isOwner =
            discussion.user_id === req.user.id;

        const isAdmin =
            req.user.role === "ADMIN";


        if (!isOwner && !isAdmin) {

            return res.status(403).json({
                success: false,
                message: "You cannot delete this discussion."
            });

        }


        // ==========================================
        // DELETE COMMENTS
        // ==========================================

        db.prepare(`
            DELETE FROM comments
            WHERE discussion_id = ?
        `).run(id);


        // ==========================================
        // DELETE LIKES
        // ==========================================

        db.prepare(`
            DELETE FROM discussion_likes
            WHERE discussion_id = ?
        `).run(id);


        // ==========================================
        // DELETE DISCUSSION
        // ==========================================

        db.prepare(`
            DELETE FROM discussions
            WHERE id = ?
        `).run(id);


        res.json({
            success: true,
            message: "Discussion deleted successfully!"
        });


    } catch (error) {

        console.error(
            "DELETE DISCUSSION ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete discussion."
        });

    }

});


// =====================================================
// LIKE / UNLIKE DISCUSSION
// =====================================================

router.post("/:id/like", (req, res) => {

    const { id } = req.params;

    const userId = req.user.id;


    try {

        // ==========================================
        // CHECK DISCUSSION
        // ==========================================

        const discussion = db.prepare(`
            SELECT id
            FROM discussions
            WHERE id = ?
        `).get(id);


        if (!discussion) {

            return res.status(404).json({
                success: false,
                message: "Discussion not found."
            });

        }


        // ==========================================
        // CHECK EXISTING LIKE
        // ==========================================

        const existingLike = db.prepare(`
            SELECT id
            FROM discussion_likes
            WHERE discussion_id = ?
            AND user_id = ?
        `).get(id, userId);


        // ==========================================
        // UNLIKE
        // ==========================================

        if (existingLike) {

            db.prepare(`
                DELETE FROM discussion_likes
                WHERE discussion_id = ?
                AND user_id = ?
            `).run(id, userId);

        }

        // ==========================================
        // LIKE
        // ==========================================

        else {

            db.prepare(`
                INSERT INTO discussion_likes
                (
                    discussion_id,
                    user_id
                )
                VALUES (?, ?)
            `).run(
                id,
                userId
            );

        }


        // ==========================================
        // RECALCULATE LIKE COUNT
        // ==========================================

        const likeCount = db.prepare(`
            SELECT COUNT(*) AS count
            FROM discussion_likes
            WHERE discussion_id = ?
        `).get(id).count;


        // Keep discussions.likes synchronized
        db.prepare(`
            UPDATE discussions
            SET likes = ?
            WHERE id = ?
        `).run(
            likeCount,
            id
        );


        res.json({
            success: true,
            liked: !existingLike,
            likes: likeCount
        });


    } catch (error) {

        console.error(
            "LIKE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update like."
        });

    }

});


// =====================================================
// ADD COMMENT
// =====================================================

router.post("/:id/comments", (req, res) => {

    const { id } = req.params;

    const {
        comment
    } = req.body;


    if (!comment || !comment.trim()) {

        return res.status(400).json({
            success: false,
            message: "Comment cannot be empty."
        });

    }


    try {

        // ==========================================
        // CHECK DISCUSSION
        // ==========================================

        const discussion = db.prepare(`
            SELECT id
            FROM discussions
            WHERE id = ?
        `).get(id);


        if (!discussion) {

            return res.status(404).json({
                success: false,
                message: "Discussion not found."
            });

        }


        // ==========================================
        // CREATE COMMENT
        // ==========================================

        const statement = db.prepare(`
            INSERT INTO comments
            (
                discussion_id,
                user_id,
                comment
            )
            VALUES (?, ?, ?)
        `);


        const result = statement.run(
            id,
            req.user.id,
            comment.trim()
        );


        // ==========================================
        // GET CREATED COMMENT
        // ==========================================

        const newComment = db.prepare(`
            SELECT
                comments.id,
                comments.comment AS text,
                comments.user_id,
                users.name AS user,
                comments.created_at
            FROM comments
            LEFT JOIN users
                ON comments.user_id = users.id
            WHERE comments.id = ?
        `).get(result.lastInsertRowid);


        res.json({
            success: true,
            message: "Comment added successfully!",
            comment: newComment
        });


    } catch (error) {

        console.error(
            "ADD COMMENT ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to add comment."
        });

    }

});


// =====================================================
// DELETE COMMENT
// =====================================================

router.delete("/comments/:commentId", (req, res) => {

    const { commentId } = req.params;


    try {

        const comment = db.prepare(`
            SELECT
                id,
                user_id
            FROM comments
            WHERE id = ?
        `).get(commentId);


        if (!comment) {

            return res.status(404).json({
                success: false,
                message: "Comment not found."
            });

        }


        // ==========================================
        // OWNER OR ADMIN
        // ==========================================

        const isOwner =
            comment.user_id === req.user.id;

        const isAdmin =
            req.user.role === "ADMIN";


        if (!isOwner && !isAdmin) {

            return res.status(403).json({
                success: false,
                message: "You cannot delete this comment."
            });

        }


        db.prepare(`
            DELETE FROM comments
            WHERE id = ?
        `).run(commentId);


        res.json({
            success: true,
            message: "Comment deleted successfully!"
        });


    } catch (error) {

        console.error(
            "DELETE COMMENT ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete comment."
        });

    }

});


module.exports = router;