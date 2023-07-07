DROP TABLE IF EXISTS cart_items;

DROP TRIGGER IF EXISTS update_cart_timestamp_trigger ON carts;
DROP FUNCTION IF EXISTS update_cart_timestamp;
DROP TABLE IF EXISTS carts CASCADE;

DROP TABLE IF EXISTS orders;

DROP TABLE IF EXISTS users;