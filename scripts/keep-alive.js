const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function keepAlive() {
    console.log('Running keep-alive ping...');

    // Just fetch one row to wake up the DB. 
    // We use 'tasks' table as verified in the schema.
    const { data, error } = await supabase
        .from('tasks')
        .select('id')
        .limit(1);

    if (error) {
        console.error('Error pinging database:', error);
        process.exit(1);
    }

    console.log('Database pinged successfully.');
}

keepAlive();
