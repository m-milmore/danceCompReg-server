const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  getLoggedInUser,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.post("/updatepassword", protect, updatePassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.put("/updatedetails", protect, updateDetails);
router.get("/me", protect, getLoggedInUser);
router.get("/logout", logout);

module.exports = router;
