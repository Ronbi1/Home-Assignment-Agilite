CREATE TABLE IF NOT EXISTS tickets (
  id             VARCHAR(12)  PRIMARY KEY,
  customer_name  VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  subject        VARCHAR(500) NOT NULL,
  message        TEXT         NOT NULL,
  product_id     INTEGER      NOT NULL,
  product_title  VARCHAR(255) NOT NULL,
  product_price  NUMERIC(10,2) NOT NULL,
  product_image  TEXT         NOT NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'open'
                              CHECK (status IN ('open', 'closed')),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS product_title VARCHAR(255);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS product_price NUMERIC(10,2);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS product_image TEXT;

UPDATE tickets
SET
  product_title = COALESCE(product_title, 'Product #' || product_id::text),
  product_price = COALESCE(product_price, 0),
  product_image = COALESCE(product_image, 'https://placehold.co/80x80?text=?');

ALTER TABLE tickets ALTER COLUMN product_title SET NOT NULL;
ALTER TABLE tickets ALTER COLUMN product_price SET NOT NULL;
ALTER TABLE tickets ALTER COLUMN product_image SET NOT NULL;

CREATE TABLE IF NOT EXISTS replies (
  id         SERIAL       PRIMARY KEY,
  ticket_id  VARCHAR(12)  NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author     VARCHAR(100) NOT NULL DEFAULT 'Support Agent',
  content    TEXT         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tickets_updated_at ON tickets;
CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
