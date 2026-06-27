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

-- 4. INSERT VOORBEELD DATA (1 Nestje x 4 Kittens)

-- Definieer vaste ID's voor de nestjes zodat we de kittens eraan kunnen koppelen
INSERT INTO litters (id, name, date_of_birth, sire_name, dam_name, description) VALUES 
('11111111-1111-4111-a111-111111111111', 'Nestje Olympus', '2025-02-15', 'Aslan van Maelduin', 'Luna van Maelduin', 'Een prachtig, speels nestje met uitstekende stamboomlijnen. Beide ouders zijn uitgebreid getest en volledig gezond verklaard. De kittens groeien op in de huiskamer en zijn zeer aanhankelijk.');

-- Nestje Olympus (4 Kittens)
INSERT INTO cats (litter_id, name, date_of_birth, gender, color, pattern, status, price_nl, price_be, cover_image, published) VALUES
('11111111-1111-4111-a111-111111111111', 'Zeus', '2025-02-15', 'Kater', 'Black (Zwart)', 'Solid (Effen)', 'beschikbaar', 1250, 1300, 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=800', TRUE),
('11111111-1111-4111-a111-111111111111', 'Apollo', '2025-02-15', 'Kater', 'Red (Rood)', 'Classic Tabby', 'gereserveerd', 1250, 1300, 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800', TRUE),
('11111111-1111-4111-a111-111111111111', 'Athena', '2025-02-15', 'Poes', 'Blue Tortie', 'Solid (Effen)', 'beschikbaar', 1350, 1400, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800', TRUE),
('11111111-1111-4111-a111-111111111111', 'Hera', '2025-02-15', 'Poes', 'Black Tortie', 'Classic Tabby', 'evaluatie', 1500, 1500, 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=800', TRUE);

