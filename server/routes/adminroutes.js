// routes/adminRoutes.js
// Mount as: app.use("/api/admin", adminRoutes)

const router = require("express").Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    submitCRRequest,
    getMyCRRequest,
    getAllCRRequests,
    approveCRRequest,
    rejectCRRequest,
    revokeRole,
    getAllUsers
} = require("../controllers/admincontroller");

// ── STUDENT ROUTES ──────────────────────────────
// any logged-in user can submit a CR request
router.post("/cr-request", protect, submitCRRequest);

// check own request status
router.get("/cr-request/me", protect, getMyCRRequest);

// ── ADMIN ROUTES ────────────────────────────────
// get all CR requests (filter by status via ?status=pending/approved/rejected)
router.get("/cr-requests", protect, authorize("admin"), getAllCRRequests);

// approve a request
router.patch("/cr-requests/:requestId/approve", protect, authorize("admin"), approveCRRequest);

// reject a request
router.patch("/cr-requests/:requestId/reject", protect, authorize("admin"), rejectCRRequest);

// revoke a user's CR role back to student
router.patch("/users/:userId/revoke", protect, authorize("admin"), revokeRole);

// get all users (with optional ?role= and ?q= filters)
router.get("/users", protect, authorize("admin"), getAllUsers);

module.exports = router;