const fs = require("fs");
const path = require("path");

const config = `const CONFIG = {
    googleMapsApiKey: ${JSON.stringify(process.env.GOOGLE_MAPS_API_KEY || "")},
    supabaseUrl: ${JSON.stringify(process.env.SUPABASE_URL || "")},
    supabaseKey: ${JSON.stringify(process.env.SUPABASE_PUBLISHABLE_KEY || "")}
};
`;

const pasta = path.join(__dirname, "..", "config");
const arquivo = path.join(pasta, "config.js");

fs.mkdirSync(pasta, { recursive: true });
fs.writeFileSync(arquivo, config);

console.log("config.js gerado pelo Netlify.");