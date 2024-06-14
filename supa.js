const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase key:', supabaseKey);
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error querying Supabase:', error);
        } else {
            console.log('Supabase connection successful, data:', data);
        }
    } catch (error) {
        console.error('Error during Supabase connection test:', error.message);
    }
}

testSupabaseConnection();
