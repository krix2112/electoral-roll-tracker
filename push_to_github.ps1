# PowerShell script to push Electoral Roll Tracker to GitHub
# Run this script after creating the repository on GitHub

Write-Host "🚀 Electoral Roll Tracker - GitHub Push Script" -ForegroundColor Cyan
Write-Host ""

# Get GitHub username
$username = Read-Host "Enter your GitHub username"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "❌ Username cannot be empty!" -ForegroundColor Red
    exit 1
}

$repoName = "electoral-roll-tracker"
$remoteUrl = "https://github.com/$username/$repoName.git"

Write-Host ""
Write-Host "📋 Repository Details:" -ForegroundColor Yellow
Write-Host "   Username: $username"
Write-Host "   Repository: $repoName"
Write-Host "   Remote URL: $remoteUrl"
Write-Host ""

$confirm = Read-Host "Have you created the repository on GitHub? (y/n)"

if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host ""
    Write-Host "⚠️  Please create the repository first:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://github.com/new" -ForegroundColor Cyan
    Write-Host "   2. Repository name: $repoName" -ForegroundColor Cyan
    Write-Host "   3. Description: Electoral Roll Tracker - Track and visualize changes in electoral rolls" -ForegroundColor Cyan
    Write-Host "   4. Choose Public or Private" -ForegroundColor Cyan
    Write-Host "   5. DO NOT initialize with README, .gitignore, or license" -ForegroundColor Yellow
    Write-Host "   6. Click 'Create repository'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then run this script again!" -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "🔗 Adding remote repository..." -ForegroundColor Yellow

# Check if remote already exists
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "⚠️  Remote 'origin' already exists: $existingRemote" -ForegroundColor Yellow
    $update = Read-Host "Update it to the new URL? (y/n)"
    if ($update -eq "y" -or $update -eq "Y") {
        git remote set-url origin $remoteUrl
        Write-Host "✅ Remote updated!" -ForegroundColor Green
    }
} else {
    git remote add origin $remoteUrl
    Write-Host "✅ Remote added!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 View your repository at:" -ForegroundColor Cyan
    Write-Host "   https://github.com/$username/$repoName" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Common issues:" -ForegroundColor Red
    Write-Host "   - Repository doesn't exist on GitHub" -ForegroundColor Yellow
    Write-Host "   - Authentication failed (use Personal Access Token)" -ForegroundColor Yellow
    Write-Host "   - Network connection issues" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Tip: If authentication fails, use a Personal Access Token:" -ForegroundColor Cyan
    Write-Host "   https://github.com/settings/tokens" -ForegroundColor Cyan
}
