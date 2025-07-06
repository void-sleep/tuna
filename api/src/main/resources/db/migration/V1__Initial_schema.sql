-- Create applications table
CREATE TABLE application (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo VARCHAR(255),
    tags TEXT[], -- PostgreSQL array type for tags
    dataset_id UUID,
    policy_id UUID,
    created_by VARCHAR(255) NOT NULL, -- Keycloak user ID
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Application table indexes
CREATE INDEX idx_application_created_by_created_at ON application(created_by, created_at DESC);
CREATE INDEX idx_application_created_by_name ON application(created_by, name);
CREATE INDEX idx_application_updated_at ON application(updated_at DESC);

-- Create datasets table (referenced by applications)
CREATE TABLE dataset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[],
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dataset table indexes
CREATE INDEX idx_dataset_created_by_created_at ON dataset(created_by, created_at DESC);
CREATE INDEX idx_dataset_created_by_name ON dataset(created_by, name);
CREATE INDEX idx_dataset_updated_at ON dataset(updated_at DESC);

-- Create recipes table (data items in datasets)
CREATE TABLE recipe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[],
    dataset_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recipes_dataset
        FOREIGN KEY(dataset_id)
        REFERENCES dataset(id)
        ON DELETE CASCADE
);

-- Recipe table indexes
CREATE INDEX idx_recipe_dataset_id_created_at ON recipe(dataset_id, created_at DESC);
CREATE INDEX idx_recipe_dataset_id_name ON recipe(dataset_id, name);
CREATE INDEX idx_recipe_updated_at ON recipe(updated_at DESC);

-- Create policies table (referenced by applications)
CREATE TABLE policy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[],
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Policy table indexes
CREATE INDEX idx_policy_created_by_created_at ON policy(created_by, created_at DESC);
CREATE INDEX idx_policy_created_by_name ON policy(created_by, name);
CREATE INDEX idx_policy_updated_at ON policy(updated_at DESC);


