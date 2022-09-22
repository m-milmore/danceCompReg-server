const Entry = require("../models/Entry");
const ErrorResponse = require("../utils/errorResponse");

// @desc		Get all entries
// @route		GET /api/v1/entries
// @access	PRIVATE
exports.getEntries = async (req, res, next) => {
  try {
    const entries = await Entry.find();
    res
      .status(200)
      .json({ success: true, count: entries.length, data: entries });
  } catch (err) {
    res.status(400).json({ success: false, mess: err.message });
  }
};

// @desc		Get single entry
// @route		GET /api/v1/entries/:id
// @access	PRIVATE
exports.getEntry = async (req, res, next) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return next(
        new ErrorResponse(`Entry not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({ success: true, data: entry });
  } catch (err) {
    // res.status(400).json({ success: false, mess: err.message });
    next(new ErrorResponse(`Incorrect id format ${req.params.id}`, 404));
  }
};

// @desc		Create entry
// @route		POST /api/v1/entries
// @access	PRIVATE
exports.createEntry = async (req, res, next) => {
  try {
    const entry = await Entry.create(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(400).json({ success: false, mess: err.message });
  }
};

// @desc		Update entry
// @route		PUT /api/v1/entries/:id
// @access	PRIVATE
exports.updateEntry = async (req, res, next) => {
  try {
    const entry = await Entry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!entry) {
      return res.status(400).json({
        success: false,
        mess: `no entry found with id:${req.params.id}`,
      });
    }

    await entry.save();
    res.status(200).json({ success: true, data: entry });
  } catch (err) {
    res.status(400).json({ success: false, mess: err.message });
  }
};

// @desc		Delete entry
// @route		DELETE /api/v1/entries/:id
// @access	PRIVATE
exports.deleteEntry = async (req, res, next) => {
  try {
    const entry = await Entry.findByIdAndDelete(req.params.id);

    if (!entry) {
      return res.status(400).json({
        success: false,
        mess: `no entry found with id:${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, mess: "deleted entry", data: entry });
  } catch (err) {
    res.status(400).json({ success: false, mess: err.message });
  }
};
