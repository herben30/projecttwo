const User = require("../models/User.js");
const Product = require("../models/Product.js");
const Cart = require("../models/Cart.js");
const Order = require("../models/Order.js");
const bcrypt = require("bcrypt");

const auth = require("../auth.js");

module.exports.checkEmailExists = (request, response, next) => {
  let reqBody = request.body;

  User.find({email : reqBody.email})
  .then(result => {
    if(result.length > 0){
      return response.send({message: "The email is already registered!"}); //`The email is already registered. Please use another email.` response.send({message: "The email is already registered!"});
    }else{
      next();
    }
  })
  .catch(error => response.send(false)); //"Error occurred!"
}


// This controller will add user on to our database.
module.exports.registerUser = (request, response) => {
  const reqBody = request.body;

  const newUser = new User({
    firstName: reqBody.firstName,
    lastName: reqBody.lastName,
    email: reqBody.email,
    password: bcrypt.hashSync(reqBody.password, 10),
    mobileNo: reqBody.mobileNo
  })
  newUser.save().then(save => {
    return response.send(true)//`${reqBody.email} is now registered!`
  }).catch((error) => {
    // console.error("Error encountered during registration:", error);
    return response.send(false);//"Error encountered during registration!"
});
}

//controller to login a user and create a token
module.exports.loginUser = (request, response) => {
  const reqBody = request.body;

  User.findOne({email : reqBody.email}).then(result => {
    if(result === null) {
      return response.send({message: "Email does not exist!"}) //`Email does not exist. Register first before logging in!`));
    }else{
      const isPasswordCorrect = bcrypt.compareSync(reqBody.password, result.password);

      if(isPasswordCorrect){

        const token = auth.createAccessToken(result);

        return response.send({accessToken: token});

      }else{
        return response.send({message: "You provided wrong password!"});//You provided wrong password. Please try again!
      }
    }
  })
}



