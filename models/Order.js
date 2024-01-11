const mongoose = require("mongoose");

// Schema:
const orderSchema = new mongoose.Schema({
	userId: {
		type : String
	},
	items : [{
		productId: {
			type : String
		},
		productName: {
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
	status : {		//e.g pending, shipped, delivered
		type : String,
		default : "Pending"
	},
	purchasedOn : {
		type : Date,
		default : new Date()
	}
});

// Create our model for the orders
const Order = mongoose.model("orders", orderSchema);

// Make our model useable by the controller
module.exports = Order;