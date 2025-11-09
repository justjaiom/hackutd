-- ============================================================================
-- QUERY TO LIST ALL TABLES IN PUBLIC SCHEMA
-- ============================================================================
-- Run this in Supabase SQL Editor to see all tables

-- List all tables in public schema
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- List all tables with their columns
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
    AND c.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

