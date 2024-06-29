import { totalPrice } from './main.js';

export function initializeCheckout() {
  const stripe = Stripe("pk_live_ca8gmEy7wmAAlOxKFqa9Opll00TnfFx9rq");
  const paymentForm = document.getElementById("payment-form");

  if (paymentForm) {
    paymentForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const priceId = document.getElementById("stripe_id")?.value;
      const email = document.getElementById("email")?.value;
      const address = document.getElementById("address")?.value;
      const phone = document.getElementById("phone")?.value;
      const shipping = document.querySelector('input[name="shipping"]:checked')?.value;
      const installation = document.querySelector('input[name="installation"]:checked')?.value;

      fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: priceId,
          email: email,
          address: address,
          phone: phone,
          shipping: shipping,
          installation: installation,
          totalPrice: totalPrice
        }),
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then(function (session) {
          if (!session.id) {
            throw new Error("Session ID not returned");
          }
          return stripe.redirectToCheckout({ sessionId: session.id });
        })
        .then(function (result) {
          if (result.error) {
            alert(result.error.message);
          }
        })
        .catch(function (error) {
          console.error("Error:", error);
        });
    });
  }
}