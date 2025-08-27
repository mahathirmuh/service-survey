# PowerShell script to execute the migration using Supabase CLI

Write-Host "Starting migration process with admin credentials..." -ForegroundColor Cyan

# Path to the SQL file
$sqlFilePath = "$PSScriptRoot\add-missing-columns.sql"

# Check if the SQL file exists
if (-not (Test-Path $sqlFilePath)) {
    Write-Host "Error: SQL file not found at $sqlFilePath" -ForegroundColor Red
    exit 1
}

# Read the SQL file content
$sqlContent = Get-Content -Path $sqlFilePath -Raw

# Extract just the ALTER TABLE statement (without the verification query)
$alterTableSQL = ($sqlContent -split "-- Verify columns were added")[0].Trim()

# Execute the SQL using Supabase CLI
Write-Host "Executing SQL using Supabase CLI..." -ForegroundColor Yellow

# Create a temporary SQL file with just the ALTER TABLE statement
$tempSqlFile = "$env:TEMP\temp-migration.sql"
Set-Content -Path $tempSqlFile -Value $alterTableSQL

try {
    # Execute the SQL using Supabase CLI
    Write-Host "Using admin password to execute SQL..." -ForegroundColor Yellow
    
    # Execute the SQL using the db execute command
    $result = npx supabase db execute --file $tempSqlFile --password "T`$1ngsh4n@24" 2>&1
    
    # Check if the command was successful
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration executed successfully!" -ForegroundColor Green
        
        # Verify the columns were added by running the import script
        Write-Host "Verifying columns by running import script..." -ForegroundColor Yellow
        node import-to-new-project.js
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Migration and import completed successfully!" -ForegroundColor Green
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "   1. Verify data in Supabase dashboard" -ForegroundColor White
            Write-Host "   2. Test application functionality" -ForegroundColor White
        } else {
            Write-Host "Import script failed. Please check the output above for details." -ForegroundColor Yellow
        }
    } else {
        Write-Host "Error executing migration:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        
        Write-Host "Please run the SQL manually in the Supabase SQL Editor:" -ForegroundColor Yellow
        Write-Host $alterTableSQL -ForegroundColor White
    }
} catch {
    Write-Host "Unexpected error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    Write-Host "Please run the SQL manually in the Supabase SQL Editor:" -ForegroundColor Yellow
    Write-Host $alterTableSQL -ForegroundColor White
} finally {
    # Clean up the temporary SQL file
    if (Test-Path $tempSqlFile) {
        Remove-Item -Path $tempSqlFile -Force
    }
}