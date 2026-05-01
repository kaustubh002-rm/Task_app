import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ================= USER ================= */
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model("User", userSchema);

/* ================= TASK ================= */
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
  userId: String
});

const Task = mongoose.model("Task", taskSchema);

/* ================= AUTH ================= */
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json("No token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json("Invalid token");
  }
};

/* ================= ROUTES ================= */

// SIGNUP
app.post("/api/signup", async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);

    await User.create({
      email: req.body.email,
      password: hashed
    });

    res.json({ message: "User created" });
  } catch {
    res.status(400).json("User already exists");
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json("User not found");

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(400).json("Wrong password");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

// CREATE
app.post("/api/tasks", auth, async (req, res) => {
  const data = await Task.create({
    ...req.body,
    userId: req.user.id
  });
  res.json(data);
});

// READ
app.get("/api/tasks", auth, async (req, res) => {
  const data = await Task.find({ userId: req.user.id });
  res.json(data);
});

// UPDATE
app.put("/api/tasks/:id", auth, async (req, res) => {
  const data = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(data);
});

// DELETE
app.delete("/api/tasks/:id", auth, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(process.env.PORT, () =>
  console.log("Server running on port " + process.env.PORT)
);