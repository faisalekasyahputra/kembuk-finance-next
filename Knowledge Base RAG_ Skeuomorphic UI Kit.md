# **Dokumentasi Knowledge Base: Skeuomorphic UI Kit**

## **Metadata**

* **Nama Dokumen:** Panduan Lengkap & Kode Skeuomorphic UI Kit  
* **Kategori:** UI/UX Design, Front-End Development, CSS, HTML, JavaScript  
* **Kata Kunci (Keywords):** Skeuomorphism, UI Kit, CSS3, Box Shadow, Inset Shadow, Realism, Physical UI, Web Components, HTML5, Vanilla JS, RAG Knowledge Base.  
* **Tujuan:** Dokumen ini berfungsi sebagai basis pengetahuan (knowledge base) untuk membangun antarmuka web yang meniru objek fisik dunia nyata (Skeuomorphic Design).

## **1\. Pengantar Konsep Skeuomorphic**

Skeuomorphism dalam desain antarmuka pengguna (UI) adalah konsep di mana elemen digital meniru karakteristik estetika dan fisik dari objek dunia nyata.

Dalam UI Kit ini, realisme dicapai melalui manipulasi **CSS murni** tanpa gambar eksternal, memanfaatkan teknik:

1. **Drop Shadows & Inset Shadows:** Untuk menciptakan ilusi kedalaman (cekungan), tonjolan, dan sumber cahaya.  
2. **Linear Gradients:** Untuk meniru pantulan cahaya pada permukaan material seperti logam (metalik) atau plastik tebal.  
3. **Text-Shadows (Engraving):** Untuk membuat efek teks yang terukir (engraved) ke dalam material atau teks timbul (embossed).  
4. **CSS :has() Pseudo-class:** Untuk mengubah gaya elemen induk berdasarkan status elemen anak (misal: mengubah lampu LED saat input radio/checkbox di-klik).

## **2\. Struktur Variabel CSS Utama (Theming)**

UI Kit ini menggunakan CSS Variables (:root) untuk menjaga konsistensi pencahayaan dan material:

* \--metal-top & \--metal-bottom: Gradien untuk permukaan tombol saat tidak ditekan (cembung).  
* \--metal-pressed-top & \--metal-pressed-bottom: Gradien saat tombol ditekan (cekung/amblas).  
* \--neon-green: Warna lampu LED atau teks terminal layar.  
* \--highlight: Warna putih transparan untuk pantulan cahaya dari atas.  
* \--shadow: Warna hitam transparan untuk bayangan di bawah objek.

## **3\. Rincian Komponen (Component Breakdown)**

Berikut adalah daftar 11 komponen utama yang terdapat dalam UI Kit ini beserta karakteristik fisiknya:

### **3.1. Buttons (Tombol Fisik)**

* **Karakteristik:** Tombol mekanis tebal.  
* **Cara Kerja:** Menggunakan box-shadow dengan offset positif untuk tonjolan. Saat status :active, transform: translateY(4px) diterapkan agar tombol secara visual "turun/amblas", bayangan luar menghilang, dan teks menyala hijau.

### **3.2. Checkboxes (Kotak Centang dengan LED)**

* **Karakteristik:** Tombol tekan persegi dengan indikator lampu LED di dalamnya.  
* **Cara Kerja:** Elemen \<input type="checkbox"\> disembunyikan. Status :checked dideteksi menggunakan pemilih :has(). Jika tercentang, kotak LED (yang awalnya memiliki *inset shadow* gelap) akan berubah warna menjadi var(--neon-green) dan memancarkan efek *glow* (cahaya) menggunakan box-shadow.

### **3.3. Toggle Switches (Saklar Mekanis)**

* **Karakteristik:** Saklar geser berbentuk rel cekung dengan kenop (knob) besi di dalamnya.  
* **Cara Kerja:** Kenop bergerak dari kiri ke kanan menggunakan translasi absolut. Ada indikator titik LED kecil di tengah kenop yang menyala saat saklar dalam posisi aktif.

### **3.4. Cards (Panel Modul / Media Card)**

* **Karakteristik:** Panel besi industrial berat yang menyatu dengan latar belakang. Memiliki area "Layar" hitam cekung untuk media/gambar.  
* **Tujuan:** Digunakan sebagai wadah konten. Teks judul menggunakan efek terukir (*engraved*).

### **3.5. Loaders (Radar/Spinner Indikator)**

