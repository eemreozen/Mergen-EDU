# PRODUCT_SPEC.md

# Mergen --- Ürün Gereksinimleri Belgesi

**Belge türü:** Product Specification\
**Ürün adı:** Mergen (çalışma adı)\
**Sürüm:** 1.0\
**Durum:** İlk ürün kapsamı / hackathon MVP'si\
**Dil:** Türkçe

---

## 1. Ürün amacı ve çözdüğü problem

### 1.1 Ürün amacı

Mergen, kullanıcının girdiği **somut hedef veya çıktı** doğrultusunda
kişiselleştirilmiş, bağımlılıkları gösteren bir öğrenme haritası
oluşturan web uygulamasıdır. Kullanıcı, haritadaki yetkinlik ve konu
düğümlerini izleyerek öğrenir; konuların sonunda çoktan seçmeli
testlerle değerlendirilir. Testte yanlış cevaplanan konular için telafi
düğümleri açılır. Kullanıcı bu düğümlerdeki konuları tamamladıktan sonra
ana yol haritasında ilerlemeye devam eder.

Yol haritasının sonunda sistem kullanıcıya: - Kazanılan yetkinlikleri, -
Üretilen çıktıları, - Bir sonraki adım önerilerini sunar.

Ürün yalnızca bir konu listesi üretmeyi değil, kullanıcının hedefe
ulaşmak için hangi konuları hangi sırayla öğrenmesi gerektiğini
göstermeyi ve ilerlemesini takip etmeyi amaçlar.

### 1.2 Çözülen problem

Öğrenmek isteyen kişiler çoğunlukla: - Nereden başlamaları ve hangi
sırayla ilerlemeleri gerektiğini bilemez. - Genel yol haritalarının
kendi başlangıç seviyelerine ve hedeflerine uygun olup olmadığını
anlayamaz. - Kaynaklar, alt konular ve pratik görevler arasında dağınık
şekilde ilerler. - Bir konuyu tamamlamış olmayı, o konuda yeterlilik
kazanmakla karıştırabilir. - Eksik kaldıkları konuları belirleyip planlı
biçimde telafi etmekte zorlanır. - Öğrenme sürecinin sonunda hangi
becerileri kazandıklarını ve bunlarla neler yapabildiklerini açık
biçimde göremez.

Mergen, hedefe özel sorular, kişiselleştirilmiş öğrenme haritası, test
tabanlı ilerleme ve yanlış cevaplanan konulara yönelik telafi düğümleri
ile bu sorunları azaltmayı hedefler.

### 1.3 Değer önerisi

**Kullanıcının somut hedefini, öğrenme adımlarına ve ölçülebilir
ilerlemeye dönüştürmek.**

Ürünün temel değer bileşenleri: 1. Hedefe göre kişiselleştirme. 2. Ön
koşul ve bağımlılıkları gösteren öğrenme grafiği. 3. Testlerle takip
edilen konu ilerlemesi. 4. Yanlış cevaplanan konulara odaklı telafi
akışı. 5. Öğrenme sonunda kazanımların ve sonraki adımların özeti.

### 1.4 Ürün ilkeleri

- Kullanıcıdan başlangıçta yalnızca **somut hedef veya çıktı**
  istenir.
- Kullanıcının seviyesini belirlemek için hedefe göre AI tarafından
  oluşturulan sorular kullanılır.
- Tüm hedeflere aynı anket uygulanmaz.
- Ana grafik, yalnızca görsel bir liste değil, konu bağımlılıklarını
  ve öğrenme sırasını gösteren bir haritadır.
- Bir ana konu, o konu için tanımlanan çoktan seçmeli test geçilmeden
  tamamlanmış sayılmaz.
- Testte yanlış cevaplanan konu veya konular için telafi düğümleri
  oluşturulur.
- Kullanıcı, ilgili telafi konularını tamamladıktan ve gerekli
  değerlendirmeyi geçtikten sonra bir sonraki ana konuya ilerler.
- Konu sonunda isteğe bağlı bir AI destekli proje/görev sunulabilir.
- İsteğe bağlı proje tamamlanması, testten geçme koşulunun yerine
  geçmez.
- Roadmap sonunda kazanılan yetkinlikler, üretilen çıktılar ve bir
  sonraki adım önerileri gösterilir.

---

## 2. Hedef kullanıcılar

### 2.1 Birincil kullanıcılar

**Kendi kendine öğrenen kişiler** - Yeni bir beceri edinmek isteyen
öğrenciler ve yetişkinler. - Nereden başlayacağını veya nasıl bir sıra
izleyeceğini bilmeyen kullanıcılar. - Öğrenme sürecini somut adımlarla
takip etmek isteyen kişiler.

**Öğrenciler** - Bir akademik konuyu öğrenmek veya sınava hazırlanmak
isteyenler. - Ön koşul konularındaki eksiklerini belirlemek
isteyenler. - Konu bazında ilerlemesini görmek isteyenler.

**Kariyer hedefi olan kullanıcılar** - Bir mesleki yetkinlik kazanmak
isteyenler. - Örneğin AI Engineer gibi geniş bir hedef için öğrenme
adımlarını görmek isteyenler. - Hedeflerini alt yetkinliklere ve
uygulamalara bölmek isteyenler.

**Bir çıktı üretmek isteyen kullanıcılar** - Web veya mobil uygulama,
veri analizi, rapor, prototip ya da benzeri bir çıktı oluşturmak
isteyenler. - Çıktıyı üretmek için hangi becerilerin gerektiğini
öğrenmek isteyenler.

### 2.2 İkincil kullanıcılar

