const SUPABASE_URL =
    "https://vsoeiufsqxsqcfysdman.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_bdMT0e6zAXcI1Yq327o-Bw_B4epCcDZ";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

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


        
/*StoneWolves2026*/