* **Karakteristik:** Cincin radar fisik yang berputar.  
* **Cara Kerja:** Wadah luar dibuat cekung, sementara elemen di dalamnya menggunakan animasi CSS @keyframes spin untuk berputar 360 derajat terus menerus dengan aksen lampu neon.

### **3.6. Inputs (Layar Terminal LCD)**

* **Karakteristik:** Layar kaca gelap yang menjorok ke dalam (cekung) dengan teks hijau menyala ala terminal jadul.  
* **Cara Kerja:** Menggunakan box-shadow: inset tebal. Font disetel ke monospace dengan efek text-shadow bercahaya hijau.

### **3.7. Radio Buttons (Pemilih Frekuensi Bersegmen)**

* **Karakteristik:** Panel kontrol bersegmen seperti tombol radio AM/FM fisik. Hanya satu segmen yang bisa aktif (timbul menyala) dalam satu waktu.  
* **Cara Kerja:** Menggunakan \<input type="radio"\> yang dibungkus dalam label, mengandalkan flexbox untuk struktur horizontal.

### **3.8. Forms (Panel Login Mekanis)**

* **Karakteristik:** Gabungan dari komponen Input (layar kaca) dan Button (tombol fisik) yang disusun secara vertikal sebagai kesatuan mesin otentikasi.

### **3.9. Patterns (Grill Speaker/Ventilasi)**

* **Karakteristik:** Kisi-kisi besi berlubang (perforated metal) yang cekung.  
* **Cara Kerja:** Menggunakan radial-gradient dengan background-size kecil (10px 10px) yang diulang-ulang (repeating) untuk menciptakan pola titik-titik tembus pandang.

### **3.10. Tooltips (Label Info)**

* **Karakteristik:** Tombol bulat berlogo "?" yang jika disorot (*hover*) akan mengeluarkan plat besi kecil melayang berisi informasi.  
* **Cara Kerja:** Menggunakan pseudo-element ::after untuk membuat segitiga penunjuk (pointer) ke bawah, memanfaatkan manipulasi batas (border).

### **3.11. Modal (Panel Peringatan Sistem Pop-up)**

* **Karakteristik:** Layar redup (kaca buram / backdrop filter) dengan modul kotak besi berat yang muncul dari bawah ke tengah layar. Memiliki layar teks dan tombol aksi ("Abort", "Confirm").  
* **Cara Kerja (JavaScript):** Dikontrol menggunakan Vanilla JavaScript dengan menambah/menghapus *class* .active pada *overlay* untuk memicu transisi CSS (opacity dan transform).

## **4\. Full Source Code (HTML, CSS, JS Gabungan)**

Berikut adalah implementasi lengkap dalam satu file HTML (index.html). Kode ini sepenuhnya fungsional dan independen.

