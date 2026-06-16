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

-- Tabel: Nestjes (Litters)
CREATE TABLE litters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- Bijv. "Nestje Lente 2025"
    date_of_birth DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel: Katten / Kittens (Cats)
CREATE TABLE cats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    litter_id UUID REFERENCES litters(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(50), -- Kater / Poes
    color VARCHAR(255),
    chip_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'beschikbaar', -- 'beschikbaar', 'gereserveerd', 'verkocht', 'eigen'
    price_nl NUMERIC(10, 2), -- Prijs voor Nederland
    price_be NUMERIC(10, 2), -- Prijs voor België
    customer_nationality VARCHAR(5), -- 'NL' of 'BE'
    cover_image TEXT, -- Hoofdfoto voor de advertentie
    pedigree_data JSONB, -- JSON opslag voor de stamboom structuur (ouders, grootouders, etc)
    secret_token UUID DEFAULT uuid_generate_v4() UNIQUE, -- Voor de unieke klant-link
    customer_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel: Documenten (Documents - De "Digitale Kluis")
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES cats(id) ON DELETE CASCADE,
    document_type VARCHAR(50), -- 'paspoort', 'factuur', 'hcm_test', 'contract'
    file_url TEXT NOT NULL,
    notes TEXT,
    is_private BOOLEAN DEFAULT TRUE, -- Standaard alleen voor Willem
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel: Inentingen & Medisch (Vaccinations)
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

-- Tabel: Tijdlijn / Updates voor het klantenportaal (Timeline Updates)
CREATE TABLE timeline_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES cats(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT, -- Bericht of foto tekst
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel: Media (Foto's & Video's)
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES cats(id) ON DELETE CASCADE, -- NULL als het een algemene nest-foto is
    litter_id UUID REFERENCES litters(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(50), -- 'image', 'video', 'youtube_link', 'vimeo_link'
    is_public BOOLEAN DEFAULT FALSE, -- Zichtbaar in klantenportaal?
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
