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

-- Create index for better query performance
CREATE INDEX idx_applications_created_by ON application(created_by);
CREATE INDEX idx_applications_created_at ON application(created_at);

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

-- Create index for datasets
CREATE INDEX idx_datasets_created_by ON dataset(created_by);

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

-- Create index for recipes
CREATE INDEX idx_recipes_dataset_id ON recipe(dataset_id);

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

-- Create index for policies
CREATE INDEX idx_policies_created_by ON policy(created_by);
