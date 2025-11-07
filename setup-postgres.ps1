# PostgreSQL Password Setup Helper

Write-Host "=== PostgreSQL Password Setup ===" -ForegroundColor Cyan
Write-Host ""

$password = Read-Host "Enter password for postgres user (or press Enter to try 'postgres')"

if ([string]::IsNullOrWhiteSpace($password)) {
    $password = "postgres"
    Write-Host "Using default password: postgres" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Testing connection..." -ForegroundColor Cyan

# Test connection
$env:PGPASSWORD = $password
$result = psql -U postgres -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Connection successful!" -ForegroundColor Green
    Write-Host ""
    
    # Check if database exists
    Write-Host "Checking for motiv_coffee database..." -ForegroundColor Cyan
    $dbExists = psql -U postgres -lqt 2>&1 | Select-String "motiv_coffee"
    
    if ($dbExists) {
        Write-Host "✓ Database motiv_coffee exists" -ForegroundColor Green
    } else {
        Write-Host "✗ Database motiv_coffee not found" -ForegroundColor Red
        Write-Host ""
        $create = Read-Host "Create database now? (Y/n)"
        
        if ($create -ne 'n' -and $create -ne 'N') {
            psql -U postgres -c "CREATE DATABASE motiv_coffee;" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Database created!" -ForegroundColor Green
            } else {
                Write-Host "✗ Failed to create database" -ForegroundColor Red
            }
        }
    }
    
    # Update .env file
    Write-Host ""
    Write-Host "Updating .env file..." -ForegroundColor Cyan
    $envContent = Get-Content .env -Raw
    $newConnectionString = "DATABASE_URL=`"postgresql://postgres:$password@localhost:5432/motiv_coffee?schema=public`""
    
    if ($envContent -match "DATABASE_URL=") {
        $envContent = $envContent -replace "DATABASE_URL=.*", $newConnectionString
    } else {
        $envContent = $newConnectionString + "`n" + $envContent
    }
    
    Set-Content -Path .env -Value $envContent
    Write-Host "✓ .env updated!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "=== Next Steps ===" -ForegroundColor Cyan
    Write-Host "1. Run: npx prisma migrate dev --name init"
    Write-Host "2. Run: npm run seed"
    Write-Host "3. Run: npm run dev"
    
} else {
    Write-Host "✗ Connection failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "1. PostgreSQL service is running: Get-Service postgresql*"
    Write-Host "2. Password is correct"
    Write-Host "3. Try resetting password (see POSTGRESQL_SETUP.md)"
}

# Clean up
Remove-Item Env:\PGPASSWORD
