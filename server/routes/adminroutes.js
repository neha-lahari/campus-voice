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

//student routes
router.post("/cr-request", protect, submitCRRequest);
router.get("/cr-request/me", protect, getMyCRRequest);

//admin routes
router.get("/cr-requests", protect, authorize("admin"), getAllCRRequests);
router.patch("/cr-requests/:requestId/approve", protect, authorize("admin"), approveCRRequest);
router.patch("/cr-requests/:requestId/reject", protect, authorize("admin"), rejectCRRequest);
router.patch("/users/:userId/revoke", protect, authorize("admin"), revokeRole);
router.get("/users", protect, authorize("admin"), getAllUsers);

module.exports = router;