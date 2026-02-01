const Booking = require("../models/Booking");
const Room = require("../models/Room");

exports.create = async (req, res) => {
  try {
    const { roomId, customerName, startTime, endTime } = req.body;

    if (!roomId || !customerName || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const booking = await Booking.create({
      roomId,
      customerName,
      startTime: start,
      endTime: end,
      status: "active",
    });

    return res.status(201).json(booking);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("roomId");
    return res.json(bookings);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.json(booking);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.json(booking);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.json({ message: "Booking deleted" });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
