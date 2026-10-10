# Mergen (Mergen-EDU)

> **Fikrine tırmanan yol** — AI Destekli, Proje Odaklı Öğrenme ve Geliştirme Yol Haritası Platformu

Mergen, geliştiricilerin gerçek projeler üreterek yazılım geliştirmeyi öğrenmelerini sağlayan modern ve minimalist bir platformdur. Kullanıcılar geliştirmek istedikleri proje fikrini tanımlar, platform ise onlar için aşamalı, pratik ve modüler bir öğrenme/geliştirme rotası oluşturur.

---

## 🚀 Teknolojiler

### Frontend
- **Çekirdek:** React 19 + TypeScript + Vite 8
- **Tasarım:** Tailwind CSS v4 (Özel Dark & Light Tema Paleti)
- **Animasyon & Geçişler:** Motion for React (`motion/react`)
- **İkon Seti:** Lucide React
- **Çoklu Dil Desteği:** `react-i18next` (🇹🇷 Türkçe & 🇬🇧 English)
- **Yönlendirme:** `react-router-dom`
- **Harita & Graf:** `@xyflow/react`

### Backend
- **Framework & Çekirdek:** Python 3.12+ + FastAPI + Pydantic v2
- **Paket Yöneticisi:** [uv](https://github.com/astral-sh/uv) (`uv.lock`)
- **Veritabanı & ORM:** SQLAlchemy 2.x (Async) + aiosqlite / asyncpg + Alembic
- **Yapay Zeka Entegrasyonu:** Google GenAI SDK (`gemini-3.5-flash-lite`, `gemini-3.8-flash`) & OpenAI SDK

---

## 🎨 Tasarım Prensipleri

- **Minimalist Developer SaaS:** Gereksiz karmaşadan arındırılmış, tipografi odaklı şık arayüz.
- **İmza Yükleme Deneyimi:** Metin içi ("Fikrine tırmanan yol") soldan sağa yatay maskeleme ile doldurulan açılış animasyonu.
- **Dahili Tema Desteği:** Sıfır parlama (flicker-free) ile Dark (`#0B0D10`) ve Light (`#F7F8FA`) mod geçişleri.
- **Erişilebilirlik:** `prefers-reduced-motion` ve klavye kısayolları (`⌘+Enter`) desteği.

---

## 📂 Proje Yapısı

- **`frontend/`**: React 19 + TypeScript + Vite 8 tabanlı web kullanıcı arayüzü.
- **`backend/`**: FastAPI, veritabanı, AI sağlayıcıları ve yol haritası motoru.

---

## 💻 Kurulum ve Çalıştırma

Projeyi yerel ortamda çalıştırmak için **Backend** ve **Frontend** servislerini ayrı terminallerde başlatın.

### 1. Backend (FastAPI + Python)

Backend için paket yöneticisi olarak **uv** ve Python 3.12+ gereklidir.

```bash
cd backend

# 1. Bağımlılıkları yükleyin
uv sync --locked

# 2. Ortam değişkenlerini hazırlayın (.env oluşturun)
# Linux / macOS:
cp .env.example .env
# Windows (CMD):
copy .env.example .env

# 3. Veritabanı tablolarını oluşturun (Migration)
uv run alembic upgrade head

# 4. Backend sunucusunu başlatın
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

> **API & Dokümantasyon:**
> - Backend URL: `http://127.0.0.1:8000`
> - Swagger Dokümantasyonu: `http://127.0.0.1:8000/docs`
> - Sağlık Kontrolü: `http://127.0.0.1:8000/health`
>
> **Yapay Zeka Yapılandırması (`backend/.env`):**
> - Gerçek AI üretimi için `LLM_API_KEY=` kısmına Gemini API anahtarınızı tanımlayın.
> - API anahtarı olmadan deterministik verilerle test etmek için `DEMO_FIXTURES=true` yapabilirsiniz.

---

### 2. Frontend (React + Vite)

```bash
cd frontend

# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirme sunucusunu başlatın
npm run dev

# Diğer komutlar:
npm run build         # Prodüksiyon derlemesi
npm run lint          # Kod kalitesi kontrolü (Linter)
npm run test:learning # Öğrenme akışı testi
```

> **Arayüz:**
> - Frontend URL: `http://localhost:5173`
> - Vite geliştirme sunucusu `/api` isteklerini otomatik olarak arka uçtaki `http://127.0.0.1:8000` servisine yönlendirir (proxy).

## Canlı öğrenme ekranı

Backend'i `backend/README.md` adımlarıyla 8000 portunda, frontend'i `cd frontend && npm run dev` ile başlatın. `/learn` gerçek kaydedilmiş projeleri listeler. Ana sayfada fikir girişi proje analizi ve keşif sorularına yönlendirir. Vite `/api` isteklerini 8000 portuna iletir. Dağıtımda aynı origin reverse proxy veya `VITE_API_BASE_URL` gerekir. API anahtarı yalnız `backend/.env` içindeki `LLM_API_KEY` alanına yazılır.

`/canvas?demo=1` eski örnek kanvastır. Yeni akış `/learn` üzerindedir: ayrıntılı keşif → uzun roadmap → bilgi testi / ders → eksik becerilere özel yan dal → ana hedefe dönüş. `npm run test:learning` ana koordinatların korunmasını ve sıradaki durağın seçimini doğrular.

### Mevcut haritaları yeniden üretme

Backend dizininde `PYTHONPATH=. .venv/bin/python scripts/regenerate_roadmaps.py --all`
komutu mevcut aktif projelerin ana haritalarını gerçek Gemini ile yeniden üretir.
Tek proje için `--project <id>` kullanılabilir. Eski haritalar, alt dallar ve test
geçmişi “Önceki sürüm” projesinde korunur; aktif proje URL’si değişmez. Model veya
doğrulama hatasında o projenin mevcut haritası korunur. Eski sürümler sonraki
`--all` çalışmalarına dahil edilmez. Yeni alt haritalar ilgili düğüm açıldığında
yeni ana haritanın bağlamıyla üretilir. Her AI düğümündeki `resourceQuery`,
konuya özel doküman/video araması içindir; arama sonuçları ayrıca filtrelenir.

### Danışman ve öğrenme puanı

Ana sayfadaki Mergen maskotu sayfanın alt sınırında yürür ve tıklanınca selamlaşır.
Fikir analizi ve harita hazırlığında yerel danışman mesajları gösterilir; bu etkileşimler ek LLM çağrısı yapmaz.
Canvas puanı kullanıcıya aittir: ilk kez doğru cevaplanan her test sorusu +10, tamamlanan her durak +25 puan getirir.
Başarılı Zaman Makinesi hatırlamaları da +10 puandır. Aynı gönderimin tekrarı puanı artırmaz.
`GET /api/v1/me/progress` kayıtlı başarılardan toplamı ve seviyeyi hesaplar; her 200 puanda bir seviye artar.

Demo ortamında kilitli duraklar `practice=true` ile içerik/test incelemesine açılabilir.
Deneme gönderimleri sonuç döndürür fakat ilerleme, test geçmişi, beceri profili, hatırlamalar, puan veya telafi dallarını değiştirmez.
İçerik ve soruların üretim önbelleği tutulur. Normal ilerleme için ön koşullar hâlâ zorunludur.
Deneme erişimi production ortamında kapalıdır. Görünen durakların numaraları 1'den başlayarak ardışıktır;
yeni pekiştirme dalları ana yolun mevcut numaralarını değiştirmeden numaralandırılır.
Animasyonlar sistemin azaltılmış hareket tercihine uyar.
