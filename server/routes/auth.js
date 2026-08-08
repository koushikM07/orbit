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

router.post("/login", (req, res) => {

    console.log("===== LOGIN API CALLED =====");
    console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields."
        });
    }

    // Temporary V1 login
    if (email === "koushik@gmail.com" && password === "123456") {
        return res.json({
            success: true,
            message: "Login successful!"
        });
    }

    res.status(401).json({
        success: false,
        message: "Invalid email or password."
    });
});

module.exports = router;