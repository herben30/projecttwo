const Product = require("../models/Product.js");
const bcrypt = require("bcrypt");
const auth = require("../auth.js");

//Controller to add new products
module.exports.addProduct = (request, response) => {
	let reqBody = request.body;

	const newProduct = new Product({
	    productName: reqBody.name,
	    description: reqBody.description,
	    price: reqBody.price
	});

	newProduct.save()
	    .then(product => {
	        // Product creation successful
	        return response.send(`New Product ${reqBody.name} successfully added.`);
	    })
	    .catch(error => {
	        // Product creation failed
	        return response.send("There's an error adding the new product.");
	    });
};

//Controller to retrieve all products by admin
module.exports.getAllProducts = (request, response) => {
	Product.find({})
	  .select(' -userOrders')		
	  .then(result => {
	    if (result.length === 0) {
	      response.send("No products found in the database.");
	    } else {
	      response.send(result);
	    }
	  })
	  .catch(error => response.send(error));

};

//Controller to retrieve all active products
module.exports.getAllActiveProducts = (request, response) => {
	Product.find({ isActive: true })
	  .select('-isActive -userOrders') // Include isActive, exclude userOrders
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
	  .select(' -userOrders')
	  .then(result => {
	    if (!result) {
	      response.status(404).send("Product not found.");
	    } else {
	      response.send(result);
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
			return response.send(`The details for product ${reqBody.name} have been updated successfully.`);
		}else{
			return response.send("You failed to update the product details.");
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
            return response.send("You have successfully archived this product.")
        }else{
            return response.send("An error occurred while attempting to archive this product.")
        }
    })
    .catch(error =>  response.send(error));
    }else{
        return response.send("Product is already de-activated")
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
    	        return response.send("You have successfully activate this product.")
    	    }else{
    	        return response.send("An error occurred while attempting to activate this product.")
    	    }
    	})    	
    	}else{
    		return response.send("Product is already Active")
    	}
    }).catch(error =>  response.send(error));
};