\<\!DOCTYPE html\>  
\<html lang="id"\>  
\<head\>  
  \<meta charset="UTF-8"\>  
  \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
  \<title\>Skeuomorphic UI Kit\</title\>  
  \<style\>  
    :root {  
      \--bg-dark: \#1a1a1a;  
      \--bg-darker: \#111;  
      \--metal-top: \#4f4f4f;  
      \--metal-bottom: \#2b2b2b;  
      \--metal-pressed-top: \#1e1e1e;  
      \--metal-pressed-bottom: \#262626;  
      \--neon-green: \#00ff66;  
      \--neon-green-glow: rgba(0, 255, 102, 0.4);  
      \--highlight: rgba(255, 255, 255, 0.15);  
      \--shadow: rgba(0, 0, 0, 0.8);  
      \--text-dim: \#1a1a1a;  
    }

    body {  
      margin: 0;  
      padding: 40px 20px;  
      background-color: \#2a2a2a;  
      background-image:   
        radial-gradient(circle at 50% 0%, \#3b3b3b, \#151515),  
        repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px);  
      font-family: system-ui, \-apple-system, sans-serif;  
      min-height: 100vh;  
      color: white;  
    }

    .header {  
      text-align: center;  
      margin-bottom: 50px;  
      color: var(--text-dim);  
      text-shadow: 0 \-1px 1px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.2);  
      font-size: 2.5rem;  
      letter-spacing: 2px;  
      text-transform: uppercase;  
    }

    .grid-container {  
      display: grid;  
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));  
      gap: 30px;  
      max-width: 1200px;  
      margin: 0 auto;  
    }

    /\* Base Component Board \*/  
    .component-board {  
      background-color: var(--bg-dark);  
      border-radius: 20px;  
      padding: 25px;  
      box-shadow:  
        inset 0 6px 15px rgba(0, 0, 0, 0.9),  
        inset 0 \-1px 2px rgba(255, 255, 255, 0.05),  
        0 4px 15px rgba(0, 0, 0, 0.8);  
      border: 1px solid \#0a0a0a;  
      display: flex;  
      flex-direction: column;  
      align-items: center;  
      position: relative;  
    }

    .board-title {  
      color: var(--text-dim);  
      text-shadow: 0 \-1px 1px rgba(0, 0, 0, 0.6), 0 1px 1px rgba(255, 255, 255, 0.15);  
      font-size: 14px;  
      text-transform: uppercase;  
      font-weight: 800;  
      letter-spacing: 1px;  
      margin-bottom: 25px;  
      width: 100%;  
      text-align: left;  
      border-bottom: 2px groove \#333;  
      padding-bottom: 10px;  
    }

    /\* Global Hide Checkbox/Radio \*/  
    input\[type="checkbox"\], input\[type="radio"\] {  
      display: none;  
    }

    /\* 1\. BUTTONS \*/  
    .btn {  
      padding: 15px 30px;  
      background: linear-gradient(to bottom, var(--metal-top), var(--metal-bottom));  
      border-radius: 12px;  
      color: var(--text-dim);  
      font-weight: 800;  
      text-transform: uppercase;  
      letter-spacing: 1px;  
      cursor: pointer;  
      border: none;  
      box-shadow:  
        inset 0 1px 1px var(--highlight),  
        inset 0 \-1px 2px rgba(0, 0, 0, 0.4),  
        0 6px 8px rgba(0, 0, 0, 0.6),  
        0 2px 3px rgba(0, 0, 0, 0.4);  
      border-top: 1px solid \#6b6b6b;  
      border-bottom: 1px solid \#0f0f0f;  
      text-shadow: 0 \-1px 1px rgba(0, 0, 0, 0.6), 0 1px 1px rgba(255, 255, 255, 0.15);  
      transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);  
    }  
    .btn:active {  
      background: linear-gradient(to bottom, var(--metal-pressed-top), var(--metal-pressed-bottom));  
      box-shadow:  
        inset 0 4px 8px rgba(0, 0, 0, 0.9),  
        inset 0 1px 3px rgba(0, 0, 0, 1),  
        0 1px 0 rgba(255, 255, 255, 0.1);   
      transform: translateY(4px);  
      color: var(--neon-green);  
      text-shadow: 0 0 8px var(--neon-green-glow);  
    }

    /\* 2\. CHECKBOXES \*/  
    .checkbox-container {  
      display: flex;  
      gap: 20px;  
    }  
    .checkbox-label {  
      width: 50px;  
      height: 50px;  
      background: linear-gradient(to bottom, var(--metal-top), var(--metal-bottom));  
      border-radius: 12px;  
      cursor: pointer;  
      display: flex;  
      justify-content: center;  
      align-items: center;  
      box-shadow: inset 0 1px 1px var(--highlight), inset 0 \-1px 2px rgba(0, 0, 0, 0.4), 0 6px 8px rgba(0, 0, 0, 0.6);  
      border-top: 1px solid \#6b6b6b;  
      transition: all 0.1s;  
    }  
    .checkbox-led {  
      width: 16px;  
      height: 16px;  
      border-radius: 4px;  
      background: var(--bg-darker);  
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.8), 0 1px 1px var(--highlight);  
      border: 1px solid \#000;  
      transition: all 0.2s;  
    }  
    .checkbox-label:has(input:checked) {  
      background: linear-gradient(to bottom, var(--metal-pressed-top), var(--metal-pressed-bottom));  
      box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.9), inset 0 1px 3px rgba(0, 0, 0, 1), 0 1px 0 rgba(255, 255, 255, 0.1);  
      transform: translateY(3px);  
    }  
    .checkbox-label:has(input:checked) .checkbox-led {  
      background: var(--neon-green);  
      box-shadow: inset 0 1px 2px rgba(255,255,255,0.5), 0 0 8px var(--neon-green), 0 0 15px var(--neon-green-glow);  
      border-color: \#5aff96;  
    }

    /\* 3\. TOGGLE SWITCHES \*/  
    .toggle-label {  
      width: 80px;  
      height: 40px;  
      background: var(--bg-darker);  
      border-radius: 20px;  
      cursor: pointer;  
      box-shadow: inset 0 3px 8px rgba(0,0,0,0.9), 0 1px 1px var(--highlight);  
      position: relative;  
      border: 1px solid \#000;  
    }  
    .toggle-knob {  
      width: 36px;  
      height: 36px;  
      background: linear-gradient(to bottom, \#666, \#333);  
      border-radius: 50%;  
      position: absolute;  
      top: 1px;  
      left: 2px;  
      box-shadow: inset 0 2px 2px rgba(255,255,255,0.3), 0 4px 6px rgba(0,0,0,0.8);  
      border: 1px solid \#111;  
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);  
      display: flex;  
      justify-content: center;  
      align-items: center;  
    }  
    .toggle-knob::after {  
      content: '';  
      width: 6px;  
      height: 6px;  
      border-radius: 50%;  
      background: \#111;  
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.8);  
      transition: all 0.3s;  
    }  
    .toggle-label:has(input:checked) .toggle-knob {  
      left: 40px;  
    }  
    .toggle-label:has(input:checked) .toggle-knob::after {  
      background: var(--neon-green);  
      box-shadow: 0 0 8px var(--neon-green);  
    }

    /\* 4\. CARDS (UI Content Card) \*/  
    .skeuo-card {  
      background: linear-gradient(135deg, var(--metal-top), var(--metal-bottom));  
      width: 100%;  
      border-radius: 16px;  
      padding: 20px;  
      box-shadow:  
        inset 0 1px 2px rgba(255, 255, 255, 0.3),  
        inset 0 \-1px 3px rgba(0, 0, 0, 0.6),  
        0 8px 15px rgba(0, 0, 0, 0.8);  
      border-top: 1px solid \#777;  
      border-left: 1px solid \#555;  
      box-sizing: border-box;  
      display: flex;  
      flex-direction: column;  
      gap: 15px;  
    }

    .card-image-box {  
      width: 100%;  
      height: 140px;  
      background: \#111;  
      border-radius: 8px;  
      box-shadow: inset 0 4px 10px rgba(0,0,0,0.9), 0 1px 1px var(--highlight);  
      border: 1px solid \#000;  
      display: flex;  
      justify-content: center;  
      align-items: center;  
      overflow: hidden;  
    }

    .card-image-box svg {  
      width: 40px;  
      height: 40px;  
      stroke: \#444;  
      fill: none;  
      stroke-width: 2;  
      stroke-linecap: round;  
      stroke-linejoin: round;  
    }

    .card-content-title {  
      color: var(--text-dim);  
      font-size: 1.1rem;  
      font-weight: 800;  
      text-transform: uppercase;  
      letter-spacing: 1px;  
      text-shadow: 0 \-1px 1px rgba(0,0,0,0.6), 0 1px 1px rgba(255,255,255,0.15);  
      margin: 0;  
    }

    .card-content-text {  
      color: \#a3a3a3;  
      font-size: 0.85rem;  
      line-height: 1.5;  
      margin: 0;  
      text-shadow: 0 \-1px 1px rgba(0,0,0,0.8);  
    }

    /\* 5\. LOADERS (Radar/Spinner) \*/  
    .loader-ring {  
      width: 70px;  
      height: 70px;  
      border-radius: 50%;  
      background: var(--bg-darker);  
      box-shadow: inset 0 4px 8px rgba(0,0,0,0.9), 0 1px 1px var(--highlight);  
      border: 2px solid \#000;  
      position: relative;  
      display: flex;  
      justify-content: center;  
      align-items: center;  
    }  
    .loader-spinner {  
      width: 50px;  
      height: 50px;  
      border-radius: 50%;  
      border: 3px solid \#111;  
      border-top: 3px solid var(--neon-green);  
      animation: spin 1s linear infinite;  
      box-shadow: 0 0 10px var(--neon-green-glow);  
    }  
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /\* 6\. INPUTS (LCD Screen) \*/  
    .skeuo-input {  
      width: 100%;  
      background: \#0f1a12;  
      border: 2px solid \#000;  
      border-radius: 8px;  
      padding: 15px;  
      color: var(--neon-green);  
      font-family: monospace;  
      font-size: 16px;  
      box-shadow: inset 0 3px 8px rgba(0,0,0,0.9), 0 1px 1px var(--highlight);  
      box-sizing: border-box;  
      outline: none;  
      text-shadow: 0 0 5px rgba(0,255,102,0.3);  
      transition: all 0.2s;  
    }  
    .skeuo-input:focus {  
      background: \#15261a;  
      box-shadow: inset 0 3px 8px rgba(0,0,0,0.9), 0 0 10px rgba(0,255,102,0.2);  
    }  
    .skeuo-input::placeholder { color: \#004d1f; }

    /\* 7\. RADIO BUTTONS (Segmented Control) \*/  
    .radio-group {  
      display: flex;  
      background: var(--bg-darker);  
      padding: 6px;  
      border-radius: 12px;  
      box-shadow: inset 0 3px 8px rgba(0,0,0,0.9), 0 1px 1px var(--highlight);  
    }  
    .radio-segment {  
      padding: 12px 20px;  
      color: var(--text-dim);  
      font-weight: 800;  
      text-transform: uppercase;  
      font-size: 13px;  
      cursor: pointer;  
      border-radius: 8px;  
      text-shadow: 0 \-1px 1px rgba(0,0,0,0.6), 0 1px 1px rgba(255,255,255,0.15);  
      transition: all 0.2s;  
    }  
    .radio-segment:has(input:checked) {  
      background: linear-gradient(to bottom, var(--metal-top), var(--metal-bottom));  
      box-shadow: inset 0 1px 1px var(--highlight), 0 4px 6px rgba(0,0,0,0.6);  
      color: var(--neon-green);  
      text-shadow: 0 0 8px var(--neon-green-glow);  
    }

    /\* 8\. FORMS (Login Panel) \*/  
    .skeuo-form {  
      width: 100%;  
      display: flex;  
      flex-direction: column;  
      gap: 15px;  
    }

    /\* 9\. PATTERNS (Speaker Grill) \*/  
    .pattern-grill {  
      width: 100%;  
      height: 80px;  
      background-color: \#1a1a1a;  
      background-image: radial-gradient(\#000 35%, transparent 35%);  
      background-size: 10px 10px;  
      border-radius: 8px;  
      box-shadow: inset 0 5px 15px rgba(0,0,0,1), 0 1px 1px var(--highlight);  
      border: 2px solid \#111;  
    }

    /\* 10\. TOOLTIPS \*/  
    .tooltip-container {  
      position: relative;  
      display: inline-block;  
    }  
    .tooltip-btn {  
      width: 50px;  
      height: 50px;  
      border-radius: 50%;  
      background: linear-gradient(to bottom, var(--metal-top), var(--metal-bottom));  
      display: flex;  
      justify-content: center;  
      align-items: center;  
      font-weight: bold;  
      color: var(--text-dim);  
      box-shadow: inset 0 1px 1px var(--highlight), 0 6px 8px rgba(0,0,0,0.6);  
      cursor: pointer;  
      text-shadow: 0 1px 1px var(--highlight);  
    }  
    .tooltip-box {  
      position: absolute;  
      bottom: 130%;  
      left: 50%;  
      transform: translateX(-50%) translateY(10px);  
      background: \#111;  
      color: var(--neon-green);  
      padding: 8px 12px;  
      border-radius: 6px;  
      font-family: monospace;  
      font-size: 12px;  
      opacity: 0;  
      visibility: hidden;  
      transition: all 0.3s;  
      box-shadow: inset 0 1px 1px var(--highlight), 0 4px 10px rgba(0,0,0,0.8);  
      border: 1px solid \#333;  
      white-space: nowrap;  
    }  
    .tooltip-box::after {  
      content: '';  
      position: absolute;  
      top: 100%;  
      left: 50%;  
      transform: translateX(-50%);  
      border-width: 6px;  
      border-style: solid;  
      border-color: \#111 transparent transparent transparent;  
    }  
    .tooltip-container:hover .tooltip-box {  
      opacity: 1;  
      visibility: visible;  
      transform: translateX(-50%) translateY(0);  
    }

    /\* 11\. MODAL \*/  
    .modal-overlay {  
      position: fixed;  
      top: 0;  
      left: 0;  
      width: 100vw;  
      height: 100vh;  
      background: rgba(0, 0, 0, 0.7);  
      display: flex;  
      justify-content: center;  
      align-items: center;  
      z-index: 1000;  
      opacity: 0;  
      pointer-events: none;  
      transition: opacity 0.3s ease;  
      backdrop-filter: blur(4px);  
    }  
    .modal-overlay.active {  
      opacity: 1;  
      pointer-events: all;  
    }  
    .skeuo-modal {  
      background: linear-gradient(135deg, var(--metal-top), var(--metal-bottom));  
      width: 90%;  
      max-width: 420px;  
      border-radius: 16px;  
      padding: 25px;  
      box-shadow:  
        inset 0 1px 1px var(--highlight),  
        0 20px 40px rgba(0, 0, 0, 0.9),  
        0 0 0 2px \#000;  
      border-top: 2px solid \#777;  
      border-left: 1px solid \#555;  
      transform: translateY(30px) scale(0.95);  
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);  
      position: relative;  
    }  
    .modal-overlay.active .skeuo-modal {  
      transform: translateY(0) scale(1);  
    }  
    .modal-title {  
      color: var(--text-dim);  
      text-shadow: 0 \-1px 1px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.2);  
      font-size: 1.1rem;  
      font-weight: 800;  
      margin-top: 0;  
      margin-bottom: 20px;  
      text-transform: uppercase;  
      letter-spacing: 1px;  
      border-bottom: 2px groove \#333;  
      padding-bottom: 10px;  
    }  
    .modal-content {  
      background: \#0f1a12;  
      border: 2px solid \#000;  
      border-radius: 8px;  
      padding: 15px;  
      color: var(--neon-green);  
      font-family: monospace;  
      font-size: 14px;  
      box-shadow: inset 0 3px 8px rgba(0,0,0,0.9), 0 1px 1px var(--highlight);  
      margin-bottom: 25px;  
      text-shadow: 0 0 5px rgba(0,255,102,0.3);  
      line-height: 1.6;  
    }  
    .modal-actions {  
      display: flex;  
      justify-content: flex-end;  
      gap: 15px;  
    }

  \</style\>  
