require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// 1. Kết nối MongoDB Compass
// Thay thế 'notification_db' bằng tên database bạn muốn
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://son:son123@cluster0.rnxpddi.mongodb.net/mini-food-order?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Kết nối thành công tới MongoDB Compass"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// 2. Định nghĩa Schema và Model cho Notification
const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  orderId: { type: String },
  user: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);

// 3. API Endpoint để nhận và log notification
app.post("/api/notifications", async (req, res) => {
  try {
    const { user, orderId } = req.body;

    // Tạo nội dung thông báo theo format yêu cầu
    const message = `User ${user} đã đặt đơn #${orderId} thành công`;

    // Lưu vào MongoDB
    const newNotification = new Notification({
      user,
      orderId,
      message,
    });

    await newNotification.save();

    // Log ra console
    console.log(`[Notification]: ${message}`);

    res.status(201).json({
      success: true,
      data: newNotification,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Khởi chạy server
const PORT =  8084;
app.listen(PORT, () => {
  console.log(`🚀 Notification Service đang chạy tại http://localhost:${PORT}`);
});
