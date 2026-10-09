# Mergen Backend

FastAPI + Pydantic v2 + SQLAlchemy 2.x ile kişiselleştirilmiş öğrenme haritaları,
kalıcı alt haritalar, değerlendirme, telafi düğümleri ve bağlama dayalı AI danışman.
Frontend `/learn` ekranı gerçek API üzerinden bu akışa bağlıdır. Paket yöneticisi **uv**; bağımlılıklar `uv.lock` ile sabitlendi.
Python 3.12+ gerekir; yerel doğrulama Python 3.14 üzerinde yapıldı.

## Kurulum

Repository kökünden:

```bash
cd backend
uv sync --locked
cp .env.example .env
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
OpenAPI: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)
Sağlık: [http://localhost:8000/health](http://localhost:8000/health)

Veritabanı uygulama açılışında kendiliğinden yaratılmaz; migration komutu zorunludur.
Migration yoksa veritabanı gerektiren istekler standart `DATABASE_ERROR` hatası verir.
`.env` dosyasını ve komutları `backend/` dizininden kullanın; SQLite yolu bu dizine göredir.

### Gerçek AI

Gemini API anahtarınızı `backend/.env` içindeki `LLM_API_KEY=` satırına yazın.
Anahtarı frontend ortam değişkenlerine veya sohbete eklemeniz gerekmez. Model ayarları hazırdır:

```dotenv
LLM_PROVIDER=gemini
LLM_API_KEY=...
LLM_MODEL_FAST=gemini-3.5-flash-lite
LLM_MODEL_STRONG=gemini-3.5-flash-lite
DEMO_MODE=true
DEMO_FIXTURES=false
```

Gemini 3.8 Flash yapılandırıldı; model adları ortam değişkenlerinden okunur.
Resmî model kimliği: [gemini-3.8-flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash/). `FAST`: analiz, gerektiğinde takip sorusu, içerik, test, danışman;
`STRONG`: kök harita ve alt harita. Anahtar yalnız backend'dedir.
Gemini için resmî `google-genai` async SDK, JSON Schema structured output ve Pydantic
doğrulaması kullanılır. Anahtarı girdikten sonra backend sunucusunu yeniden başlatın.
Alternatif OpenAI sağlayıcısı `LLM_PROVIDER=openai` ile korunmuştur; bu modda
resmî `AsyncOpenAI.responses.parse` kullanılır:
[OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses).
Sağlayıcı çıktısı doğrudan frontend'e verilmez. OpenAI yanıtları `store=False` ile istenir.

Varsayılan AI bekleme süresi 120 saniyedir; otomatik tekrar kapalıdır (`LLM_RETRIES=0`).
Böylece yavaş bir yanıt gereksiz ikinci AI isteğine dönüşmez. İstenirse yapılandırmayla en fazla
2 tekrar açılabilir. Frontend bekleme süresi 150 saniyedir. Kimlik doğrulama, kota ve sağlayıcı
hataları açık hata döner. Operasyon, model, geçen süre ve token kullanımı loglanır; anahtar
ve kullanıcı mesajı loglanmaz.

**Bu geliştirme ortamında API anahtarı yoktu. Gerçek AI ile analiz, kök harita ve alt harita
üretimi doğrulanamadı.** Gemini ve OpenAI SDK protokolleri sahte HTTP transport ile, tüm öğrenme akışı
etiketli deterministik fixture ile test edildi. Canlı doğrulama komutu aşağıdadır.

### Anahtarsız, açık demo

`.env` içine `DEMO_FIXTURES=true` yazın. Yanıtlar `metadata.demo=true` ve
`metadata.source=deterministic_fixture` taşır. Bu mod gerçek AI değildir; eğitim
soruları akışı göstermek içindir ve teknik ölçme kalitesi iddiası taşımaz.
Varsayılan `DEMO_FIXTURES=false`; anahtar/model eksikse `AI_NOT_CONFIGURED` döner.
Gerçek ve fixture projeleri aynı projede karıştırılamaz (`AI_MODE_MISMATCH`).

### Oturum ve sahiplik

Sağlık dışındaki bütün iş API'lerinde `X-Demo-Session` başlığında UUID gönderin.
Tarayıcı bu UUID'yi bir kez oluşturup `localStorage` içinde saklamalıdır.
Projeler, haritalar, düğümler, testler, export ve danışman bu oturuma göre ayrılır;
başkasının kimliğiyle erişim `404` döner.

**Bu gerçek authentication değildir:** başlıktaki UUID'yi bilen kişi o demo oturumuna
erişebilir. `DEMO_MODE=false` durumunda iş API'leri `AUTH_REQUIRED` ile kapalıdır.
Üretim kullanımı için kimlik doğrulama ve dağıtım öncesi erişim sınırları eklenmelidir.

## API akışı

```bash
# İki terminal/istek arasında aynı UUID'yi koruyun.
export MERGEN_DEMO_SESSION="$(uv run python -c 'import uuid; print(uuid.uuid4())')"
curl http://localhost:8000/api/v1/projects \
  -H "X-Demo-Session: $MERGEN_DEMO_SESSION" \
  -H 'Content-Type: application/json' \
  -d '{"idea":"Yapay zekâ destekli fitness uygulaması geliştirmek istiyorum.","locale":"tr"}'
