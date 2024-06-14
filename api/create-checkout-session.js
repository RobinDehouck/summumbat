const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/', async (req, res) => {
    console.log("Received request:", req.body); // Log the incoming request

    const { priceId, email, address, phone } = req.body;

    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("Missing Stripe Secret Key");
        }
        console.log("Stripe Secret Key is available.");

        console.log("Creating session with Stripe..."); // Log before creating session

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `https://www.summumbat.fr/success`,
            cancel_url: `https://www.summumbat.fr/canceled`,
            metadata: {
                email: email,
                address: address,
                phone: phone,
                product: priceId
            }
        });

        console.log("Session created:", session.id); // Log the session id
        res.status(200).json({ id: session.id });
    } catch (error) {
        console.error('Error creating session:', error); // Log the entire error object
        res.status(500).json({ error: 'Failed to create Stripe checkout session' });
    }
});

module.exports = router;
