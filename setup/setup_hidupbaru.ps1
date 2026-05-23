# ====================================================================
# HidupBaru POS - One-click cashier PC setup
#
# Steps performed:
#   1. Self-elevate (UAC prompt) if not running as admin
#   2. Detect connected Panda PRJ-80USE printer (USB VID 0FE6 / PID 811E)
#   3. Discover the dynamic USB printer port assigned by Windows (USBxxx)
#   4. Verify FK80 driver is installed (POS80ENG / FK80ENG)
#   5. Create or re-point "FK80 Printer" queue to the correct USB port
#   6. Set "FK80 Printer" as the default Windows printer
#   7. Create a Desktop shortcut "HidupBaru POS" that launches Chrome with
#      --app + --kiosk-printing flags pointing at the production URL
# ====================================================================

$ErrorActionPreference = 'Stop'

$APP_URL       = 'https://hidupbaru.benangsukses.shop'
$APP_NAME      = 'HidupBaru POS'
$SHORTCUT_NAME = 'HidupBaru POS.lnk'
$PRINTER_NAME  = 'FK80 Printer'
$PANDA_VID     = '0FE6'
$PANDA_PID     = '811E'
$PREFERRED_DRIVERS = @('POS80ENG', 'FK80ENG')


function Write-Step($msg)    { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)      { Write-Host "   [OK] $msg" -ForegroundColor Green }
function Write-Warn2($msg)   { Write-Host "   [WARN] $msg" -ForegroundColor Yellow }
function Write-Fail($msg)    { Write-Host "   [ERR] $msg" -ForegroundColor Red }


# --- 1. Self-elevate ---------------------------------------------------
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal(
    [Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)) {
    Write-Host "Script needs admin rights. Re-launching with UAC prompt..."
    Start-Process powershell.exe `
        -ArgumentList @('-ExecutionPolicy', 'Bypass', '-NoProfile', '-File', "`"$PSCommandPath`"") `
        -Verb RunAs
    exit
}

Write-Host "================================================================"
Write-Host "  HidupBaru POS - Cashier PC Setup"
Write-Host "================================================================"


# --- 2. Detect Panda printer USB device --------------------------------
Write-Step "Mencari printer Panda yang ter-colok (VID=$PANDA_VID PID=$PANDA_PID)..."
$pandaUsb = Get-PnpDevice -PresentOnly -ErrorAction SilentlyContinue |
    Where-Object { $_.InstanceId -match "USB\\VID_$PANDA_VID&PID_$PANDA_PID" } |
    Select-Object -First 1

if (-not $pandaUsb) {
    Write-Fail "Printer Panda tidak terdeteksi."
    Write-Host "         Pastikan printer:"
    Write-Host "           - Sudah dinyalakan"
    Write-Host "           - Kabel USB tersambung ke PC ini"
    Write-Host "           - Driver FK80 sudah ter-install"
    exit 1
}
Write-Ok "Printer terdeteksi: $($pandaUsb.FriendlyName)"


# --- 3. Discover USB printer port (USBxxx) -----------------------------
Write-Step "Mencari port USB yang dipakai printer..."
# usbprint driver creates a child node under USBPRINT\* with the port name in its InstanceId
$usbPrintNode = Get-PnpDevice -PresentOnly -ErrorAction SilentlyContinue |
    Where-Object { $_.InstanceId -match '^USBPRINT\\.*USB(\d+)$' } |
    Select-Object -First 1

$portName = $null
if ($usbPrintNode -and $usbPrintNode.InstanceId -match 'USB(\d+)$') {
    $portName = "USB$($Matches[1])"
    Write-Ok "Port terdeteksi: $portName"
} else {
    Write-Warn2 "Tidak menemukan port USBxxx via USBPRINT enumerator."
    Write-Warn2 "Akan dicoba auto-detect dengan menambahkan ke USB002, USB003 secara berurutan."
}


# --- 4. Verify FK80 driver is installed --------------------------------
Write-Step "Memastikan driver FK80 (POS80ENG/FK80ENG) ter-install..."
$installedDrivers = Get-PrinterDriver -ErrorAction SilentlyContinue
$driverToUse = $null
foreach ($d in $PREFERRED_DRIVERS) {
    if ($installedDrivers | Where-Object { $_.Name -eq $d }) {
        $driverToUse = $d
        break
    }
}

