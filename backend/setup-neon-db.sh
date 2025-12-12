#!/bin/bash

# Neon Database Setup Script
echo "🗄️  Setting up Neon Database..."
echo ""

cd "$(dirname "$0")/src/db"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found in src/db/"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
bunx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated"
echo ""

# Push schema to Neon database
echo "🚀 Pushing schema to Neon database..."
bunx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push schema to database"
    echo "   Please check your DATABASE_URL in .env"
    exit 1
fi

echo "✅ Schema pushed to Neon successfully!"
echo ""

# Optional: Open Prisma Studio
read -p "Do you want to open Prisma Studio to view your database? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🎨 Opening Prisma Studio..."
    bunx prisma studio
fi

echo ""
echo "🎉 Database setup complete!"
echo "   You can now start your server with: bun run dev"
