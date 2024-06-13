const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    const { priceId } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `https://www.summumbat.fr/`,
            cancel_url: `https://www.summumbat.fr/`,
        });

        res.status(200).json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
