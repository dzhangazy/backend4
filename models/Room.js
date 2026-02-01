const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    pricePerHour: { type: Number, required: true, min: 0 },
    roomType: { type: String, default: "conference" },
    description: { type: String, default: "" },
    amenities: { type: [String], default: [] },
    available: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Room", roomSchema);
