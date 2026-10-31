# 🌌 OdakAlanı — Huzurlu Çalışma ve Ambiyans İstasyonu

[![Lisans: MIT](https://img.shields.io/badge/Lisans-MIT-teal.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/tr/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/tr/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/tr/docs/Web/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Web_Audio-Canlı_Sentezleme-14b8a6)](#)
[![GitHub Pages](https://img.shields.io/badge/Yayın-GitHub_Pages-blue?logo=github)](https://pages.github.com/)

> **OdakAlanı**, çalışma ve kodlama süreçlerinde dikkat dağınıklığını en aza indirmek, derin odaklanma sağlamak ve zihni dinlendirmek amacıyla tasarlanmış modern, cam efektli (glassmorphism) ve tarayıcı üzerinde çalışan interaktif bir masaüstü çalışma alanıdır.

---

## ✨ Öne Çıkan Özellikler

### 🎧 1. Gerçek Zamanlı Ortam Sesleri Mikseri (Web Ses API)
- **Sıfır Dış MP3/Ses Dosyası:** Tüm sesler tarayıcının ses işlemcisiyle gerçek zamanlı sentezlenir; internet kesintilerinde dahi kesintisiz çalar.
- **6 Doğal Ses Katmanı:**
  - 🌧️ Ilık Yağmur
  - ⚡ Gök Gürültüsü
  - 🌊 Okyanus Dalgası
  - 🔥 Şömine Çatırtısı
  - 💨 Hafif Rüzgar
  - ☕ Kahve Dükkanı Uğultusu
- **Hızlı Modlar:** Tek tıkla *Yağmurlu Gece*, *Sıcak Şömine* veya *Sahil Esintisi* ambiyanslarına geçiş.

### ⏱️ 2. Pomodoro ve Odaklanma Sayacı
- Klasik **25 dk Odaklanma**, **5 dk Kısa Mola** ve **15 dk Uzun Dinlenme** modları.
- Dairesel animasyonlu SVG ilerleme halkası.
- Tur tamamlandığında melodik tamamlanma zili.
- Toplam odaklanma süresi ve tamamlanan tur sayısını tarayıcı yerel hafızasında (LocalStorage) saklama.

### 📝 3. Hedef Panosu ve Hızlı Not Defteri
- Yapılacaklar listesi ekleme, tamamlama ve silme.
- Fikirlerinizi, kod parçacıklarını ve linkleri saklayabileceğiniz anlık otomatik kaydedilen not defteri.

### 🫁 4. Zihin Molası & Nefes Egzersizi
- **Kutu Nefesi (4-4-4-4)** ve **4-7-8 Derin Sakinleşme** desenleri.
- Nefes ritmini yönlendiren yumuşak büyüyüp küçülen görsel kılavuz.

### 🪟 5. Modüler Cam Pencere Deneyimi
- Pencereleri serbestçe sürükleyebilir, simge durumuna küçültebilir ve alt dock üzerinden tekrar açabilirsiniz.
- **Sade (Zen) Modu:** Tüm pencereleri gizleyerek arka plan ışık parçacıkları ve saatle baş başa kalmanızı sağlar.
- **3 Görsel Renk Teması:** Kuzey Işıkları (Aurora), Gün Batımı (Sunset) ve Derin Gece (Zen).

---

## 🚀 Canlı Önizleme & Nasıl Çalıştırılır?

Bu proje hiçbir harici kütüphane veya paket kurulumu (`npm`, `yarn` vb.) gerektirmez.

### 1. Yerel Olarak Çalıştırma:
Projeyi bilgisayarınızda açmak için `index.html` dosyasına çift tıklamanız yeterlidir.

### 2. GitHub Pages ile Yayına Alma (Ücretsiz Canlı Demo):
1. Kodlarınızı GitHub reponuza yükleyin.
2. Reponuzun üst menüsünden **Settings** (Ayarlar) sekmesine gidin.
3. Sol menüden **Pages** seçeneğine tıklayın.
4. **Branch** kısmında `main` (veya `master`) dalını ve `/ (root)` dizinini seçip **Save** butonuna tıklayın.
5. Birkaç saniye içinde `https://kullaniciadiniz.github.io/reponuzun-adi` adresinde projeniz canlı yayına geçecektir!

---

## 📁 Proje Dosya Yapısı

```
odak-alani/
│
├── index.html        # Ana sayfa, pencere yapıları ve HTML5 semantik düzen
├── style.css         # Cam efektli (Glassmorphism) modern tasarım ve animasyonlar
├── audio.js          # Web Audio API ile gerçek zamanlı ortam sesleri sentezleyicisi
├── app.js            # Sayaç, görevler, sürükleme ve pencere yönetimi
└── README.md         # Proje tanıtımı ve kurulum rehberi
```

---

## 👤 Geliştirici

- **Geliştirici:** Ceren
- **GitHub:** [@ceren](https://github.com)

Bu projeyi beğendiyseniz bir ⭐ bırakmayı unutmayın!
