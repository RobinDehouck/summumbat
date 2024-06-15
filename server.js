import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2022-11-15' });

app.use(express.json());
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));
app.use(express.static(path.join(__dirname, 'public')));

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

app.post('/webhook', async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (err) {
        console.error('⚠️  Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { email, address, phone, product } = session.metadata;

        try {
            const { data, error } = await supabase
                .from('customers')
                .insert([{ email, address, phone, product, created_at: new Date() }]);

            if (error) {
                console.error('Error inserting customer data into Supabase:', error);
            } else {
                console.log('Customer data inserted into Supabase:', data);
            }
        } catch (error) {
            console.error('Error handling webhook event:', (error as Error).message);
        }
    }

    res.status(200).json({ received: true });
});

app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, 'public', `${page}.html`);

    res.sendFile(filePath, err => {
        if (err) {
            next();
        }
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
