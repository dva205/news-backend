import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SERVICE_ROLE } = process.env;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

export default supabase;
