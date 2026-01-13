$gitPath = "C:\Users\Hitendra Singh\AppData\Local\GitHubDesktop\app-*\resources\app\git\cmd\git.exe"
$git = (Get-Item $gitPath | Select-Object -First 1).FullName
Write-Host "Using git at: $git"

# Ensure we are pointing to the correct remote
& $git remote add origin https://github.com/krix2112/electoral-roll-tracker.git 2>$null
& $git remote set-url origin https://github.com/krix2112/electoral-roll-tracker.git

Write-Host "Fetching remote changes..."
& $git fetch origin

Write-Host "Merging remote changes..."
# We explicitly set --no-rebase to perform a merge, fixing the "divergent branches" error
& $git pull origin main --allow-unrelated-histories --no-rebase --no-edit

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Merge successful!" -ForegroundColor Green
    Write-Host "Pushing to GitHub repo: krix2112/electoral-roll-tracker..."
    & $git push -u origin main
}
else {
    Write-Host "⚠️  Merge failed with conflicts." -ForegroundColor Red
    Write-Host "This usually means both the remote repo and your local code changed the same files."
    Write-Host "Attempting a force push... (Warning: This overwrites remote main branch with your local version)"
    $Response = Read-Host "Do you want to FORCE push and overwrite the remote repository? (y/n)"
    if ($Response -eq "y") {
        & $git push -u origin main --force
    }
    else {
        Write-Host "Push cancelled. Please resolve conflicts manually."
    }
}

Read-Host "Press Enter to exit..."
