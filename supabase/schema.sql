-- 1. DROP oude tabellen (zodat we 100% schoon beginnen)
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS timeline_updates CASCADE;
DROP TABLE IF EXISTS vaccinations CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS cats CASCADE;
DROP TABLE IF EXISTS litters CASCADE;

-- 2. Extensie voor UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Maak alle tabellen opnieuw aan

CREATE TABLE litters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    description TEXT,
    sire_name VARCHAR(255),
    dam_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    litter_id UUID REFERENCES litters(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(50),
    color VARCHAR(255),
    pattern VARCHAR(255),
    chip_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'beschikbaar',
    price_nl NUMERIC(10, 2),
    price_be NUMERIC(10, 2),
    customer_nationality VARCHAR(5),
    cover_image TEXT,
    pedigree_data JSONB,
    secret_token_nl UUID DEFAULT uuid_generate_v4() UNIQUE,
    secret_token_be UUID DEFAULT uuid_generate_v4() UNIQUE,
    published BOOLEAN DEFAULT FALSE,
    customer_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES cats(id) ON DELETE CASCADE,
    document_type VARCHAR(50),
    file_url TEXT NOT NULL,
    notes TEXT,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES cats(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255),
    batch_number VARCHAR(100),
    vaccination_date DATE,
    valid_until DATE,
    veterinarian_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE timeline_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES cats(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES cats(id) ON DELETE CASCADE,
    litter_id UUID REFERENCES litters(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INSERT VOORBEELD DATA (4 Nestjes x 8 Kittens)

-- Definieer vaste ID's voor de nestjes zodat we de kittens eraan kunnen koppelen
INSERT INTO litters (id, name, date_of_birth, sire_name, dam_name) VALUES 
('11111111-1111-4111-a111-111111111111', 'Nestje Olympus', '2025-02-15', 'Aslan van Maelduin', 'Luna van Maelduin'),
('22222222-2222-4222-a222-222222222222', 'Nestje Galactisch', '2025-04-10', 'King Arthur of the North', 'Queen Guinevere'),
('33333333-3333-4333-a333-333333333333', 'Nestje Edelstenen', '2025-05-01', 'Aslan van Maelduin', 'Bella Donna'),
('44444444-4444-4444-a444-444444444444', 'Nestje Natuur', '2025-06-20', 'Thor van Asgard', 'Luna van Maelduin');

-- Nestje Olympus (8 Kittens)
INSERT INTO cats (litter_id, name, date_of_birth, gender, color, pattern, status, price_nl, price_be, cover_image) VALUES
('11111111-1111-4111-a111-111111111111', 'Zeus', '2025-02-15', 'Kater', 'Black (Zwart)', 'Solid (Effen)', 'beschikbaar', 1250, 1300, 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=800'),
('11111111-1111-4111-a111-111111111111', 'Apollo', '2025-02-15', 'Kater', 'Red (Rood)', 'Classic Tabby', 'gereserveerd', 1250, 1300, 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800'),
('11111111-1111-4111-a111-111111111111', 'Hermes', '2025-02-15', 'Kater', 'Cream (Crème)', 'Mackerel Tabby', 'beschikbaar', 1250, 1300, 'https://images.unsplash.com/photo-1615397323144-8848d5423fdb?auto=format&fit=crop&q=80&w=800'),
('11111111-1111-4111-a111-111111111111', 'Ares', '2025-02-15', 'Kater', 'Black (Zwart)', 'Smoke', 'verkocht', 1250, 1300, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800'),
('11111111-1111-4111-a111-111111111111', 'Athena', '2025-02-15', 'Poes', 'Blue Tortie', 'Solid (Effen)', 'beschikbaar', 1350, 1400, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800'),
('11111111-1111-4111-a111-111111111111', 'Hera', '2025-02-15', 'Poes', 'Black Tortie', 'Classic Tabby', 'evaluatie', 1500, 1500, 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=800'),
('11111111-1111-4111-a111-111111111111', 'Artemis', '2025-02-15', 'Poes', 'White (Wit)', 'Solid (Effen)', 'gereserveerd', 1350, 1400, 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&q=80&w=800'),
('11111111-1111-4111-a111-111111111111', 'Aphrodite', '2025-02-15', 'Poes', 'Blue (Blauw)', 'Smoke', 'beschikbaar', 1350, 1400, 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80&w=800');

-- Nestje Galactisch (8 Kittens)
INSERT INTO cats (litter_id, name, date_of_birth, gender, color, pattern, status, price_nl, price_be) VALUES
('22222222-2222-4222-a222-222222222222', 'Orion', '2025-04-10', 'Kater', 'Blue (Blauw)', 'Classic Tabby', 'beschikbaar', 1250, 1300),
('22222222-2222-4222-a222-222222222222', 'Sirius', '2025-04-10', 'Kater', 'Black (Zwart)', 'Bicolor', 'beschikbaar', 1250, 1300),
('22222222-2222-4222-a222-222222222222', 'Cosmo', '2025-04-10', 'Kater', 'Red (Rood)', 'Solid (Effen)', 'beschikbaar', 1250, 1300),
('22222222-2222-4222-a222-222222222222', 'Nova', '2025-04-10', 'Poes', 'Black Tortie', 'Harlequin', 'beschikbaar', 1350, 1400),
('22222222-2222-4222-a222-222222222222', 'Lyra', '2025-04-10', 'Poes', 'White (Wit)', 'Solid (Effen)', 'evaluatie', 1500, 1500),
('22222222-2222-4222-a222-222222222222', 'Vega', '2025-04-10', 'Poes', 'Blue Tortie', 'Bicolor', 'beschikbaar', 1350, 1400),
('22222222-2222-4222-a222-222222222222', 'Stella', '2025-04-10', 'Poes', 'Cream (Crème)', 'Spotted Tabby', 'beschikbaar', 1350, 1400),
('22222222-2222-4222-a222-222222222222', 'Luna', '2025-04-10', 'Poes', 'Black (Zwart)', 'Smoke', 'beschikbaar', 1350, 1400);

-- Nestje Edelstenen (8 Kittens)
INSERT INTO cats (litter_id, name, date_of_birth, gender, color, pattern, status, price_nl, price_be) VALUES
('33333333-3333-4333-a333-333333333333', 'Onyx', '2025-05-01', 'Kater', 'Black (Zwart)', 'Solid (Effen)', 'beschikbaar', 1250, 1300),
('33333333-3333-4333-a333-333333333333', 'Jasper', '2025-05-01', 'Kater', 'Red (Rood)', 'Mackerel Tabby', 'beschikbaar', 1250, 1300),
('33333333-3333-4333-a333-333333333333', 'Topaz', '2025-05-01', 'Kater', 'Cream (Crème)', 'Classic Tabby', 'beschikbaar', 1250, 1300),
('33333333-3333-4333-a333-333333333333', 'Garnet', '2025-05-01', 'Kater', 'Blue (Blauw)', 'Smoke', 'beschikbaar', 1250, 1300),
('33333333-3333-4333-a333-333333333333', 'Ruby', '2025-05-01', 'Poes', 'Red (Rood)', 'Classic Tabby', 'beschikbaar', 1350, 1400),
('33333333-3333-4333-a333-333333333333', 'Sapphire', '2025-05-01', 'Poes', 'Blue (Blauw)', 'Solid (Effen)', 'evaluatie', 1500, 1500),
('33333333-3333-4333-a333-333333333333', 'Emerald', '2025-05-01', 'Poes', 'Black Tortie', 'Spotted Tabby', 'beschikbaar', 1350, 1400),
('33333333-3333-4333-a333-333333333333', 'Amber', '2025-05-01', 'Poes', 'Cream (Crème)', 'Shaded', 'beschikbaar', 1350, 1400);

-- Nestje Natuur (8 Kittens)
INSERT INTO cats (litter_id, name, date_of_birth, gender, color, pattern, status, price_nl, price_be) VALUES
('44444444-4444-4444-a444-444444444444', 'River', '2025-06-20', 'Kater', 'Blue (Blauw)', 'Bicolor', 'beschikbaar', 1250, 1300),
('44444444-4444-4444-a444-444444444444', 'Forest', '2025-06-20', 'Kater', 'Black (Zwart)', 'Smoke', 'beschikbaar', 1250, 1300),
('44444444-4444-4444-a444-444444444444', 'Ash', '2025-06-20', 'Kater', 'Cream (Crème)', 'Solid (Effen)', 'beschikbaar', 1250, 1300),
('44444444-4444-4444-a444-444444444444', 'Rowan', '2025-06-20', 'Kater', 'Red (Rood)', 'Classic Tabby', 'beschikbaar', 1250, 1300),
('44444444-4444-4444-a444-444444444444', 'Willow', '2025-06-20', 'Poes', 'Blue Tortie', 'Van', 'beschikbaar', 1350, 1400),
('44444444-4444-4444-a444-444444444444', 'Hazel', '2025-06-20', 'Poes', 'Black Tortie', 'Spotted Tabby', 'evaluatie', 1500, 1500),
('44444444-4444-4444-a444-444444444444', 'Ivy', '2025-06-20', 'Poes', 'White (Wit)', 'Solid (Effen)', 'beschikbaar', 1350, 1400),
('44444444-4444-4444-a444-444444444444', 'Fern', '2025-06-20', 'Poes', 'Black (Zwart)', 'Classic Tabby', 'beschikbaar', 1350, 1400);
