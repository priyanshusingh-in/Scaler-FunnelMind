@echo off
echo 🧠 Scaler-FunnelMind - Vercel Deployment
echo ========================================

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if user is logged in
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo 🔐 Please login to Vercel...
    vercel login
)

REM Check if project is already linked
if exist ".vercel\project.json" (
    echo ✅ Project already linked to Vercel
    echo 🚀 Deploying to production...
    vercel --prod
) else (
    echo 🔗 Linking project to Vercel...
    echo 📝 Please follow the prompts:
    echo    - Set up and deploy? → Yes
    echo    - Which scope? → Select your account
    echo    - Link to existing project? → No
    echo    - Project name? → scaler-funnelmind
    echo    - Directory? → ./ (current directory)
    echo    - Override settings? → No
    
    vercel
)

echo.
echo 🎉 Deployment complete!
echo 📊 Check your admin dashboard at: https://your-project.vercel.app/admin
echo 🔍 Health check at: https://your-project.vercel.app/health
echo.
echo 💡 Don't forget to set up environment variables in Vercel dashboard!
pause
