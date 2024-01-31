const express = require("express");
const userControllers = require("../controllers/userControllers.js");
const auth = require("../auth.js");


// Router
const router = express.Router();

const {verify, verifyAdmin} = auth; //deconstruct


//route to activate a product by admin.
router.put("/admin/:userId", verify, verifyAdmin, userControllers.makeAdmin);

// Register user in our application:
router.post("/register", userControllers.checkEmailExists, userControllers.registerUser); //done

//route to login user
router.post(`/login`, userControllers.loginUser); //done

//route to retrieve user details
router.get('/details', verify, userControllers.getProfile); //done

// Route for resetting password
router.post('/reset-password', verify, userControllers.resetPassword); //done

// Route for updating profile
router.put('/update-profile', verify, userControllers.updateProfile); //done

//route to add to cart
router.post("/order", verify, userControllers.addToCart); //done

//route to retrieve the user's cart
router.get('/cart', verify, userControllers.getCart); //done

//route to remove an item from user's cart. 
router.delete('/:productId',verify, userControllers.removeFromCart); //done

//route to checkout the user's cart
router.post('/checkout', verify, userControllers.checkOut); //done

//route to retrieve the user's order
router.get('/order', verify, userControllers.getOrder); //done

//route to update the quanties customer cart
router.post('/change-quantities', verify, userControllers.updateCartQuantity); //done

//route to retrive every user's order
router.get('/allorder', verify, verifyAdmin, userControllers.getAllOrders); //done

//route to update the status of user's order.
router.put('/orderstatus/:orderId', verify, verifyAdmin, userControllers.updateOrderStatus);

// To make our router exportable
module.exports = router;