const express = require("express");
const router = express.Router();
const filteredResults = require("../middleware/filteredResults");
const Entry = require("../models/Entry");

const {
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
} = require("../controllers/entries");

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(filteredResults(Entry), getEntries)
  .post(protect, authorize("publisher", "admin"), createEntry);
router
  .route("/:id")
  .get(getEntry)
  .put(protect, authorize("publisher", "admin"), updateEntry)
  .delete(protect, authorize("publisher", "admin"), deleteEntry);

module.exports = router;