if (-not $driverToUse) {
    Write-Fail "Driver FK80 belum ter-install."
    Write-Host "         Silakan install dulu 'FK80 Printer Driver Install.exe'"
    Write-Host "         dari CD/installer Panda. Kemudian jalankan ulang script ini."
    exit 1
}
Write-Ok "Driver terdeteksi: $driverToUse"


# --- 5. Create / fix the FK80 Printer queue ----------------------------
Write-Step "Konfigurasi printer queue '$PRINTER_NAME'..."
$existing = Get-Printer -Name $PRINTER_NAME -ErrorAction SilentlyContinue

if ($existing) {
    Write-Ok "Queue '$PRINTER_NAME' sudah ada (driver: $($existing.DriverName), port: $($existing.PortName))."
    if ($portName -and $existing.PortName -ne $portName) {
        Write-Step "Memindahkan queue ke port $portName..."
        Set-Printer -Name $PRINTER_NAME -PortName $portName
        Write-Ok "Port di-update ke $portName."
    }
} else {
    if (-not $portName) {
        # Fallback: try common USB ports until one works
        $candidates = @('USB003', 'USB002', 'USB004', 'USB005')
        foreach ($p in $candidates) {
            try {
                Add-Printer -Name $PRINTER_NAME -DriverName $driverToUse -PortName $p -ErrorAction Stop
                $portName = $p
                Write-Ok "Queue dibuat di port $p (auto-pick)."
                break
            } catch {
                continue
            }
        }
        if (-not $portName) {
            Write-Fail "Gagal menambahkan queue di semua port kandidat."
            exit 1
        }
    } else {
        Add-Printer -Name $PRINTER_NAME -DriverName $driverToUse -PortName $portName
        Write-Ok "Queue '$PRINTER_NAME' berhasil dibuat di port $portName."
    }
}


# --- 6. Set as default printer -----------------------------------------
Write-Step "Set '$PRINTER_NAME' sebagai default printer Windows..."
try {
    $printerInst = Get-CimInstance -ClassName Win32_Printer -Filter "Name='$PRINTER_NAME'"
    $result = Invoke-CimMethod -InputObject $printerInst -MethodName SetDefaultPrinter
    if ($result.ReturnValue -eq 0) {
        Write-Ok "Default printer = '$PRINTER_NAME'."
    } else {
        Write-Warn2 "SetDefaultPrinter return code: $($result.ReturnValue) (mungkin Windows mengatur default secara otomatis)."
    }
} catch {
    Write-Warn2 "Tidak bisa set default printer otomatis: $_"
    Write-Warn2 "Silakan set manual di: Settings > Bluetooth & devices > Printers & scanners."
}


# --- 7. Locate Chrome (or Edge fallback) -------------------------------
Write-Step "Mencari browser Chrome / Edge..."
$browserCandidates = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
)
$browserExe = $browserCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $browserExe) {
    Write-Fail "Tidak ditemukan Chrome atau Edge."
    Write-Host "         Install Google Chrome dari https://www.google.com/chrome/"
    Write-Host "         lalu jalankan ulang script ini."
    exit 1
}
$browserName = if ($browserExe -match 'chrome\.exe$') { 'Chrome' } else { 'Edge' }
Write-Ok "Browser: $browserName ($browserExe)"


# --- 8. Create Desktop shortcut ----------------------------------------
Write-Step "Membuat shortcut Desktop '$APP_NAME'..."
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop $SHORTCUT_NAME

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath       = $browserExe
$shortcut.Arguments        = "--app=`"$APP_URL`" --kiosk-printing --no-first-run --no-default-browser-check"
$shortcut.WorkingDirectory = Split-Path $browserExe
$shortcut.IconLocation     = "$browserExe,0"
$shortcut.Description      = "$APP_NAME (silent thermal print via FK80)"
$shortcut.Save()
Write-Ok "Shortcut dibuat: $shortcutPath"


# --- Done ---------------------------------------------------------------
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  SETUP SELESAI" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Printer queue : $PRINTER_NAME (port $portName)"
Write-Host "  Default       : $PRINTER_NAME"
Write-Host "  Shortcut      : $shortcutPath"
Write-Host "  URL           : $APP_URL"
Write-Host ""
Write-Host "  Cara pakai:"
Write-Host "    Double-click icon '$APP_NAME' di Desktop. Klik Cetak di"
Write-Host "    aplikasi -> struk langsung keluar tanpa dialog konfirmasi."
Write-Host ""
