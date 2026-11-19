import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://riyjynjdgmqosravejop.supabase.co'; // Dans Settings > API sur Supabase
const supabaseAnonKey = 'sb_publishable_dwomXGvDMOCiEpNNVzP4jg_0eRBn4yW'; // Dans Settings > API sur Supabase

export const supabase = createClient(supabaseUrl, supabaseAnonKey);