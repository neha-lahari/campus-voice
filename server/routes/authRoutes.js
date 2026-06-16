const express = require("express");
const router = express.Router();

const {
    signup,
    login,
    verifyUser,
    getLeaderboard/// remoooveeee thissss
} = require("../controllers/userAuthcontroller");

const { protect } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, verifyUser);
router.get("/leaderboard", getLeaderboard);////removeee


router.post("/logout", (req, res) => {
    res.json({
        success: true,
        message: "Logged out (remove token on frontend)"
    });
});

module.exports = router;