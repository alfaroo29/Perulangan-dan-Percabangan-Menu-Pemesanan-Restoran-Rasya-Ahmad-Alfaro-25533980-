// ===== DATA MENU (array berisi objek) =====
const menu = [
  { id: 1,  kategori: "Makanan", nama: "Nasi Goreng Kampung", harga: 25000 },
  { id: 2,  kategori: "Makanan", nama: "Ayam Bakar Madu",     harga: 32000 },
  { id: 3,  kategori: "Makanan", nama: "Soto Ayam",           harga: 22000 },
  { id: 4,  kategori: "Makanan", nama: "Gado-gado",           harga: 20000 },
  { id: 5,  kategori: "Minuman", nama: "Es Teh Manis",        harga: 6000  },
  { id: 6,  kategori: "Minuman", nama: "Es Jeruk",            harga: 9000  },
  { id: 7,  kategori: "Minuman", nama: "Kopi Tubruk",         harga: 10000 },
  { id: 8,  kategori: "Camilan", nama: "Pisang Goreng",       harga: 12000 },
  { id: 9,  kategori: "Camilan", nama: "Tahu Crispy",         harga: 11000 },
  { id: 10, kategori: "Camilan", nama: "Kentang Goreng",      harga: 14000 }
];
const daftarKategori = ["Semua", "Makanan", "Minuman", "Camilan"];

let keranjang = [];        // isi: { id, jumlah }
let filterAktif = "Semua"; // kategori yang sedang dipilih

function rupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function cariMenu(id) {
  for (let i = 0; i < menu.length; i++) {      // PERULANGAN: mencari data
    if (menu[i].id === id) {                   // PERCABANGAN: ketemu atau tidak
      return menu[i];
    }
  }
  return null;
}

// ===== TAMPILKAN TOMBOL FILTER (perulangan for...of) =====
function tampilkanFilter() {
  const wadah = document.getElementById("filter");
  wadah.innerHTML = "";
  for (const kategori of daftarKategori) {
    const tombol = document.createElement("button");
    tombol.textContent = kategori;
    if (kategori === filterAktif) {            // percabangan: tandai tombol aktif
      tombol.className = "aktif";
    }
    tombol.onclick = function () {
      filterAktif = kategori;
      tampilkanFilter();
      tampilkanMenu();
    };
    wadah.appendChild(tombol);
  }
}

// ===== TAMPILKAN MENU (perulangan + percabangan filter) =====
function tampilkanMenu() {
  let html = "";
  for (let i = 0; i < menu.length; i++) {
    const item = menu[i];
    if (filterAktif !== "Semua" && item.kategori !== filterAktif) {
      continue; // lewati menu yang tidak sesuai filter
    }
    html += '<div class="kartu">' +
              '<span class="kat">' + item.kategori + '</span>' +
              '<h3>' + item.nama + '</h3>' +
              '<div class="harga">' + rupiah(item.harga) + '</div>' +
              '<button onclick="tambah(' + item.id + ')">Tambah</button>' +
            '</div>';
  }
  document.getElementById("daftarMenu").innerHTML = html;
}

// ===== TAMBAH / KURANGI PESANAN =====
function tambah(id) {
  let ditemukan = false;
  for (let i = 0; i < keranjang.length; i++) {
    if (keranjang[i].id === id) {              // sudah ada: tambah jumlah
      keranjang[i].jumlah++;
      ditemukan = true;
      break;
    }
  }
  if (!ditemukan) {                            // belum ada: masukkan baru
    keranjang.push({ id: id, jumlah: 1 });
  }
  tampilkanKeranjang();
}

function kurangi(id) {
  for (let i = 0; i < keranjang.length; i++) {
    if (keranjang[i].id === id) {
      keranjang[i].jumlah--;
      if (keranjang[i].jumlah <= 0) {          // jumlah habis: hapus dari keranjang
        keranjang.splice(i, 1);
      }
      break;
    }
  }
  tampilkanKeranjang();
}

// ===== HITUNG TOTAL (percabangan bertingkat untuk diskon) =====
function hitungTotal() {
  let subtotal = 0;
  for (let i = 0; i < keranjang.length; i++) {
    subtotal += cariMenu(keranjang[i].id).harga * keranjang[i].jumlah;
  }

  let persenDiskon = 0;
  if (subtotal >= 150000) {
    persenDiskon = 15;
  } else if (subtotal >= 100000) {
    persenDiskon = 10;
  } else if (subtotal >= 50000) {
    persenDiskon = 5;
  } else {
    persenDiskon = 0;
  }

  const diskon = subtotal * persenDiskon / 100;
  const setelahDiskon = subtotal - diskon;
  const pajak = Math.round(setelahDiskon * 0.10);
  const total = setelahDiskon + pajak;

  return { subtotal, persenDiskon, diskon, pajak, total };
}

