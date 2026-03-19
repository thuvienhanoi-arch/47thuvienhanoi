import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const router = express.Router();

// đăng ký
router.post("/dang-ky", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.create({ email, password });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: "Email đã tồn tại hoặc dữ liệu không hợp lệ" });
  }
});

// đăng nhập
router.post("/dang-nhap", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });

    if (!user) return res.status(401).send("Sai tài khoản hoặc mật khẩu");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret");
    res.json({ token });
  } catch (err: any) {
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
});

export default router;
