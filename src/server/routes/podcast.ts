import express from "express";
const router = express.Router();

// tạo podcast
router.post("/tao", (req, res) => {
  const { noiDung } = req.body;

  const tap = [
    { tieuDe: "Phần 1", thoiLuong: "5:00" },
    { tieuDe: "Phần 2", thoiLuong: "5:00" }
  ];

  res.json({ tap });
});

export default router;