// ===== TAMPILKAN KERANJANG =====
function tampilkanKeranjang() {
  const wadah = document.getElementById("isiKeranjang");
  const ringkasan = document.getElementById("ringkasan");
  const info = document.getElementById("infoDiskon");

  if (keranjang.length === 0) {                // percabangan: keranjang kosong
    wadah.innerHTML = '<p class="kosong">Belum ada pesanan. Pilih menu di sebelah kiri.</p>';
    ringkasan.innerHTML = "";
    info.textContent = "Belanja minimal Rp 50.000 untuk mendapat diskon 5%.";
    return;
  }

  let html = "";
  for (let i = 0; i < keranjang.length; i++) {
    const item = cariMenu(keranjang[i].id);
    const jumlah = keranjang[i].jumlah;
    html += '<div class="baris">' +
              '<div>' + item.nama + '<small>' + rupiah(item.harga * jumlah) + '</small></div>' +
              '<div class="qty">' +
                '<button onclick="kurangi(' + item.id + ')" aria-label="Kurangi ' + item.nama + '">-</button>' +
                '<span>' + jumlah + '</span>' +
                '<button onclick="tambah(' + item.id + ')" aria-label="Tambah ' + item.nama + '">+</button>' +
              '</div>' +
            '</div>';
  }
  wadah.innerHTML = html;

  const h = hitungTotal();
  let baris = '<div><span>Subtotal</span><span>' + rupiah(h.subtotal) + '</span></div>';
  if (h.persenDiskon > 0) {                    // tampilkan baris diskon hanya bila ada
    baris += '<div><span>Diskon ' + h.persenDiskon + '%</span><span>- ' + rupiah(h.diskon) + '</span></div>';
  }
  baris += '<div><span>Pajak 10%</span><span>' + rupiah(h.pajak) + '</span></div>' +
           '<div class="total"><span>Total</span><span>' + rupiah(h.total) + '</span></div>';
  ringkasan.innerHTML = baris;

  // percabangan: pesan semangat menuju diskon berikutnya
  if (h.subtotal >= 150000) {
    info.textContent = "Diskon maksimal 15% sudah Anda dapatkan.";
  } else if (h.subtotal >= 100000) {
    info.textContent = "Tambah " + rupiah(150000 - h.subtotal) + " lagi untuk diskon 15%.";
  } else if (h.subtotal >= 50000) {
    info.textContent = "Tambah " + rupiah(100000 - h.subtotal) + " lagi untuk diskon 10%.";
  } else {
    info.textContent = "Tambah " + rupiah(50000 - h.subtotal) + " lagi untuk diskon 5%.";
  }
}

// ===== PROSES PEMESANAN (validasi bertingkat) =====
function pesan() {
  const nama = document.getElementById("nama").value.trim();
  const meja = parseInt(document.getElementById("meja").value);
  const bayar = document.getElementById("bayar").value;
  const pesanError = document.getElementById("pesanError");
  const struk = document.getElementById("struk");

  pesanError.textContent = "";
  struk.style.display = "none";

  if (keranjang.length === 0) {
    pesanError.textContent = "Pilih minimal satu menu sebelum memesan.";
  } else if (nama === "") {
    pesanError.textContent = "Isi nama pemesan terlebih dahulu.";
  } else if (isNaN(meja) || meja < 1 || meja > 20) {
    pesanError.textContent = "Nomor meja harus antara 1 sampai 20.";
  } else {
    cetakStruk(nama, meja, bayar);
  }
}

// ===== CETAK STRUK (perulangan for dan while) =====
function cetakStruk(nama, meja, bayar) {
  const h = hitungTotal();

  let garis = "";
  while (garis.length < 34) {                  // PERULANGAN while: membuat garis pemisah
    garis += "-";
  }

  let teks = "WARUNG DAUN PISANG\n" + garis + "\n";
  teks += "Nama  : " + nama + "\nMeja  : " + meja + "\n" + garis + "\n";

  for (let i = 0; i < keranjang.length; i++) { // PERULANGAN for: daftar pesanan
    const item = cariMenu(keranjang[i].id);
    teks += keranjang[i].jumlah + "x " + item.nama + "\n";
    teks += "     " + rupiah(item.harga * keranjang[i].jumlah) + "\n";
  }

  teks += garis + "\nSubtotal : " + rupiah(h.subtotal) + "\n";
  if (h.persenDiskon > 0) {
    teks += "Diskon " + h.persenDiskon + "%: -" + rupiah(h.diskon) + "\n";
  }
  teks += "Pajak    : " + rupiah(h.pajak) + "\nTOTAL    : " + rupiah(h.total) + "\n" + garis + "\n";

  // percabangan switch: pesan sesuai metode pembayaran
  switch (bayar) {
    case "tunai":
      teks += "Bayar tunai di kasir setelah makan.";
      break;
    case "qris":
      teks += "Pindai kode QRIS di meja Anda.";
      break;
    case "kartu":
      teks += "Petugas akan membawa mesin EDC.";
      break;
    default:
      teks += "Metode pembayaran tidak dikenal.";
  }
  teks += "\nTerima kasih, pesanan sedang dibuat!";

  const struk = document.getElementById("struk");
  struk.textContent = teks;                    // textContent agar input nama aman
  struk.style.display = "block";

  keranjang = [];                              // kosongkan keranjang setelah pesan
  tampilkanKeranjang();
}

// ===== JALANKAN SAAT HALAMAN DIBUKA =====
document.getElementById("tombolPesan").onclick = pesan;
tampilkanFilter();
tampilkanMenu();
tampilkanKeranjang();
