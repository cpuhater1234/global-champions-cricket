# Optimize GCC v116 release HTML by extracting inline base64 images to external files
$ErrorActionPreference = "Stop"

$htmlPath = 'GCC_v116_release (1).html'
$outPath = 'GCC_v116_release_optimized.html'

Write-Output "Reading $htmlPath..."
$content = [System.IO.File]::ReadAllText($htmlPath)
Write-Output "Original size: $($content.Length) bytes"

# 1. Replace stadium base64 with relative path
Write-Output "Replacing stadium image..."
# Find the stadium value (may have newlines in the key)
$stadiumPattern = '"stadium":\s*"data:image/webp;base64,[A-Za-z0-9+/=]+"'
$match = [regex]::Match($content, $stadiumPattern)
if ($match.Success) {
    $content = $content.Replace($match.Value, '"stadium":"assets/stadium.webp"')
    Write-Output "  Stadium replaced"
} else {
    Write-Output "  WARNING: Stadium pattern not found!"
}

# 2. Replace all venue dataUrls with relative paths, one at a time (sequential)
Write-Output "Replacing venue images..."
$venuePattern = '"dataUrl":"data:image/webp;base64,[A-Za-z0-9+/=]+"'
$counter = 0
while ($true) {
    $match = [regex]::Match($content, $venuePattern)
    if (-not $match.Success) { break }
    $replacement = '"dataUrl":"assets/venues/venue-{0:D3}.webp"' -f $counter
    $content = $content.Replace($match.Value, $replacement)
    $counter++
}
Write-Output "  Replaced $counter venue dataUrls"

# 3. Replace CSS base64 images with relative paths
Write-Output "Replacing CSS base64 images..."
# --g8-cricket-art (webp base64 in CSS url())
$cssPattern1 = 'url\("data:image/webp;base64,[A-Za-z0-9+/=]+"\)'
$cssCounter1 = 0
while ($true) {
    $match = [regex]::Match($content, $cssPattern1)
    if (-not $match.Success) { break }
    $content = $content.Replace($match.Value, 'url("assets/css/cricket-art.webp")')
    $cssCounter1++
}
Write-Output "  Replaced $cssCounter1 CSS webp image(s)"

# --g8-canvas-grain (SVG base64 in CSS url())
$cssPattern2 = 'url\("data:image/svg+xml;base64,[A-Za-z0-9+/=]+"\)'
$cssCounter2 = 0
while ($true) {
    $match = [regex]::Match($content, $cssPattern2)
    if (-not $match.Success) { break }
    $content = $content.Replace($match.Value, 'url("assets/css/canvas-grain.svg")')
    $cssCounter2++
}
Write-Output "  Replaced $cssCounter2 CSS SVG image(s)"

# Report remaining base64 references
$remaining = [regex]::Matches($content, 'data:image/[^;]+;base64,').Count
Write-Output "  Remaining base64 references: $remaining"

# Write output
[System.IO.File]::WriteAllText($outPath, $content)
$origSize = (Get-Item $htmlPath).Length
$newSize = (Get-Item $outPath).Length
Write-Output "Optimized size: $newSize bytes"
Write-Output "Savings: $($origSize - $newSize) bytes ($([math]::Round(($origSize - $newSize) / $origSize * 100, 1))% smaller)"
Write-Output "Output written to $outPath"