- Eğitim içerikleri ve öğrenme planları üzerinde çalışan eğitimciler.
- Öğrenme süreçlerini planlamak isteyen mentörler.
- Kişisel gelişim veya mesleki yeniden beceri kazanımı hedefleyen
  kullanıcılar.

### 2.3 Kullanıcı ihtiyaçları

Kullanıcı: - Hedefini serbest metinle ifade edebilmelidir. - Hedefine
uygun sorularla başlangıç seviyesinin belirlenmesini bekler. - Öğrenmesi
gereken konuları ve bunların sırasını anlayabilmelidir. - Her konunun
neden gerekli olduğunu ve neyi öğreneceğini görebilmelidir. -
İlerlemesini kolayca takip edebilmelidir. - Yanlış yaptığı konularda
hedefli destek alabilmelidir. - Yolculuğun sonunda öğrendiklerini ve
bunlarla neler yapabileceğini görebilmelidir.

---

## 3. Kullanıcı hikâyeleri ve senaryoları

### 3.1 Kullanıcı hikâyeleri

1.  **Hedef belirleme:** Bir kullanıcı olarak, öğrenmek veya üretmek
    istediğim somut hedefi girmek istiyorum; böylece hedefime uygun bir
    yol haritası oluşturulabilsin.
2.  **Seviye belirleme:** Bir kullanıcı olarak, hedefime özel sorular
    cevaplamak istiyorum; böylece roadmap başlangıç seviyeme göre
    şekillensin.
3.  **Büyük resmi görme:** Bir kullanıcı olarak, gerekli yetkinlikleri
    ve bunların bağımlılıklarını bir graf üzerinde görmek istiyorum;
    böylece hedefime nasıl ulaşacağımı anlayabileyim.
4.  **Konu öğrenme:** Bir kullanıcı olarak, bir düğümü açıp alt
    konuları, kaynakları ve öğrenme hedefini görmek istiyorum; böylece
    konuyu planlı şekilde öğrenebileyim.
5.  **İlerleme takibi:** Bir kullanıcı olarak, hangi konuları
    tamamladığımı ve sırada ne olduğunu görmek istiyorum.
6.  **Yeterlilik kontrolü:** Bir kullanıcı olarak, konu sonunda çoktan
    seçmeli bir test çözmek istiyorum; böylece ilerlemem öğrenme
    ölçütlerine bağlansın.
7.  **Eksik telafisi:** Bir kullanıcı olarak, yanlış cevapladığım
    konular için telafi düğümleri görmek istiyorum; böylece yalnızca
    eksik olduğum alanlara odaklanabileyim.
8.  **İsteğe bağlı uygulama:** Bir kullanıcı olarak, konu sonunda isteğe
    bağlı bir proje veya uygulama görevi yapmak istiyorum; böylece
    öğrendiklerimi pratiğe dökebileyim.
9.  **Sonuçları görme:** Bir kullanıcı olarak, roadmap sonunda
    kazandığım yetkinlikleri, ürettiğim çıktıları ve sonraki adım
    önerilerini görmek istiyorum.
10. **Planı sürdürme:** Bir kullanıcı olarak, mevcut ilerlememi
    koruyarak roadmap'ime daha sonra geri dönmek istiyorum. _(Kalıcı
    kullanıcı hesabı ve kayıt desteği MVP kapsamında
    netleştirilecektir.)_

### 3.2 Senaryo A --- Akademik konu öğrenme

**Örnek hedef:** "Diferansiyel denklemleri öğrenip temel problemleri
çözebilmek istiyorum."

1.  Kullanıcı siteye girer ve "Öğren" eylemini seçer.
2.  Sistem kullanıcıdan somut hedef veya çıktı girmesini ister.
3.  AI hedefi analiz eder ve başlangıç seviyesini belirlemek için
    diferansiyel denklemlerle ve gerekli ön koşullarla ilişkili sorular
    oluşturur.
4.  Kullanıcı soruları yanıtlar.
5.  Sistem, cevaplara göre kişiselleştirilmiş öğrenme grafiği oluşturur.
6.  Kullanıcı ilk erişilebilir konu düğümünü açar; öğrenme hedefini, alt
    konuları ve kaynakları görür.
7.  Kullanıcı konuyu çalışır ve çoktan seçmeli testi tamamlar.
8.  Testi geçerse konu tamamlanır ve bağımlılıkları karşılanan sonraki
    konu açılır.
9.  Testte yanlış cevaplanan konu veya konular için telafi düğümleri
    oluşturulur. Kullanıcı bu düğümlerdeki konuları çalışıp gerekli
    değerlendirmeyi geçtikten sonra ana yol haritasında devam eder.
10. Roadmap tamamlandığında sistem kazanılan yetkinlikleri, üretilen
    çıktıları ve sonraki adım önerilerini gösterir.

### 3.3 Senaryo B --- Mesleki hedef

**Örnek hedef:** "AI Engineer olarak bir makine öğrenmesi modelini API
üzerinden sunabilecek seviyeye gelmek istiyorum."

Akış Senaryo A ile aynıdır; ancak AI soruları Python, veri işleme,
makine öğrenmesi, API ve dağıtım gibi hedefle ilişkili ön koşullara göre
üretir. Grafik, bu yetkinlikleri ve aralarındaki bağımlılıkları
gösterir. Konu sonu projeleri isteğe bağlıdır; nihai hedefin
tamamlanması için hangi çıktının zorunlu olduğu roadmap oluşturulurken
tanımlanmalıdır.

### 3.4 Senaryo C --- Somut çıktı oluşturma

**Örnek hedef:** "Kullanıcıların araç fiyatı tahmini yapabildiği bir web
uygulaması oluşturmak istiyorum."

1.  Kullanıcı hedefini serbest metinle girer.
2.  AI, hedefin kapsamını netleştirmek için gerekiyorsa takip soruları
    sorar.
