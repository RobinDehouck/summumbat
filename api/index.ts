import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-04-10' });

// Needed for __dirname to work in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));
app.use(express.static(path.join(__dirname, '../public'))); // Adjust the path to point to the public directory

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'test.html'), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.get('/product/:productSlug', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public', 'product.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'admin.html'), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
    const { priceId, email, address, phone } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            success_url: `https://www.summumbat.fr/success`,
            cancel_url: `https://www.summumbat.fr/test`,
            metadata: { email, address, phone, product: priceId }
        });
        res.status(200).json({ id: session.id });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error creating session:', error.message);
            res.status(500).json({ error: 'Failed to create Stripe checkout session' });
        } else {
            console.error('Unexpected error:', error);
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
});

app.post('/webhook', async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (err) {
        if (err instanceof Error) {
            console.error('⚠️  Webhook signature verification failed.', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        } else {
            console.error('Unexpected error during webhook verification:', err);
            return res.status(400).send('Webhook Error: An unexpected error occurred');
        }
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata as { email: string; address: string; phone: string; product: string };
        const { email, address, phone, product } = metadata;

        try {
            const { data, error } = await supabase.from('customers').insert([{ email, address, phone, product, created_at: new Date() }]);
            if (error) {
                console.error('Error inserting customer data into Supabase:', error);
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error handling webhook event:', error.message);
            } else {
                console.error('Unexpected error handling webhook event:', error);
            }
        }
    }

    res.status(200).json({ received: true });
});

app.get('/api/products', async (req: Request, res: Response) => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
        console.error('Error fetching products:', error.message);
        return res.status(500).json({ error: 'Error fetching products' });
    }
    res.status(200).json(data);
});

app.post('/api/products', async (req: Request, res: Response) => {
    const { title, description, price, frais_de_port_hdf, frais_de_port_non_hdf, image1_url, image2_url, image3_url, image4_url, video_url, template_url, ison, stripe_id } = req.body;

    const { data, error } = await supabase.from('products').insert([
        { title, description, price, frais_de_port_hdf, frais_de_port_non_hdf, image1_url, image2_url, image3_url, image4_url, video_url, template_url, ison, stripe_id }
    ]);

    if (error) {
        console.error('Error creating product:', error.message);
        return res.status(500).json({ error: 'Error creating product' });
    }

    res.status(201).json(data);
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, price, frais_de_port_hdf, frais_de_port_non_hdf, image1_url, image2_url, image3_url, image4_url, video_url, template_url, ison, stripe_id } = req.body;

    const { data, error } = await supabase.from('products').update({ 
        title, description, price, frais_de_port_hdf, frais_de_port_non_hdf, image1_url, image2_url, image3_url, image4_url, video_url, template_url, ison, stripe_id 
    }).eq('id', id);

    if (error) {
        console.error('Error updating product:', error.message);
        return res.status(500).json({ error: 'Error updating product' });
    }

    res.status(200).json(data);
});

app.get('/api/product/:productSlug', async (req: Request, res: Response) => {
    const productSlug = req.params.productSlug;
    const productTitle = productSlug.replace(/-/g, ' ');
    
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .ilike('title', productTitle)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

export default app;
