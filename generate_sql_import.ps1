
$csvPath = "c:\Users\ghisl\Desktop\MMC Calendar with Claude\project_report.csv"
$outputPath = "c:\Users\ghisl\Desktop\MMC Calendar with Claude\import-csv-data.sql"

# Mappings
$assigneeMap = @{
    "Tactical Squad"          = 4
    "Tactical Squad - Backup" = 4
}
$defaultAssignee = 4

$colorMap = @{
    "FF0000" = "bg-red-100 text-red-800 border-red-200"
    "FFE900" = "bg-yellow-100 text-yellow-800 border-yellow-200"
    "21FF00" = "bg-green-100 text-green-800 border-green-200"
    "FFAA00" = "bg-orange-100 text-orange-800 border-orange-200"
}
$defaultColor = "bg-gray-100 text-gray-800 border-gray-200"

# Helper to escape single quotes for SQL
function Escape-Sql($str) {
    if ([string]::IsNullOrEmpty($str)) { return "" }
    return $str.Replace("'", "''")
}

# Read CSV
$data = Import-Csv -Path $csvPath

$sqlContent = @("-- Generated SQL Import Script from project_report.csv")
$sqlContent += "BEGIN;"

foreach ($row in $data) {
    # Parse Date (d/M/yyyy)
    try {
        $dateObj = [datetime]::ParseExact($row."Publish Date", "d/M/yyyy", $null)
        $date = $dateObj.Day
        $month = $dateObj.Month - 1 # 0-indexed month
        $year = $dateObj.Year
    }
    catch {
        try {
            $dateObj = [datetime]::ParseExact($row."Publish Date", "dd/MM/yyyy", $null)
            $date = $dateObj.Day
            $month = $dateObj.Month - 1 # 0-indexed month
            $year = $dateObj.Year
        }
        catch {
            Write-Host "Error parsing date for row: $($row.Title)"
            continue
        }
    }

    # Map Assignee
    $assignee = $defaultAssignee
    if ($assigneeMap.ContainsKey($row."Project Owner")) {
        $assignee = $assigneeMap[$row."Project Owner"]
    }

    # Map Color
    $color = $defaultColor
    if ($colorMap.ContainsKey($row."Label Color")) {
        $color = $colorMap[$row."Label Color"]
    }

    # Map Status
    $status = "planned"
    if ($row.Status -eq "Completed") { $status = "completed" }
    elseif ($row.Status -eq "In Progress") { $status = "in-progress" }
    
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
    }

    $title = Escape-Sql $row.Title
    $desc = Escape-Sql $row.Description
    $link = Escape-Sql $row.Link
    
    # Combine Description and Link if link exists
    if ($link) {
        if ($desc) { $desc = "$desc`n`nLink: $link" }
        else { $desc = "Link: $link" }
    }

    $sql = "INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, assignees, status, color, priority, created_by) VALUES ('$title', '$desc', '$type', '$category', $date, $month, $year, '09:00', $assignee, ARRAY[$assignee], '$status', '$color', 'medium', 1);"
    $sqlContent += $sql
}

$sqlContent += "COMMIT;"
$sqlContent += "SELECT 'Imported ' || (SELECT count(*) FROM tasks)::text || ' tasks.' as status;"

$sqlContent | Out-File -FilePath $outputPath -Encoding UTF8
Write-Host "SQL script generated at $outputPath"
