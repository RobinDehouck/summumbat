require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.PORT || 3000;
const app = express();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to handle raw body (required for Stripe webhooks)
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Import and use the API routes
const createCheckoutSession = require('./api/create-checkout-session');
app.use('/api/create-checkout-session', createCheckoutSession);

// Webhook endpoint to handle Stripe events
app.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('⚠️  Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Retrieve customer details from the session object
        const { email, address, phone, product } = session.metadata;

        try {
            // Insert customer data into Supabase
            const { data, error } = await supabase
                .from('customers')
                .insert([
                    { email: email, address: address, phone: phone, product: product, created_at: new Date() }
                ]);

            if (error) {
                console.error('Error inserting customer data into Supabase:', error);
            } else {
                console.log('Customer data inserted into Supabase:', data);
            }
        } catch (error) {
            console.error('Error handling webhook event:', error.message);
        }
    }

    res.status(200).json({ received: true });
});

// Remove the manual static file routing since Vercel will handle this
// Fallback to index.html for any other routes (for SPA behavior)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
