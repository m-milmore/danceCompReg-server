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
  getFormConstants,
  createStripeURL,
  getStripeData
} = require("../controllers/entries");

const { protect, authorize } = require("../middleware/auth");

router.get("/formconstants", getFormConstants);
router
  .route("/")
  .get(filteredResults(Entry), getEntries)
  // .post(protect, authorize("publisher", "admin"), createEntry);
  .post(createEntry);
router
  .route("/:id")
  .get(getEntry)
  .put(protect, authorize("publisher", "admin"), updateEntry)
  .delete(protect, authorize("publisher", "admin"), deleteEntry);
router.post("/createcheckoutsession", createStripeURL);
router.get("/getstripedata/:session_id", getStripeData);

module.exports = router;
