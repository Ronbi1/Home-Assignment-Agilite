CREATE TABLE IF NOT EXISTS tickets (
  id             VARCHAR(12)  PRIMARY KEY,
  customer_name  VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  subject        VARCHAR(500) NOT NULL,
  message        TEXT         NOT NULL,
  product_id     INTEGER      NOT NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'open'
                              CHECK (status IN ('open', 'closed')),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

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
