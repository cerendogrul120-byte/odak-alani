/**
 * OdakAlanı - Ana Uygulama Mantığı (100% Türkçe)
 * Pencerelerin sürüklenmesi, Pomodoro sayacı, ortam sesleri mikseri,
 * görev yöneticisi, nefes egzersizi ve arka plan animasyonu.
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================
  // 1. DİNAMİK ARKA PLAN ANİMASYONU (Canvas Parçacıkları)
  // =========================================================
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let parcalari = [];
  let genislik, yukseklik;

  function boyutlandir() {
    genislik = canvas.width = window.innerWidth;
    yukseklik = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', boyutlandir);
  boyutlandir();

  class Parcacik {
    constructor() {
      this.sifirla();
    }
    sifirla() {
      this.x = Math.random() * genislik;
      this.y = Math.random() * yukseklik;
      this.yaricap = Math.random() * 2 + 0.8;
      this.hizX = (Math.random() - 0.5) * 0.35;
      this.hizY = (Math.random() - 0.5) * 0.35;
      this.opaklik = Math.random() * 0.5 + 0.2;
      this.renk = Math.random() > 0.5 ? '20, 184, 166' : '99, 102, 241';
    }
    guncelle() {
      this.x += this.hizX;
      this.y += this.hizY;
      if (this.x < 0 || this.x > genislik || this.y < 0 || this.y > yukseklik) {
        this.sifirla();
      }
    }
    ciz() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.yaricap, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.renk}, ${this.opaklik})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(${this.renk}, 0.7)`;
      ctx.fill();
    }
  }

  // 45 adet yumuşak süzülen ışık parçacığı oluştur
  for (let i = 0; i < 45; i++) {
    parcalari.push(new Parcacik());
  }

  function animasyonDongusu() {
    ctx.clearRect(0, 0, genislik, yukseklik);
    parcalari.forEach(p => {
      p.guncelle();
      p.ciz();
    });
    requestAnimationFrame(animasyonDongusu);
  }
  animasyonDongusu();


  // =========================================================
  // 2. CANLI SAAT VE ZAMAN GÖSTERGESİ
  // =========================================================
  const saatAlani = document.getElementById('clock-display');
  function saatGuncelle() {
    const simdi = new Date();
    const saat = String(simdi.getHours()).padStart(2, '0');
    const dakika = String(simdi.getMinutes()).padStart(2, '0');
    const saniye = String(simdi.getSeconds()).padStart(2, '0');
    if (saatAlani) saatAlani.textContent = `${saat}:${dakika}:${saniye}`;
  }
  setInterval(saatGuncelle, 1000);
  saatGuncelle();


  // =========================================================
  // 3. PENCERE YÖNETİMİ (Sürükleme, Öne Getirme, Kapatma/Açma)
  // =========================================================
  const pencereler = document.querySelectorAll('.glass-window');
  const dockButonlari = document.querySelectorAll('.dock-item');
  let enUstZIndex = 100;

  function pencereyiOneGetir(win) {
    enUstZIndex++;
    win.style.zIndex = enUstZIndex;
    pencereler.forEach(p => p.classList.remove('active'));
    win.classList.add('active');
  }

  pencereler.forEach(win => {
    // Tıklandığında en öne getir
    win.addEventListener('mousedown', () => pencereyiOneGetir(win));

    // Pencere başlığından sürükleme işlemi
    const baslik = win.querySelector('.window-header');
    if (baslik) {
      let surukleniyor = false;
      let baslangicX, baslangicY, baslangicSol, baslangicUst;

      baslik.addEventListener('mousedown', (e) => {
        if (e.target.closest('.win-controls') || e.target.closest('.win-action')) return;
        surukleniyor = true;
        pencereyiOneGetir(win);
        baslangicX = e.clientX;
        baslangicY = e.clientY;
        const rect = win.getBoundingClientRect();
        baslangicSol = rect.left;
        baslangicUst = rect.top;

        function fareHareket(ev) {
          if (!surukleniyor) return;
          const deltaX = ev.clientX - baslangicX;
          const deltaY = ev.clientY - baslangicY;
          win.style.left = `${Math.max(10, baslangicSol + deltaX)}px`;
          win.style.top = `${Math.max(65, baslangicUst + deltaY)}px`;
        }

        function fareBirak() {
          surukleniyor = false;
          document.removeEventListener('mousemove', fareHareket);
          document.removeEventListener('mouseup', fareBirak);
        }

        document.addEventListener('mousemove', fareHareket);
        document.addEventListener('mouseup', fareBirak);
      });
    }

    // Kapatma ve küçültme butonları
    const kapatBtn = win.querySelector('.win-close');
    const kucultBtn = win.querySelector('.win-minimize');
    const hedefAd = win.dataset.window;

    if (kapatBtn) {
      kapatBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pencereKapat(hedefAd);
      });
    }

    if (kucultBtn) {
      kucultBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pencereKapat(hedefAd);
      });
    }
  });

  function pencereKapat(ad) {
    const win = document.getElementById(`win-${ad}`);
    if (win) win.classList.add('hidden');
    const dockBtn = document.querySelector(`.dock-item[data-app="${ad}"]`);
    if (dockBtn) dockBtn.classList.remove('active');
  }

  function pencereAc(ad) {
    const win = document.getElementById(`win-${ad}`);
    if (win) {
      win.classList.remove('hidden');
      pencereyiOneGetir(win);
    }
    const dockBtn = document.querySelector(`.dock-item[data-app="${ad}"]`);
    if (dockBtn) dockBtn.classList.add('active');
  }

  function pencereDurumunuDegistir(ad) {
    const win = document.getElementById(`win-${ad}`);
    if (win && win.classList.contains('hidden')) {
      pencereAc(ad);
    } else if (win) {
      pencereKapat(ad);
    }
  }

  // Alt Dock butonlarına tıklama
  dockButonlari.forEach(btn => {
    btn.addEventListener('click', () => {
      const hedef = btn.dataset.app;
      pencereDurumunuDegistir(hedef);
    });
  });

  // Üst menü "Hakkımda" çipine tıklama
  const profilBtn = document.getElementById('open-profile-btn');
  if (profilBtn) {
    profilBtn.addEventListener('click', () => pencereDurumunuDegistir('profile'));
  }


  // =========================================================
  // 4. POMODORO VE ODAKLANMA SAYACI
  // =========================================================
  const modSureleri = {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  };

  const modBasliklari = {
    work: 'Derin Odaklanma',
    short: 'Kısa Mola',
    long: 'Uzun Dinlenme'
  };

  let aktifMod = 'work';
  let kalanSaniye = modSureleri.work;
  let sayacZamanlayici = null;
  let calisiyor = false;

  const zamanMetin = document.getElementById('timer-time');
  const durumEtiket = document.getElementById('timer-label');
  const ustSayacMetin = document.getElementById('header-timer-display');
  const ustDurumEtiket = document.getElementById('header-status-label');
  const baslatDurdurBtn = document.getElementById('timer-toggle-btn');
  const baslatMetin = document.getElementById('timer-toggle-text');
  const baslatIkon = document.getElementById('timer-play-icon');
  const basaAlBtn = document.getElementById('timer-reset-btn');
  const atlaBtn = document.getElementById('timer-skip-btn');
  const ilerlemeHalkasi = document.getElementById('timer-progress-ring');
  const cevreUzunlugu = 2 * Math.PI * 95; // 596.90

  // İlerleme çemberini hazırla
  if (ilerlemeHalkasi) {
    ilerlemeHalkasi.style.strokeDasharray = `${cevreUzunlugu}`;
    ilerlemeHalkasi.style.strokeDashoffset = '0';
  }

  // Yerel hafızadan istatistikleri yükle
  let tamamlananTur = parseInt(localStorage.getItem('odak_tur_sayisi') || '0', 10);
  let toplamDakika = parseInt(localStorage.getItem('odak_toplam_dakika') || '0', 10);
  const turSayacAlani = document.getElementById('stat-sessions');
  const dakikaSayacAlani = document.getElementById('stat-minutes');

  function istatistikleriGuncelle() {
    if (turSayacAlani) turSayacAlani.textContent = tamamlananTur;
    if (dakikaSayacAlani) dakikaSayacAlani.textContent = `${toplamDakika} dk`;
  }
  istatistikleriGuncelle();

  function zamaniBicimlendir(saniye) {
    const dk = Math.floor(saniye / 60);
    const sn = saniye % 60;
    return `${String(dk).padStart(2, '0')}:${String(sn).padStart(2, '0')}`;
  }

  function ekraniGuncelle() {
    const formatli = zamaniBicimlendir(kalanSaniye);
    if (zamanMetin) zamanMetin.textContent = formatli;
    if (ustSayacMetin) ustSayacMetin.textContent = formatli;
    if (durumEtiket) durumEtiket.textContent = modBasliklari[aktifMod];
    if (ustDurumEtiket) ustDurumEtiket.textContent = modBasliklari[aktifMod];
    document.title = `(${formatli}) OdakAlanı`;

    // Çember ilerleme oranı
    const toplam = modSureleri[aktifMod];
    const gecen = toplam - kalanSaniye;
    const oran = gecen / toplam;
    const ofset = cevreUzunlugu * (1 - oran);
    if (ilerlemeHalkasi) {
      ilerlemeHalkasi.style.strokeDashoffset = ofset;
    }
  }

  function sayaciBaslat() {
    if (calisiyor) return;
    calisiyor = true;
    baslatMetin.textContent = 'Duraklat';
    baslatIkon.className = 'ph-fill ph-pause';

    sayacZamanlayici = setInterval(() => {
      if (kalanSaniye > 0) {
        kalanSaniye--;
        ekraniGuncelle();
      } else {
        sayaciDurdur();
        // Tamamlanma zili çal
        if (window.ortamSesMotoru) {
          window.ortamSesMotoru.tamamlandiCani();
        }

        if (aktifMod === 'work') {
          tamamlananTur++;
          toplamDakika += 25;
          localStorage.setItem('odak_tur_sayisi', tamamlananTur);
          localStorage.setItem('odak_toplam_dakika', toplamDakika);
          istatistikleriGuncelle();
          modDegistir('short');
        } else {
          modDegistir('work');
        }
      }
    }, 1000);
  }

  function sayaciDurdur() {
    calisiyor = false;
    clearInterval(sayacZamanlayici);
    baslatMetin.textContent = 'Başlat';
    baslatIkon.className = 'ph-fill ph-play';
  }

  function modDegistir(yeniMod) {
    sayaciDurdur();
    aktifMod = yeniMod;
    kalanSaniye = modSureleri[yeniMod];

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === yeniMod);
    });

    ekraniGuncelle();
  }

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modDegistir(btn.dataset.mode);
    });
  });

  if (baslatDurdurBtn) {
    baslatDurdurBtn.addEventListener('click', () => {
      if (calisiyor) sayaciDurdur();
      else sayaciBaslat();
    });
  }

  if (basaAlBtn) {
    basaAlBtn.addEventListener('click', () => {
      sayaciDurdur();
      kalanSaniye = modSureleri[aktifMod];
      ekraniGuncelle();
    });
  }

  if (atlaBtn) {
    atlaBtn.addEventListener('click', () => {
      sayaciDurdur();
      if (aktifMod === 'work') modDegistir('short');
      else modDegistir('work');
    });
  }

  ekraniGuncelle();


  // =========================================================
  // 5. ORTAM SESLERİ MİKSERİ VE KONTROLLER
  // =========================================================
  const kaydiricilar = document.querySelectorAll('.sound-slider');
  const sessizBtn = document.getElementById('mute-all-btn');
  const sessizIkon = document.getElementById('mute-all-icon');

  kaydiricilar.forEach(slider => {
    const sesAdi = slider.dataset.sound;
    const kart = slider.closest('.sound-card');
    const durumEtiket = kart.querySelector('.sound-status');

    slider.addEventListener('input', (e) => {
      const deger = parseInt(e.target.value, 10);
      if (window.ortamSesMotoru) {
        window.ortamSesMotoru.sesSeviyesiAyarla(sesAdi, deger);
      }

      if (deger > 0) {
        kart.classList.add('playing');
        durumEtiket.textContent = `%${deger}`;
      } else {
        kart.classList.remove('playing');
        durumEtiket.textContent = 'Kapalı';
      }
    });
  });

  if (sessizBtn) {
    sessizBtn.addEventListener('click', () => {
      if (window.ortamSesMotoru) {
        const sessizdeMi = window.ortamSesMotoru.sessizModuDegistir();
        if (sessizdeMi) {
          sessizIkon.className = 'ph-bold ph-speaker-slash';
          sessizBtn.title = 'Sesi Aç';
        } else {
          sessizIkon.className = 'ph-bold ph-speaker-high';
          sessizBtn.title = 'Tümünü Sustur';
        }
      }
    });
  }

  // Hazır Modlar (Yağmurlu Gece, Şömine, Sahil)
  const hazirModlar = {
    'rainy-night': { rain: 75, thunder: 50, wind: 30, ocean: 0, fire: 0, cafe: 0 },
    'cozy-cabin': { rain: 40, thunder: 0, wind: 20, ocean: 0, fire: 80, cafe: 0 },
    'coastal-zen': { rain: 0, thunder: 0, wind: 35, ocean: 75, fire: 0, cafe: 0 },
    'clear-all': { rain: 0, thunder: 0, wind: 0, ocean: 0, fire: 0, cafe: 0 }
  };

  document.querySelectorAll('.preset-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const modKodu = tag.dataset.preset;
      const ayarlar = hazirModlar[modKodu];
      if (!ayarlar) return;

      Object.entries(ayarlar).forEach(([ses, deger]) => {
        const slider = document.querySelector(`.sound-slider[data-sound="${ses}"]`);
        if (slider) {
          slider.value = deger;
          const kart = slider.closest('.sound-card');
          const durumEtiket = kart.querySelector('.sound-status');
          if (deger > 0) {
            kart.classList.add('playing');
            durumEtiket.textContent = `%${deger}`;
          } else {
            kart.classList.remove('playing');
            durumEtiket.textContent = 'Kapalı';
          }
          if (window.ortamSesMotoru) {
            window.ortamSesMotoru.sesSeviyesiAyarla(ses, deger);
          }
        }
      });
    });
  });


  // =========================================================
  // 6. GÖREVLER VE NOT DEFTERİ (Yerel Hafıza ile Tam Senkron)
  // =========================================================
  const gorevForm = document.getElementById('new-task-form');
  const gorevGirdi = document.getElementById('task-input');
  const gorevListe = document.getElementById('task-list');
  const gorevSayacEtiket = document.getElementById('task-count');

  const tabGorevBtn = document.getElementById('tab-tasks-btn');
  const tabNotBtn = document.getElementById('tab-notes-btn');
  const gorunumGorev = document.getElementById('view-tasks');
  const gorunumNot = document.getElementById('view-notes');

  const notAlani = document.getElementById('scratchpad-area');
  const kayitDurumEtiket = document.getElementById('save-status');
  const notTemizleBtn = document.getElementById('clear-notes-btn');

  // Sekme geçişi
  tabGorevBtn.addEventListener('click', () => {
    tabGorevBtn.classList.add('active');
    tabNotBtn.classList.remove('active');
    gorunumGorev.classList.remove('hidden');
    gorunumNot.classList.add('hidden');
  });

  tabNotBtn.addEventListener('click', () => {
    tabNotBtn.classList.add('active');
    tabGorevBtn.classList.remove('active');
    gorunumNot.classList.remove('hidden');
    gorunumGorev.classList.add('hidden');
  });

  // Görevleri Yükle
  let gorevler = JSON.parse(localStorage.getItem('odak_gorevler') || '[]');
  if (gorevler.length === 0) {
    gorevler = [
      { id: 1, metin: 'Projeyi GitHub üzerinde yayınla', tamamlandi: true },
      { id: 2, metin: 'Ortam sesleri ile 25 dk odaklanma turu yap', tamamlandi: false },
      { id: 3, metin: 'Nefes egzersizi ile zihnini dinlendir', tamamlandi: false }
    ];
  }

  function gorevleriKaydetVeCiz() {
    localStorage.setItem('odak_gorevler', JSON.stringify(gorevler));
    gorevListe.innerHTML = '';

    const tamamlanan = gorevler.filter(g => g.tamamlandi).length;
    gorevSayacEtiket.textContent = `${tamamlanan}/${gorevler.length}`;

    gorevler.forEach(gorev => {
      const li = document.createElement('li');
      li.className = `task-item ${gorev.tamamlandi ? 'completed' : ''}`;
      li.innerHTML = `
        <div class="task-checkbox ${gorev.tamamlandi ? 'checked' : ''}" data-id="${gorev.id}">
          <i class="ph-bold ph-check"></i>
        </div>
        <span class="task-text">${gorev.metin}</span>
        <button class="task-del-btn" data-id="${gorev.id}" title="Görevi Sil">
          <i class="ph-bold ph-trash"></i>
        </button>
      `;
      gorevListe.appendChild(li);
    });
  }

  gorevForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const metin = gorevGirdi.value.trim();
    if (!metin) return;
    gorevler.push({
      id: Date.now(),
      metin: metin,
      tamamlandi: false
    });
    gorevGirdi.value = '';
    gorevleriKaydetVeCiz();
  });

  gorevListe.addEventListener('click', (e) => {
    const cb = e.target.closest('.task-checkbox');
    const del = e.target.closest('.task-del-btn');

    if (cb) {
      const id = parseInt(cb.dataset.id, 10);
      const gorev = gorevler.find(g => g.id === id);
      if (gorev) {
        gorev.tamamlandi = !gorev.tamamlandi;
        gorevleriKaydetVeCiz();
      }
    } else if (del) {
      const id = parseInt(del.dataset.id, 10);
      gorevler = gorevler.filter(g => g.id !== id);
      gorevleriKaydetVeCiz();
    }
  });

  gorevleriKaydetVeCiz();

  // Not Defteri
  if (notAlani) {
    notAlani.value = localStorage.getItem('odak_hizli_notlar') || '';

    let kaydetmeZamanlayici = null;
    notAlani.addEventListener('input', () => {
      kayitDurumEtiket.innerHTML = '<i class="ph ph-spinner"></i> Kaydediliyor...';
      clearTimeout(kaydetmeZamanlayici);
      kaydetmeZamanlayici = setTimeout(() => {
        localStorage.setItem('odak_hizli_notlar', notAlani.value);
        kayitDurumEtiket.innerHTML = '<i class="ph ph-check"></i> Kaydedildi';
      }, 500);
    });

    if (notTemizleBtn) {
      notTemizleBtn.addEventListener('click', () => {
        if (confirm('Tüm notlar temizlensin mi?')) {
          notAlani.value = '';
          localStorage.removeItem('odak_hizli_notlar');
          kayitDurumEtiket.innerHTML = '<i class="ph ph-check"></i> Temizlendi';
        }
      });
    }
  }


  // =========================================================
  // 7. NEFES EGZERSİZİ WİDGET'I
  // =========================================================
  const nefesDaire = document.getElementById('breathe-circle');
  const nefesTalimat = document.getElementById('breathe-instruction');
  const nefesToggleBtn = document.getElementById('breathe-toggle-btn');
  const nefesBtnMetin = document.getElementById('breathe-btn-text');
  const nefesIkon = document.getElementById('breathe-icon');
  let nefesCalisiyor = false;
  let nefesZamanlayici = null;
  let aktifDesen = 'box'; // 'box' (4-4-4-4) veya 'relax' (4-7-8)

  document.querySelectorAll('.pattern-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      aktifDesen = btn.dataset.pattern;
      if (nefesCalisiyor) nefesDurdur();
    });
  });

  function nefesAdimi(adimIndex) {
    if (!nefesCalisiyor) return;

    if (aktifDesen === 'box') {
      // Kutu Nefesi: 4sn Al -> 4sn Tut -> 4sn Ver -> 4sn Bekle
      const adimlar = [
        { metin: 'Derin Nefes Al...', olcek: 1.25, sure: 4000 },
        { metin: 'Nefesini Tut...', olcek: 1.25, sure: 4000 },
        { metin: 'Yavaşça Nefes Ver...', olcek: 0.65, sure: 4000 },
        { metin: 'Bekle ve Rahatla...', olcek: 0.65, sure: 4000 }
      ];
      const adim = adimlar[adimIndex % 4];
      nefesTalimat.textContent = adim.metin;
      nefesDaire.style.transition = `transform ${adim.sure / 1000}s ease-in-out`;
      nefesDaire.style.transform = `scale(${adim.olcek})`;

      nefesZamanlayici = setTimeout(() => {
        nefesAdimi(adimIndex + 1);
      }, adim.sure);

    } else {
      // 4-7-8 Nefesi: 4sn Al -> 7sn Tut -> 8sn Ver
      const adimlar = [
        { metin: 'Derin Nefes Al (4sn)...', olcek: 1.3, sure: 4000 },
        { metin: 'Nefesini Tut (7sn)...', olcek: 1.3, sure: 7000 },
        { metin: 'Dudaklarından Ver (8sn)...', olcek: 0.6, sure: 8000 }
      ];
      const adim = adimlar[adimIndex % 3];
      nefesTalimat.textContent = adim.metin;
      nefesDaire.style.transition = `transform ${adim.sure / 1000}s ease-in-out`;
      nefesDaire.style.transform = `scale(${adim.olcek})`;

      nefesZamanlayici = setTimeout(() => {
        nefesAdimi(adimIndex + 1);
      }, adim.sure);
    }
  }

  function nefesBaslat() {
    nefesCalisiyor = true;
    nefesBtnMetin.textContent = 'Egzersizi Durdur';
    nefesIkon.className = 'ph-fill ph-pause';
    nefesAdimi(0);
  }

  function nefesDurdur() {
    nefesCalisiyor = false;
    clearTimeout(nefesZamanlayici);
    nefesBtnMetin.textContent = 'Egzersizi Başlat';
    nefesIkon.className = 'ph-fill ph-play';
    nefesTalimat.textContent = 'Hazır';
    nefesDaire.style.transform = 'scale(0.7)';
  }

  if (nefesToggleBtn) {
    nefesToggleBtn.addEventListener('click', () => {
      if (nefesCalisiyor) nefesDurdur();
      else nefesBaslat();
    });
  }


  // =========================================================
  // 8. TEMA DEĞİŞTİRME VE SADE (ZEN) MODU
  // =========================================================
  const temalar = ['theme-aurora', 'theme-sunset', 'theme-zen'];
  let temaIndex = 0;
  const temaBtn = document.getElementById('theme-toggle');

  if (temaBtn) {
    temaBtn.addEventListener('click', () => {
      document.body.classList.remove(temalar[temaIndex]);
      temaIndex = (temaIndex + 1) % temalar.length;
      document.body.classList.add(temalar[temaIndex]);
    });
  }

  const zenBtn = document.getElementById('zen-mode-toggle');
  if (zenBtn) {
    zenBtn.addEventListener('click', () => {
      document.body.classList.toggle('zen-mode');
    });
  }

});
