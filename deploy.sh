#!/bin/bash

# 🚀 Scaler-FunnelMind Vercel Deployment Script

echo "🧠 Scaler-FunnelMind - Vercel Deployment"
echo "========================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Check if project is already linked
if [ -f ".vercel/project.json" ]; then
    echo "✅ Project already linked to Vercel"
    echo "🚀 Deploying to production..."
    vercel --prod
else
    echo "🔗 Linking project to Vercel..."
    echo "📝 Please follow the prompts:"
    echo "   - Set up and deploy? → Yes"
    echo "   - Which scope? → Select your account"
    echo "   - Link to existing project? → No"
    echo "   - Project name? → scaler-funnelmind"
    echo "   - Directory? → ./ (current directory)"
    echo "   - Override settings? → No"
    
    vercel
fi

echo ""
echo "🎉 Deployment complete!"
echo "📊 Check your admin dashboard at: https://your-project.vercel.app/admin"
echo "🔍 Health check at: https://your-project.vercel.app/health"
echo ""
echo "💡 Don't forget to set up environment variables in Vercel dashboard!"
