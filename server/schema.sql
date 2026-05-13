CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS venues (
  id VARCHAR(20) PRIMARY KEY,
  league VARCHAR(10) NOT NULL,
  team VARCHAR(100) NOT NULL,
  stadium VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  capacity INTEGER,
  concessions_url TEXT,
  tier INTEGER DEFAULT 3,
  status VARCHAR(20) DEFAULT 'needs_scout',
  operator VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id VARCHAR(20) REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  gate VARCHAR(20),
  level VARCHAR(50),
  sections TEXT,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stand_id UUID REFERENCES stands(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(6,2) NOT NULL,
  category VARCHAR(50),
  emoji VARCHAR(10),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'fan',
  current_venue_id VARCHAR(20) REFERENCES venues(id),
  current_section VARCHAR(20),
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID REFERENCES users(id),
  runner_id UUID REFERENCES users(id),
  venue_id VARCHAR(20) REFERENCES venues(id),
  stand_id UUID REFERENCES stands(id),
  section VARCHAR(20) NOT NULL,
  row VARCHAR(10),
  seat VARCHAR(10),
  status VARCHAR(20) DEFAULT 'pending',
  tip DECIMAL(6,2) DEFAULT 0,
  delivery_fee DECIMAL(6,2) DEFAULT 2.00,
  subtotal DECIMAL(8,2) NOT NULL,
  total DECIMAL(8,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER DEFAULT 1,
  price DECIMAL(6,2) NOT NULL,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id VARCHAR(20) REFERENCES venues(id),
  stand_id UUID REFERENCES stands(id),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  section VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  runner_id UUID REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  tip DECIMAL(6,2) DEFAULT 0,
  base_pay DECIMAL(6,2) DEFAULT 3.00,
  total DECIMAL(6,2),
  created_at TIMESTAMP DEFAULT NOW()
);
