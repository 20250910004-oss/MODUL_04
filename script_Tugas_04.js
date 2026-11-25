// Data alumni (array dataAlumni) berada pada file data_alumni.js
const daftarFakultas = [
    { kode: "fikom", nama: "Fakultas Ilmu Komputer" },
    { kode: "feb", nama: "Fakultas Ekonomi dan Bisnis" },
    { kode: "fh", nama: "Fakultas Hukum" },
    { kode: "fkip", nama: "Fakultas Keguruan dan Ilmu Pendidikan" },
    { kode: "fhut", nama: "Fakultas Kehutanan" },
    { kode: "fikes", nama: "Fakultas Ilmu Kesehatan" }
];

const jumlahPerHalaman = 12;

// ===== Mengambil elemen dari halaman =====
const kolomCari = document.getElementById("kolom-cari");
const tombolReset = document.getElementById("tombol-reset");
const wadahFilter = document.getElementById("filter-fakultas");
const infoHasil = document.getElementById("info-hasil");
const infoProfil = document.getElementById("info-profil");
const daftarAlumni = document.getElementById("daftar-alumni");
const paginasi = document.getElementById("paginasi");
const pesanKosong = document.getElementById("pesan-kosong");

const teksAwalInfo = infoProfil.textContent.trim();

// ===== Status halaman =====
let fakultasAktif = "semua";
let halamanAktif = 1;
let hasilFilter = dataAlumni;

function namaFakultas(kode) {
    return daftarFakultas.find(function (f) { return f.kode === kode; }).nama;
}

function inisial(nama) {
    return nama.split(" ").map(function (kata) { return kata[0]; }).slice(0, 2).join("").toUpperCase();
}

// ===== Statistik pada bagian hero =====
function tampilkanStatistik() {
    const jumlahProdi = new Set(dataAlumni.map(function (a) { return a.jurusan; })).size;
    document.getElementById("stat-alumni").textContent = dataAlumni.length;
    document.getElementById("stat-fakultas").textContent = daftarFakultas.length;
    document.getElementById("stat-prodi").textContent = jumlahProdi;
}

// ===== Tombol filter fakultas =====
function buatFilter() {
    const semua = [{ kode: "semua", nama: "Semua Fakultas" }].concat(daftarFakultas);
    semua.forEach(function (f) {
        const jumlah = f.kode === "semua"
            ? dataAlumni.length
            : dataAlumni.filter(function (a) { return a.fakultas === f.kode; }).length;
        const tombol = document.createElement("button");
        tombol.type = "button";
        tombol.className = "chip" + (f.kode === "semua" ? " aktif" : "");
        tombol.dataset.fakultas = f.kode;
        tombol.textContent = f.nama + " (" + jumlah + ")";
        tombol.addEventListener("click", function () {
            fakultasAktif = f.kode;
            wadahFilter.querySelectorAll(".chip").forEach(function (c) {
                c.classList.toggle("aktif", c === tombol);
            });
            cariAlumni();
        });
        wadahFilter.appendChild(tombol);
    });
}

// ===== Membuat kartu alumni =====
function buatKartu(alumni) {
    const kartu = document.createElement("article");
    kartu.className = "kartu-alumni fak-" + alumni.fakultas;
    kartu.tabIndex = 0;
    kartu.dataset.info = alumni.pekerjaan + " di " + alumni.instansi + ", " + alumni.kota + ".";
    kartu.innerHTML =
        '<div class="avatar">' + inisial(alumni.nama) + '</div>' +
        '<span class="lencana">' + namaFakultas(alumni.fakultas) + '</span>' +
        '<h3 class="nama">' + alumni.nama + '</h3>' +
        '<p class="jurusan">' + alumni.jurusan + '</p>' +
        '<p class="detail">Angkatan ' + alumni.angkatan + ' &bull; ' + alumni.pekerjaan + '</p>' +
        '<p class="kutipan">&ldquo;' + alumni.kutipan + '&rdquo;</p>';
    return kartu;
}

// ===== Interaktivitas hover pada profil alumni =====
function tampilkanInfo(kartu) {
    const nama = kartu.querySelector(".nama").textContent;
    infoProfil.textContent = nama + " - " + kartu.dataset.info;
    infoProfil.classList.add("aktif");
}