```

Yanıttaki `projectId` ile keşif sorularını alın. Bütün zorunlu sorular ve en fazla iki
takip sorusu cevaplanınca `readyForRoadmap=true` olur:

```json
{
  "answers": [
    {"questionId":"goal","value":"mvp"},
    {"questionId":"experience","value":"beginner"},
    {"questionId":"technologies","value":"JavaScript"},
    {"questionId":"platform","value":"mobile"},
    {"questionId":"hours","value":"10"},
    {"questionId":"mobile_stack","value":"react_native"},
    {"questionId":"ai_strategy","value":"train_model"}
  ]
}
```

Bu senaryoda `followup-python` sorusu eklenir; aynı cevap endpoint'ine bu soruyu da gönderin.
Soruları sabit kodlamak yerine keşif yanıtındaki `questions` listesini render edin.
`multi_choice` cevapları dizi, diğerleri string; `weeklyHours` sayısal string olmalıdır.
Başlangıç seviyesi ve bilinen teknolojiler **öz-beyandır**, tamamlanmış öğrenme kanıtı sayılmaz.

| Yöntem | Endpoint | İşlev |
| --- | --- | --- |
| GET | `/health`, `/api/v1/health` | DB erişimi ve AI yapılandırma bilgisi |
| POST | `/api/v1/projects` | AI hedef analizi ve proje kaydı; 201 |
| GET | `/api/v1/projects?limit=50&offset=0` | Oturuma ait projeler |
| GET | `/api/v1/projects/{project_id}` | Proje durumu |
| GET | `/api/v1/projects/{project_id}/discovery` | Sorular, cevaplar ve hazır olma durumu |
| POST | `/api/v1/projects/{project_id}/discovery/answers` | Tip/seçenek doğrulamalı cevap kaydı |
| POST | `/api/v1/projects/{project_id}/roadmap/generate` | Kalıcı kök harita; tekrar istek aynı kimliği döner |
| GET | `/api/v1/projects/{project_id}/roadmap` | Kök harita |
| GET | `/api/v1/maps/{map_id}` | Ana veya alt harita |
| POST | `/api/v1/nodes/{node_id}/submap` | En fazla iki alt seviye; tekrar istek mevcut haritayı döner |
| GET | `/api/v1/nodes/{node_id}` | Hedefe özel, önbellekli öğrenme içeriği |
| PATCH | `/api/v1/nodes/{node_id}` | Başlatma / geliştirme görevi tamamlama |
| GET | `/api/v1/nodes/{node_id}/assessment` | Önbellekli, cevap anahtarsız test |
| POST | `/api/v1/nodes/{node_id}/learn` | Sıfırdan öğrenme dalı oluştur / mevcut dalı getir |
| POST | `/api/v1/nodes/{node_id}/assessment/submit` | Deterministik puanlama, telafi ve güncel map |
| GET | `/api/v1/nodes/{node_id}/resources` | Becerilerle eşleşen curated kaynaklar |
| POST | `/api/v1/advisor/chat` | Sunucudan kurulan ilgili bağlamla danışman |
| GET | `/api/v1/projects/{project_id}/export?mode=public` | `mergen/v1` JSON paketi |
| GET | `/api/v1/projects/{project_id}/export?mode=demo` | Yalnız fixture projelerinde cevap anahtarlı offline demo |

Öğrenme düğümleri testle, alt haritalar çocukları tamamlanınca, milestone'lar ön koşulları
sağlanınca tamamlanır. Geliştirme görevlerinde ayrı çıktı kaydı gerekir:

```json
{"action":"start"}
```

```json
{"action":"complete_task","expectedOutput":"Çalışan prototip ve test çıktısı bağlantısı/açıklaması"}
```

Görev çıktısı kullanıcı beyanı olarak saklanır; bu MVP kodu otomatik çalıştırıp değerlendirmez.
Öğrenme düğümünü bu endpoint ile tamamlayamazsınız.

Değerlendirme gönderimi:

```json
{
  "assessmentId":"assessment endpoint'inden gelen id",
  "version":1,
  "submissionId":"her yeni deneme için UUID",
  "answers":[{"questionId":"soru id","selectedIndex":2}]
}
```

Her soruyu tam bir kez cevaplayın. Aynı `submissionId` ve aynı cevaplar aynı sonucu döndürür;
farklı cevaplarla tekrar kullanım `SUBMISSION_CONFLICT` verir. Farklı bir deneme için yeni UUID kullanın.
Yanıt `attemptId`, `passed`, `score`, `weakSkills`, `remediationCreated`, `map` içerir.
`passingScore=100`; puan doğru sayısı / toplam soru sayısıdır. Yanlış soruların `targetSkill`
alanları telafiyi belirler. Test sürümü ve sorular değerlendirme sırasında değişmez.

Yanlış cevaplarda yalnız eksik becerileri kapsayan ayrı bir `kind=adaptive` harita oluşturulur. Ana düğümler ve edge listesi korunur. `targetNodeId` asıl hedefe bağlanır.
Telafi başarısızlığı yeni telafi zinciri üretmez. Ana testi yeniden denemeden önce bütün telafileri
geçmek gerekir; telafi ana düğümü otomatik tamamlamaz. Ardından ana test geçilince bağımlılıklar açılır.
`requires` kilit oluşturur; `supports` oluşturmaz. Kilitli düğüm içerik/test/görev işlemleri `409` verir.

Danışman isteği:

```json
{
  "projectId":"...",
  "currentMapId":"...",
  "currentNodeId":"...",
  "message":"Bu ek görev neden eklendi?"
}
```

Yalnız ilgili beceriler, son değerlendirme ve telafi nedeni gönderilir. Tam sohbet geçmişi,
cevap anahtarı ve ilgisiz beceriler LLM bağlamına girmez. Danışman yalnız önerir;
`suggestedActions` haritaya otomatik uygulanmaz.

### Hatalar

Bütün beklenen hatalar aynı yapıyı kullanır:

```json
{"error":{"code":"AI_TIMEOUT","message":"AI isteği zaman aşımına uğradı.","retryable":true}}
```

`401`: oturum/auth eksik; `403`: demo cevap anahtarı yasağı; `404`: bulunamadı/sahiplik;
`409`: kilit, eksik keşif, sürüm/tekrar gönderim/mod çakışması;
`422`: geçersiz istek/cevap; `502`: AI veya graph doğrulaması; `503`: yapılandırma/DB/limit;
`504`: AI timeout. Swagger response modellerini gösterir.
Başarısız kök harita üretimi `failed` durumunu kaydeder, kısmi harita bırakmaz;
aynı generate endpoint'i yeniden denenebilir. Alt harita/içerik/test hatasında referans veya eksik kayıt bırakılmaz.

## JSON sözleşmesi ve frontend bağlantısı

Paketin sabit üst alanları:

```json
{
  "schemaVersion":"mergen/v1",
  "project":{},
  "learnerProfile":{},
  "discovery":{"questions":[],"answers":[]},
  "maps":[],
  "assessments":[],
  "resources":[]
}
```

Ek alanlar geriye uyumludur. Bütün HTTP alanları camelCase, Python isimleri snake_case'tir.
UUID'ler kalıcıdır; AI yalnız taslak anahtarlar üretir, kalıcı kimlikleri backend atar.
Üretilmemiş alt haritanın `childMapId` değeri null'dır; export uydurma referans veya otomatik
pahalı üretim içermez. İçerik/testler ihtiyaç anında üretilir; henüz oluşturulmamış alanlar boş/null olabilir.
Kilitli harita düğümleri görünür; öğrenme içeriği/test endpoint'lerinde erişim kontrolü uygulanır.

- `contracts/mergen-v1.schema.json`: Pydantic'ten üretilen bütün paket şeması.
- `contracts/discovery.schema.json`, `roadmap.schema.json`, `assessment.schema.json`: ayrı endpoint modelleri.
- `contracts/assessment-demo.schema.json`: yalnız demo için cevap anahtarlı değerlendirme modeli.
- `contracts/mergen-v1.ts`: JSON Schema'dan üretilen TypeScript tipleri.
- `contracts/frontend-client.ts`: fetch, oturum başlığı, standart hata ve typed export örneği.

Canlı istemci `frontend/src/api/client.ts`, üretilen tipler `frontend/src/api/types.ts` içindedir.
Oturumu `crypto.randomUUID()` ile bir kez üretip saklayın. Vite için `http://localhost:5173`
CORS açıktır; farklı origin'leri `.env` içindeki virgülle ayrılmış `CORS_ORIGINS` alanına ekleyin.
API base URL `http://localhost:8000/api/v1`; istemci örneğine `http://localhost:8000` verilir.

