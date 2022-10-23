const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// load env var
dotenv.config({ path: "./config/config.env" });

// load models
const Entry = require("./models/Entry");
const User = require("./models/User");

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Read json
const entries = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/entries.json`, "utf-8")
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);

// import into DB
const importData = async () => {
  try {
    await Entry.create(entries);
    // await User.create(users);
    console.log("data imported...");
    process.exit();
  } catch (err) {
    console.err(err);
  }
};

// delete DB data
const deleteData = async () => {
  try {
    await Entry.deleteMany();
    await User.deleteMany();
    console.log("data deleted...");
    process.exit();
  } catch (err) {
    console.err(err);
  }
};

// node seeder.js -i or -d
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
