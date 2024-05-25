import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';
//Db connection
const sbase = createClient(config.SBASEURI , config.SBASEKEY)

export default sbase