Mevcut `frontend/src/types/canvas.ts` iki dilli demo alanları (`titleTr`, `quizId`, `submapId`)
kullanıyor. Yeni API alanları `title`, `assessmentId`, `childMapId`, `type` biçimindedir.
Frontend'in veri adaptörü bu alanları görsel bileşenlerine eşlemelidir; backend serbest LLM metni,
React bileşeni veya koordinat dönmez. API sınavında `correctIndex` beklemeyin; sonucu backend'den alın.
`explanation` public testte boş tutulur, çünkü açıklama da doğru cevabı ele verebilir.
Görsel koordinatlar ve `submap`/`development_task`/`milestone` türlerinin görsel karşılıkları frontend'e aittir.

**Demo export güvenli sınav uygulaması değildir.** `discovery.json`, `roadmap.json`,
`roadmap-updated.json` offline demo fixture'ıdır ve test varsa cevap anahtarı içerir.
`roadmap-public.json` anahtarsız public örnektir. Gerçek projelerde `mode=demo` yasaktır.

## Dosyalar ve mimari

| Dizin/dosya | Sorumluluk |
| --- | --- |
| `app/main.py`, `config.py`, `errors.py` | Uygulama, ayarlar, CORS ve hata sözleşmesi |
| `app/api/dependencies.py`, `app/api/v1/` | Transaction, demo oturumu, sahiplik ve REST router'ları |
| `app/ai/gateway.py`, `context_builder.py`, `prompts/` | Tek AI katmanı, ilgili bağlam ve operasyon prompt'ları |
| `app/schemas/` | API, AI taslakları ve export Pydantic modelleri |
| `app/models/`, `app/db/` | User, Project, Map, Node, Edge, Skill, Assessment, Attempt, AdvisorMessage |
| `app/services/` | Keşif, üretim, içerik, değerlendirme, telafi, danışman, kaynak ve export |
| `app/graph/` | DAG/referans doğrulaması, bağımlılıklar ve ilerleme |
| `app/templates/domains/` | core, web, mobile, ai_ml, game_dev keşif şablonları |
| `app/resources/curated.json` | Resmî kaynak URL'leri ve beceri eşleşmeleri |
| `app/seed/demo.py` | Açık deterministik fixture sağlayıcısı |
| `migrations/`, `alembic.ini` | İlişkisel ilk migration ve PostgreSQL JSONB varyantları |
| `scripts/` | Şema, TypeScript ve API tabanlı demo üretimi |
| `contracts/`, `tests/` | Frontend teslimatları ve doğrulamalar |

