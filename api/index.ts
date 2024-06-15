import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2022-11-15' });

app.use(express.json());

app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
    console.log("Received request:", req.body);

    const { priceId, email, address, phone } = req.body;

    try {
        console.log("Creating session with Stripe...");

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

        console.log("Session created:", session.id);
        res.status(200).json({ id: session.id });
    } catch (error) {
        console.error('Error creating session:', (error as Error).message);
        res.status(500).json({ error: 'Failed to create Stripe checkout session' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
