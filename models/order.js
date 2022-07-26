const mongoose = require("mongoose");
// A
const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAddress.address",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    items: [
      { 
        customer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        payablePrice: {
          type: Number,
          required: true,
        },
        purchasedQty: {
          type: Number,
          required: true,
        },
        orderStatus: [
          {
            type: {
              type: String,
              enum: ["pending","placed", "packed", "shipped", "delivered","cancelled"],
              default: "pending",
            },
            date: {
              type: Date,
              default:new Date()
            },
            isCompleted: {
              type: Boolean,
              default: false,
            },
          },
        ]
      },
    ],
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "cancelled", "refund"],
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);