Node/edge'ler ilişkisel tablolardadır. Proje analiz/keşif, içerik ve soru alanları SQLite JSON,
PostgreSQL JSONB olarak saklanır. Kullanıcı öz-beyanı UserSkill alanında; değerlendirme kanıtı
ayrı AssessmentAttempt kayıtlarındadır. Kök harita ve parent node için DB unique constraint'leri vardır.

SQLite'ta API transaction'ları `BEGIN IMMEDIATE` ile sıraya alınır; bu küçük hackathon yükünde
aynı anda kök/alt harita, içerik veya test yaratılmasını engeller. LLM çağrısı boyunca transaction
kilidi tutulur; yoğun kullanım için uygun değildir. PostgreSQL'de proje satırına `FOR UPDATE`
uygulanır. Uzun üretim için job queue / transaction dışı üretim P2 geliştirmesidir.
Transaction response gönderilmeden commit edilir; hata olursa rollback uygulanır.

PostgreSQL yapılandırması:

```dotenv
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/mergen
```

Yeni, boş PostgreSQL DB'ye `uv run alembic upgrade head` uygulayın. SQLite'taki veriler otomatik
taşınmaz. PostgreSQL migration DDL'i offline doğrulandı; bu ortamda canlı PostgreSQL sunucusunda test edilmedi.