3.  AI, başlangıç seviyesini belirlemek için veri analizi, modelleme,
    web/API ve dağıtım gibi hedefe özgü sorular üretir.
4.  Sistem ana hedef grafiğini; gerekli yetkinlikleri, ön koşulları ve
    alt grafikleriyle birlikte oluşturur.
5.  Kullanıcı ana grafikte bir yetkinlik düğümüne tıklayarak alt grafiğe
    iner.
6.  Kullanıcı konuları öğrenir, testleri geçer ve isterse uygulama
    görevlerini yapar.
7.  Yanlış cevaplanan konular için telafi düğümleri açılır; bunlar
    tamamlanmadan ilgili ana öğrenme akışı ilerlemez.
8.  Nihai aşamada hedef çıktının tanımlanmış ölçütleri karşılayıp
    karşılamadığı gösterilir.
9.  Sonuç ekranında kazanılan yetkinlikler, üretilen çıktı ve sonraki
    adımlar sunulur.

---

## 4. Kullanıcı arayüzü ve sayfa gereksinimleri

### 4.1 Ana sayfa

**Amaç:** Ürünün ne yaptığını kısa biçimde anlatmak ve kullanıcıyı hedef
girişi akışına yönlendirmek.

Gereksinimler: - Ürün adı ve kısa değer önerisi görünür olmalıdır. -
"Öğren" adlı veya aynı işlevi açıkça ifade eden birincil eylem
bulunmalıdır. - Kullanıcıyı beceri/çıktı türü seçmeye zorlayan iki ayrı
başlangıç akışı bulunmamalıdır. - Kullanıcı, somut hedef veya çıktı
girme sayfasına yönlendirilmelidir.

### 4.2 Hedef giriş sayfası

**Amaç:** Kullanıcının somut hedefini almak.

Gereksinimler: - Ana soru: **"Neyi başarmak istiyorsun?"** - Kullanıcı
serbest metin girebilmelidir. - Örnek hedefler, giriş alanının altında
yardımcı metin olarak gösterilebilir. - Sistem boş, aşırı belirsiz veya
anlaşılması güç hedefler için açıklama istemelidir. - Hedef yeterince
anlaşılmadan roadmap oluşturulmamalıdır. - Hedef metni, sonraki
adımlarda bağlam olarak korunmalıdır.

### 4.3 Hedefe özel soru ve başlangıç seviyesi sayfası

**Amaç:** Kullanıcının mevcut seviyesini ve hedefin kapsamını
belirlemek.

Gereksinimler: - Sorular, kullanıcının girdiği hedefe göre AI tarafından
oluşturulmalıdır. - Her hedefte aynı soru seti kullanılmamalıdır. -
Sorular, hedef için gereken ön koşul yetkinlikleri ve kullanıcının
mevcut deneyimiyle ilgili olmalıdır. - Kullanıcı birden fazla soruyu
adım adım yanıtlayabilmelidir. - Soruların sayısı hedefin belirsizliğine
ve seviye tespit ihtiyacına göre değişebilir. - AI, kullanıcının verdiği
öz değerlendirmeyi tek başına doğrulanmış seviye olarak kabul
etmemelidir. - Yanıtlar tamamlandığında kullanıcıya roadmap üretimi
başlatılmalıdır.

### 4.4 Roadmap ana sayfası

**Amaç:** Hedefin genel yapısını, konu bağımlılıklarını ve ilerlemeyi
göstermek.

Gereksinimler: - Ana hedef veya çıktı sayfanın üst bölümünde
görünmelidir. - Yetkinlik ve konu düğümleri bir öğrenme grafiği üzerinde
gösterilmelidir. - Bağımlılık ilişkileri görsel bağlantılarla ifade
edilmelidir. - Tamamlanan, devam eden, kilitli ve telafi bekleyen
düğümler ayırt edilebilir olmalıdır. - Kullanıcı erişilebilir bir düğüme
tıklayarak konu detayına gidebilmelidir. - Bir yetkinlik düğümü, ilgili
alt grafiğe açılabilmelidir. - Ana graf ve alt grafik arasında geri
dönüş/navigasyon bulunmalıdır. - Kilitli düğümlerin neden henüz
erişilebilir olmadığı kullanıcıya açıklanmalıdır. - Kullanıcı genel
ilerleme durumunu görebilmelidir. - Ana grafik, çok sayıda düğüm
oluştuğunda kullanılabilirliğini korumalıdır.

### 4.5 Konu detay sayfası veya paneli

**Amaç:** Kullanıcının seçtiği konuyu öğrenmesi ve değerlendirmeye
hazırlanması.

Gereksinimler: - Konu adı ve öğrenme hedefi gösterilmelidir. - Alt
başlıklar listelenmelidir. - Konuya uygun makale, video veya diğer
kaynaklara bağlantılar sunulmalıdır. - Kaynak bağlantıları mümkün
olduğunda doğrulanmalıdır; doğrulanmamış bağlantılar kesin kaynak olarak
sunulmamalıdır. - Konu sonunda çoktan seçmeli teste geçiş
bulunmalıdır. - Uygunsa AI tarafından oluşturulmuş isteğe bağlı
proje/görev gösterilmelidir. - Proje/görev, testten geçme koşulunun
yerine geçmemelidir.

### 4.6 Test sayfası

**Amaç:** Konuya ilişkin yeterliliği ölçmek.

