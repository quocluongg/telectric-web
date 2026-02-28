import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zqhksdkenxfubtpglmix.supabase.co'
const supabaseKey = 'sb_publishable_CN5VAzRfCa6dBhsYjMs8mg_QGjFo_ja'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log('--- PRODUCTS COLUMNS ---');
    const { data: p } = await supabase.from('products').select('*').limit(1);
    if (p && p.length > 0) console.log(Object.keys(p[0]));

    console.log('\n--- VARIANTS COLUMNS ---');
    const { data: v } = await supabase.from('product_variants').select('*').limit(1);
    if (v && v.length > 0) console.log(Object.keys(v[0]));
}

test();
