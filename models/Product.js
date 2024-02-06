const mongoose = require("mongoose");

// Schema:
const productSchema = new mongoose.Schema({
	productName : {
		type : String,
		required : [true, "Product Name is required!"]
	},
	description : {
		type : String,
		required : [true, "Description is required!"]
	},
	price : {
		type : Number,
		required : [true, "Price is required!"]
	},
	isActive : {
		type: Boolean,
		default: true
	},
	productImage: {
	  type: String,
	  required: true,
	},
	createdOn: {
		type : Date,
		default : new Date()
	},
	userOrders :[
	{
		userId : {
			type:String
		},
		orderId : {
			type:String
		}
	}]
})

// Create our model for the products
const Product = mongoose.model("products", productSchema);

// Make our model useable by the controller
module.exports = Product;