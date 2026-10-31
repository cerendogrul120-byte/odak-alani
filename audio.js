/**
 * OdakAlanı - Web Ses API tabanlı Ortam Sesleri Sentezleyicisi
 * Hiçbir harici ses dosyasına (mp3/wav) ihtiyaç duymadan,
 * tamamen tarayıcının ses işlemcisiyle gerçek zamanlı ses üretir.
 */

class OrtamSesMotoru {
  constructor() {
    this.audioCtx = null;
    this.sesler = {};
    this.sessizMod = false;
    this.hazir = false;
  }

  // Kullanıcı ilk etkileşiminde Ses Bağlamını başlat
  baslat() {
    if (this.hazir) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    // Ana ses çıkışı ve sınırlayıcı (limiter)
    this.anaSesKazanci = this.audioCtx.createGain();
    this.anaSesKazanci.gain.setValueAtTime(0.8, this.audioCtx.currentTime);
    this.anaSesKazanci.connect(this.audioCtx.destination);

    this._sesKanallariniKur();
    this.hazir = true;
  }

  // Beyaz / Pembe Gürültü Üreteci (Yağmur, Rüzgar, Okyanus için temel)
  _gurultuTamponuUret(tur = 'pembe') {
    const tamponBoyutu = this.audioCtx.sampleRate * 2; // 2 saniyelik döngü
    const tampon = this.audioCtx.createBuffer(1, tamponBoyutu, this.audioCtx.sampleRate);
    const veri = tampon.getChannelData(0);

    if (tur === 'beyaz') {
      for (let i = 0; i < tamponBoyutu; i++) {
        veri[i] = Math.random() * 2 - 1;
      }
    } else {
      // Pembe / Kahverengi gürültü filtresi
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < tamponBoyutu; i++) {
        const beyaz = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + beyaz * 0.0555179;
        b1 = 0.99332 * b1 + beyaz * 0.0750759;
        b2 = 0.96900 * b2 + beyaz * 0.1538520;
        b3 = 0.86650 * b3 + beyaz * 0.3104856;
        b4 = 0.55000 * b4 + beyaz * 0.5329522;
        b5 = -0.7616 * b5 - beyaz * 0.0168980;
        veri[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + beyaz * 0.5362) * 0.11;
        b6 = beyaz * 0.115926;
      }
    }
    return tampon;
  }

  _sesKanallariniKur() {
    const ctx = this.audioCtx;
    const gurultuTamponu = this._gurultuTamponuUret('pembe');

    // 1. YAĞMUR KANALI
    const yagmurKaynak = ctx.createBufferSource();
    yagmurKaynak.buffer = gurultuTamponu;
    yagmurKaynak.loop = true;
    const yagmurFiltre = ctx.createBiquadFilter();
    yagmurFiltre.type = 'lowpass';
    yagmurFiltre.frequency.value = 1000;
    const yagmurKazanc = ctx.createGain();
    yagmurKazanc.gain.value = 0;
    yagmurKaynak.connect(yagmurFiltre);
    yagmurFiltre.connect(yagmurKazanc);
    yagmurKazanc.connect(this.anaSesKazanci);
    yagmurKaynak.start(0);

    // 2. RÜZGAR KANALI
    const ruzgarKaynak = ctx.createBufferSource();
    ruzgarKaynak.buffer = gurultuTamponu;
    ruzgarKaynak.loop = true;
    const ruzgarFiltre = ctx.createBiquadFilter();
    ruzgarFiltre.type = 'bandpass';
    ruzgarFiltre.frequency.value = 450;
    ruzgarFiltre.Q.value = 3.0;

    // Rüzgarın dalgalanması için LFO (düşük frekanslı salınım)
    const ruzgarLfo = ctx.createOscillator();
    const ruzgarLfoKazanc = ctx.createGain();
    ruzgarLfo.frequency.value = 0.2; // 5 saniyede bir hafif uğultu dalgası
    ruzgarLfoKazanc.gain.value = 250;
    ruzgarLfo.connect(ruzgarLfoKazanc);
    ruzgarLfoKazanc.connect(ruzgarFiltre.frequency);
    ruzgarLfo.start(0);

    const ruzgarKazanc = ctx.createGain();
    ruzgarKazanc.gain.value = 0;
    ruzgarKaynak.connect(ruzgarFiltre);
    ruzgarFiltre.connect(ruzgarKazanc);
    ruzgarKazanc.connect(this.anaSesKazanci);
    ruzgarKaynak.start(0);

    // 3. OKYANUS DALGASI KANALI
    const okyanusKaynak = ctx.createBufferSource();
    okyanusKaynak.buffer = gurultuTamponu;
    okyanusKaynak.loop = true;
    const okyanusFiltre = ctx.createBiquadFilter();
    okyanusFiltre.type = 'lowpass';
    okyanusFiltre.frequency.value = 600;

    // Dalga gelip gitme hissi için LFO
    const dalgaLfo = ctx.createOscillator();
    const dalgaLfoKazanc = ctx.createGain();
    dalgaLfo.frequency.value = 0.12; // 8 saniyelik nefes gibi dalga periyodu
    dalgaLfoKazanc.gain.value = 400;
    dalgaLfo.connect(dalgaLfoKazanc);
    dalgaLfoKazanc.connect(okyanusFiltre.frequency);
    dalgaLfo.start(0);

    const okyanusKazanc = ctx.createGain();
    okyanusKazanc.gain.value = 0;
    okyanusKaynak.connect(okyanusFiltre);
    okyanusFiltre.connect(okyanusKazanc);
    okyanusKazanc.connect(this.anaSesKazanci);
    okyanusKaynak.start(0);

    // 4. ŞÖMİNE ÇATIRTISI
    const somineKazanc = ctx.createGain();
    somineKazanc.gain.value = 0;
    somineKazanc.connect(this.anaSesKazanci);

    // Hafif dip sıcaklık uğultusu
    const somineUgultu = ctx.createBufferSource();
    somineUgultu.buffer = gurultuTamponu;
    somineUgultu.loop = true;
    const somineFiltre = ctx.createBiquadFilter();
    somineFiltre.type = 'lowpass';
    somineFiltre.frequency.value = 220;
    somineUgultu.connect(somineFiltre);
    somineFiltre.connect(somineKazanc);
    somineUgultu.start(0);

    // Rastgele çıtırtı kıvılcımları oluşturan zamanlayıcı
    setInterval(() => {
      if (somineKazanc.gain.value > 0.02 && !this.sessizMod && this.audioCtx.state === 'running') {
        this._citirtiTetikle(somineKazanc);
      }
    }, 180);

    // 5. GÖK GÜRÜLTÜSÜ
    const gokGurultuKazanc = ctx.createGain();
    gokGurultuKazanc.gain.value = 0;
    gokGurultuKazanc.connect(this.anaSesKazanci);

    // Periyodik uzaktan gök gürültüsü efekti
    setInterval(() => {
      if (gokGurultuKazanc.gain.value > 0.05 && !this.sessizMod && this.audioCtx.state === 'running') {
        if (Math.random() < 0.35) {
          this._gurultuPatlamasiTetikle(gokGurultuKazanc);
        }
      }
    }, 9000);

    // 6. KAHVE DÜKKANI (Sıcak ortam mırıltısı & çan rezonansı)
    const cafeKazanc = ctx.createGain();
    cafeKazanc.gain.value = 0;
    cafeKazanc.connect(this.anaSesKazanci);

    const cafeKaynak = ctx.createBufferSource();
    cafeKaynak.buffer = gurultuTamponu;
    cafeKaynak.loop = true;
    const cafeFiltre1 = ctx.createBiquadFilter();
    cafeFiltre1.type = 'bandpass';
    cafeFiltre1.frequency.value = 520;
    cafeFiltre1.Q.value = 1.2;

    cafeKaynak.connect(cafeFiltre1);
    cafeFiltre1.connect(cafeKazanc);
    cafeKaynak.start(0);

    // Ses kanallarını sakla
    this.sesler = {
      rain: { kazanc: yagmurKazanc, hedefSeviye: 0 },
      wind: { kazanc: ruzgarKazanc, hedefSeviye: 0 },
      ocean: { kazanc: okyanusKazanc, hedefSeviye: 0 },
      fire: { kazanc: somineKazanc, hedefSeviye: 0 },
      thunder: { kazanc: gokGurultuKazanc, hedefSeviye: 0 },
      cafe: { kazanc: cafeKazanc, hedefSeviye: 0 }
    };
  }

  // Şömine çıtırtı kıvılcımı
  _citirtiTetikle(hedefKazanc) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const kzn = ctx.createGain();
    const filtre = ctx.createBiquadFilter();

    filtre.type = 'highpass';
    filtre.frequency.value = 1200 + Math.random() * 1500;

    const sure = 0.015 + Math.random() * 0.025;
    const zaman = ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200 + Math.random() * 600, zaman);

    kzn.gain.setValueAtTime((0.15 + Math.random() * 0.25) * hedefKazanc.gain.value, zaman);
    kzn.gain.exponentialRampToValueAtTime(0.0001, zaman + sure);

    osc.connect(filtre);
    filtre.connect(kzn);
    kzn.connect(this.anaSesKazanci);

    osc.start(zaman);
    osc.stop(zaman + sure);
  }

  // Gök gürültüsü efekti
  _gurultuPatlamasiTetikle(hedefKazanc) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const zaman = ctx.currentTime;
    const osc = ctx.createOscillator();
    const kzn = ctx.createGain();
    const filtre = ctx.createBiquadFilter();

    filtre.type = 'lowpass';
    filtre.frequency.setValueAtTime(140, zaman);
    filtre.frequency.exponentialRampToValueAtTime(45, zaman + 2.8);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, zaman);
    osc.frequency.exponentialRampToValueAtTime(25, zaman + 3.0);

    const guc = hedefKazanc.gain.value * 0.6;
    kzn.gain.setValueAtTime(0.001, zaman);
    kzn.gain.linearRampToValueAtTime(guc, zaman + 0.4);
    kzn.gain.exponentialRampToValueAtTime(0.001, zaman + 3.2);

    osc.connect(filtre);
    filtre.connect(kzn);
    kzn.connect(this.anaSesKazanci);

    osc.start(zaman);
    osc.stop(zaman + 3.4);
  }

  // Ses seviyesini güncelle (0 ile 100 arası)
  sesSeviyesiAyarla(sesAdi, yuzde) {
    this.baslat();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const kanal = this.sesler[sesAdi];
    if (!kanal) return;

    const hedefKazanc = (yuzde / 100) * 0.6;
    kanal.hedefSeviye = hedefKazanc;

    if (!this.sessizMod) {
      kanal.kazanc.gain.setTargetAtTime(hedefKazanc, this.audioCtx.currentTime, 0.1);
    }
  }

  // Tümünü sustur veya geri aç
  sessizModuDegistir() {
    this.baslat();
    this.sessizMod = !this.sessizMod;

    const zaman = this.audioCtx.currentTime;
    if (this.sessizMod) {
      this.anaSesKazanci.gain.setTargetAtTime(0, zaman, 0.1);
    } else {
      this.anaSesKazanci.gain.setTargetAtTime(0.8, zaman, 0.1);
    }
    return this.sessizMod;
  }

  // Pomodoro Tamamlanma Çanı (Melodik akor)
  tamamlandiCani() {
    this.baslat();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const notalar = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 akoru
    const baslangic = this.audioCtx.currentTime;

    notalar.forEach((frekans, sira) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frekans, baslangic + sira * 0.1);

      gain.gain.setValueAtTime(0, baslangic + sira * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, baslangic + sira * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, baslangic + sira * 0.1 + 1.8);

      osc.connect(gain);
      gain.connect(this.anaSesKazanci);

      osc.start(baslangic + sira * 0.1);
      osc.stop(baslangic + sira * 0.1 + 2.0);
    });
  }
}

// Global nesne olarak dışa aktar
window.ortamSesMotoru = new OrtamSesMotoru();
