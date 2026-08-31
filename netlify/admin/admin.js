import { createClient } from "@supabase/supabase-js";

export default async (request) => {

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SECRET_KEY
    );
    

    // operação administrativa...

};