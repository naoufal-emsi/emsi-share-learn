-- Create a file named large_objects_config.sql in the backend directory
ALTER SYSTEM SET max_locks_per_transaction = 128;
ALTER SYSTEM SET work_mem = '64MB';
ALTER SYSTEM SET maintenance_work_mem = '256MB';
ALTER SYSTEM SET temp_buffers = '32MB';
SELECT pg_reload_conf();
