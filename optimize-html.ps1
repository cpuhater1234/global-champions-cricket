# Optimize GCC v116 release HTML â€” single clean pass from original
$ErrorActionPreference = "Stop"

$htmlPath = 'GCC_v116_release (1).html'
$outPath = 'GCC_v116_release_optimized.html'

Write-Output "Reading $htmlPath..."
$content = [System.IO.File]::ReadAllText($htmlPath)
$origLen = $content.Length
Write-Output "Original size: $origLen bytes"

# --- 1. Stadium image ---
Write-Output "Replacing stadium image..."
$stadiumPattern = '"stadium":\s*"data:image/webp;base64,[A-Za-z0-9+/=]+"'
$match = [regex]::Match($content, $stadiumPattern)
if ($match.Success) {
    $content = $content.Replace($match.Value, '"stadium":"assets/stadium.webp"')
    Write-Output "  Stadium replaced"
} else {
    Write-Output "  WARNING: Stadium pattern not found!"
}

# --- 2. Venue images ---
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

# --- 3. CSS cricket-art webp ---
Write-Output "Replacing CSS cricket-art..."
$cssArtPattern = 'url\("data:image/webp;base64,[A-Za-z0-9+/=]+"\)'
while ($true) {
    $match = [regex]::Match($content, $cssArtPattern)
    if (-not $match.Success) { break }
    $content = $content.Replace($match.Value, 'url("assets/css/cricket-art.webp")')
}
Write-Output "  Cricket-art CSS replaced"

# --- 4. CSS canvas-grain SVG ---
Write-Output "Replacing CSS canvas-grain SVG..."
$svgPrefix = 'data:image/svg+xml;base64,'
$svgIdx = $content.IndexOf($svgPrefix)
if ($svgIdx -ge 0) {
    $start = $svgIdx + $svgPrefix.Length
    $endIdx = $content.IndexOf('")', $start)
    $fullOld = $content.Substring($svgIdx, $endIdx - $svgIdx + 2)
    $content = $content.Replace($fullOld, 'assets/css/canvas-grain.svg')
    Write-Output "  Canvas-grain SVG replaced"
} else {
    Write-Output "  Canvas-grain SVG not found"
}

# --- 5. All font base64 (woff) ---
Write-Output "Replacing font base64 embeds..."
$fontPattern = 'src:url\(data:font/woff;base64,[A-Za-z0-9+/=]+\)'
$fontCounter = 0
while ($true) {
    $match = [regex]::Match($content, $fontPattern)
    if (-not $match.Success) { break }
    $fname = 'font-{0:D2}.woff' -f $fontCounter
    $fpath = 'assets/css/' + $fname
    $b64Start = $match.Value.IndexOf('base64,') + 7
    $b64 = $match.Value.Substring($b64Start).TrimEnd(')')
    $b64 = $b64 -replace '\s',''
    $bytes = [Convert]::FromBase64String($b64)
    [System.IO.File]::WriteAllBytes($fpath, $bytes)
    Write-Output ("  " + $fname + ": " + $bytes.Length + " bytes")
    $content = $content.Replace($match.Value, 'src:url("' + $fpath + '")')
    $fontCounter++
}
Write-Output "  Replaced $fontCounter font embeds"

# --- 6. Lazy-load venue images ---
Write-Output "Changing venue images to lazy loading..."
$oldLoad = 'decoding="sync" loading="eager" fetchpriority="high"'
$newLoad = 'decoding="async" loading="lazy" fetchpriority="low"'
$loadCount = ($content -split [regex]::Escape($oldLoad), -1).Count - 1
$content = $content.Replace($oldLoad, $newLoad)
Write-Output "  Changed $loadCount loading attribute(s)"

# --- Report remaining base64 ---
$remainingImg = [regex]::Matches($content, 'data:image/[^;]+;base64,').Count
$remainingFont = [regex]::Matches($content, 'data:font/[^;]+;base64,').Count
Write-Output "  Remaining data:image base64: $remainingImg"
Write-Output "  Remaining data:font base64: $remainingFont"

# --- Write output ---
[System.IO.File]::WriteAllText($outPath, $content)
$newSize = (Get-Item $outPath).Length
Write-Output ""
Write-Output "=== RESULTS ==="
Write-Output "Original:  $origLen bytes"
Write-Output "Optimized: $newSize bytes"
Write-Output "Saved:     $($origLen - $newSize) bytes ($([math]::Round(($origLen - $newSize) / $origLen * 100, 1))% smaller)"
Write-Output "Output:    $outPath"