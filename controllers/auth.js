const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// @desc		Register user
// @route		POST /api/v1/auth/register
// @access	PUBLIC
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

// @desc		Login user
// @route		POST /api/v1/auth/login
// GET requests should never be used when dealing with sensitive data (it comes from a form so POST & GET displays
// the data on the browser address bar)
// @access	PUBLIC
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password"));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc 		Logout user
// @route		GET /api/v1/auth/logout
// @access	PUBLIC
exports.logout = asyncHandler(async (req, res, next) => {
  console.log(res);
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
});

// @desc		Get logged in user by id
// @routes	GET /api/v1/auth/me
// @access	PRIVATE
exports.getLoggedInUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

// @desc		Update user details
// @routes	PUT /api/v1/auth/updatedetails
// @access	PRIVATE
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

// @desc		Update user password
// @routes	POST /api/v1/auth/updatepassword
// @access	PRIVATE
exports.updatePassword = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.user.id).select("+password");

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Incorrect password", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  user = await User.findById(user.id);

  sendTokenResponse(user, 200, res);
});

// @desc		Forgot password
// @routes	POST /api/v1/auth/forgotpassword
// @access	PRIVATE
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.body.urlLink}${resetToken}?email=${user.email}`;

  const message = `You are receiving this email because you've requested a password reset. Please click on this link to reset your password: ${resetUrl}\n
  If you didn't request a password reset, you can just ignore this email. The link in this email will expire in 10 minutes.`;

  const options = {
    email: user.email,
    subject: "Password reset",
    message,
  };

  try {
    await sendEmail(options);
    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpired = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc		Reset password
// @routes	PUT /api/v1/auth/resetpassword/:resettoken
// @access	PUBLIC
exports.resetPassword = asyncHandler(async (req, res, next) => {
  console.log(req.params.resettoken);
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  let user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpired: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Expired token", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpired = undefined;
  await user.save({ validateBeforeSave: false });

  user = await User.findById(user.id);

  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = async (user, statusCode, res) => {
  const token = user.getSignedJwt();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  const userLight = await User.findById(user.id); // so the API doesn't return the password

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token, data: userLight });
};
