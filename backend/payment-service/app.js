const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 8084;

// 1. Kết nối MongoDB (Sử dụng URI từ cấu hình của bạn)
const MONGO_URI =
  "mongodb+srv://son:son123@cluster0.rnxpddi.mongodb.net/mini-food-order?retryWrites=true&w=majority";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Payment Service đã kết nối MongoDB"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// 2. Định nghĩa Schema khớp chính xác với MongoDB Compass của bạn
const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  userId: { type: String, required: true }, // Thêm userId từ hình ảnh Compass
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Chỉ định rõ collection tên là 'payments' để khớp với Compass
const Payment = mongoose.model("Payment", paymentSchema, "payments");

app.use(cors());
app.use(express.json());

// URL của Order Service chạy trên port 8083
const ORDER_SERVICE_URL = "http://localhost:8083";

app.post("/payments", async (req, res) => {
  const { orderId, paymentMethod, amount } = req.body;

  try {
    console.log(`[Payment] Đang xử lý đơn hàng #${orderId}...`);

    // BƯỚC 1: Gọi Order Service để cập nhật trạng thái sang PAID
    // Sử dụng PATCH và body khớp với UpdateOrderStatusRequest
    const orderResponse = await axios.patch(
      `${ORDER_SERVICE_URL}/orders/${orderId}/status`,
      {
        status: "PAID",
      },
    );

    if (orderResponse.status === 200) {
      // Lấy thông tin đơn hàng từ phản hồi của Order Service
      const orderData = orderResponse.data;

      // BƯỚC 2: Lưu vào collection 'payments' với các trường khớp Compass
      const newPayment = new Payment({
        orderId: orderId,
        userId: orderData.userId, // Lấy userId từ dữ liệu đơn hàng trả về
        amount: amount || 0,
        paymentMethod: paymentMethod || "Banking",
        status: "SUCCESS",
      });

      await newPayment.save();

      // BƯỚC 3: Notification (Người 5)
      console.log(`\n🔔 [NOTIFICATION]`);
      console.log(`Người dùng: ${orderData.userId}`);
      console.log(
        `Nội dung: Đơn hàng #${orderId} đã thanh toán thành công qua ${paymentMethod}.`,
      );
      console.log(`Số tiền: ${amount} VNĐ`);
      console.log(`------------------------------------------\n`);

      return res.status(200).json({
        message: "Thanh toán thành công và đã lưu vào DB",
        payment: newPayment,
      });
    }
  } catch (error) {
    console.error("❌ Lỗi thanh toán:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Không thể xử lý thanh toán",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Payment Service (Người 5) đang chạy tại port ${PORT}`);
});