Curated kaynaklar resmî Python, React Native, FastAPI, scikit-learn, pandas, Godot ve MDN
sayfalarıdır. `verified=true` URL'nin kontrol edildiğini gösterir; canlı içerik izleme anlamına gelmez.
AI içerik modeli URL üretmez; eşleşme yoksa boş kaynak listesi döner.

## Test ve demo üretimi

```bash
uv run pytest -q -m 'not live'
uv run ruff check .
uv run ruff format --check .
uv run alembic check
uv run python scripts/generate_contracts.py
uv run python scripts/generate_typescript.py
uv run python scripts/export_demo.py
```

Aktif sanal ortamda istenen doğrudan komut da çalışır: `python scripts/export_demo.py`.
Demo script'i geçici DB üzerinde **gerçek FastAPI endpoint'lerini** çağırır; ana `mergen.db`
dosyasını değiştirmez. Aynı akışın bütün aşamalarında referans kimlikleri korunur; script yeniden
çalıştırılınca yeni UUID'ler üretilir. Çıktıları JSON Schema ve graph validator doğrular.

Ana test takımı internet veya gerçek API anahtarı istemez. Proje/keşif, döngü/edge/parent-child
hataları, eşzamanlı üretim, içerik/test önbelleği, doğru/yanlış puanlama, telafi ve kilitler,
app restart kalıcılığı, public cevap gizleme, sahiplik, danışman bağlamı, SDK protokolü,
timeout/geçersiz JSON/sağlayıcı hataları ve migration ileri/geri işlemleri test edilir.

Gerçek model ile ayrı smoke testi (API ücretine neden olabilir):

```bash
RUN_LIVE_AI=1 uv run pytest -q -m live
```

Anahtar/model eksikse açık `skip` verir. Test gerçek fitness fikrini analiz eder, keşfi tamamlar,
kök haritayı üretir; gerekirse ön koşul öğrenme akışını tamamlayıp alt haritayı üretir ve export'u doğrular.
Smoke iç değerlendirmeleri geçmek için cevap anahtarını yalnız test DB'sinden okur; public API anahtar döndürmez.

## Kapsam dışında kalanlar

P2: canlı web/YouTube araması, gelişmiş hafıza/Time Machine, analitik, ek sağlayıcılar,
arka plan iş kuyruğu ve gelişmiş token optimizasyonu eklenmedi. Gerçek authentication,
ve otomatik kod değerlendirmesi kapsam dışındadır.
Gerçek LLM akışının ve canlı PostgreSQL'in doğrulanması ilgili ortam/anahtar sağlandığında yapılmalıdır.

## Etkileşimli öğrenme akışı

Proje analizi aynı AI çağrısında projeye özel 4–6 ayrıntılı soru üretir; profil sorularıyla birlikte keşif tamamlanır. Ana yol haritası 12–24 anlamlı düğüm içerir. `/learn?project=ID` ekranı sıradaki erişilebilir düğümü vurgular. Her durakta tanı testi veya sıfırdan öğrenme seçilir. Tanı testi ders içeriğini ayrıca üretmez. Test, ders ve dal üretimleri önbelleğe alınır.

Yanlış soruların becerileri 2–10 düğümlük ayrı bir öğrenme dalına dönüşür. `learn` bütün hedef becerilerini kapsar. Dal ana kanvasta yana yerleşir; bitince kullanıcı asıl hedefte tekrar test edilir. Dal içinde başarısız test yeni dal zinciri açmaz. Proje görevleri ayrıca çıktı kanıtı ister. Tarayıcı oturum kimliği `X-Demo-Session` ile saklanır; gerçek hesap kimlik doğrulaması değildir.

