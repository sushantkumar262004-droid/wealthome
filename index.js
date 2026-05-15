const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

// 👉 frontend serve karne ke liye
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connect
mongoose.connect("mongodb://127.0.0.1:27017/wealthome")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ---------------- REGISTER ---------------- */
app.post("/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.json({ success: true, message: "User registered" });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

/* ---------------- LOGIN ---------------- */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Wrong password" });
    }

    res.json({ success: true, message: "Login successful" });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.listen(5000, () => {
  console.log("Server Started on http://localhost:5000");
});