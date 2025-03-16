const mongoose = require("mongoose");

// Schema:
const expenseSchema = new mongoose.Schema({
	createdOn: {
		type : Date,
		default : new Date()
	},
	description : {
		type : String,
		required : [true, "Description is required!"]
	},
	amount : {
		type : Number,
		required : [true, "Price is required!"]
	},
	modeOfPayment: {
	  type: String,
	  required: true,
	},
	isActive : {
		type: Boolean,
		default: true
	},
})

// Create our model for the expenses
const Expenses = mongoose.model("expenses", expenseSchema);

// Make our model useable by the controller
module.exports = Expenses;