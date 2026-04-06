#!/bin/bash

# Kembukbot Polling Agent - Check Vercel every 3 minutes
# Usage: ./poll-vercel.sh

REPO="faisalekasyahputra/kembuk-finance-next"
LAST_COMMIT=""
INTERVAL=180  # 3 minutes in seconds

echo "🔄 Kembukbot Polling Agent started..."
echo "⏰ Checking every $((INTERVAL/60)) minutes"
echo "📱 App: https://kembuk-finance-next.vercel.app"
echo ""

while true; do
    echo "[$(date '+%H:%M:%S')] Checking for new commits..."
    
    # Get latest commit
    CURRENT_COMMIT=$(git ls-remote https://github.com/$REPO HEAD 2>/dev/null | cut -f1)
    
    if [ "$CURRENT_COMMIT" != "$LAST_COMMIT" ] && [ -n "$LAST_COMMIT" ]; then
        echo "🆕 New commit detected!"
        echo "📝 Pulling changes..."
        git pull origin main
        
        echo "🔍 Build check..."
        npm run build > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo "✅ Build passed"
            echo "📤 Pushing status update..."
            git add -A
            git commit -m "Kembukbot: Auto-deploy check passed - $(date)"
            git push origin main
            echo "✅ Done! Ndrogrok's turn."
        else
            echo "❌ Build failed - waiting for Ndrogrok fix"
        fi
    else
        echo "✅ No changes"
    fi
    
    LAST_COMMIT="$CURRENT_COMMIT"
    echo "💤 Sleeping for $((INTERVAL/60)) minutes..."
    sleep $INTERVAL
done
