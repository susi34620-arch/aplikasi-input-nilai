// Import database dari file firebase-config.js
import { db } from "./firebase-config.js";
// Import fungsi Firestore yang akan kita gunakan
import { collection, addDoc, getDocs, doc, deleteDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
let currentEditId = null; // Variabel untuk menyimpan ID data yang sedang diedit

/**
 * [Source 166]
 * Fungsi untuk validasi input form.
 * Memeriksa apakah semua field sudah diisi.
 * @returns {object|null} Objek data jika valid, null jika tidak valid.
 */
function validasiInput() {
  const nama = document.getElementById("nama").value;
  const nim = document.getElementById("nim").value;
  const matkul = document.getElementById("matkul").value;
  const nilai = document.getElementById("nilai").value;

  // [Source 170] Memeriksa apakah data lengkap
  if (nama === "" || nim === "" || matkul === "" || nilai === "") {
    alert("Semua field wajib diisi!");
    return null; // [Source 171] Gagal validasi
  }

  // Mengembalikan data yang sudah rapi
  return {
    nama: nama,
    nim: nim,
    mataKuliah: matkul,
    nilai: parseFloat(nilai), // Ubah nilai ke tipe data angka
  };
}

/**
 * [Source 167]
 * Fungsi untuk menyimpan data ke Cloud Firestore.
 * @param {object} data - Objek data mahasiswa yang akan disimpan.
 */
async function simpanData(data) {
  try {
    // [Source 184] Menyimpan data ke koleksi 'mahasiswa'
    // (kita gunakan 'nilai_mahasiswa' agar lebih deskriptif)
    const docRef = await addDoc(collection(db, "nilai_mahasiswa"), data);

    // [Source 131] Sesuai Activity Diagram: Notifikasi berhasil
    alert("Data berhasil disimpan!");
    document.getElementById("formNilai").reset(); // Kosongkan form
  } catch (e) {
    console.error("Error adding document: ", e);
    // [Source 131] Sesuai Activity Diagram: Notifikasi gagal
    alert("Terjadi kesalahan, data gagal disimpan."); // [Source 171]
  }
}

/**
 * [Source 168]
 * Fungsi untuk mengambil dan menampilkan data dari Firestore ke tabel HTML.
 * @param {string} tabelId - ID dari <tbody> tabel.
 */
async function loadData(tabelId) {
  const tabelBody = document.getElementById(tabelId);
  if (!tabelBody) return; // Hentikan jika ini bukan halaman 'lihatdatamhs.html'

  tabelBody.innerHTML = ""; // Kosongkan tabel sebelum diisi data baru
  try {
    // [Source 185] Mengambil kembali data
    const querySnapshot = await getDocs(collection(db, "nilai_mahasiswa"));

    let no = 1;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Buat baris baru (tr) untuk tabel
      const baris = `
                <tr>
                    <td>${no++}</td>
                    <td>${data.nama}</td>
                    <td>${data.nim}</td>
                    <td>${data.mataKuliah}</td>
                    <td>${data.nilai}</td>
                    <td>
                        <div class="d-flex gap-2">
                        <a href="index.html?id=${doc.id}" class="btn btn-warning btn-sm">Edit</a>
                        <button class="btn btn-danger btn-sm btn-delete" data-id="${doc.id}">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
      tabelBody.innerHTML += baris; // Tambahkan baris ke tabel
    });

    // [Source 186] Konfirmasi data berhasil dimuat
    console.log("Data berhasil dimuat dari Firebase.");
  } catch (e) {
    console.error("Error loading documents: ", e);
    alert("Gagal memuat data dari database.");
  }
}

/**
 * Fungsi untuk menghapus data dari Firestore berdasarkan ID.
 * @param {string} id - ID dokumen yang akan dihapus.
 */
async function deleteData(id) {
  // Konfirmasi sebelum hapus
  if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) {
    return; // Batal jika pengguna klik 'Cancel'
  }

  try {
    // Tentukan referensi dokumen yang akan dihapus
    const docRef = doc(db, "nilai_mahasiswa", id);
    // Hapus dokumen
    await deleteDoc(docRef);

    alert("Data berhasil dihapus!");

    // Muat ulang data di tabel setelah berhasil hapus
    loadData("tabelDataNilai");
  } catch (e) {
    console.error("Error deleting document: ", e);
    alert("Gagal menghapus data.");
  }
}

/**
 * Mengambil satu data berdasarkan ID dan mengisinya ke form.
 * @param {string} id - ID dokumen yang akan diedit.
 */
async function loadDataForEdit(id) {
  try {
    const docRef = doc(db, "nilai_mahasiswa", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Isi form dengan data yang ada
      document.getElementById("nama").value = data.nama;
      document.getElementById("nim").value = data.nim;
      document.getElementById("matkul").value = data.mataKuliah;
      document.getElementById("nilai").value = data.nilai;

      // Ubah tampilan form
      document.querySelector(".card-title").textContent = "Formulir Edit Nilai";
      document.getElementById("btnSimpan").textContent = "Update Data";
    } else {
      alert("Data tidak ditemukan.");
      window.location.href = "index.html"; // Kembali ke form kosong
    }
  } catch (e) {
    console.error("Error getting document: ", e);
    alert("Gagal memuat data untuk diedit.");
  }
}

/**
 * Memperbarui data yang ada di Firestore (sesuai konsep 'Update').
 * @param {string} id - ID dokumen yang akan diperbarui.
 * @param {object} data - Objek data baru.
 */
async function updateData(id, data) {
  try {
    const docRef = doc(db, "nilai_mahasiswa", id);
    await updateDoc(docRef, data);

    alert("Data berhasil diperbarui!");

    // Arahkan kembali ke halaman tabel
    window.location.href = "lihatdatamhs.html";
  } catch (e) {
    console.error("Error updating document: ", e);
    alert("Gagal memperbarui data.");
  }
}

// === PENGATUR EVENT ===
// Kode ini akan mengecek di halaman mana kita berada
// dan menjalankan fungsi yang sesuai.

// 1. Jika kita di halaman 'index.html' (ada formNilai)
const formNilai = document.getElementById("formNilai");
if (formNilai) {
  // (BAGIAN BARU) Cek apakah kita dalam mode EDIT
  // Ambil parameter ID dari URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id) {
    // Jika ada ID di URL, kita masuk mode EDIT
    currentEditId = id; // Simpan ID di variabel global
    loadDataForEdit(id); // Panggil fungsi untuk mengisi form
  }
  // (BATAS BAGIAN BARU)

  // Tambahkan event listener untuk tombol 'Simpan'
  formNilai.addEventListener("submit", async (event) => {
    event.preventDefault(); // Mencegah reload halaman

    // 1. Panggil validasiInput()
    const data = validasiInput();

    if (data) {
      // (BAGIAN YANG DIMODIFIKASI)
      // Cek apakah kita sedang mengedit atau menyimpan baru
      if (currentEditId) {
        // Mode EDIT: Panggil updateData
        await updateData(currentEditId, data);
      } else {
        // Mode SIMPAN BARU: Panggil simpanData
        await simpanData(data);
      }
      // (BATAS BAGIAN YANG DIMODIFIKASI)
    }
  });
}

// 2. Jika kita di halaman 'lihatdatamhs.html' (ada tabelDataNilai)
const tabelDataNilai = document.getElementById("tabelDataNilai");
if (tabelDataNilai) {
  // Langsung panggil loadData() saat halaman dibuka
  loadData("tabelDataNilai");

  // TAMBAHKAN LISTENER BARU INI
  // Listener ini "mendengarkan" klik di seluruh area tabel
  tabelDataNilai.addEventListener("click", async (event) => {
    // Cek apakah yang diklik adalah tombol dengan class 'btn-delete'
    if (event.target.classList.contains("btn-delete")) {
      // Ambil ID dari atribut 'data-id'
      const id = event.target.dataset.id;
      // Panggil fungsi deleteData
      await deleteData(id);
    }
  });
}