\</head\>  
\<body\>

  \<h1 class="header"\>Skeuomorphic UI Kit\</h1\>

  \<div class="grid-container"\>

    \<\!-- 1\. Buttons \--\>  
    \<div class="component-board"\>  
      \<div class="board-title"\>1. Buttons\</div\>  
      \<button class="btn"\>Push Me\</button\>  
    \</div\>

    \<\!-- 2\. Checkboxes \--\>  
    \<div class="component-board"\>  
      \<div class="board-title"\>2. Checkboxes\</div\>  
      \<div class="checkbox-container"\>  
        \<label class="checkbox-label"\>  
          \<input type="checkbox" checked\>  
          \<div class="checkbox-led"\>\</div\>  
        \</label\>  
        \<label class="checkbox-label"\>  
          \<input type="checkbox"\>  
          \<div class="checkbox-led"\>\</div\>  
        \</label\>  
      \</div\>  
    \</div\>

    \<\!-- 3\. Toggle switches \--\>  
    \<div class="component-board"\>  
      \<div class="board-title"\>3. Toggle Switches\</div\>  
      \<label class="toggle-label"\>  
        \<input type="checkbox"\>  
        \<div class="toggle-knob"\>\</div\>  
      \</label\>  
    \</div\>

    \<\!-- 4\. Cards \--\>  
    \<div class="component-board"\>  
      \<div class="board-title"\>4. Cards\</div\>  
      \<div class="skeuo-card"\>  
        \<\!-- Placeholder Gambar \--\>  
        \<div class="card-image-box"\>  
          \<svg viewBox="0 0 24 24"\>  
            \<rect x="3" y="3" width="18" height="18" rx="2" ry="2"\>\</rect\>  
            \<circle cx="8.5" cy="8.5" r="1.5"\>\</circle\>  
            \<polyline points="21 15 16 10 5 21"\>\</polyline\>  
          \</svg\>  
        \</div\>  
        \<\!-- Konten Card \--\>  
        \<h3 class="card-content-title"\>Media Panel\</h3\>  
        \<p class="card-content-text"\>Sistem penyimpanan data fisik. Modul ini digunakan untuk memuat dan menampilkan informasi media pada layar.\</p\>  
        \<button class="btn" style="width: 100%; padding: 12px; font-size: 12px;"\>BACA DATA\</button\>  
      \</div\>  
    \</div\>

    \<\!-- 5\. Loaders \--\>  
    \<div class="component-board"\>  
      \<div class="board-title"\>5. Loaders\</div\>  
      \<div class="loader-ring"\>  
        \<div class="loader-spinner"\>\</div\>  
      \</div\>  
    \</div\>

    \<\!-- 6\. Inputs \--\>  
    \<div class="component-board"\>  
      \<div class="board-title"\>6. Inputs\</div\>  
      \<input type="text" class="skeuo-input" placeholder="ENTER COMMAND\_"\>  
    \</div\>

    \<\!-- 7\. Radio Buttons \--\>  
    \<div class="component-board"\>  
      \<div class="board-title"\>7. Radio Buttons\</div\>  
      \<div class="radio-group"\>  
        \<label class="radio-segment"\>  
          \<input type="radio" name="mode" checked\> AM  
        \</label\>  
        \<label class="radio-segment"\>  
          \<input type="radio" name="mode"\> FM  
        \</label\>  
        \<label class="radio-segment"\>  
          \<input type="radio" name="mode"\> AUX  
        \</label\>  
      \</div\>  
    \</div\>

    \<\!-- 8\. Forms \--\>  
    \<div class="component-board"\>  
      \<div class="board-title"\>8. Forms\</div\>  
      \<div class="skeuo-form"\>  
        \<input type="password" class="skeuo-input" placeholder="PASSCODE"\>  
        \<button class="btn" style="width: 100%;"\>ACCESS\</button\>  
      \</div\>  
    \</div\>

    \<\!-- 9\. Patterns \--\>  
    \<div class="component-board"\>  
      \<div class="board-title"\>9. Patterns\</div\>  
      \<div class="pattern-grill"\>\</div\>  
    \</div\>

    \<\!-- 10\. Tooltips \--\>  
    \<div class="component-board"\>  
      \<div class="board-title"\>10. Tooltips\</div\>  
      \<div class="tooltip-container"\>  
        \<div class="tooltip-btn"\>?\</div\>  
        \<div class="tooltip-box"\>System Info v1.0\</div\>  
      \</div\>  
    \</div\>

    \<\!-- 11\. Modal Trigger \--\>  
    \<div class="component-board"\>  
      \<div class="board-title"\>11. Modal\</div\>  
      \<button class="btn" id="openModalBtn"\>INITIATE MODAL\</button\>  
    \</div\>

  \</div\>

  \<\!-- Modal Overlay & Container \--\>  
  \<div class="modal-overlay" id="modalOverlay"\>  
    \<div class="skeuo-modal"\>  
      \<h2 class="modal-title"\>System Alert\</h2\>  
      \<div class="modal-content"\>  
        \> OVERRIDE REQUIRED.\<br\>  
        \> DO YOU WANT TO PROCEED WITH PROTOCOL 7?\<br\>  
        \> WARNING: THIS ACTION CANNOT BE UNDONE.  
      \</div\>  
      \<div class="modal-actions"\>  
        \<button class="btn" id="closeModalBtn" style="padding: 10px 15px; font-size: 12px;"\>ABORT\</button\>  
        \<button class="btn" id="confirmModalBtn" style="padding: 10px 15px; font-size: 12px; color: var(--neon-green); text-shadow: 0 0 8px var(--neon-green-glow);"\>CONFIRM\</button\>  
      \</div\>  
    \</div\>  
  \</div\>

  \<\!-- Script for Modal Interaction \--\>  
  \<script\>  
    const modalOverlay \= document.getElementById('modalOverlay');  
    const openModalBtn \= document.getElementById('openModalBtn');  
    const closeModalBtn \= document.getElementById('closeModalBtn');  
    const confirmModalBtn \= document.getElementById('confirmModalBtn');

    // Buka Modal  
    openModalBtn.addEventListener('click', () \=\> {  
      modalOverlay.classList.add('active');  
    });

    // Fungsi Tutup Modal  
    const closeModal \= () \=\> {  
      modalOverlay.classList.remove('active');  
    };

    // Event Listener Penutup  
    closeModalBtn.addEventListener('click', closeModal);  
    confirmModalBtn.addEventListener('click', closeModal);  
      
    // Tutup bila area luar (backdrop) di-klik  
    modalOverlay.addEventListener('click', (e) \=\> {  
      if (e.target \=== modalOverlay) {  
        closeModal();  
      }  
    });  
  \</script\>  
\</body\>  
\</html\>  
