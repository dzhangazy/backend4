const Room = require("../models/Room");

exports.create = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    return res.status(201).json(room);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const rooms = await Room.find();
    return res.json(rooms);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    return res.json(room);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!room) return res.status(404).json({ message: "Room not found" });
    return res.json(room);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    return res.json({ message: "Room deleted" });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
