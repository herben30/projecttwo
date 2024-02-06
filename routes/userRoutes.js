const express = require("express");
const userControllers = require("../controllers/userControllers.js");
const auth = require("../auth.js");


// Router
const router = express.Router();

const {verify, verifyAdmin} = auth; //deconstruct


//route to activate a user by admin.
router.put("/admin/:userId", verify, verifyAdmin, userControllers.makeAdmin);

//route to get all users
router.get("/all", verify, verifyAdmin, userControllers.getAllUsers)

// Register user in our application:
router.post("/register", userControllers.checkEmailExists, userControllers.registerUser);

//route to login user
router.post(`/login`, userControllers.loginUser);

//route to retrieve user details
router.get('/details', verify, userControllers.getProfile);

// Route for resetting password
router.post('/reset-password', verify, userControllers.resetPassword);

// Route for updating profile
router.put('/update-profile', verify, userControllers.updateProfile);

//route to add to cart
router.post("/order", verify, userControllers.addToCart);

//route to retrieve the user's cart
router.get('/cart', verify, userControllers.getCart);

//route to remove an item from user's cart. 
router.delete('/:productId',verify, userControllers.removeFromCart);

//route to checkout the user's cart
router.post('/checkout', verify, userControllers.checkOut);

//route to retrieve the user's order
router.get('/order', verify, userControllers.getOrder);

//route to update the quanties customer cart
router.post('/change-quantities', verify, userControllers.updateCartQuantity);

//route to retrive every user's order
router.get('/allorder', verify, verifyAdmin, userControllers.getAllOrders);

//route to update the status of user's order.
router.put('/orderstatus/:orderId', verify, verifyAdmin, userControllers.updateOrderStatus);

// To make our router exportable
module.exports = router;