Gereksinimler: - Test soruları, ilgili konunun öğrenme hedefleriyle
eşleşmelidir. - Çoktan seçmeli sorular ve cevap seçenekleri
gösterilmelidir. - Kullanıcı cevaplarını gönderebilmelidir. - Sonuçta
doğru/yanlış durumu ve uygun açıklama veya geri bildirim verilmelidir. -
Başarı eşiği konu için tanımlanmış kurala göre değerlendirilmelidir. -
Başarılı testte konu tamamlanmalıdır. - Başarısız testte yanlış
cevaplanan konu veya konular için telafi akışı başlatılmalıdır.

### 4.7 Telafi düğümü ve telafi akışı

**Amaç:** Testte yanlış cevaplanan konuları ele alıp kullanıcının ana
roadmap'te ilerlemesini sağlamak.

Gereksinimler: - Telafi düğümleri yalnızca testte yanlış cevaplanan konu
veya konular için oluşturulmalıdır. - Yanlış cevap, ilgili konu/alt konu
ile eşleştirilmelidir. - Telafi düğümü ana graf üzerinde bir baloncuk
veya ayrı bir düğüm olarak görünmelidir. - Baloncuk, ilgili sonraki ana
konuya giden akışla görsel olarak ilişkilendirilmelidir. - Kullanıcı
telafi düğümünü açtığında konu açıklamasını, kaynakları ve gerekli
öğrenme etkinliğini görmelidir. - Telafi konusunun tamamlanması için
gerekli değerlendirme geçilmelidir. - İlgili telafi düğümleri
tamamlanmadan bir sonraki ana konuya geçiş yapılmamalıdır. - Telafi
tamamlandıktan sonra ana roadmap akışı kaldığı yerden sürmelidir. -
Sistem, telafi düğümleri üretirken yanlış cevaplanmayan konular için
gereksiz düğümler eklememelidir.

### 4.8 İsteğe bağlı proje/görev alanı

**Amaç:** Kullanıcının öğrendiklerini uygulamasına olanak sağlamak.

Gereksinimler: - AI, konu ve hedefle ilişkili bir proje/görev
önerebilir. - Görev isteğe bağlı olmalıdır. - Görev açıklaması, beklenen
çıktı ve mümkünse başarı ölçütleri içermelidir. - Kullanıcı görevi
yapmayı seçebilir veya atlayabilir. - Görevin yapılması, konu testini
geçme şartını ortadan kaldırmamalıdır. - Tamamlanan görevler, sonuç
ekranında üretilen çıktılar kapsamında gösterilebilir. - MVP'de proje
çıktılarının otomatik ve güvenilir biçimde değerlendirilmesi zorunlu
değildir.

### 4.9 Sonuç sayfası

**Amaç:** Kullanıcının öğrenme yolculuğunun sonuçlarını sunmak.

Zorunlu bölümler: 1. **Kazanılan yetkinlikler:** Tamamlanan konu ve
yetkinlikler ile bunların hangi değerlendirmelerle doğrulandığı. 2.
**Üretilen çıktılar:** Kullanıcının tamamladığı proje, görev veya somut
teslimatlar. Çıktı yoksa bu durum açıkça belirtilmelidir. 3. **Bir
sonraki adım önerileri:** Hedefin doğal devamı olabilecek yeni öğrenme
hedefleri veya geliştirilebilecek alanlar.

Ek olarak tamamlanma özeti ve öğrenme grafiğinin son durumu
gösterilebilir.

---

## 5. Özellikler ve beklenen davranışlar

### 5.1 Hedef analizi

- Kullanıcıdan somut hedef veya çıktı alınır.
- AI hedefi analiz eder ve gerekirse açıklayıcı sorular sorar.
- Hedefin kapsamı, nihai başarı koşulları ve gerekli yetkinlikler
  belirlenir.
- Hedef yeterince net değilse sistem varsayımları sessizce
  kesinleştirmek yerine kullanıcıdan netleştirme ister.

### 5.2 AI ile seviye belirleme

- AI, hedefe ve hedef için gereken ön koşullara göre soru seti
  oluşturur.
- Sorular, kullanıcının deneyim ve beceri düzeyini anlamaya yönelik
  olmalıdır.
- Yanıtlar roadmap kapsamını, başlangıç düğümlerini veya öğrenme
  sırasını etkileyebilmelidir.
- Sistem, cevaplardan çıkarılan seviyeyi kesin bir ölçüm gibi
  sunmamalıdır; yeterli kanıt yoksa belirsizliği belirtmelidir.

### 5.3 AI ile öğrenme grafiği oluşturma

- AI, hedefe ulaşmak için gereken yetkinlik ve konu düğümlerini
  üretir.
- Düğümler arasındaki ön koşul ilişkileri tanımlanır.
- Gerekli olduğunda yetkinlik düğümleri alt grafiklere bağlanır.
- Grafik döngüsel veya çelişkili ön koşul ilişkileri içermemelidir.
- Her düğümün bir öğrenme hedefi ve tamamlanma ölçütü bulunmalıdır.
- Grafik, kullanıcının başlangıç seviyesi ve hedefiyle tutarlı
  olmalıdır.

### 5.4 Kaynak önerme

- Her konu için ilgili kaynaklar sunulur.
- Kaynakların konu ve seviye uyumu gözetilir.
- Kaynak bulunamıyorsa sistem uydurma bağlantı üretmek yerine bunu
  açıkça belirtmelidir.
- Kaynaklar öğrenme hedefinin yerine geçmez; kullanıcıya hedefe
  ulaşmak için destek sağlar.

### 5.5 Test üretimi ve puanlama

- Test soruları konu hedefleriyle ilişkilendirilir.
- Çoktan seçmeli cevaplar için doğru cevap veya cevap anahtarı
  belirlenir.
- Başarı eşiği konu veya test için tanımlı olmalıdır.
- Testi geçen konu tamamlandı olarak işaretlenir.
- Testte başarısızlık, yanlış cevaplanan konu veya konuların telafi
  edilmesini başlatır.
