require("dotenv").config({ path: ".env.local" });
const postgres = require("postgres");

console.log("Connecting to:", process.env.DATABASE_URL);
const sql = postgres(process.env.DATABASE_URL);

async function check() {
    try {
        const res = await sql`SELECT 1 as result`;
        console.log("Success:", res);
    } catch (err) {
        console.error("Connection Error:", err);
    } finally {
        process.exit(0);
    }
}

check();
