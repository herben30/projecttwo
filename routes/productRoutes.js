const express = require("express");
const productControllers = require("../controllers/productControllers.js");
const auth = require("../auth.js");

const multer = require('multer');
const path = require("path");

// Router
const router = express.Router();

const { verify, verifyAdmin } = auth; // destructure

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage
});

// Route to add a new product
router.post("/", upload.single("productImage"), verify, verifyAdmin, productControllers.addProduct);

// Route to retrieve all products by admin
router.get("/all", verify, verifyAdmin, productControllers.getAllProducts);

// Route to retrieve all active products by any user
router.get("/active", productControllers.getAllActiveProducts);

// Route to search a product by name (for both admin and users)
router.post('/search', productControllers.searchProductsByName);

// Route to retrieve a specific product by id
router.get("/:productId", productControllers.getProduct);

// Route to modify the details of a specific product by admin
router.put("/:productId", verify, verifyAdmin, productControllers.updateProduct);

// Route to archive a product by admin
router.put("/archive/:productId", verify, verifyAdmin, productControllers.archiveProduct);

// Route to activate a product by admin
router.put("/activate/:productId", verify, verifyAdmin, productControllers.activateProduct);

module.exports = router;
