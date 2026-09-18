const fs = require("fs");
const path = require("path");

const config = `const CONFIG = {
    googleMapsApiKey: ${JSON.stringify(process.env.googleMapsApiKey || "")},
    supabaseUrl: ${JSON.stringify(process.env.supabaseUrl || "")},
    supabasePublishableKey: ${JSON.stringify(process.env.supabasePublishableKey || "")}
};
`;

const pasta = path.join(__dirname, "..", "config");
const arquivo = path.join(pasta, "config.js");

fs.mkdirSync(pasta, { recursive: true });
fs.writeFileSync(arquivo, config);

console.log("config.js gerado pelo Netlify.");