- Test sonucu ve telafi durumu kaydedilmelidir.

### 5.6 Dinamik telafi düğümleri

- Telafi düğümü, başarısız olunan testte yanlış cevaplanan konu veya
  konulara dayanır.
- Telafi kapsamı başarısızlıkla ilişkili konularla sınırlı tutulur.
- Telafi düğümü ilgili ana konu ve sonraki ana konu arasındaki
  ilerleme kuralına bağlanır.
- Telafi içeriği konu açıklaması, kaynak ve gerekli olduğunda yeni
  değerlendirme içerebilir.
- Kullanıcı telafi düğümündeki konuyu tamamlayıp gerekli
  değerlendirmeyi geçmeden sonraki ana konu açılmaz.
- Telafi tamamlanınca ana roadmap'te ilerleme devam eder.
- Aynı hata tekrarlandığında sistem mevcut telafi düğümünü
  güncelleyebilir veya yeniden değerlendirme sunabilir; gereksiz
  çoğaltma yapmamalıdır.

### 5.7 İlerleme takibi

- Her düğümün durumu takip edilir.
- Durumlar en azından "Kilitli", "Başlanabilir", "Devam ediyor",
  "Tamamlandı" ve "Telafi gerekiyor" durumlarını kapsamalıdır.
- Tamamlanma, ilgili testin geçilmesine dayanır.
- İsteğe bağlı proje tamamlanması ayrı kaydedilir.
- İlerleme göstergesi, tamamlanan düğümler ve toplam gerekli düğümler
  üzerinden hesaplanabilir; telafi düğümlerinin ilerleme yüzdesine
  etkisi ürün kararı olarak ayrıca belirlenmelidir.

### 5.8 Nihai sonuç üretimi

- Roadmap'in tamamlanmasıyla sonuç sayfası oluşturulur.
- Kazanılan yetkinlikler yalnızca tamamlanma ve değerlendirme
  kayıtlarıyla desteklenen konuları kapsamalıdır.
- Üretilen çıktılar, kullanıcının tamamladığı görevlerden veya hedef
  çıktısından gelmelidir.
- Sonraki adım önerileri tamamlanan hedefle ilişkili olmalıdır.
- Sistem, ölçmediği bir beceri için kesin yeterlilik iddiasında
  bulunmamalıdır.

---

## 6. Kullanıcı akışları

### 6.1 Ana akış

1.  Kullanıcı ana sayfaya girer.
2.  "Öğren" eylemini seçer.
3.  Sistem "Neyi başarmak istiyorsun?" sorusunu gösterir.
4.  Kullanıcı somut hedef veya çıktı girer.
5.  AI hedefi analiz eder.
6.  Gerekirse AI hedefi netleştiren sorular sorar.
7.  AI, başlangıç seviyesini belirlemek için hedefe özgü sorular
    oluşturur.
8.  Kullanıcı soruları yanıtlar.
9.  AI, cevapları değerlendirir ve öğrenme grafiğini oluşturur.
10. Kullanıcı ana grafiği görür.
11. Kullanıcı erişilebilir bir konu düğümünü açar.
12. Konu içeriğini ve kaynakları inceler.
13. İsterse ilgili proje/görevi yapar; bu adım zorunlu değildir.
14. Kullanıcı çoktan seçmeli testi tamamlar.
15. Sistem test sonucunu değerlendirir.
16. Test geçildiyse ilgili düğüm tamamlanır ve ön koşulları karşılanan
    sonraki ana düğüm erişilebilir olur.
17. Testte yanlış cevaplanan konu veya konular için telafi düğümleri
    oluşturulur.
18. Kullanıcı telafi konularını çalışır ve gerekli değerlendirmeleri
    geçer.
19. Telafi koşulları karşılanınca bir sonraki ana konuya geçilir.
20. Bu döngü, gerekli ana roadmap düğümleri tamamlanana kadar devam
    eder.
21. Sistem nihai sonuç sayfasını gösterir: kazanılan yetkinlikler,
    üretilen çıktılar ve bir sonraki adım önerileri.

### 6.2 Başarılı test akışı

1.  Kullanıcı konu testini gönderir.
2.  Sistem cevapları ve başarı eşiğini değerlendirir.
3.  Kullanıcı başarı eşiğini karşılar.
4.  İlgili konu "Tamamlandı" durumuna geçer.
5.  Ön koşulları karşılanan sonraki düğüm veya düğümler açılır.
6.  Kullanıcı roadmap üzerinde devam eder.

### 6.3 Başarısız test ve telafi akışı

1.  Kullanıcı konu testini gönderir.
2.  Sistem cevapları değerlendirir.
3.  Kullanıcı başarı eşiğini karşılayamaz.
4.  Sistem yanlış cevaplanan konu veya konuları belirler.
5.  Yalnızca bu konular için telafi düğümleri oluşturulur.
6.  Telafi düğümleri graf üzerinde görünür ve ilgili sonraki ana konuya
    ilerleme kısıtını açıklar.
7.  Kullanıcı telafi içeriğini çalışır.
8.  Kullanıcı telafi için tanımlanan değerlendirmeyi tamamlar.
9.  Telafi konularının tümü gerekli koşulları karşılayınca ilerleme
    kilidi kaldırılır.
10. Kullanıcı sonraki ana konuya geçer.

### 6.4 İsteğe bağlı proje akışı

1.  Kullanıcı konu içeriğinin sonunda proje/görev önerisini görür.
2.  Kullanıcı görevi yapmayı veya atlamayı seçer.
3.  Yapmayı seçerse görev açıklamasını ve beklenen çıktıyı görür.
4.  Kullanıcı çıktısını tamamlar.
5.  Sistem, MVP kapsamında görevi tamamlandı olarak kaydedebilir;
    otomatik kalite değerlendirmesi zorunlu değildir.
