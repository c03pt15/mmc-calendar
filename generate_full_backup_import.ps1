# PowerShell script to generate SQL import from COSCHEDULE-FULL-BACKUP.csv

$csvPath = ".\COSCHEDULE-FULL-BACKUP.csv"
$outputPath = ".\import-full-backup.sql"

# Check if CSV exists
if (-not (Test-Path $csvPath)) {
    Write-Error "CSV file not found at $csvPath"
    exit 1
}

# Read CSV
$csvData = Import-Csv -Path $csvPath

# Start SQL content
$sqlContent = "-- Generated SQL Import Script from COSCHEDULE-FULL-BACKUP.csv`n"
$sqlContent += "BEGIN;`n"

# Mappings
$assigneeMap = @{
    "Tactical Squad"          = 4
    "Tactical Squad - Backup" = 4
}
$defaultAssignee = 4 # Default to Krystle if unknown

$colorMap = @{
    "FF0000" = "bg-red-100 text-red-800 border-red-200"
    "FFE900" = "bg-yellow-100 text-yellow-800 border-yellow-200"
    "21FF00" = "bg-green-100 text-green-800 border-green-200"
    "FFAA00" = "bg-orange-100 text-orange-800 border-orange-200"
}
$defaultColor = "bg-gray-100 text-gray-800 border-gray-200"

# Helper function to escape single quotes for SQL
function Escape-Sql($str) {
    if ($null -eq $str) { return "" }
    return $str -replace "'", "''"
}

foreach ($row in $csvData) {
    # Parse Date (dd/MM/yyyy)
    try {
        $dateObj = [DateTime]::ParseExact($row."Publish Date", "dd/MM/yyyy", $null)
        $date = $dateObj.Day
        $month = $dateObj.Month - 1 # 0-indexed month for DB
        $year = $dateObj.Year
    }
    catch {
        Write-Warning "Could not parse date: $($row.'Publish Date'). Skipping row."
        continue
    }

    # Map Title
    $title = Escape-Sql $row.Title

    # Map Description (Description + Link)
    $descText = Escape-Sql $row.Description
    $link = Escape-Sql $row.Link
    $desc = ""
    if ($descText -and $link) {
        $desc = "$descText`n`nLink: $link"
    }
    elseif ($descText) {
        $desc = $descText
    }
    elseif ($link) {
        $desc = "Link: $link"
    }

    # Map Type/Category
    $type = "Task"
    $category = "general"
    
    switch ($row."Project Types") {
        "Blog post" { $type = "Blog"; $category = "blogPosts" }
        "Social Campaign" { $type = "Social"; $category = "socialMedia" }
        "Social post" { $type = "Social"; $category = "socialMedia" }
        "Newsletter" { $type = "Marketing"; $category = "marketingOps" }
        "Mailchimp" { $type = "Marketing"; $category = "marketingOps" }
        "Promotion plan" { $type = "Strategy"; $category = "strategicPlanning" }
        "Event" { $type = "Event"; $category = "strategicPlanning" } # Mapping Event to Strategy/Strategic for now or generic
        "Eblast" { $type = "Marketing"; $category = "marketingOps" }
        "Press release" { $type = "Marketing"; $category = "marketingOps" }
        "Website content" { $type = "Website"; $category = "general" }
        "Podcast" { $type = "Blog"; $category = "blogPosts" } # Map Podcast to Blog/Content
        Default { 
            # Fallback based on text if needed, or keep default
            if ($row."Project Types" -match "Social") { $type = "Social"; $category = "socialMedia" }
        }
    }

    # Map Assignee
    $assignee = $defaultAssignee
    if ($assigneeMap.ContainsKey($row."Project Owner")) {
        $assignee = $assigneeMap[$row."Project Owner"]
    }

    # Map Status
    $status = "planned"
    if ($row.Status -eq "Completed" -or $row.Status -eq "Published") { $status = "completed" }
    elseif ($row.Status -eq "In Progress") { $status = "in-progress" }
    
    # Map Color
    $color = $defaultColor
    if ($colorMap.ContainsKey($row."Label Color")) {
        $color = $colorMap[$row."Label Color"]
    }

    # Map Tags
    $tagsSql = "NULL"
    if ($row.Tags) {
        $tagsArray = $row.Tags -split ","
        $escapedTags = @()
        foreach ($tag in $tagsArray) {
            $trimmedTag = $tag.Trim()
            if ($trimmedTag) {
                $escapedTags += "'" + (Escape-Sql $trimmedTag) + "'"
            }
        }
        if ($escapedTags.Count -gt 0) {
            $tagsSql = "ARRAY[" + ($escapedTags -join ", ") + "]"
        }
    }

    $sql = "INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, assignees, status, color, priority, tags, created_by) VALUES ('$title', '$desc', '$type', '$category', $date, $month, $year, '09:00', $assignee, ARRAY[$assignee], '$status', '$color', 'medium', $tagsSql, 1);"
    $sqlContent += $sql + "`n"
}

$sqlContent += "COMMIT;`n"
$sqlContent += "SELECT 'Imported ' || (SELECT count(*) FROM tasks)::text || ' tasks.' as status;`n"

$sqlContent | Out-File -FilePath $outputPath -Encoding UTF8
Write-Host "SQL script generated at $outputPath"
