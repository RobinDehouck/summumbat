"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const supabase_js_1 = require("@supabase/supabase-js");
const stripe_1 = __importDefault(require("stripe"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
app.use(express_1.default.json());
app.use('/webhook', body_parser_1.default.raw({ type: 'application/json' }));
app.use(express_1.default.static(path_1.default.join(path_1.default.resolve(), 'public')));
app.post('/api/create-checkout-session', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { priceId, email, address, phone } = req.body;
    try {
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            success_url: `https://www.summumbat.fr/success`,
            cancel_url: `https://www.summumbat.fr/canceled`,
            metadata: { email, address, phone, product: priceId }
        });
        res.status(200).json({ id: session.id });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error creating session:', error.message);
            res.status(500).json({ error: 'Failed to create Stripe checkout session' });
        }
        else {
            console.error('Unexpected error:', error);
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
}));
app.post('/webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error('⚠️  Webhook signature verification failed.', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        else {
            console.error('Unexpected error during webhook verification:', err);
            return res.status(400).send('Webhook Error: An unexpected error occurred');
        }
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const metadata = session.metadata;
        const { email, address, phone, product } = metadata;
        try {
            const { data, error } = yield supabase.from('customers').insert([{ email, address, phone, product, created_at: new Date() }]);
            if (error) {
                console.error('Error inserting customer data into Supabase:', error);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Error handling webhook event:', error.message);
            }
            else {
                console.error('Unexpected error handling webhook event:', error);
            }
        }
    }
    res.status(200).json({ received: true });
}));
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    const filePath = path_1.default.join(path_1.default.resolve(), 'public', `${page}.html`);
    res.sendFile(filePath, err => { if (err)
        next(); });
});
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(path_1.default.resolve(), 'public', 'index.html'));
});
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
