const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email) return res.status(400).json({ message: "email is required" });
    if (!password)
      return res.status(400).json({ message: "password is required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hash,
      role: role === "admin" ? "admin" : "user",
    });

    return res
      .status(201)
      .json({ id: user._id, email: user.email, role: user.role });
  } catch (e) {
    return next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: "email is required" });
    if (!password)
      return res.status(400).json({ message: "password is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    return res.json({ token, role: user.role });
  } catch (e) {
    return next(e);
  }
};