// Controller to create an order
module.exports.addToCart = async (req, res) => {
  //productName

  const { productId, quantity } = req.body;
  const { user } = req;

  try {
    // Find the product details
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Retrieve productName from the product details
    const productName = product.productName;

    // Calculate subTotal for the current item
    const subTotal = product.price * quantity;

    // Check if the user has an existing cart
    const existingCart = await Cart.findOne({ userId: user.id });

    if (existingCart) {
      // User has an existing cart
      const existingItemIndex = existingCart.items.findIndex(item => item.productId === productId);

      if (existingItemIndex !== -1) {
        // Product already exists in the cart, update quantity and subTotal
        existingCart.items[existingItemIndex].quantity += quantity;
        existingCart.items[existingItemIndex].subTotal += subTotal;
      } else {
        // Product doesn't exist in the cart, add a new item
        existingCart.items.push({ productId, productName, quantity, subTotal });
      }

      // Update totalAmount in the existing cart
      existingCart.totalAmount += subTotal;


      await existingCart.save();

      res.status(200).json({ message: 'Item added to cart successfully'}); //, cart: existingCart 
    } else {
      // User doesn't have an existing cart, create a new cart
      const newCart = new Cart({
        userId: user.id,
        items: [{ productId, productName, quantity, subTotal }],
        totalAmount: subTotal,
      });

      await newCart.save();
      res.status(200).json({ message: 'Item added to cart successfully', cart: newCart });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }



};

//controller to retrieve User Details
module.exports.getProfile = (request, response) => {
  let user = request.user;

  User.findById(user.id)/*
    .select('-isAdmin ')*/
    .then((result) => { 
      // Clearing the password field for security
      result.password = "";  
      return response.send(result);
      console.log(result.isAdmin)
    })
   .catch((error) => response.send(false)) //"There was an error encountered during the user retrieval!"
};

//controller to make the user as admin
module.exports.makeAdmin = (request, response) => {
    let reqParams = request.params.userId;
  
    User.findById(reqParams)
    .then(result => {
      let firstName = result.firstName;
      let lastName = result.lastName;
      if(result.isAdmin === false){
          let adminUser = {
              isAdmin : true
      }

      User.findByIdAndUpdate(reqParams, adminUser).then(result => {
          if(result){
              return response.send(`You have successfully make user ${firstName} ${lastName} as Admin.`)
          }else{
              return response.send("An error occurred while attempting to make this user as Admin.")
          }
      })      
      }else{
        return response.send("User is already an Admin.")
      }
    }).catch(error =>  response.send(error));
};


//controller to retrieve user's cart 
module.exports.getCart = (request, response) => {
    let user = request.user;

    Cart.findOne({ userId: user.id })
        .then((result) => {
            if (result) {
                return response.send(result);
            } else {
                return response.send(false); //"No cart found for the user"
            }
        })
        .catch((error) => response.send("There was an error encountered during the user's cart retrieval!"));

};


//controller to checkout user's cart
module.exports.checkOut = async (req, res) => {
 try {
   const { user } = req;

   // Find the user's cart
   const userCart = await Cart.findOne({ userId: user.id });

   if (!userCart || !userCart.items || userCart.items.length === 0) {
     return res.status(400).json({ error: 'User has no items in the cart' });
   }

   // Build the order details from the cart
   const orderItems = userCart.items.map(item => ({
     productId: item.productId,
     productName: item.productName,
     quantity: item.quantity,
     subTotal: item.subTotal,
   }));

   // Calculate the total amount from the cart
   const totalAmount = userCart.totalAmount;

   // Create an order
   const order = new Order({
     userId: user.id,
     items: orderItems,
     totalAmount: totalAmount,
     status: 'Pending',
     purchasedOn: new Date(),
   });

   // Save the order to the database
   await order.save();

   // Update Product database with user order information
   await Promise.all(
     orderItems.map(async item => {
       await Product.findOneAndUpdate(
         { _id: item.productId },
         {$push: {
             userOrders: {
               userId: user.id,
               orderId: order._id,
             },},
         });
     }));

   // Update User database with order information
   const userOrderDetails = {
     orderId: order._id,
     items: orderItems,
     status: order.status,
     totalAmount: order.totalAmount,
     purchasedOn: order.purchasedOn,
   };

   await User.findByIdAndUpdate(user.id, {
     $push: { orderedItems: userOrderDetails },
   });

   // Clear the user's cart after checkout
   await userCart.deleteOne();

   res.status(200).json({ message: 'Order placed successfully'});//, order 
 } catch (error) {
   console.error(error);
   res.status(500).json({ error: 'Internal Server Error' });
 }
}



//controller to retrieve user's order list 
module.exports.getOrder = (request, response) => {
    let user = request.user;

        // Use Promise.all to execute both queries concurrently
            /*Promise.all([
    ,
                Order.countDocuments({ userId: user.id })
            ])
    , count*/
            Order.find({ userId: user.id })
            .then((result) => {
                return response.send(result);//{ message: `You have a total of ${count} order/s.`, orders }
            })
            .catch((error) => response.send("There was an error encountered during the user's order retrieval!"));
};


// controller to update the status of user's order
module.exports.updateOrderStatus = async (request, response) => {
   try {
       const orderId = request.params.orderId;
       const newStatus = request.body.status;

       if (newStatus !== "Shipped" && newStatus !== "Delivered") {
           return response.status(400).send({ message: 'Invalid status. Only "Shipped" or "Delivered" are allowed.' });
       }

       const updatedOrder = await Order.findByIdAndUpdate(
           orderId,
           { $set: { status: newStatus } },
           { new: true }
       );

       if (!updatedOrder) {
           return response.status(404).send({ message: 'Order not found.' });
       }

       const userDetails = await User.findById(updatedOrder.userId);

       if (!userDetails) {
           return response.status(404).json({ error: 'User not found' });
       }

       const order = userDetails.orderedItems.find(item => item.orderId === orderId);

       if (!order) {
           return response.status(404).json({ error: 'Order not found' });
       }

       order.status = newStatus;
       await userDetails.save();

       return response.send(updatedOrder.status); // { message: `Order status updated successfully.`, order: updatedOrder }
   } catch (error) {
       console.error(error);
       return response.status(500).send("There was an error updating the order status.");
   }

};

//controller to change the quantities in the cart
module.exports.updateCartQuantity = async (req, res) => {
  const { productId, newQuantity } = req.body;
  const { user } = req;

  try {
    // Check if the user has an existing cart
    const existingCart = await Cart.findOne({ userId: user.id });

    if (!existingCart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Find the item in the cart
    const existingItemIndex = existingCart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex !== -1) {
      // Item found in the cart, update quantity and subTotal
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const subTotal = product.price * newQuantity;

      existingCart.items[existingItemIndex].quantity = newQuantity;
      existingCart.items[existingItemIndex].subTotal = subTotal;

      // Update totalAmount in the existing cart
      existingCart.totalAmount = existingCart.items.reduce((total, item) => total + item.subTotal, 0);

      await existingCart.save();

      return res.status(200).json({ message: 'Cart updated successfully', cart: existingCart });
    } else {
      return res.status(404).json({ error: 'Item not found in the cart' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


//controller that remove a product from users cart
module.exports.removeFromCart = async (req, res) => {
  const { productId } = req.params; // Assuming productId is passed as a route parameter
  const { user } = req;

  try {
    // Check if the user has an existing cart
    const existingCart = await Cart.findOne({ userId: user.id });

    if (!existingCart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Find the item in the cart
    const existingItemIndex = existingCart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex !== -1) {
      // Item found in the cart, remove it
      const removedItem = existingCart.items.splice(existingItemIndex, 1)[0];

      // Update totalAmount in the existing cart
      existingCart.totalAmount -= removedItem.subTotal;

      await existingCart.save();

      return res.status(200).json(true);//{ message: 'Item removed from cart successfully', cart: existingCart }
    } else {
      // Item not found in the cart
      return res.status(404).json(false); //{ error: 'Item not found in the cart' }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });//
  }
};


module.exports.getAllOrders = async (request, response) => {
  try {
      const orders = await Order.find();

      if (orders.length > 0) {
          return response.send(orders);
      } else {
          return response.send("No orders found.");
      }
  } catch (error) {
      console.error(error);
      return response.status(500).send("There was an error retrieving orders.");
  }

} 

module.exports.resetPassword = async (req, res) => {
  try {
    // Get user ID from the JWT token passed in the authorization headers
    const userId = req.user.id;

    // Get the new password from the request body
    const { newPassword } = req.body;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports.updateProfile = async (req, res) => {
  try {
    // Get user ID from the JWT token passed in the authorization headers
    const userId = req.user.id;

    // Get updated profile information from the request body
    const { firstName, lastName, mobileNo } = req.body;

    // Update the user's profile in the database
    await User.findByIdAndUpdate(userId, { firstName, lastName, mobileNo });

    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};