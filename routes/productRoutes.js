const express = require("express");
const productControllers = require("../controllers/productControllers.js");
const auth = require("../auth.js");

// Router
const router = express.Router();

const {verify, verifyAdmin} = auth; //deconstruct

//route to add new product
router.post(`/`, verify, verifyAdmin, productControllers.addProduct); //done

//route to retriece all products by admin.
router.get("/all", verify, verifyAdmin, productControllers.getAllProducts); //done

//route to retrieve all active products by any users.
router.get("/active", productControllers.getAllActiveProducts); //done

//route to search a product using name
router.post('/search', productControllers.searchProductsByName); //need to search an item for admin as well

//route to retrive a specific product using id.
router.get("/:productId", productControllers.getProduct); //done

//route to modify the details of a specific product by admin.
router.put("/:productId", verify, verifyAdmin, productControllers.updateProduct); //done

//route to archive a product by admin.
router.put("/archive/:productId", verify, verifyAdmin, productControllers.archiveProduct); //done

//route to activate a product by admin.
router.put("/activate/:productId", verify, verifyAdmin, productControllers.activateProduct); //done



module.exports = router;