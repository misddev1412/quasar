#!/bin/bash

# Backend Environment Setup Script

echo "🚀 Setting up backend environment..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists."
    read -p "Do you want to overwrite it? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo "❌ Setup cancelled."
        exit 0
    fi
fi

# Copy template to .env
if [ -f "env.template" ]; then
    cp env.template .env
    echo "✅ Created .env from template"
else
    echo "❌ env.template not found!"
    exit 1
fi

# Generate a random JWT secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
if [ $? -eq 0 ]; then
    # Replace the JWT secret in .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/JWT_SECRET=your-super-secret-jwt-key-change-this-in-production/JWT_SECRET=${JWT_SECRET}/" .env
    else
        # Linux
        sed -i "s/JWT_SECRET=your-super-secret-jwt-key-change-this-in-production/JWT_SECRET=${JWT_SECRET}/" .env
    fi
    echo "✅ Generated secure JWT secret"
else
    echo "⚠️  Could not generate JWT secret automatically. Please update it manually in .env"
fi

echo ""
echo "📝 Next steps:"
echo "1. Update database credentials in .env file if needed"
echo "2. Make sure PostgreSQL is running"
echo "3. Create the database: createdb quasar_db"
echo "4. Run migrations: yarn migration:run"
echo "5. Seed permissions: yarn seed:permissions"
echo ""
echo "🎉 Environment setup complete!"
echo "   You can now start the backend with: nx serve backend" 