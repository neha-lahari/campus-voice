const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const parseRollNumber = require("../helpers/parseRollnumber");

// ================= TOKEN =================
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

// ================= SIGNUP =================
const signup = async (req, res) => {
    try {
        const { name, email, password, rollNumber } = req.body;

        // basic validation
        if (!name || !email || !password || !rollNumber) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // email validation
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // roll number parsing
        const parsed = parseRollNumber(rollNumber);

        if (!parsed) {
            return res.status(400).json({
                success: false,
                message: "Invalid roll number format"
            });
        }

        // check existing user
        const existing = await User.findOne({
            $or: [{ email }, { rollNumber }]
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            rollNumber,
            department: parsed.department,
            batch: parsed.batch
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            token,
            user
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ================= LOGIN =================
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields required"
            });
        }

        const user = await User.findOne({
            $or: [
                { email: identifier },
                { rollNumber: identifier }
            ]
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ================= VERIFY =================
const verifyUser = async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
};

module.exports = {
    signup,
    login,
    verifyUser
};