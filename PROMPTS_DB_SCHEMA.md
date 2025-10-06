### Prompts for database schema work (Supabase / Postgres)

Use these as ready-to-paste messages. Replace bracketed values.

#### Idempotent schema (tables, indexes, constraints)
“Create idempotent PostgreSQL SQL for Supabase to define these tables and relations: [list tables/fields/types/constraints]. Include primary keys, unique constraints, foreign keys with ON DELETE behavior, helpful indexes, and check constraints. Use CREATE TABLE IF NOT EXISTS and add IF NOT EXISTS guards for indexes/constraints. Provide one combined script I can paste in Supabase SQL Editor.”

#### Seed data
“Write a small, safe seed script for the schema above. Use INSERT ... ON CONFLICT DO NOTHING so it’s re-runnable. Provide a sectioned script per table with clear comments.”

#### Row Level Security (RLS) policies
“Enable RLS and create policies for table [table-name] allowing: (1) owners to read/write their own rows by user id column [owner_id], (2) service role full access, (3) optional public read when [condition]. Provide enabling statements and explicit policies with names. Include ‘ALTER TABLE ... ENABLE ROW LEVEL SECURITY;’ and ‘CREATE POLICY ...’ statements.”

#### Auth wiring in SQL
“Assume Supabase auth with users in auth.users. Add a trigger to set [owner_id] = auth.uid() on insert for tables [tables]. Provide the trigger function and per-table trigger creation, idempotent where possible.”

#### Triggers for timestamps and soft deletes
“Add idempotent triggers to set updated_at on UPDATE and created_at on INSERT for tables [tables]. Also add a soft-delete column deleted_at and a helper view [table_name_active] that filters non-deleted rows.”

#### Views and materialized views
“Create a view [view_name] that joins [tables] and exposes fields [fields]. Provide indexes (if needed) on base tables to keep queries fast. If a materialized view is better, provide refresh statement and a note on scheduling.”

#### Performance and indexing
“Recommend and create indexes for the most common queries: [describe queries]. Use btree or gin/gist as appropriate. Include partial indexes if filters are common. Ensure CREATE INDEX IF NOT EXISTS and name indexes clearly.”

#### Migrations strategy
“Split schema into migration files: 001_init.sql, 002_add_feature_x.sql, etc. Output each file’s contents with headers and include idempotency where safe. Include a top-level ‘seed.sql’. Provide a brief README section explaining the order to run them in Supabase.”

#### Backfill scripts
“Provide a safe backfill script for table [table] to populate column [new_column] based on [logic]. Make it chunked and re-runnable; avoid exclusive locks. Wrap in a transaction if safe, or explain when not to.”

#### Storage buckets (if needed)
“Create SQL to define a Supabase storage bucket [bucket-name] and RLS policies so only the owner (by [owner_id]) can read/write their files. Provide example `@supabase/storage-js` usage snippet.”

#### Testing queries
“Provide sample SELECTs to quickly verify schema and policies are behaving correctly. Include examples for anonymous user, authenticated user (owner), and non-owner.”

---

#### Example: Tasks schema prompt
“Create idempotent SQL for Supabase with tables: tasks(id bigint pk, owner_id uuid not null, title text not null, description text, status text check (status in ('todo','doing','done')) not null default 'todo', due_date date, created_at timestamptz default now(), updated_at timestamptz default now()); Add index on (owner_id, status) and a trig function to auto-update updated_at. Enable RLS and add policies: owners full access to their rows; no public access. Provide a small seed for two users’ tasks using ON CONFLICT DO NOTHING. Include short verification queries.”


