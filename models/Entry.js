const mongoose = require("mongoose");
// const {
//   levels,
//   ages,
//   smooth,
//   rhythm,
//   ballroom,
//   latin,
//   countries,
//   states,
//   provinces,
//   statesAbbr,
//   provAbbr,
// } = require("../constants");

const EntrySchema = new mongoose.Schema({
  formName: {
    type: String,
    required: [true, "missing form type"],
    enum: {
      values: ["Pro/Am 1 Danse", "Pro/Am Multi Danse"],
      message: "invalid form name",
    },
  },
  studio: {
    type: String,
    required: [true, "missing studio"],
    maxlength: [25, "25 char. max. for studio name"],
  },
  city: {
    type: String,
    required: [true, "missing city"],
    maxlength: [20, "20 char. max. for city name"],
  },
  state: {
    type: String,
    required: [true, "missing state"],
    // validate: {
    //   validator: (state) => {
    //     const territories = provinces.concat(states.concat(countries));
    //     return territories.includes(state);
    //   },
    //   message: ({ value }) => `${value} is invalid`,
    // },
  },
  stateAbbrev: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    match: [
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      "invalid phone number",
    ],
    required: [true, "missing phone number"],
  },
  email: {
    type: String,
    match: [/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/, "invalid email"],
    required: [true, "missing email"],
  },
  teacherFirstName: {
    type: String,
    required: [true, "missing teacher first name"],
    maxlength: [20, "20 char. max. for first name"],
  },
  teacherLastName: {
    type: String,
    required: [true, "missing teacher last name"],
    maxlength: [20, "20 char. max. for last name"],
  },
  member: {
    type: Number,
    required: [true, "missing teacher's member number"],
  },
  studentFirstName: {
    type: String,
    required: [true, "missing student first name"],
    maxlength: [20, "20 char. max. for first name"],
  },
  studentLastName: {
    type: String,
    required: [true, "missing student last name"],
    maxlength: [20, "20 char. max. for last name"],
  },
  studentGender: {
    type: String,
    required: [true, "missing student's gender"],
    enum: {
      values: ["M", "F"],
      message: "invalid gender",
    },
  },
  level: {
    type: String,
    required: [true, "missing level"],
    // validate: {
    //   validator: (level) => {
    //     return levels.includes(level);
    //   },
    //   message: ({ value }) => `${value} is invalid`,
    // },
  },
  age: {
    type: String,
    required: [true, "missing age"],
  },
  syllabus: {
    type: String,
    required: [true, "missing syllabus"],
    // enum: {
    //   values: ["closed", "open", "fermé", "ouvert"],
    //   message: "invalid syllabus",
    // },
  },
  danceStyle: {
    type: String,
    required: [true, "missing dance style"],
    // enum: {
    //   values: ["Smooth", "Rhythm", "Ballroom", "Latin"],
    //   message: "invalid dance style",
    // },
  },
  dance: {
    type: String,
    required: [true, "missing dance"],
  },
  category: {
    type: String,
    required: [true, "missing category"],
    enum: {
      values: ["single", "champ", "schol", "solo"],
      message: "invalid category",
    },
  },
  ageType: {
    type: String,
    required: [true, "missing ageType"],
    enum: {
      values: ["0", "1"],
      message: "invalid ageType",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // user: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: "User",
  //   required: true,
  // },
});

// EntrySchema.pre("validate", function (next) {
//   if (
//     !(
//       (this.danceStyle === "Smooth" && smooth.includes(this.dance)) ||
//       (this.danceStyle === "Rhythm" && rhythm.includes(this.dance)) ||
//       (this.danceStyle === "Ballroom" && ballroom.includes(this.dance)) ||
//       (this.danceStyle === "Latin" && latin.includes(this.dance))
//     )
//   ) {
//     this.invalidate("dance", "invalid or missing dance", this.dance);
//   }
//   next();
// });

// EntrySchema.pre("validate", function (next) {
//   if (this.age === "All" && this.category !== "solo") {
//     this.invalidate("age", "invalid or missing age", this.dance);
//   }
//   next();
// });

// EntrySchema.pre("save", function (next) {
//   const countriesDivisions = provinces.concat(states);
//   const countriesDivisionsAbbr = provAbbr.concat(statesAbbr);

//   this.stateAbbrev = countriesDivisions.includes(this.state)
//     ? countriesDivisionsAbbr[countriesDivisions.indexOf(this.state)]
//     : "";

//   next();
// });

module.exports = mongoose.model("Entry", EntrySchema);
