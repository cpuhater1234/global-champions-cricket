#!/usr/bin/env powershell.exe
# check_missing.ps1 — Verify every file referenced by CI workflows and repo docs exists on disk.
# Usage: powershell.exe -ExecutionPolicy Bypass -File qa/check_missing.ps1
#
# Exits non-zero if any referenced path is missing, supporting Issue #2 (repo restructure)
# and Issue #3 (release progression guardrails) by ensuring no dangling references.

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$missing = @()
$checked = @{}

function Test-ReferencedPath {
    param([string]$Path)
    if ($checked.ContainsKey($Path)) { return }
    $checked[$Path] = $true
    $full = Resolve-Path (Join-Path $root $Path) -ErrorAction SilentlyContinue
    if (-not $full) {
        $missing += $Path
        Write-Host "MISSING: $Path" -ForegroundColor Red
    }
}

# --- CI-referenced files from CONTRIBUTING.md / REPO_MAP.md ---
$ciFiles = @(
    "captaincy_layer_v116.py",
    "qa/native_two_tab_v116.py",
    "qa/native_v116_signing_css.py",
    ".github/workflows/v116-native-acceptance.yml",
    ".github/workflows/v116-source-identity.yml",
    "GCC_v116_release (1).html"
)
foreach ($f in $ciFiles) { Test-ReferencedPath $f }

# --- Docs-referenced key files ---
$docFiles = @(
    "docs/REPO_MAP.md",
    "CONTRIBUTING.md",
    "docs/WORKFLOW.md",
    "docs/REPOSITORY_GUIDE.md",
    "docs/release/V116_HANDOFF.md",
    "docs/release/CURRENT_V116_REVIEW_HANDOFF.md",
    "docs/release/V116_SOURCE_RECONCILIATION.md",
    "docs/release/V116_BLOCK_LINEAGE.md",
    "docs/release/V116_CASCADE_INSPECTION.md",
    "docs/release/V116_SIGNING_WIDTH_REVIEW.md",
    "qa/check_candidate.py",
    "qa/visual/pixel-diff.py",
    "qa/visual/baselines/report.json",
    "v116/canonical/template.html",
    "v116/canonical/manifest.json"
)
foreach ($f in $docFiles) { Test-ReferencedPath $f }

# --- v116 canonical source blocks (extract .css/.js/.html paths from manifest.json) ---
$manifestPath = Join-Path $root "v116/canonical/manifest.json"
if (Test-Path -LiteralPath $manifestPath) {
    $manifestContent = Get-Content -Path $manifestPath -Raw
    $pattern = '"([^"]+\.(?:css|js|html))"'
    $manifestStrings = [regex]::Matches($manifestContent, $pattern)
    foreach ($ms in $manifestStrings) {
        $p = $ms.Groups[1].Value
        Test-ReferencedPath "v116/canonical/$p"
    }
}

Write-Host ""
if ($missing.Count -eq 0) {
    Write-Host "PASS: all referenced files exist on disk" -ForegroundColor Green
    exit 0
} else {
    Write-Host ("FAIL: " + $missing.Count + " referenced file(s) missing") -ForegroundColor Red
    exit 1
}
