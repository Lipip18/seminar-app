const express = require("express");
const {
  getFacultyList,
  sendConnectionRequest,
  getMyConnections,
} = require("../controllers/connectionController");

const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/faculty", getFacultyList);
router.get("/", getMyConnections);
router.post("/", authorize("student"), sendConnectionRequest);

module.exports = router;