Gemini `503 UNAVAILABLE` yanıtı `AI_SERVICE_UNAVAILABLE` olarak, zaman aşımından ayrı gösterilir. Bu sağlayıcı yanıtı başarısız olduğu için roadmap veya keşif soruları kaydedilmez. Otomatik tekrar yapılmaz; model değiştirilmez.

İlk proje analizi ve soru üretimi `LLM_PROJECT_ANALYSIS_TIMEOUT_SECONDS=35` ile sınırlıdır; genel 120 saniyelik sınırı aşamaz. Bu sınır yalnız ilk aşamayı etkiler. Roadmap üretiminin süre ve düğüm kapsamı korunur. İlk prompt kompakt analiz ve dört projeye özel soru ister. Bu optimizasyon sağlayıcının 503 hatasını giderme garantisi değildir; kullanıcıyı uzun süre bekletmeden hatayı döndürür.

`LLM_MODEL_PROJECT_ANALYSIS=gemini-3.5-flash-lite` yalnız ilk proje analizi ve projeye özel keşif sorularını üretir. Boş bırakılırsa `LLM_MODEL_FAST` kullanılır. Mevcut yapılandırmada üç model ayarı da `gemini-3.5-flash-lite` kullanır; roadmap, öğrenme dalları, testler, dersler ve danışman dahil tüm AI işlemleri bu modele gider.

## Zaman Makinesi

Canvas üzerindeki Zaman Makinesi geçmiş yanlış soruları, verilen yanıtı, doğru yanıtı ve açıklamayı saklar. Eski değerlendirme kayıtları da görüntülenir. Tamamlanan ana/alt harita düğümlerindeki beceriler için kısa tekrar planlanır; öğrenme dalındaki düğümler ayrı tekrar kuyruğu oluşturmaz.

İlk hatırlatma üç yeni ana durak tamamlanınca veya bir gün sonra gelir. Doğru cevaplarda aralıklar 3/6/12/24 yeni durak veya 1/3/7/14 gün olarak uzar. Canvas küçük bir hatırlatma gösterir; çalışma akışını zorunlu modal ile kesmez. Kullanıcı istediğinde daha erken de tekrar yapabilir.

`GET /api/v1/projects/{id}/time-machine` geçmişi ve tekrar kuyruğunu döndürür; AI çağırmaz. `POST /api/v1/memory/{id}/prepare` tek farklı senaryo sorusu üretir ve cevaplanana kadar önbellekten döndürür. `POST /api/v1/memory/{id}/answer` sunucuda puanlar. Yanlışta kısa anlatım ve mini uygulama sunulur; ardından farklı bir soruyla denenebilir. Tekrarların tamamlanmış düğümlere, harita bağlantılarına veya ilerleme yüzdesine etkisi yoktur.

Yeni düğümün testinde daha önce tamamlanmış bir düğümün aynı becerisi yanlış cevaplanırsa bu eski beceri kısa pekiştirmeye yönlendirilir; bu beceri için yeniden uzun bir öğrenme dalı üretilmez. Yeni beceri açıkları mevcut adaptif dal akışını kullanır. Kısa tekrarlar engelleyici değildir; asıl düğümün testi yine geçilmelidir. Veriler `memory_reviews` ve `memory_checks` tablolarında kalıcıdır; kurulumda `alembic upgrade head` çalıştırın.


Keşif ekranı iki bölümden oluşur: sabit ve alana göre seçilen `advisor` soruları,
ardından ürün fikrine özel `project` soruları. Sabit çekirdek yedi karar toplar:
ilk sürümün olgunluğu, platform, deneyim, kullanılabilen teknolojiler, tercih edilen
teknoloji, haftalık süre ve teslim/bütçe kısıtları. Roadmap tüm gerekli cevaplardan
sonra üretilir. Projeye özel sorular ilk proje analizi çağrısında kaydedilir; bölüm
geçişi yeni AI çağrısı yapmaz. Eski projelerin cevapları korunur, mevcut soru kimlikleri
üzerinden bölüm bilgisi geriye uyumlu olarak sunulur. Yeni soru seti yeni projelerde kullanılır.
