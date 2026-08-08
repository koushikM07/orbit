const express = require("express");
const db = require("../database/database");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);
// ==========================================
// ADMIN STATS
// ==========================================

router.get("/stats", (req, res) => {

    try {

        const users = db.prepare(`
            SELECT COUNT(*) AS count
            FROM users
        `).get().count;

        const discussions = db.prepare(`
            SELECT COUNT(*) AS count
            FROM discussions
        `).get().count;

        const comments = db.prepare(`
            SELECT COUNT(*) AS count
            FROM comments
        `).get().count;

        const likes = db.prepare(`
            SELECT COALESCE(SUM(likes), 0) AS count
            FROM discussions
        `).get().count;

        res.json({
            success: true,
            stats: {
                users,
                discussions,
                comments,
                likes
            }
        });

    } catch (error) {

        console.error("ADMIN STATS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load admin statistics."
        });

    }

});


// ==========================================
// GET ALL USERS
// ==========================================

router.get("/users", (req, res) => {

    try {

        const users = db.prepare(`
            SELECT
                id,
                name,
                email,
                role,
                created_at
            FROM users
            ORDER BY created_at DESC
        `).all();

        res.json({
            success: true,
            users
        });

    } catch (error) {

        console.error("ADMIN USERS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load users."
        });

    }

});


// ==========================================
// DELETE USER
// ==========================================

router.delete("/users/:id", (req, res) => {

    const { id } = req.params;

    try {

        const user = db.prepare(`
            SELECT id, name, email, role
            FROM users
            WHERE id = ?
        `).get(id);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        // Never delete an admin
        if (user.role === "ADMIN") {

            return res.status(403).json({
                success: false,
                message: "Admin accounts cannot be deleted."
            });

        }

        // Delete user's comments
        db.prepare(`
            DELETE FROM comments
            WHERE user_id = ?
        `).run(id);

        // Delete user's discussions
        db.prepare(`
            DELETE FROM discussions
            WHERE user_id = ?
        `).run(id);

        // Delete user
        const result = db.prepare(`
            DELETE FROM users
            WHERE id = ?
        `).run(id);

        if (result.changes === 0) {

            return res.status(404).json({
                success: false,
                message: "User could not be deleted."
            });

        }

        res.json({
            success: true,
            message: "User deleted successfully."
        });

    } catch (error) {

        console.error("DELETE USER ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete user."
        });

    }

});


module.exports = router;