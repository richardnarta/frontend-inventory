# HidupBaru POS — Cashier PC Setup

Folder berisi script setup otomatis untuk PC kasir.

## Tujuan

Sekali jalankan, script otomatis konfigurasi:
1. Printer queue Windows "FK80 Printer" terpasang di port USB yang benar
2. Printer tersebut di-set sebagai default printer
3. Shortcut "HidupBaru POS" di Desktop yang launch Chrome dalam **app mode + silent print**

Setelah setup, kasir cukup **double-click icon "HidupBaru POS" di Desktop**. Saat klik Cetak di aplikasi, struk langsung keluar **tanpa dialog konfirmasi**.

## Prasyarat

**Driver Panda FK80 harus terinstall dulu.** Script ini cuma konfigurasi, tidak install driver.

Install driver dari:
- CD bawaan printer (cari `FK80 Printer Driver Install.exe`), atau
- Download dari website Panda / search "FK80 Printer Driver Windows"

Setelah driver terinstall, printer Panda harus dalam keadaan **menyala dan nyolok ke USB PC**.

Browser **Chrome atau Edge** harus terinstall (script otomatis pakai yang ada).

## Cara pakai

1. Copy folder `setup/` ke PC kasir (atau langsung jalankan dari USB flashdrive)
2. Pastikan printer Panda nyala dan nyolok USB
3. **Double-click `setup_hidupbaru.bat`**
4. Klik "Yes" pada prompt UAC (admin rights diperlukan untuk daftar printer)
5. Tunggu sampai muncul "SETUP SELESAI"
6. Tutup jendela
7. Buka shortcut "HidupBaru POS" yang baru muncul di Desktop

## Apa yang script lakukan

| Step | Aksi |
|------|------|
| 1 | Self-elevate ke admin (UAC) |
| 2 | Deteksi printer Panda via USB VID `0FE6` / PID `811E` |
| 3 | Cari port USB (`USBxxx`) yang dipakai printer — dinamis per colok |
| 4 | Pastikan driver `POS80ENG` / `FK80ENG` ter-install |
| 5 | Buat / update queue "FK80 Printer" ke port yang benar |
| 6 | Set "FK80 Printer" sebagai default printer Windows |
| 7 | Cari Chrome (fallback Edge) |
| 8 | Bikin Desktop shortcut dengan flag `--app` + `--kiosk-printing` |

## Re-run / troubleshooting

Aman di-jalankan berulang. Kalau printer dicolok ulang dan dapat port USB baru, jalankan script lagi → port-nya akan ter-update otomatis.

### Printer tidak terdeteksi

- Cek di Device Manager apakah ada device "80Series2" atau sejenisnya di section "USB Devices"
- Coba colok ke port USB lain
- Pastikan printer menyala (lampu LED ON)

### Driver belum terinstall

Script akan exit dengan pesan "Driver FK80 belum ter-install." Install driver dulu, baru jalankan ulang.

### Shortcut sudah ada tapi mau di-replace

Script akan overwrite shortcut existing. Aman di-rerun.

### Mau pakai URL beda

Edit `setup_hidupbaru.ps1`, ubah baris:
```powershell
$APP_URL = 'https://hidupbaru.benangsukses.shop'
```

## Cara verifikasi silent print jalan

1. Buka shortcut "HidupBaru POS"
2. Login → menu Data Penjualan
3. Klik Detail pada salah satu transaksi
4. Klik tombol Cetak
5. **Struk harus langsung keluar dari printer tanpa muncul dialog Print**

Kalau dialog Print masih muncul, berarti shortcut tidak pakai flag `--kiosk-printing`. Cek shortcut dengan klik kanan → Properties → tab Shortcut → field "Target" harus berisi `--kiosk-printing`.
