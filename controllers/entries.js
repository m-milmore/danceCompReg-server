const Entry = require("../models/Entry");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc		Get all entries
// @route		GET /api/v1/entries
// @access	PRIVATE
exports.getEntries = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.filteredResults);
});

// @desc		Get single entry
// @route		GET /api/v1/entries/:id
// @access	PRIVATE
exports.getEntry = asyncHandler(async (req, res, next) => {
  const entry = await Entry.findById(req.params.id);
  res.status(200).json({ success: true, data: entry });
});

// @desc		Create entry
// @route		POST /api/v1/entries
// @access	PRIVATE
exports.createEntry = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const entry = await Entry.create(req.body);
  res.status(201).json({ success: true, data: entry });
});

// @desc		Update entry
// @route		PUT /api/v1/entries/:id
// @access	PRIVATE
exports.updateEntry = asyncHandler(async (req, res, next) => {
  let entry = await Entry.findById(req.params.id);

  if (entry.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.name} is not authorized to update this entry`,
        401
      )
    );
  }

  entry = await Entry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  await entry.save();
  res.status(200).json({ success: true, data: entry });
});

// @desc		Delete entry
// @route		DELETE /api/v1/entries/:id
// @access	PRIVATE
exports.deleteEntry = asyncHandler(async (req, res, next) => {
  const entry = await Entry.findById(req.params.id);

  if (entry.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.name} is not authorized to delete this entry`,
        401
      )
    );
  }

  entry.remove();
  res.status(200).json({ success: true, mess: "deleted entry", data: entry });
});
