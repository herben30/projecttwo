const Product = require("../models/Product.js");
const bcrypt = require("bcrypt");
const auth = require("../auth.js");

//Controller to add new products
module.exports.addProduct = async (req, res) => {
	const { productName, description, price } = req.body;

	try {
		const newProduct = await Product.create({
			productName,
			description,
			price,
			productImage: req.file.filename,
		});

		res.status(201).json({
			status: 'success',
			data: newProduct,
		});
	} catch (error) {
		console.error('Error adding product:', error);
		res.status(500).json({
			status: 'error',
			message: 'Internal Server Error',
		});
	}
};

//Controller to retrieve all products by admin
module.exports.getAllProducts = (request, response) => {
	Product.find({})	
	.then(result => {
		if (result.length === 0) {
			response.send(false); //"No products found in the database."
		} else {
			response.send(result);
		}
	})
	.catch(error => response.send(error));
};

//Controller to retrieve all active products
module.exports.getAllActiveProducts = (request, response) => {
	Product.find({ isActive: true })
	.then(result => {
		if (result.length === 0) {
			response.send("No active products found in the database.");
		} else {
			response.send(result);
		}
	})
	.catch(error => response.send(error));
};

//Controller to retrieve a specific product by product id
module.exports.getProduct = (request, response) => {
	let reqParams = request.params.productId;

	Product.findById(reqParams)
	.then(result => {
		if (!result) {
			response.status(404).send("Product not found.");
		} else {
			const { productName, description, price, productImage } = result;

			response.send({
				productName,
				description,
				price,
				productImage,
			});
		}
	})
	.catch(error => response.send(error));
};

//Controller to modify the details of a specific product
module.exports.updateProduct = (request, response) => {
	let reqParams = request.params.productId;
	let reqBody = request.body;

	let updatedProduct = {
		productName: reqBody.name,
		description: reqBody.description,
		price: reqBody.price
	}

	Product.findByIdAndUpdate(reqParams, updatedProduct).then(result => {
		if(result){
			return response.send(true);//`The details for product ${reqBody.name} have been updated successfully.`
		}else{
			return response.send(false); //"You failed to update the product details."
		}
	})
	.catch(error => response.send(error));
};

//Controller to achrive a product
module.exports.archiveProduct = (request, response) => {
    let reqParams = request.params.productId;

    Product.findById(reqParams)
    .then(result => {
	    if(result.isActive === true){
	        let archivedProduct = {
	        		isActive: false	
	    }
		    Product.findByIdAndUpdate(reqParams, archivedProduct).then(result => {
		        if(result){
		            return response.send(true)//"You have successfully archived this product."
		        }else{
		            return response.send(false)//"An error occurred while attempting to archive this product."
		        }
		    })
		    .catch(error =>  response.send(error));
	    }
	}).catch(error =>  response.send(error));
};


// Controller to activate a product
module.exports.activateProduct = (request, response) => {
    let reqParams = request.params.productId;
  
    Product.findById(reqParams)
    .then(result => {    	
    	if(result.isActive === false){
    	    let activateProduct = {
    	        isActive : true
    	}
    		Product.findByIdAndUpdate(reqParams, activateProduct).then(result => {
	    	    if(result){
	    	        return response.send(true) //"You have successfully activate this product."
	    	    }else{
	    	        return response.send(false) //"An error occurred while attempting to activate this product."
	    	    }
	    	})
    	}
    }).catch(error =>  response.send(error));
};

// Controller to search a product
module.exports.searchProductsByName = async (req, res) => {
	try {
		// Get product name from the request body
		const { productName } = req.body;

		// Use Mongoose to perform a case-insensitive search by product name
		const products = await Product.find({
			productName: { $regex: new RegExp(productName, 'i') },
			isActive: true // Assuming 'isActive' is the field that determines if a product is active
		});

		res.status(200).json({ products });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};
