const mongoose = require("mongoose");

// Schema:
const cartSchema = new mongoose.Schema({
	userId: {
		type : String
	},
	items: [{
		productId: {
			type : String
		},		
		productName : {
			type : String
		},
		productImage : {
			type : String
		},
		quantity : {
			type : Number
		},
		subTotal : {
			type : Number
		}
	}],
	totalAmount : {
		type : Number
	},
	createdOn : {
		type : Date,
		default : new Date()
	}
})


// Create our model for the carts
const Cart = mongoose.model("carts", cartSchema);

// Make our model useable by the controller
module.exports = Cart;