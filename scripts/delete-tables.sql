DROP TRIGGER IF EXISTS item_update_cart_timestamp_trigger ON carts_items;
DROP FUNCTION IF EXISTS item_update_cart_timestamp;
DROP TABLE IF EXISTS cart_items;

DROP TRIGGER status_update_cart_timestamp_trigger on carts;
DROP FUNCTION IF EXISTS update_cart_timestamp;
DROP TABLE IF EXISTS carts CASCADE;

DROP TABLE IF EXISTS orders;

DROP TABLE IF EXISTS users;