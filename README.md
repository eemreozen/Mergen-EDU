# Mergen (Mergen-EDU)

> **Fikrine tırmanan yol** — AI Destekli, Proje Odaklı Öğrenme ve Geliştirme Yol Haritası Platformu

Mergen, geliştiricilerin gerçek projeler üreterek yazılım geliştirmeyi öğrenmelerini sağlayan modern ve minimalist bir platformdur. Kullanıcılar geliştirmek istedikleri proje fikrini tanımlar, platform ise onlar için aşamalı, pratik ve modüler bir öğrenme/geliştirme rotası oluşturur.

---

## 🚀 Teknolojiler

- **Çekirdek:** React 19 + TypeScript + Vite 8
- **Tasarım:** Tailwind CSS v4 (Özel Dark & Light Tema Paleti)
- **Animasyon & Geçişler:** Motion for React (`motion/react`)
- **İkon Seti:** Lucide React
- **Çoklu Dil Desteği:** `react-i18next` (🇹🇷 Türkçe & 🇬🇧 English)
- **Yönlendirme:** `react-router-dom`

---

## 🎨 Tasarım Prensipleri

- **Minimalist Developer SaaS:** Gereksiz karmaşadan arındırılmış, tipografi odaklı şık arayüz.
- **İmza Yükleme Deneyimi:** Metin içi ("Fikrine tırmanan yol") soldan sağa yatay maskeleme ile doldurulan açılış animasyonu.
- **Dahili Tema Desteği:** Sıfır parlama (flicker-free) ile Dark (`#0B0D10`) ve Light (`#F7F8FA`) mod geçişleri.
- **Erişilebilirlik:** `prefers-reduced-motion` ve klavye kısayolları (`⌘+Enter`) desteği.

---

---

## 📂 Proje Yapısı

- **`frontend/`**: React 19 + TypeScript + Vite 8 tabanlı web kullanıcı arayüzü.
- **`backend/`**: Yapay zeka servisleri, yol haritası motoru ve backend mimarisi.

---

## 💻 Kurulum ve Çalıştırma

### Frontend (Web)
```bash
cd frontend

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Prodüksiyon derlemesini alın
npm run build

# Kod kalitesi kontrolü (Linter)
npm run lint
```

## Canlı öğrenme ekranı

Backend'i `backend/README.md` adımlarıyla 8000 portunda, frontend'i `cd frontend && npm run dev` ile başlatın. `/learn` gerçek kaydedilmiş projeleri listeler. Ana sayfada fikir girişi proje analizi ve keşif sorularına yönlendirir. Vite `/api` isteklerini 8000 portuna iletir. Dağıtımda aynı origin reverse proxy veya `VITE_API_BASE_URL` gerekir. API anahtarı yalnız `backend/.env` içindeki `LLM_API_KEY` alanına yazılır.

`/canvas?demo=1` eski örnek kanvastır. Yeni akış `/learn` üzerindedir: ayrıntılı keşif → uzun roadmap → bilgi testi / ders → eksik becerilere özel yan dal → ana hedefe dönüş. `npm run test:learning` ana koordinatların korunmasını ve sıradaki durağın seçimini doğrular.
