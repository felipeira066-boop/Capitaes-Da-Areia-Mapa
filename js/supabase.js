const supabaseClient =
    window.supabase.createClient(
        CONFIG.supabaseUrl,
        CONFIG.supabasePublishableKey
    );
/*
const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );
*/
async function testarSupabase() {

    const { data, error } =
        await supabaseClient
            .from("locais")
            .select("*")
            .order("ordem", {
                ascending: true
            });

    console.log("DATA:", data);
    console.log("ERROR:", error);

}

testarSupabase();