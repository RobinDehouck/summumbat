export function fetchProductData(productSlug) {
	console.log("Fetching product data...", productSlug);
	return fetch(`/api/product/${productSlug}`)
	  .then((response) => response.json())
	  .catch((error) => {
		console.error("Error fetching product data:", error);
		throw error;
	  });
  }
  
  export function populateProductData(product) {
	document.title = `${product.title} - Summum Bat`;
	console.log(product);
	const elements = {
	  "product-title": product.title,
	  "product-price": `€${product.price.toFixed(2)}`,
	  "product-description": product.description,
	  "product_id": product.id,
	  "stripe_id": product.stripe_id,
	  "breadcrumb-product-name": product.title,
	"product-image1": product.image1_url,
	"product-image2": product.image2_url,
	"product-image3": product.image3_url,
	"product-image4": product.image4_url,
	};
  
	for (const [id, value] of Object.entries(elements)) {
	  const element = document.getElementById(id);
	  if (element) {
		element.textContent = value;
	  }
	}
  
	return product.price;
  }