6.  Görev sonucu, uygun olduğunda nihai çıktı özetine eklenir.
7.  Projeyi atlamak konu testini veya ana roadmap ilerleme kurallarını
    değiştirmez.

---

## 7. İş kuralları

**BR-01 --- Tek hedef girişi:** Başlangıçta kullanıcıdan beceri türü
seçmesi istenmez; kullanıcı doğrudan somut hedef veya çıktı girer.

**BR-02 --- Hedefe özel soru üretimi:** Başlangıç seviyesi soruları
kullanıcının hedefi ve hedef için gerekli yetkinlikler doğrultusunda AI
tarafından oluşturulur. Her hedefte aynı anket kullanılmaz.

**BR-03 --- Hedef netliği:** Hedef yeterince açık değilse sistem roadmap
oluşturmadan önce netleştirme soruları sorabilir.

**BR-04 --- Kişiselleştirilmiş grafik:** Roadmap; hedef, kullanıcı
yanıtları, başlangıç seviyesi tahmini ve gerekli ön koşullarla tutarlı
olmalıdır.

**BR-05 --- Bağımlılıklar:** Bir düğüm, tanımlanmış ön koşulları
tamamlanmadan erişilebilir olmamalıdır. Birden fazla bağımsız düğüm aynı
anda erişilebilir olabilir.

**BR-06 --- Konu tamamlanması:** Bir ana konu, o konu için tanımlanan
çoktan seçmeli testte başarı eşiği karşılanmadan tamamlanmış sayılmaz.

**BR-07 --- Telafi kapsamı:** Test başarısız olduğunda yalnızca yanlış
cevaplanan konu veya konular için telafi düğümleri oluşturulur. Yanlış
cevaplanmayan konular için telafi düğümü açılmaz.

**BR-08 --- Telafi kilidi:** İlgili telafi düğümleri tamamlanmadan bir
sonraki ana konuya geçiş yapılamaz.

**BR-09 --- Telafi tamamlanması:** Telafi konusunun tamamlanma ölçütü,
gerekli öğrenme etkinliğinin ve telafi değerlendirmesinin
tamamlanmasıdır. Sadece düğümü açmak veya içeriği görüntülemek yeterli
değildir.

**BR-10 --- Ana akışa dönüş:** Gerekli telafi konuları tamamlandıktan
sonra kullanıcı ana roadmap akışına geri döner ve sonraki ana konuya
geçebilir.

**BR-11 --- İsteğe bağlı projeler:** Konu sonunda sunulan proje/görev
isteğe bağlıdır ve çoktan seçmeli testin yerine geçmez.

**BR-12 --- Proje durumu:** Projenin yapılması veya atlanması, ayrı bir
durum olarak tutulur; konu testi durumuyla birleştirilmez.

**BR-13 --- Nihai sonuç:** Roadmap'in sonunda kazanılan yetkinlikler,
üretilen çıktılar ve bir sonraki adım önerileri gösterilir.

**BR-14 --- Kanıta dayalı iddialar:** Sonuç sayfası, sistemin
değerlendirmediği yetkinlikleri doğrulanmış gibi sunamaz.

**BR-15 --- Kaynak güvenilirliği:** Sistem kaynak bağlantısı
uydurmamalı; kaynak doğrulanamıyorsa bunu belirtmelidir.

**BR-16 --- Telafi düğümü çoğalması:** Aynı konu için tekrarlanan
hatalarda gereksiz ve yinelenen telafi düğümleri üretilmemelidir.

**BR-17 --- İlerleme durumu:** Düğüm durumu test sonucu, ön koşullar ve
telafi koşullarıyla tutarlı olmalıdır.

**BR-18 --- Hedef tamamlama:** Nihai hedefin tamamlanması, yalnızca tüm
konu kutularının işaretlenmesine değil, roadmap oluşturulurken
tanımlanan zorunlu koşulların karşılanmasına dayanmalıdır.

---

## 8. Kabul kriterleri

### 8.1 Hedef girişi ve netleştirme

- [ ] Kullanıcı ana sayfadan hedef girişine erişebilir.
- [ ] Başlangıç akışında ayrı "beceri öğren" ve "somut çıktı"
      seçimleri bulunmaz.
- [ ] Kullanıcı somut hedef veya çıktı metni girebilir.
- [ ] Belirsiz hedefler için sistem ek soru sorabilir.
- [ ] Hedef netleşmeden roadmap oluşturulmaz.

### 8.2 Hedefe özel seviye tespiti

- [ ] Sorular girilen hedefe göre oluşturulur.
- [ ] Farklı hedefler için farklı soru setleri oluşturulabilir.
- [ ] Sorular hedefin gerektirdiği ön koşul yetkinliklerini
      değerlendirmeyi amaçlar.
- [ ] Kullanıcı yanıtları roadmap'in içeriğini veya başlangıç
      noktasını etkiler.
- [ ] Sistem yeterli kanıt bulunmadığında kullanıcının seviyesini
      kesin olarak bildiğini iddia etmez.

### 8.3 Öğrenme grafiği

- [ ] Roadmap ana hedefi ve gerekli yetkinlikleri gösterir.
- [ ] Düğümler arasındaki bağımlılıklar görsel olarak gösterilir.
- [ ] Yetkinlik düğümleri ilgili alt grafiklere açılabilir.
- [ ] Düğüm durumları birbirinden ayırt edilebilir.
- [ ] Ön koşulları karşılanmayan düğümler kilitli kalır.
- [ ] Graf üzerinde kullanıcı bulunduğu konumu ve ana hedefe dönüş
      yolunu anlayabilir.

