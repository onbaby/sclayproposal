#!/bin/bash

# Sclay AI Proposal Generator - Quick Deploy to Vercel

echo "🚀 Deploying Sclay AI Proposal Generator to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project first to catch any issues
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🌍 Deploying to Vercel..."
    vercel --prod
    
    echo ""
    echo "🎉 Deployment complete!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Set up environment variables in Vercel dashboard"
    echo "2. Configure custom domain (optional)"
    echo "3. Add link to your existing website"
    echo ""
    echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
else
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi 