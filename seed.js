const fs = require("fs");
const { Pool } = require("pg");
const csv = require("csv-parser");
const faker = require("faker");

// PostgreSQL pool connection config
const pool = new Pool({
    user: process.env.USER,
    host: "localhost",
    database: "exabloom",
    password: "",
    port: 5433,
});

/**
 * Loads all messages from the provided CSV file.
 * The first column of each row is used as message content.
 */
async function loadMessagesFromCSV() {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream("data/message_content.csv")
            .pipe(csv())
            .on("data", (data) => {
                const message = Object.values(data)[0];
                if (message) results.push(message);
            })
            .on("end", () => resolve(results))
            .on("error", reject);
    });
}

/**
 * Generates and inserts 100,000 unique contacts into the database.
 */
async function seedContacts() {
    const client = await pool.connect();
    const contacts = [];

    for (let i = 0; i < 100000; i++) {
        const name = faker.name.findName();
        const phone = String(6000000000 + i);
    }


    console.log("Seeding 100,000 contacts...");

    for (let i = 0; i < contacts.length; i += 1000) {
        const chunk = contacts.slice(i, i + 1000);
        const values = chunk
            .map((c, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`)
            .join(", ");
        const flat = chunk.flatMap((c) => [c.name, c.phone]);

        await client.query(
            `INSERT INTO contacts (name, phone_number) VALUES ${values}`,
            flat
        );
    }

    console.log("✅ Contacts seeded.");
    client.release();
}

/**
 * Generates and inserts 5 million messages associated with random contacts.
 */
async function seedMessages(messagesCSV) {
    const client = await pool.connect();

    // Fetch contact ids
    const { rows } = await client.query("SELECT id FROM contacts");
    const contactIds = rows.map((r) => r.id);
    const totalMessages = 5000000;

    console.log("Seeding 5,000,000 messages...");

    for (let i = 0; i < totalMessages; i += 1000) {
        const chunk = [];
        for (let j = 0; j < 1000; j++) {
            const contactId = contactIds[Math.floor(Math.random() * contactIds.length)];
            const content = messagesCSV[Math.floor(Math.random() * messagesCSV.length)];
            const timestamp = faker.date.past(2).toISOString(); // last 2 years
            chunk.push({ contactId, content, timestamp });
        }

        const values = chunk
            .map((m, idx) =>
                `($${idx * 3 + 1}, $${idx * 3 + 2}, $${idx * 3 + 3})`
            )
            .join(", ");
        const flat = chunk.flatMap((m) => [m.contactId, m.content, m.timestamp]);

        await client.query(
            `INSERT INTO messages (contact_id, content, timestamp) VALUES ${values}`,
            flat
        );

        if (i % 100000 === 0) {
            console.log(`Inserted ${i} messages...`);
        }
    }

    console.log("✅ Messages seeded.");
    client.release();
}

(async () => {
    try {
        const messages = await loadMessagesFromCSV();
        await seedContacts();
        await seedMessages(messages);
        console.log("🌱 Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error during seeding:", err);
        process.exit(1);
    }
})();
