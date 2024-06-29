import { fetchProductData, populateProductData } from './product-data.js';
import { initializeImageOverlay } from './image-overlay.js';
import { initializeCheckout } from './checkout.js';

let currentStep = 1;
let totalPrice = 0;

function updateRecap(shippingOption, installationOption, price) {
  const recapDiv = document.getElementById('live-recap');
  recapDiv.innerHTML = '';
  
  if (shippingOption) {
    const shippingText = document.createElement('span');
    shippingText.textContent = `Livraison: ${shippingOption.parentElement.textContent.trim()}`;
    recapDiv.appendChild(shippingText);
  }
  
  if (installationOption) {
    const installationText = document.createElement('span');
    installationText.textContent = `Installation: ${installationOption.parentElement.textContent.trim()}`;
    recapDiv.appendChild(installationText);
  }

  const priceSpan = document.createElement('span');
  priceSpan.textContent = `Prix total: €${price.toFixed(2)}`;
  recapDiv.appendChild(priceSpan);
}

function goToNextStep() {
  document.getElementById(`step-${currentStep}`).classList.add('hidden');
  currentStep++;
  document.getElementById(`step-${currentStep}`).classList.remove('hidden');
  updateRecap(
    document.querySelector('input[name="shipping"]:checked'),
    document.querySelector('input[name="installation"]:checked'),
    totalPrice
  );
}

function initializeProductPage(product) {
  populateProductData(product);
  initializeImageOverlay(product.images);
  initializeCheckout();

  document.querySelectorAll('.shipping-option input, .installation-option input').forEach(input => {
    input.addEventListener('change', function() {
      goToNextStep();
    });
  });

  document.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach(input => {
    input.addEventListener('input', function() {
      checkFormCompletion();
    });
  });

  function checkFormCompletion() {
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const isComplete = email && phone && address;
    document.getElementById('checkout-button-1').disabled = !isComplete;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const productSlug = window.location.pathname.split("/").pop();
  fetchProductData(productSlug)
    .then(initializeProductPage)
    .catch((error) => {
      console.error("Error initializing product page:", error);
    });
});

// load the imgs


export { updateRecap, totalPrice };