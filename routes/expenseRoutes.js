const express = require("express");
const userControllers = require("../controllers/userControllers.js");
const auth = require("../auth.js");

// Router
const router = express.Router();

const { verify, verifyAdmin } = auth; // destructure



module.exports = router;