### 8.4 Konu içeriği ve kaynaklar

- [ ] Her konu için konu adı ve öğrenme hedefi gösterilir.
- [ ] Alt başlıklar görüntülenebilir.
- [ ] Konuyla ilişkili kaynak bağlantıları sunulur veya kaynak
      bulunamadığı belirtilir.
- [ ] Konu sonunda çoktan seçmeli teste erişilebilir.
- [ ] Uygun konularda isteğe bağlı proje/görev sunulabilir.

### 8.5 Test ve ilerleme

- [ ] Test soruları ilgili konunun öğrenme hedefleriyle ilişkilidir.
- [ ] Başarı eşiği karşılanınca konu tamamlandı olarak işaretlenir.
- [ ] Test sonucu başarısızsa konu tamamlanmış sayılmaz.
- [ ] Başarılı test sonrasında yalnızca ön koşulları karşılanan
      sonraki düğümler açılır.
- [ ] Projeyi atlamak testten geçme kuralını değiştirmez.

### 8.6 Telafi düğümleri

- [ ] Başarısız testte yanlış cevaplanan konular belirlenir.
- [ ] Yalnızca yanlış cevaplanan konular için telafi düğümü açılır.
- [ ] Telafi düğümü kullanıcıya açık ve anlaşılır biçimde gösterilir.
- [ ] İlgili telafi tamamlanmadan bir sonraki ana konuya geçilemez.
- [ ] Telafi için gerekli değerlendirme geçilince kilit kaldırılır.
- [ ] Gerekli telafiler tamamlandığında kullanıcı ana roadmap'e geri
      döner.
- [ ] Tekrarlanan hatalar gereksiz düğüm çoğalmasına yol açmaz.

### 8.7 Sonuç sayfası

- [ ] Roadmap sonunda kazanılan yetkinlikler gösterilir.
- [ ] Üretilen çıktılar gösterilir; çıktı yoksa bu durum açıkça
      belirtilir.
- [ ] Bir sonraki adım önerileri gösterilir.
- [ ] Doğrulanmamış beceriler kazanılmış veya kanıtlanmış gibi
      sunulmaz.

---

## 9. Kapsam dışı özellikler

Aşağıdaki özellikler ilk hackathon MVP'si için zorunlu değildir:

- Sosyal öğrenme, arkadaş ekleme, grup çalışma alanları ve akran
  değerlendirmesi.
- Öğretmen, kurum yöneticisi veya sınıf yönetimi panelleri.
- Sertifika verme veya resmî yeterlilik belgelendirme.
- Kullanıcının tüm becerilerini ölçen genel amaçlı ve doğrulanmış bir
  yeterlilik sınavı sistemi.
- Tüm proje türleri için otomatik, güvenilir ve kapsamlı kod/ürün
  değerlendirmesi.
- Gerçek zamanlı mentor veya insan eğitmen desteği.
- Gelişmiş oyunlaştırma, liderlik tabloları ve ödül ekonomisi.
- Çok kullanıcılı ortak roadmap düzenleme.
- Harici öğrenme platformlarıyla kapsamlı entegrasyon.
- Öğrenme içeriğinin tamamının sistem içinde barındırılması; MVP
  kaynak bağlantıları sunabilir.
- Kullanıcının hedefini değiştirdiği her durumda tüm roadmap'in
  otomatik ve kapsamlı biçimde yeniden planlanması.
- Gelişmiş analitik, kurumsal raporlama ve yönetici panelleri.
- Çoklu dil desteği; ilk sürümün dili Türkçe olarak ele alınabilir.
- Her tür becerinin yalnızca çoktan seçmeli testlerle güvenilir
  biçimde ölçüldüğünü iddia etmek.
- Mobil uygulama; ilk ürün bir web uygulamasıdır.

Bu liste, ilgili özelliklerin gelecekte eklenemeyeceği anlamına gelmez;
yalnızca ilk sürümde ana öğrenme döngüsünün doğrulanmasına öncelik
verir.

---

## 10. Belirsiz kalan gereksinimler

Aşağıdaki kararlar geliştirme başlamadan önce ürün ekibi tarafından
netleştirilmelidir. Geçici öneriler, kararların görünür olması için
eklenmiştir; kesinleşmiş gereksinim olarak değerlendirilmemelidir.

---

ID Belirsiz gereksinim Neden önemli? Geçici öneri

---

U-01 Kullanıcı hesabı İlerlemenin MVP'de kalıcı
zorunlu mu? oturumlar kayıt mümkünse
arasında desteklensin;
saklanmasını değilse oturum
belirler. kapsamı açıkça
tanımlansın.

U-02 Hedefin yeterince Roadmap AI hedefi kontrol
somut olduğuna kim kalitesini etsin; belirsiz
karar verir? etkiler. hedeflerde takip
sorusu sorsun.

U-03 Seviye belirleme Kullanıcı Hedefe göre
sorularının sayısı deneyimi ve ölçüm değişken sayıda
ve formatı ne kalitesini soru; gerektiğinde
olacak? etkiler. tanılayıcı görev.

U-04 Test başına soru Test süresi ve Konu kapsamına
sayısı ne olacak? ölçüm göre değişen,
güvenilirliğini MVP'de sınırlı bir
etkiler. soru seti.

U-05 Test başarı eşiği Düğüm Konu başına
nasıl belirlenecek? tamamlanmasını ve tanımlı eşik;
ilerlemeyi MVP'de başlangıçta
kontrol eder. ortak bir
varsayılan
kullanılabilir.

U-06 Yanlış cevap hangi Telafi düğümünün Her soruyu önceden
konuya eşlenecek? doğruluğunu tanımlanmış bir
belirler. konu/alt beceri
etiketiyle
ilişkilendirmek.

