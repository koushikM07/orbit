const express = require("express");

const router = express.Router();

router.post("/register", (req, res) => {

    console.log("===== REGISTER API CALLED =====");
    console.log(req.body);

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields."
        });
    }

    res.json({
        success: true,
        message: "User registered successfully!"
    });

});

module.exports = router;