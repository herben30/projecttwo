const mongoose = require("mongoose");

// Schema:
const userSchema = new mongoose.Schema({
	firstName : {
		type: String,
		required: [true, "First Name is required!"]
	},
	lastName: {
		type: String,
		required: [true, "Last Name is required!"]
	},
	email: {
		type: String,
		required: [true, "Email is required!"]
	},
	password: {
		type: String,
		required: [true, "Password is required!"]
	},
	isAdmin: {
		type: Boolean,
		default: false
	},
	mobileNo: {
		type: String,
		required: [true, "Mobile No. is required!"]
	},
	orderedItems : [{
		orderId : {
			type : String
		},
		items : [{
			productId: {
				type : String
			}, 
			productName : {
				type : String
			},
			quantity : {
				type : Number
			},
			subTotal : {
				type : Number
			}
		}], 
		status : {
			type : String
		},
		totalAmount : {
			type : Number
		},
		purchasedOn : {
			type : Date,
			default : new Date()
		}
	}]
})

// Create our model for the users
const User = mongoose.model("users", userSchema);

// Make our model useable by the controller
module.exports = User;