-- Enable extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
                                        id SERIAL PRIMARY KEY,
                                        name TEXT NOT NULL,
                                        phone_number TEXT NOT NULL UNIQUE
);

--Messages Table
CREATE TABLE IF NOT EXISTS messages (
                                        id SERIAL PRIMARY KEY,
                                        contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_contact_id ON messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_content_trgm ON messages USING gin (content gin_trgm_ops);
