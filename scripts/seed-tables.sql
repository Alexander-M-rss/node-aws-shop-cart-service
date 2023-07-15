-- seeding users
INSERT INTO users (name, email, password)
VALUES
  ('John Doe', 'johndoe@example.com', 'password123'),
  ('Michael Johnson', 'michaeljohnson@example.com', 'password789'),
  ('Emily Davis', 'emilydavis@example.com', 'password123'),
  ('Robert Wilson', 'robertwilson@example.com', 'password456'),
  ('Sophia Thompson', 'sophiathompson@example.com', 'password789');

-- seeding carts
INSERT INTO carts (user_id, status)
SELECT
  users.id
FROM users;

-- seeding carts_items
WITH numbered_products AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY id) AS row_number
  FROM products
),
numbered_carts AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY id) AS row_number
  FROM carts
)
INSERT INTO cart_items (cart_id, product_id, count)
SELECT
  nc.id AS cart_id,
  np.id AS product_id,
  1 AS count
FROM numbered_carts nc
JOIN numbered_products np ON np.row_number = ((nc.row_number - 1) * 2) % (SELECT COUNT(*) FROM products) + 1
UNION ALL
SELECT
  nc.id AS cart_id,
  np.id AS product_id,
  1 AS count
FROM numbered_carts nc
JOIN numbered_products np ON np.row_number = ((nc.row_number - 1) * 2 + 1) % (SELECT COUNT(*) FROM products) + 1;
