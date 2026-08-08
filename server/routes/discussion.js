const express = require("express");

const router = express.Router();

const db = require("../database/database");


// ==========================================
// GET ALL DISCUSSIONS
// ==========================================

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
                users.name AS user
            FROM discussions
            LEFT JOIN users
                ON discussions.user_id = users.id
            ORDER BY discussions.created_at DESC
        `).all();

        // Add comments to every discussion
        const commentStatement = db.prepare(`
            SELECT
                comments.id,
                comments.comment AS text,
                users.name AS user
            FROM comments
            LEFT JOIN users
                ON comments.user_id = users.id
            WHERE comments.discussion_id = ?
            ORDER BY comments.created_at ASC
        `);

        const result = discussions.map((discussion) => {

            const comments = commentStatement.all(
                discussion.id
            );

            return {
                ...discussion,
                comments: comments
            };

        });

        res.json({
            success: true,
            discussions: result
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch discussions."
        });
    }
});


// ==========================================
// CREATE DISCUSSION
// ==========================================

router.post("/", (req, res) => {

    const {
        user_id,
        type,
        title,
        description
    } = req.body;

    if (!user_id || !title || !description) {

        return res.status(400).json({
            success: false,
            message: "Please provide all required fields."
        });

    }

    try {

        const statement = db.prepare(`
            INSERT INTO discussions
            (user_id, type, title, description)
            VALUES (?, ?, ?, ?)
        `);

        const result = statement.run(
            user_id,
            type || "DISCUSSION",
            title,
            description
        );

        res.json({
            success: true,
            message: "Discussion created successfully!",
            discussionId: result.lastInsertRowid
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create discussion."
        });
    }
});


// ==========================================
// UPDATE DISCUSSION
// ==========================================

router.put("/:id", (req, res) => {

    const { id } = req.params;

    const {
        title,
        description,
        user_id
    } = req.body;

    if (!title || !description) {

        return res.status(400).json({
            success: false,
            message: "Title and description are required."
        });

    }

    try {

        const statement = db.prepare(`
            UPDATE discussions
            SET title = ?,
                description = ?
            WHERE id = ?
        `);

        const result = statement.run(
            title,
            description,
            id
        );

        if (result.changes === 0) {

            return res.status(404).json({
                success: false,
                message: "Discussion not found."
            });

        }

        res.json({
            success: true,
            message: "Discussion updated successfully!"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update discussion."
        });
    }
});


// ==========================================
// DELETE DISCUSSION
// ==========================================

router.delete("/:id", (req, res) => {

    const { id } = req.params;

    try {

        // Delete comments first
        db.prepare(`
            DELETE FROM comments
            WHERE discussion_id = ?
        `).run(id);

        // Delete discussion
        const statement = db.prepare(`
            DELETE FROM discussions
            WHERE id = ?
        `);

        const result = statement.run(id);

        if (result.changes === 0) {

            return res.status(404).json({
                success: false,
                message: "Discussion not found."
            });

        }

        res.json({
            success: true,
            message: "Discussion deleted successfully!"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete discussion."
        });
    }
});


// ==========================================
// LIKE / UNLIKE DISCUSSION
// ==========================================

router.post("/:id/like", (req, res) => {

    const { id } = req.params;

    try {

        const discussion = db.prepare(`
            SELECT likes
            FROM discussions
            WHERE id = ?
        `).get(id);

        if (!discussion) {

            return res.status(404).json({
                success: false,
                message: "Discussion not found."
            });

        }

        // V1 simple toggle.
        // Later we'll track likes per user.
        const newLikes = discussion.likes + 1;

        db.prepare(`
            UPDATE discussions
            SET likes = ?
            WHERE id = ?
        `).run(newLikes, id);

        res.json({
            success: true,
            message: "Discussion liked!",
            likes: newLikes
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to like discussion."
        });
    }
});


// ==========================================
// ADD COMMENT
// ==========================================

router.post("/:id/comments", (req, res) => {

    const { id } = req.params;

    const {
        user_id,
        comment
    } = req.body;

    if (!user_id || !comment) {

        return res.status(400).json({
            success: false,
            message: "Comment cannot be empty."
        });

    }

    try {

        // Check discussion exists
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

        const statement = db.prepare(`
            INSERT INTO comments
            (discussion_id, user_id, comment)
            VALUES (?, ?, ?)
        `);

        const result = statement.run(
            id,
            user_id,
            comment
        );

        res.json({
            success: true,
            message: "Comment added successfully!",
            commentId: result.lastInsertRowid
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to add comment."
        });
    }
});


module.exports = router;