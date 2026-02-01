const router = require("express").Router();
const c = require("../controllers/bookingController");

const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

// Public READ
router.get("/", c.getAll);
router.get("/:id", c.getOne);

// Admin-only CRUD
router.post("/", auth, requireAdmin, c.create);
router.put("/:id", auth, requireAdmin, c.update);
router.delete("/:id", auth, requireAdmin, c.remove);

module.exports = router;
