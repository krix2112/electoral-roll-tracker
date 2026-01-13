$gitPath = "C:\Users\Hitendra Singh\AppData\Local\GitHubDesktop\app-*\resources\app\git\cmd\git.exe"
$git = (Get-Item $gitPath | Select-Object -First 1).FullName
Write-Host "Using git at: $git"

Write-Host "⚠️  ABORTING MERGE to clear conflict state..."
& $git merge --abort

Write-Host "🚀 FORCE PUSHING local code to remote..."
Write-Host "This will overwrite the remote repository with your local files."
& $git push -u origin main --force

Read-Host "Press Enter to exit..."
