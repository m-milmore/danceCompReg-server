const Entry = require("../models/Entry");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const {
  levels,
  ages,
  states,
  provinces,
  statesAbbr,
  provAbbr,
  danceNames,
  priceList,
  early,
} = require("../constants");
const { danceCategories } = require("../compmngrSetup");
const moment = require("moment");

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
  const entries = req.body.entries.map((entry) => ({
    ...entry,
    // user: req.user.id,
  }));

  // await sendEntriesToRegistrar(entries);
  await Entry.create(entries);
  res.status(201).json({ success: true });
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

// @desc    Get form constants
// @route   GET /api/v1/entries/formconstants
// @access  PUBLIC
exports.getFormConstants = asyncHandler(async (req, res, next) => {
  const formConstants = {
    priceList,
  };
  res.status(200).json({ success: true, data: formConstants });
});

const sendEntriesToRegistrar = async (entries) => {
  const countriesDivisions = provinces.concat(states);
  const countriesDivisionsAbbr = provAbbr.concat(statesAbbr);
  const createdAt = moment(Date.now()).format("MM.DD.YYYY.HH.mm.ss");
  let entryStr = "";

  entries.forEach((entry) => {
    const {
      form,
      danceStyle,
      syllabus,
      dance,
      level,
      age,
      studentGender,
      studio,
      city,
      state,
      phone,
      email,
      teacherFirstName,
      teacherLastName,
      member,
      studentFirstName,
      studentLastName,
    } = entry;
    const stateAbbr = countriesDivisions.includes(state)
      ? countriesDivisionsAbbr[countriesDivisions.indexOf(state)]
      : state;

    // get dance category code
    const danceCategory = danceCategories[form + danceStyle + syllabus];
    const { categoryCode } = danceCategory;

    // get dance code
    const dances = danceCategory.dances.split(";");
    const danceName = danceNames[dance.toLowerCase()];
    const danceIndex = dances.findIndex((item) => item.includes(danceName));
    const danceCode = dances[danceIndex - 1];

    // get level code
    const levels = danceCategory.levels.split(";");
    const levelIndex = levels.findIndex((item) => item.includes(level));
    const levelCode = levels[levelIndex - 1];

    // get age code
    const ages = danceCategory.ages.split(";");
    const ageSet = age === "JE" ? "Y" : age;
    const ageIndex = ages.findIndex((item) => item.includes(ageSet));
    const ageCode = ages[ageIndex - 1];

    // get entry type
    const entryType =
      ages[ageIndex + 1] === "1" ? studentGender.toLowerCase() : studentGender;

    entryStr = entryStr.concat("EN|");
    entryStr = entryStr.concat(categoryCode + "|");
    entryStr = entryStr.concat(
      danceCode + "|" + levelCode + "|" + ageCode + "|"
    );
    entryStr = entryStr.concat(entryType + "||");
    entryStr = entryStr.concat("N|0.00|1|" + createdAt + "|");

    entryStr = entryStr.concat("ST|");
    entryStr = entryStr.concat(studio + " " + city + "|||");
    entryStr = entryStr.concat(city + " " + stateAbbr + "||||");
    entryStr = entryStr.concat(
      phone + "||" + email + "||1|1|" + createdAt + "|"
    );

    let teacher = "PR|";
    teacher = teacher.concat(studentGender === "M" ? "F|" : "M|");
    teacher = teacher.concat(
      "P|" + teacherFirstName + "|" + teacherLastName + "|||"
    );
    teacher = teacher.concat(member + "||1|1|" + createdAt + "|");

    let student = "PR|";
    student = student.concat(entryType + "|A|");
    student = student.concat(
      studentFirstName + "|" + studentLastName + "|||||1|1|"
    );
    student = student.concat(createdAt + "|");

    entryStr = entryStr.concat(
      studentGender === "M" ? student + teacher : teacher + student
    );

    entryStr = entryStr.concat("PR||||||||||||");

    entryStr = entryStr.concat("\r\n");
  });

  const msg = `NDCC2023 entries ${moment().format("DD-MM-YYYY, HH:mm:ss")}`;
  const attachments = [
    {
      filename: `NDCC2023Entries${moment(Date.now()).format(
        "DD-MM-YYYY_HH:mm:ss"
      )}.txt`,
      content: entryStr,
      contentType: "text/plain",
    },
  ];

  const options = {
    email: `${process.env.REGISTRAR_EMAIL}`,
    subject: msg,
    message: msg,
    attachments,
  };

  await sendEmail(options);
};

// @desc		Create Stripe URL
// @route		POST /api/v1/entries/create-checkout-session
// @access	PRIVATE
exports.createStripeURL = asyncHandler(async (req, res, next) => {
  const itemsWithNoZeros = req.body.items.filter((item) => item.quantity > 0);
  const price = early() ? 1 : 2;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: itemsWithNoZeros.map((item) => {
      const storeItem = priceList.filter((list) => list.includes(item.name));
      return {
        price_data: {
          currency: "cad",
          product_data: { name: storeItem[0].split("|")[3] },
          unit_amount: storeItem[0].split("|")[price] * 100,
        },
        quantity: item.quantity,
      };
    }),
    success_url: `${process.env.CLIENT_URL}/success`,
    cancel_url: `${process.env.CLIENT_URL}`,
  });

  res.status(201).json({ url: session.url });
});
