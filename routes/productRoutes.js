const express = require("express");
const productControllers = require("../controllers/productControllers.js");
const auth = require("../auth.js");

// Router
const router = express.Router();

const {verify, verifyAdmin} = auth; //deconstruct

//route to add new product
router.post(`/`, verify, verifyAdmin, productControllers.addProduct);

//route to retriece all products by admin.
router.get("/all", verify, verifyAdmin, productControllers.getAllProducts);

//route to retrieve all active products by any users.
router.get("/active", productControllers.getAllActiveProducts);

//route to retrive a specific product using id.
router.get("/:productId", productControllers.getProduct);

//route to modify the details of a specific product by admin.
router.put("/:productId", verify, verifyAdmin, productControllers.updateProduct);

//route to archive a product by admin.
router.put("/archive/:productId", verify, verifyAdmin, productControllers.archiveProduct);

//route to activate a product by admin.
router.put("/activate/:productId", verify, verifyAdmin, productControllers.activateProduct);



module.exports = router;