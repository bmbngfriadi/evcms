# Panduan Logika & Kalkulasi Sistem EVCMS

Dokumen ini merangkum secara detail bagaimana EVCMS (Electric Vehicle Charging Management System) menghitung setiap poin, estimasi biaya, dan pemakaian energi. Sistem ini menggunakan data matematika dasar namun sangat akurat karena mendasarkan perhitungannya pada spesifikasi teknis (Kapasitas Baterai) dan data riil dari _dashboard_ kendaraan.

---

## 1. Persentase Baterai Terisi (SOC Added)
**Apa ini?**
Seberapa banyak persentase baterai yang bertambah selama sesi pengecasan berlangsung.

**Rumus:**
`SOC Setelah (Akhir) - SOC Sebelum (Awal)`

**Contoh:**
Mobil datang dengan sisa baterai 20% (SOC Before). Diisi sampai penuh 100% (SOC After).
*Maka:* `100% - 20% = 80%` (Baterai bertambah 80%).

---

## 2. Estimasi Daya yang Masuk (Estimated Battery Energy Added)
**Apa ini?**
Menghitung jumlah daya listrik (dalam satuan **kWh**) yang secara matematis masuk dan tersimpan ke dalam baterai kendaraan pada sesi pengecasan tersebut.

**Rumus:**
`(SOC Added / 100) x Kapasitas Baterai Mobil`

**Contoh:**
Baterai bertambah 80% (seperti contoh di atas). Kapasitas total baterai mobil tersebut adalah 60 kWh.
*Maka:* `(80 / 100) x 60 kWh = 48 kWh`. (Ada sekitar 48 kWh listrik yang masuk ke mobil).

---

## 3. Jarak Tempuh (Distance)
**Apa ini?**
Seberapa jauh mobil melaju sejak **pengecasan terakhir** hingga pengecasan saat ini. Angka ini baru bisa dihitung jika mobil sudah pernah dicas dan tercatat sebelumnya di sistem.

**Rumus:**
`Odometer (KM) Saat Ini - Odometer Pengecasan Terakhir`

**Contoh:**
Saat dicas kemarin, odometernya di 15.000 KM. Saat dicas sekarang, odometernya di 15.250 KM.
*Maka:* `15.250 - 15.000 = 250 KM`. (Mobil sudah berjalan sejauh 250 KM).

---

## 4. Pemakaian Energi Kendaraan (Estimated Vehicle Energy)
**Apa ini?**
Sistem menghitung berapa kWh listrik yang benar-benar **dihabiskan/dikonsumsi** oleh mobil untuk menempuh jarak (Distance) tersebut. Penghitungan ini menggunakan data konsumsi aktual yang biasanya ditampilkan di layar _dashboard_ mobil (dalam bentuk kWh/100km).

**Rumus:**
`(Jarak Tempuh x Konsumsi Dashboard) / 100`

**Contoh:**
Mobil menempuh 250 KM. Di layar _dashboard_ supir, rata-rata konsumsinya adalah 15 kWh per 100 KM.
*Maka:* `(250 x 15) / 100 = 37.5 kWh`. (Selama melaju 250 KM, mobil menghabiskan 37.5 kWh).

> [!TIP]
> **Kenapa Daya Masuk dan Energi Terpakai (Poin 2 & 4) Berbeda?**
> Hal ini sangat wajar karena mobil mungkin tidak dicas saat baterainya benar-benar habis, atau karena efisiensi _regenerative braking_ saat berkendara.

---

## 5. Estimasi Biaya Pengecasan (Estimated Charging Cost)
**Apa ini?**
Seberapa banyak nilai Rupiah (Rp) yang harus dibayar atau ditagihkan untuk sesi pengisian daya yang baru saja dilakukan.

**Rumus:**
`Daya Masuk (Poin 2) x Harga Tarif per kWh`

**Contoh:**
Daya yang masuk 48 kWh. Harga tarif listrik saat itu Rp 2.500 per kWh.
*Maka:* `48 x Rp 2.500 = Rp 120.000`.

---

## 6. Estimasi Biaya Perjalanan (Estimated Energy Cost)
**Apa ini?**
Berapa nilai uang (Rp) ekuivalen energi listrik yang benar-benar **terbakar/habis dipakai** untuk melaju sejak pengecasan sebelumnya. Ini berguna untuk pelaporan keuangan (biaya operasional nyata).

**Rumus:**
`Energi Terpakai (Poin 4) x Harga Tarif per kWh`

**Contoh:**
Listrik yang dipakai jalan sebesar 37.5 kWh. Tarif listrik Rp 2.500/kWh.
*Maka:* `37.5 x Rp 2.500 = Rp 93.750`.

---

## 7. Biaya per Kilometer (Cost per KM)
**Apa ini?**
Metrik untuk mengetahui efisiensi finansial kendaraan. Berapa Rupiah biaya bahan bakar (listrik) yang dikeluarkan untuk menjalankan mobil sejauh 1 Kilometer. Angka ini bagus untuk mengukur kehematan supir/kendaraan.

**Rumus:**
`Estimasi Biaya Perjalanan (Poin 6) / Jarak Tempuh (Poin 3)`

**Contoh:**
Biaya perjalanan habis Rp 93.750 untuk jarak 250 KM.
*Maka:* `93.750 / 250 = Rp 375 per KM`. (Sangat murah dibandingkan bensin yang bisa Rp 1.000 - Rp 1.500 per KM).

---

> [!NOTE]
> Semua angka perhitungan (Desimal) pada sistem otomatis dibulatkan maksimal ke 2-3 angka di belakang koma untuk akurasi data sistem EVCMS.
