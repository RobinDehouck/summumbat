const backendUrl = "http://127.0.0.1:5000";
document.addEventListener("DOMContentLoaded", () => {
  // Initialize tabs and fetch products
  initializeTabs();
  fetchProducts();

  // Create Product Form Submission
  document
    .getElementById("create-product-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      createProduct();
    });
});

function initializeTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".content-section").forEach((section) => {
        section.classList.add("hidden");
      });
      tabs.forEach((innerTab) => {
        innerTab.classList.remove("bg-gray-200");
      });
      tab.classList.add("bg-gray-200");
      const target = tab.getAttribute("data-target");
      document.getElementById(target).classList.remove("hidden");
    });
  });
}

function fetchProducts() {
  fetch(`${backendUrl}/products`)
    .then((response) => response.json())
    .then((data) => {
      const productsList = document.getElementById("products-list");
      productsList.innerHTML = "";
      data.forEach((productArray) => {
        const [
          id,
          name,
          description,
          price,
          categoryId,
          stockQuantity,
          imageUrl,
          dimensions,
          weight,
        ] = productArray;
        const productCard = document.createElement("div");
        productCard.className =
          "bg-white rounded-lg shadow-md p-4 flex flex-col justify-between mb-4";

        productCard.innerHTML = `
                    <div class="flex flex-col mb-4">
                        <img src="${imageUrl}" alt="${name}" class="rounded w-32 h-32 object-cover mb-4">
                        <div><strong>ID:</strong> ${id}</div>
                        <div><strong>Name:</strong> <input type="text" value="${name}" class="name-input bg-gray-200 rounded p-1" data-id="${id}"></div>
                        <div><strong>Description:</strong> <input type="text" value="${description}" class="description-input bg-gray-200 rounded p-1" data-id="${id}"></div>
                        <div><strong>Price:</strong> <input type="number" step="0.01" value="${price}" class="price-input bg-gray-200 rounded p-1" data-id="${id}"></div>
                        <div class="hidden"><strong>Category ID:</strong> ${categoryId}</div>
                        <div><strong>Stock Quantity:</strong> <input type="number" value="${stockQuantity}" class="stock-input bg-gray-200 rounded p-1" data-id="${id}"></div>
                        <div><strong>Image URL:</strong> <input type="text" value="${imageUrl}" class="image-input bg-gray-200 rounded p-1" data-id="${id}"></div>
                        <div><strong>Dimensions:</strong> <input type="text" value="${dimensions}" class="dimensions-input bg-gray-200 rounded p-1" data-id="${id}"></div>
                        <div><strong>Weight:</strong> <input type="number" step="0.01" value="${weight}" class="weight-input bg-gray-200 rounded p-1" data-id="${id}"></div>
                        <button class="update-product-btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" data-id="${id}">Update</button>
                    </div>
                `;
        productsList.appendChild(productCard);
      });

      document.querySelectorAll(".update-product-btn").forEach((button) => {
        button.addEventListener("click", function (e) {
          const id = this.getAttribute("data-id");
          updateProduct(id);
        });
      });
    })
    .catch((error) => console.error("Fetching products failed:", error));
}

function updateProduct(id) {
  const password = prompt("Please enter your password for authorization:");
  if (!password) {
    alert("Password is required for updating products.");
    return;
  }

  // Assuming category_id isn't changed often and might not need an inline-editing field
  const name = document.querySelector(`.name-input[data-id="${id}"]`).value;
  const description = document.querySelector(
    `.description-input[data-id="${id}"]`
  ).value;
  const price = document.querySelector(`.price-input[data-id="${id}"]`).value;
  const stockQuantity = document.querySelector(
    `.stock-input[data-id="${id}"]`
  ).value;
  const imageUrl = document.querySelector(
    `.image-input[data-id="${id}"]`
  ).value;
  const dimensions = document.querySelector(
    `.dimensions-input[data-id="${id}"]`
  ).value;
  const weight = document.querySelector(`.weight-input[data-id="${id}"]`).value;
  const categoryId = document.querySelector(
    `.category-id-input[data-id="${id}"]`
  )
    ? document.querySelector(`.category-id-input[data-id="${id}"]`).value
    : null;

  // Construct the request body with all required fields including the password
  const requestBody = {
    name,
    description,
    price: parseFloat(price),
    category_id: categoryId,
    stock_quantity: parseInt(stockQuantity, 10),
    image_url: imageUrl,
    dimensions,
    weight: parseFloat(weight),
    password: password, // Include the password in the request
  };

  fetch(`${backendUrl}/product/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Failed to update product. Please check your authorization and try again."
        );
      }
      return response.json();
    })
    .then(() => {
      alert("Product updated successfully.");
      fetchProducts(); // Optionally refresh the products list
    })
    .catch((error) => {
      console.error("Operation failed:", error);
      alert(error.message);
    });
}

function createProduct() {
  const name = document.getElementById("create-name").value;
  const description = document.getElementById("create-description").value;
  const price = document.getElementById("create-price").value;
  const categoryId = document.getElementById("create-category-id").value;
  const stockQuantity = document.getElementById("create-stock-quantity").value;
  const imageUrl = document.getElementById("create-image-url").value;
  const dimensions = document.getElementById("create-dimensions").value;
  const weight = document.getElementById("create-weight").value;
  const password = document.getElementById("create-password").value;

  fetch(`${backendUrl}/product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      price,
      category_id: categoryId,
      stock_quantity: stockQuantity,
      image_url: imageUrl,
      dimensions,
      weight,
      password,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          alert(
            "Failed to create product. Please check your authorization and try again."
          );
          throw new Error(data.error);
        });
      }
      alert("Product created successfully.");
      return response.json();
    })
    .then(fetchProducts) // Refresh the products list
    .catch(handleError);
}

function handleResponse(response) {
  if (!response.ok) {
    return response.json().then((data) => {
      throw new Error(data.error);
    });
  }
  return response.json();
}

function handleError(error) {
  console.error("Operation failed:", error);
}