U-07 Bir sorunun birden Karmaşık Gerekli olduğunda
fazla konu etiketi soruların birden fazla
olabilir mi? telafisini etiket
etkiler. desteklensin;
yalnızca yanlış
cevapla ilişkili
konular açılsın.

U-08 Telafi düğümü testte Grafın boyutunu Her yanlış konu
yanlış cevaplanan ve kullanıcı için ayrı düğüm;
her konu için ayrı deneyimini aynı konuya ait
mı olacak? etkiler. tekrarlar tek
düğümde
birleştirilsin.

U-09 Telafi düğümünün Ana akışın ne Kısa telafi
geçme kriteri ne zaman açılacağını içeriği ve yeni
olacak? belirler. sorularla yeniden
değerlendirme.

U-10 Telafi Sonsuz döngü ve Aynı düğüm
değerlendirmesinde kullanıcı güncellensin;
kullanıcı tekrar tıkanmasını alternatif
başarısız olursa ne önler. açıklama veya yeni
olacak? örnek sunulsun.

U-11 Sonraki ana konu tek Graf Ön koşulları
bir düğüm mü, birden navigasyonunu karşılanan tüm
fazla paralel düğüm etkiler. düğümler
mü olabilir? erişilebilir
olabilir;
kullanıcıya
önerilen sıradaki
düğüm ayrıca
vurgulanabilir.

U-12 Projeler nasıl Üretilen çıktının MVP'de görev,
değerlendirilecek? doğrulanmasını beklenen çıktı ve
etkiler. ölçütleri
gösterilsin;
otomatik puanlama
zorunlu olmasın.

U-13 "Üretilen çıktılar" Sonuç ekranının Kullanıcının
hangi durumlarda doğruluğunu tamamladığı
gösterilecek? etkiler. görevler ve
doğrulanabilen
nihai çıktılar
listelensin.

U-14 Nihai hedefin Roadmap'in Roadmap üretiminde
tamamlanma koşulu gerçekten hedefe zorunlu
nasıl tanımlanacak? ulaşıp yetkinlikler ve
ulaşmadığını nihai çıktı
belirler. koşulları
tanımlansın.

U-15 Kaynak bağlantıları Kırık veya Mümkünse bağlantı
nasıl doğrulanacak? alakasız bağlantı kontrolü ve kaynak
riskini etkiler. meta verisi;
doğrulanamayan
bağlantı için açık
uyarı.

U-16 Roadmap üretimi için Gecikme, maliyet MVP öncesinde
hangi AI modeli ve ve çıktı model ve istek
maliyet sınırı kalitesini başına maliyet
kullanılacak? etkiler. sınırı
belirlenmeli.

U-17 AI'ın ürettiği Döngü, eksik ön Yapısal şema
grafın tutarlılığı koşul veya doğrulaması ve
nasıl kontrol gereksiz düğüm döngü/boş alan
edilecek? riskini etkiler. kontrolleri.

U-18 İlerleme yüzdesi Kullanıcıya Ana roadmap
telafi düğümlerini gösterilen ilerlemesi ve
içerecek mi? ilerleme oranını telafi durumu ayrı
etkiler. gösterilsin.

U-19 Kullanıcı roadmap'i Kişiselleştirme MVP'de hedefi
düzenleyebilecek mi? ve plan netleştirme ve
kararlılığını planı onaylama
etkiler. yeterli olabilir.

U-20 İlk sürümde hangi Kalite güvencesi En az bir akademik
hedef türleri test ve demo kapsamını öğrenme hedefi,
edilecek? belirler. bir mesleki hedef
ve bir somut ürün
çıktısı senaryosu
test edilsin.

---

### 10.1 MVP öncesi çözülmesi gereken kritik belirsizlikler

Geliştirme başlamadan önce en azından şu kararlar kesinleştirilmelidir:

1.  Testte yanlış cevaplanan soruların hangi konu düğümüne bağlanacağı.
2.  Telafi düğümünün hangi koşulda tamamlanacağı.
3.  Telafi tamamlanınca hangi ana düğümün açılacağı.
4.  Ana roadmap ilerlemesi ile telafi ilerlemesinin nasıl gösterileceği.
5.  Nihai hedefin hangi zorunlu ölçütlerle tamamlanmış sayılacağı.
6.  AI'ın oluşturduğu roadmap ve testlerin hangi yapısal kontrollerden
    geçeceği.

Bu kararlar, arayüz geliştirmesinden önce veri modelini ve uygulama
akışını etkiler.

---

## MVP başarı ölçütleri

Hackathon MVP'sinde ürünün başarısı, yalnızca roadmap üretebilmesiyle
ölçülmemelidir. Önerilen doğrulama ölçütleri:

- Farklı türde somut hedefler için anlamlı ve tutarlı roadmap
  üretebilmesi.
- Hedefe özel soruların farklı kullanıcı profillerinde farklı
  başlangıç yolları oluşturabilmesi.
- Ana grafın ön koşul ilişkilerini doğru şekilde gösterebilmesi.
- Test başarısının düğüm durumuna doğru yansıması.
- Yanlış cevaplanan konular için yalnızca ilgili telafi düğümlerinin
  açılması.
- Telafi tamamlanmadan ilgili sonraki ana konuya geçişin engellenmesi.
- Telafi tamamlandığında ana öğrenme akışının devam etmesi.
- Sonuç sayfasının kazanılan yetkinlikleri, üretilen çıktıları ve
  sonraki adım önerilerini sunması.

Bu ölçütler, ürünün temel vaadini teknik gösterimden öteye taşıyarak
uçtan uca çalışan bir öğrenme döngüsüyle kanıtlamaya yardımcı olur.
