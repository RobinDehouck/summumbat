const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    console.log('Request received:', req.body);

    const { priceId } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.VERCEL_URL}/success`,
            cancel_url: `${process.env.VERCEL_URL}/canceled`,
        });

        console.log('Session created:', session);

        res.status(200).json({ id: session.id });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: error.message });
    }
};
