const express = require("express");

const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes.js");
const productRoutes = require("./routes/productRoutes.js");

const cors = require("cors");

const port = 3003;

const app = express();

mongoose.connect("mongodb+srv://admin:admin@batch330manzon.kiejmjc.mongodb.net/Pastry_E-Commerce_API?retryWrites=true&w=majority");

let connect = mongoose.connection;

connect.on("error", console.error.bind(console, "Connection error!"));

connect.once("open", () => {
	console.log("Connected with the Database!");
});


// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended : true}));

// Allows all resources to access our backend application
app.use(cors());
app.use("/users", userRoutes);
app.use("/products", productRoutes);


app.listen(port, () => {
	console.log(`API is now online on port ${port}!`);
})