function resetInfo() {
    infoProfil.textContent = teksAwalInfo;
    infoProfil.classList.remove("aktif");
}

// Satu pendengar event pada wadah daftar berlaku untuk semua kartu
daftarAlumni.addEventListener("mouseover", function (e) {
    const kartu = e.target.closest(".kartu-alumni");
    if (kartu) {
        tampilkanInfo(kartu);
    }
});

daftarAlumni.addEventListener("mouseout", function (e) {
    const kartu = e.target.closest(".kartu-alumni");
    if (kartu && !kartu.contains(e.relatedTarget)) {
        resetInfo();
    }
});

daftarAlumni.addEventListener("focusin", function (e) {
    const kartu = e.target.closest(".kartu-alumni");
    if (kartu) {
        tampilkanInfo(kartu);
    }
});

daftarAlumni.addEventListener("focusout", resetInfo);

// ===== Menampilkan satu halaman daftar alumni =====
function tampilkanHalaman() {
    const total = hasilFilter.length;
    const awal = (halamanAktif - 1) * jumlahPerHalaman;
    const halamanIni = hasilFilter.slice(awal, awal + jumlahPerHalaman);

    daftarAlumni.innerHTML = "";
    halamanIni.forEach(function (alumni) {
        daftarAlumni.appendChild(buatKartu(alumni));
    });
    resetInfo();

    pesanKosong.hidden = total !== 0;

    const kataKunci = kolomCari.value.trim();
    let teks = total === 0
        ? "Tidak ada alumni yang cocok"
        : "Menampilkan " + (awal + 1) + "-" + (awal + halamanIni.length) + " dari " + total + " alumni";
    if (kataKunci !== "") {
        teks += " untuk kata kunci \"" + kataKunci + "\"";
    }
    if (fakultasAktif !== "semua") {
        teks += " pada " + namaFakultas(fakultasAktif);
    }
    infoHasil.textContent = teks + ".";

    buatPaginasi();
}

// ===== Navigasi halaman =====
function buatTombolHalaman(teks, nomor, nonaktif, aktif) {
    const tombol = document.createElement("button");
    tombol.type = "button";
    tombol.textContent = teks;
    tombol.disabled = nonaktif;
    tombol.className = "tombol-halaman" + (aktif ? " aktif" : "");
    tombol.addEventListener("click", function () {
        halamanAktif = nomor;
        tampilkanHalaman();
        infoProfil.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return tombol;
}

function buatPaginasi() {
    const jumlahHalaman = Math.ceil(hasilFilter.length / jumlahPerHalaman);
    paginasi.innerHTML = "";
    if (jumlahHalaman <= 1) {
        return;
    }

    paginasi.appendChild(buatTombolHalaman("Sebelumnya", halamanAktif - 1, halamanAktif === 1, false));
    for (let i = 1; i <= jumlahHalaman; i++) {
        paginasi.appendChild(buatTombolHalaman(String(i), i, false, i === halamanAktif));
    }
    paginasi.appendChild(buatTombolHalaman("Berikutnya", halamanAktif + 1, halamanAktif === jumlahHalaman, false));
}

// ===== Pencarian alumni (nama atau jurusan) dan filter fakultas =====
function cariAlumni() {
    const kataKunci = kolomCari.value.trim().toLowerCase();

    hasilFilter = dataAlumni.filter(function (alumni) {
        const cocokKata = alumni.nama.toLowerCase().includes(kataKunci) ||
                          alumni.jurusan.toLowerCase().includes(kataKunci);
        const cocokFakultas = fakultasAktif === "semua" || alumni.fakultas === fakultasAktif;
        return cocokKata && cocokFakultas;
    });

    halamanAktif = 1;
    tampilkanHalaman();
}

function resetPencarian() {
    kolomCari.value = "";
    fakultasAktif = "semua";
    wadahFilter.querySelectorAll(".chip").forEach(function (c) {
        c.classList.toggle("aktif", c.dataset.fakultas === "semua");
    });
    cariAlumni();
    kolomCari.focus();
}

kolomCari.addEventListener("input", cariAlumni);
kolomCari.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        resetPencarian();
    }
});
tombolReset.addEventListener("click", resetPencarian);

// ===== Menjalankan halaman =====
tampilkanStatistik();
buatFilter();
cariAlumni();
