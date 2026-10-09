import { type Edge, type Node } from '@xyflow/react'
import { type NodeData, type QuizData } from '@/types/canvas'

// 1. Root Expedition Map Nodes (Bottom-to-Top Mountain Climbing Route)
export const initialRootNodes: Node<NodeData>[] = [
  // Basecamp: Database & Core Infrastructure (y: 720)
  {
    id: 'domain-db',
    type: 'milestone',
    position: { x: 380, y: 720 },
    data: {
      id: 'domain-db',
      titleTr: 'Veritabanı & Veri Depolama',
      titleEn: 'Database & Storage Layer',
      category: 'domain',
      status: 'available',
      stepNumber: '01',
      domain: 'Database',
      milestoneScale: 'md',
      labelPosition: 'right',
      estimatedHours: 15,
      whyNeededTr: 'Egzersiz katalogları ve kullanıcı antrenman geçmişinin PostgreSQL ve Redis ile saklanması.',
      whyNeededEn: 'Persisting workout catalogs and telemetry logs with PostgreSQL and fast Redis caching.',
      learningObjectivesTr: ['PostgreSQL Tablo Şeması', 'İlişkisel İndeksleme', 'Redis Önbellek Yönetimi'],
      learningObjectivesEn: ['PostgreSQL Schema Design', 'Relational Indexing', 'Redis Cache Invalidation'],
      practicalTaskTr: 'Egzersiz şeması tablolarını ve kullanıcı profili indekslerini oluşturun.',
      practicalTaskEn: 'Author workout tables and user profile indexing strategy.',
    },
  },

  // Branch Left: Mobile Development (y: 530, x: 190)
  {
    id: 'domain-mobile',
    type: 'milestone',
    position: { x: 190, y: 530 },
    data: {
      id: 'domain-mobile',
      titleTr: 'Mobil Arayüz (React Native)',
      titleEn: 'Mobile App (React Native)',
      category: 'domain',
      status: 'available',
      stepNumber: '02',
      domain: 'Mobile',
      milestoneScale: 'md',
      labelPosition: 'left',
      estimatedHours: 35,
      whyNeededTr: 'Kullanıcıların antrenman takibi yapacağı modern, akıcı ve duyarlı iOS/Android mobil deneyimi.',
      whyNeededEn: 'Fluid cross-platform iOS/Android UI for interactive workout tracking and telemetry.',
      learningObjectivesTr: ['React Native & Expo', 'Navigation & Yerel Durum', 'Çevrimdışı Önbellekleme'],
      learningObjectivesEn: ['React Native & Expo', 'Navigation & Local State', 'Offline Caching'],
      practicalTaskTr: 'Kullanıcı profili ve günlük egzersiz kartları ekranlarını kodlayın.',
      practicalTaskEn: 'Build user profile and daily workout cards screens.',
    },
  },

  // Branch Right: Backend & Core APIs (y: 530, x: 570)
  {
    id: 'domain-backend',
    type: 'milestone',
    position: { x: 570, y: 530 },
    data: {
      id: 'domain-backend',
      titleTr: 'Backend ve API Mimarisi',
      titleEn: 'Backend & API Architecture',
      category: 'domain',
      status: 'in_progress',
      stepNumber: '03',
      domain: 'Backend',
      milestoneScale: 'md',
      labelPosition: 'right',
      estimatedHours: 30,
      whyNeededTr: 'Kullanıcı yetkilendirmesi, egzersiz kayıtları ve ML model çıkarımlarına güvenli erişim katmanı.',
      whyNeededEn: 'Secure services providing auth, workout logs, and ML model inference access.',
      learningObjectivesTr: ['RESTful API Tasarımı', 'JWT Kimlik Doğrulama', 'Asenkron İstek Yönetimi'],
      learningObjectivesEn: ['RESTful API Design', 'JWT Authentication', 'Async Request Handling'],
      practicalTaskTr: 'Kullanıcı oturum ve egzersiz kaydetme API uç noktalarını kodlayın.',
      practicalTaskEn: 'Develop user auth and workout logging endpoints.',
    },
  },

  // Middle Convergence: Machine Learning Engine (y: 340, x: 380) [Contains Nested Submap]
  {
    id: 'domain-ml',
    type: 'milestone',
    position: { x: 380, y: 340 },
    data: {
      id: 'domain-ml',
      titleTr: 'Machine Learning (Öneri Motoru)',
      titleEn: 'Machine Learning (Engine)',
      category: 'domain',
      status: 'available',
      stepNumber: '04',
      domain: 'AI/ML',
      hasSubmap: true,
      submapId: 'ml-submap',
      milestoneScale: 'lg',
      labelPosition: 'right',
      estimatedHours: 40,
      whyNeededTr: 'Kullanıcının geçmiş antrenmanları, nabız verileri ve hedeflerine göre en uygun egzersizleri tahmin eden akıllı model.',
      whyNeededEn: 'Intelligent engine predicting tailored exercises based on user logs and physiological fitness metrics.',
      learningObjectivesTr: [
        'Python ve veri bilimi kütüphaneleri',
        'Model eğitimi ve değerlendirmesi',
        'Fitness öneri algoritması geliştirme',
      ],
      learningObjectivesEn: [
        'Python & data science toolkits',
        'Model training and evaluation metrics',
        'Authoring fitness recommendation algorithm',
      ],
      practicalTaskTr: 'Alt haritayı açarak adım adım öneri motorunu inşa edin.',
      practicalTaskEn: 'Open the submap to construct the recommendation model step-by-step.',
    },
  },

  // High Elevation: Testing & Cloud Deployment (y: 180, x: 380)
  {
    id: 'domain-deploy',
    type: 'milestone',
    position: { x: 380, y: 180 },
    data: {
      id: 'domain-deploy',
      titleTr: 'Test, CI/CD ve Yayınlama',
      titleEn: 'Testing, CI/CD & Cloud',
      category: 'domain',
      status: 'locked',
      stepNumber: '05',
      domain: 'DevOps',
      milestoneScale: 'md',
      labelPosition: 'right',
      estimatedHours: 15,
      whyNeededTr: 'Sistemin kararlı çalışması için otomatik testler ve bulut ortamında container dağıtımı.',
      whyNeededEn: 'Automated test suite and cloud containerization for production reliability.',
      learningObjectivesTr: ['Docker Konteynerleri', 'GitHub Actions CI', 'Bulut Dağıtımı'],
      learningObjectivesEn: ['Docker Containers', 'GitHub Actions CI', 'Cloud Deployment'],
      practicalTaskTr: 'Docker compose yapılandırması ve CI test pipeline hazırlayın.',
      practicalTaskEn: 'Create Docker compose environment and CI pipeline.',
    },
  },

  // The Summit: AI Fitness App (y: 40, x: 380)
  {
    id: 'root-project',
    type: 'milestone',
    position: { x: 380, y: 40 },
    data: {
      id: 'root-project',
      titleTr: 'AI Fitness App (MVP Lansmanı)',
      titleEn: 'AI Fitness App (Summit Goal)',
      category: 'root',
      status: 'in_progress',
      milestoneScale: 'lg',
      labelPosition: 'bottom',
      estimatedHours: 120,
      whyNeededTr: 'Kullanıcının fitness hedeflerine göre uyarlanabilir egzersiz ve beslenme önerisi sunan tam teşekküllü mobil ve yapay zekâ uygulaması.',
      whyNeededEn: 'Full-stack mobile and AI application delivering personalized workout and nutrition recommendations.',
      learningObjectivesTr: [
        'Uçtan uca ürün mimarisini tamamlama',
        'Mobil ön yüz, API servisleri ve ML modelini birleştirme',
        'Canlı kullanıcı testi ve lansman',
      ],
      learningObjectivesEn: [
        'Complete end-to-end product architecture',
        'Integrate mobile client, REST APIs, and ML inference model',
        'Live pilot testing and launch',
      ],
      practicalTaskTr: 'Tüm aşamaları birleştirerek çalışan uygulamayı yayına alın.',
      practicalTaskEn: 'Assemble all components into a running production release.',
    },
  },
]

// Root Expedition Route Edges (Curved Bezier Paths Climbing Upward)
export const initialRootEdges: Edge[] = [
  // From Basecamp (DB) to Mobile and Backend
  { id: 'e-db-mobile', source: 'domain-db', target: 'domain-mobile', type: 'expedition', data: { isCompleted: true } },
  { id: 'e-db-backend', source: 'domain-db', target: 'domain-backend', type: 'expedition', data: { isActive: true } },

  // From Mobile and Backend to ML Convergence
  { id: 'e-mobile-ml', source: 'domain-mobile', target: 'domain-ml', type: 'expedition' },
  { id: 'e-backend-ml', source: 'domain-backend', target: 'domain-ml', type: 'expedition', data: { isActive: true } },

  // From ML to Deployment
  { id: 'e-ml-deploy', source: 'domain-ml', target: 'domain-deploy', type: 'expedition' },

  // From Deployment to Summit Goal
  { id: 'e-deploy-summit', source: 'domain-deploy', target: 'root-project', type: 'expedition' },
]

// 2. Machine Learning Expedition Submap (Bottom-to-Top Progression)
export const initialMlSubmapNodes: Node<NodeData>[] = [
  // Basecamp: Python Fundamentals (y: 840, x: 360)
  {
    id: 'ml-python',
    type: 'milestone',
    position: { x: 360, y: 840 },
    data: {
      id: 'ml-python',
      titleTr: 'Python Temelleri',
      titleEn: 'Python Fundamentals',
      category: 'learning',
      status: 'available',
      stepNumber: '01',
      domain: 'AI/ML',
      milestoneScale: 'md',
      labelPosition: 'right',
      estimatedHours: 8,
      quizId: 'quiz-python',
      whyNeededTr: 'Veri analizi, modelleme ve API entegrasyonlarının temel programlama dili.',
      whyNeededEn: 'Core language for data manipulation, mathematical computing, and model prototyping.',
      prerequisitesTr: ['Temel programlama mantığı'],
      prerequisitesEn: ['Basic programming logic'],
      learningObjectivesTr: [
        'Fonksiyonlar, döngüler ve koşullar',
        'Listeler, sözlükler ve veri yapıları',
        'Hata yakalama ve modüler kod yazımı',
      ],
      learningObjectivesEn: [
        'Functions, loops, and branching logic',
        'Lists, dictionaries, and memory structures',
        'Exception handling and modular structure',
      ],
      practicalTaskTr: 'Kullanıcının bazal metabolizma hızını (BMR) ve kalori ihtiyacını hesaplayan bir Python fonksiyonu yazın.',
      practicalTaskEn: 'Write a Python function computing user basal metabolic rate (BMR) and daily caloric target.',
      resources: [
        { title: 'Python.org Official Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'doc' },
        { title: 'Core Data Structures in Python', url: '#', type: 'interactive' },
      ],
    },
  },

  // Branch Left (Data Route): NumPy & Pandas (y: 660, x: 190)
  {
    id: 'ml-numpy-pandas',
    type: 'milestone',
    position: { x: 190, y: 660 },
    data: {
      id: 'ml-numpy-pandas',
      titleTr: 'NumPy ve Pandas',
      titleEn: 'NumPy & Pandas',
      category: 'learning',
      status: 'locked',
      stepNumber: '02',
      domain: 'AI/ML',
      milestoneScale: 'sm',
      labelPosition: 'left',
      estimatedHours: 6,
      whyNeededTr: 'Egzersiz tablolarını ve kullanıcı verilerini matris formatında hızlıca işlemek için.',
      whyNeededEn: 'High-speed matrix operations and dataframe filtering for user fitness records.',
      prerequisitesTr: ['Python Temelleri'],
      prerequisitesEn: ['Python Fundamentals'],
      learningObjectivesTr: ['NumPy Dizileri ve Vektörizasyon', 'Pandas DataFrame İşlemleri', 'Eksik Veri Yönetimi'],
      learningObjectivesEn: ['NumPy Arrays & Vectorization', 'Pandas DataFrame Operations', 'Handling Missing Values'],
      practicalTaskTr: '1000 kullanıcılık örnek antrenman CSV dosyasını okuyun ve ortalama egzersiz sürelerini hesaplayın.',
      practicalTaskEn: 'Load a sample workout CSV dataset and compute average duration grouped by exercise type.',
    },
  },

  // Branch Left (Data Route): Data Prep & Feature Engineering (y: 500, x: 190)
  {
    id: 'ml-data-prep',
    type: 'milestone',
    position: { x: 190, y: 500 },
    data: {
      id: 'ml-data-prep',
      titleTr: 'Veri Hazırlama & Özellik Çıkarımı',
      titleEn: 'Data Prep & Feature Engineering',
      category: 'learning',
      status: 'locked',
      stepNumber: '03',
      domain: 'AI/ML',
      milestoneScale: 'sm',
      labelPosition: 'left',
      estimatedHours: 8,
      whyNeededTr: 'Ham kullanıcı verilerini modelin anlayabileceği normalize edilmiş özelliklere dönüştürmek.',
      whyNeededEn: 'Transforming raw telemetry into normalized numerical features for training.',
      prerequisitesTr: ['NumPy ve Pandas'],
      prerequisitesEn: ['NumPy & Pandas'],
      learningObjectivesTr: ['Min-Max Normalizasyon', 'Kategorik Veri Kodlama (One-Hot)', 'Eğitim/Test Veri Ayrımı'],
      learningObjectivesEn: ['Min-Max Feature Scaling', 'One-Hot Categorical Encoding', 'Train/Validation Splitting'],
      practicalTaskTr: 'Fitness veri setini %80 eğitim ve %20 test olacak şekilde ölçekleyip ayırın.',
      practicalTaskEn: 'Scale fitness features and partition into 80% train and 20% test splits.',
    },
  },

  // Branch Right (Algorithm Route): Machine Learning Foundations (y: 660, x: 530)
  {
    id: 'ml-basics',
    type: 'milestone',
    position: { x: 530, y: 660 },
    data: {
      id: 'ml-basics',
      titleTr: 'ML Temel Kavramları',
      titleEn: 'ML Foundations',
      category: 'learning',
      status: 'available',
      stepNumber: '04',
      domain: 'AI/ML',
      milestoneScale: 'sm',
      labelPosition: 'right',
      estimatedHours: 6,
      whyNeededTr: 'Denetimli ve denetimsiz öğrenme kavramlarını, kayıp fonksiyonlarını ve tahmin mantığını kavramak.',
      whyNeededEn: 'Understanding supervised vs unsupervised paradigm, loss functions, and inference logic.',
      prerequisitesTr: ['Temel matematiksel kavramlar'],
      prerequisitesEn: ['Basic mathematical foundations'],
      learningObjectivesTr: ['Gözetimli vs Gözetimsiz Öğrenme', 'Kayıp Fonksiyonları (Loss Functions)', 'Aşırı Öğrenme (Overfitting)'],
      learningObjectivesEn: ['Supervised vs Unsupervised Learning', 'Loss Functions & Gradients', 'Overfitting Prevention'],
      practicalTaskTr: 'Basit bir doğrusal regresyon mantığıyla kalori harcamasını tahmin edin.',
      practicalTaskEn: 'Predict caloric burn using simple linear regression principles.',
    },
  },

  // Branch Right (Algorithm Route): Supervised Learning (y: 500, x: 530)
  {
    id: 'ml-supervised',
    type: 'milestone',
    position: { x: 530, y: 500 },
    data: {
      id: 'ml-supervised',
      titleTr: 'Supervised Learning & Sınıflandırma',
      titleEn: 'Supervised Learning',
      category: 'learning',
      status: 'locked',
      stepNumber: '05',
      domain: 'AI/ML',
      milestoneScale: 'sm',
      labelPosition: 'right',
      estimatedHours: 8,
      whyNeededTr: 'Kullanıcının fitness seviyesine göre doğru egzersiz kategorisini sınıflandırmak.',
      whyNeededEn: 'Classifying appropriate workout difficulty tier based on user state.',
      prerequisitesTr: ['ML Temel Kavramları'],
      prerequisitesEn: ['ML Foundations'],
      learningObjectivesTr: ['Lojistik Regresyon & Karar Ağaçları', 'K-Nearest Neighbors (KNN)', 'Scikit-Learn Kütüphanesi'],
      learningObjectivesEn: ['Logistic Regression & Decision Trees', 'K-Nearest Neighbors (KNN)', 'Scikit-Learn Library'],
      practicalTaskTr: 'Scikit-Learn ile kullanıcının seviyesini tahmin eden bir sınıflandırıcı eğitin.',
      practicalTaskEn: 'Train a Scikit-Learn classifier to categorize user fitness difficulty tier.',
    },
  },

  // Ridge Convergence: Model Training & Tuning (y: 340, x: 360)
  {
    id: 'ml-training',
    type: 'milestone',
    position: { x: 360, y: 340 },
    data: {
      id: 'ml-training',
      titleTr: 'Model Eğitimi ve Optimizasyon',
      titleEn: 'Model Training & Tuning',
      category: 'learning',
      status: 'locked',
      stepNumber: '06',
      domain: 'AI/ML',
      milestoneScale: 'md',
      labelPosition: 'right',
      estimatedHours: 6,
      whyNeededTr: 'Modelin en yüksek doğrulukla antrenman önermesini sağlamak için hiperparametre optimizasyonu.',
      whyNeededEn: 'Tuning parameters to maximize precision when suggesting exercise routines.',
      prerequisitesTr: ['Veri Hazırlama & Özellik Çıkarımı', 'Supervised Learning & Sınıflandırma'],
      prerequisitesEn: ['Data Prep & Feature Engineering', 'Supervised Learning'],
      learningObjectivesTr: ['K-Fold Çapraz Doğrulama (Cross Validation)', 'GridSearchCV ile Ayarlama', 'Model Kaydetme (Joblib)'],
      learningObjectivesEn: ['K-Fold Cross Validation', 'GridSearchCV Hyperparameter Tuning', 'Model Serialization (Joblib)'],
      practicalTaskTr: 'En iyi F1-skorunu veren parametreleri cross-validation ile belirleyin.',
      practicalTaskEn: 'Determine best hyperparameter combination using cross-validation.',
    },
  },

  // Near Summit: Evaluation & Validation (y: 190, x: 360)
  {
    id: 'ml-eval',
    type: 'milestone',
    position: { x: 360, y: 190 },
    data: {
      id: 'ml-eval',
      titleTr: 'Model Değerlendirme & Metrikler',
      titleEn: 'Evaluation & Metrics',
      category: 'learning',
      status: 'locked',
      stepNumber: '07',
      domain: 'AI/ML',
      milestoneScale: 'sm',
      labelPosition: 'right',
      estimatedHours: 6,
      whyNeededTr: 'Öneri motorunun dengeli ve fizyolojik olarak güvenli tavsiyeler ürettiğini kanıtlamak.',
      whyNeededEn: 'Validating that recommendations remain physiologically balanced and accurate.',
      prerequisitesTr: ['Model Eğitimi ve Optimizasyon'],
      prerequisitesEn: ['Model Training & Tuning'],
      learningObjectivesTr: ['Confusion Matrix & Doğruluk', 'Precision, Recall, F1 Skoru', 'A/B Test Temelleri'],
      learningObjectivesEn: ['Confusion Matrix & Accuracy', 'Precision, Recall, F1 Score', 'Offline Evaluation'],
      practicalTaskTr: 'Modelin test veri seti üzerindeki doğruluk ve karmaşıklık matrisini çıkarın.',
      practicalTaskEn: 'Generate confusion matrix and evaluate test set precision and recall.',
    },
  },

  // The ML Expedition Summit Goal (y: 40, x: 360)
  {
    id: 'ml-final-task',
    type: 'milestone',
    position: { x: 360, y: 40 },
    data: {
      id: 'ml-final-task',
      titleTr: 'Fitness Öneri Modeli (Final Servis)',
      titleEn: 'Fitness Recommendation Engine',
      category: 'task',
      status: 'locked',
      stepNumber: '08',
      domain: 'AI/ML',
      milestoneScale: 'lg',
      labelPosition: 'bottom',
      estimatedHours: 12,
      whyNeededTr: 'Tüm aşamaları birleştirerek mobil uygulamaya canlı öneri sunan çalışan Python FastAPI servisi.',
      whyNeededEn: 'Assembling all stages into a deployable inference microservice for the mobile app.',
      prerequisitesTr: ['Model Değerlendirme & Metrikler'],
      prerequisitesEn: ['Evaluation & Metrics'],
      learningObjectivesTr: ['FastAPI ile Model Sunumu', 'Girdi Doğrulama ve Tahmin Döndürme', 'Docker İmajı Oluşturma'],
      learningObjectivesEn: ['FastAPI Model Serving', 'Payload Validation & Inference Response', 'Docker Packaging'],
      practicalTaskTr: 'Eğitilmiş modeli bir FastAPI endpoint arkasında sunarak POST /recommend isteğini yanıtlayın.',
      practicalTaskEn: 'Serve the serialized model behind a FastAPI endpoint responding to POST /recommend.',
    },
  },
]

// Machine Learning Expedition Route Edges (Curved Bezier Paths Climbing Upward)
export const initialMlSubmapEdges: Edge[] = [
  // From Basecamp (Python) branching out to NumPy and ML Basics
  { id: 'e-ml-python-numpy', source: 'ml-python', target: 'ml-numpy-pandas', type: 'expedition' },
  { id: 'e-ml-python-basics', source: 'ml-python', target: 'ml-basics', type: 'expedition', data: { isActive: true } },

  // Left Data Route ascent
  { id: 'e-ml-numpy-dataprep', source: 'ml-numpy-pandas', target: 'ml-data-prep', type: 'expedition' },

  // Right Algorithm Route ascent
  { id: 'e-ml-basics-supervised', source: 'ml-basics', target: 'ml-supervised', type: 'expedition' },

  // Both branches converge into Model Training
  { id: 'e-ml-data-training', source: 'ml-data-prep', target: 'ml-training', type: 'expedition' },
  { id: 'e-ml-supervised-training', source: 'ml-supervised', target: 'ml-training', type: 'expedition' },

  // From Training to Evaluation
  { id: 'e-ml-training-eval', source: 'ml-training', target: 'ml-eval', type: 'expedition' },

  // From Evaluation to Summit Goal
  { id: 'e-ml-eval-final', source: 'ml-eval', target: 'ml-final-task', type: 'expedition' },
]

// 3. Adaptive Remedial Detour Node (Placed near Python along winding route at y: 740, x: 210)
export const remedialPythonNode: Node<NodeData> = {
  id: 'ml-remedial-python',
  type: 'milestone',
  position: { x: 210, y: 740 },
  data: {
    id: 'ml-remedial-python',
    titleTr: 'Python Fonksiyonları — Ek Pratik',
    titleEn: 'Python Functions — Extra Practice',
    category: 'learning',
    status: 'in_progress',
    isRemedial: true,
    stepNumber: '✦',
    domain: 'AI/ML',
    milestoneScale: 'sm',
    labelPosition: 'left',
    estimatedHours: 4,
    whyNeededTr: 'Bilgi değerlendirmesinde eksik görülen fonksiyon yapıları ve parametre aktarımı pekiştirilerek NumPy rotasına güvenle geçiş sağlanır.',
    whyNeededEn: 'Strengthens modular function parameters and return types before advancing to vectorized numerical arrays.',
    prerequisitesTr: ['Python Temelleri'],
    prerequisitesEn: ['Python Fundamentals'],
    learningObjectivesTr: ['Argümanlar ve *args, **kwargs', 'Lambda Fonksiyonları', 'Fonksiyon Döndürme ve Tip İpuçları'],
    learningObjectivesEn: ['Function Arguments & Return Signatures', 'Lambda Expressions', 'Python Type Hinting'],
    practicalTaskTr: '3 farklı fitness hesaplama fonksiyonu (BMI, Kalori, Su İhtiyacı) yazarak tek bir sözlükte birleştirin.',
    practicalTaskEn: 'Author 3 fitness utility functions and package outputs into a structured summary dictionary.',
  },
}

// 4. Interactive Quiz Dataset for Python Temelleri
export const pythonQuizData: QuizData = {
  id: 'quiz-python',
  nodeId: 'ml-python',
  titleTr: 'Python Temelleri — Bilgi Değerlendirmesi',
  titleEn: 'Python Fundamentals — Knowledge Check',
  passingScore: 3,
  questions: [
    {
      id: 'q1',
      questionTr: 'Python dilinde yeniden kullanılabilir bir fonksiyon bloğu hangi anahtar kelime ile tanımlanır?',
      questionEn: 'Which keyword is used to define a reusable function in Python?',
      optionsTr: ['function calculate()', 'def calculate():', 'fn calculate() -> int', 'func calculate:()'],
      optionsEn: ['function calculate()', 'def calculate():', 'fn calculate() -> int', 'func calculate:()'],
      correctIndex: 1,
      explanationTr: 'Python dilinde fonksiyonlar "def" anahtar kelimesi ve iki nokta (:) ile tanımlanır.',
      explanationEn: 'In Python, functions are defined using the "def" keyword followed by a colon (:).',
    },
    {
      id: 'q2',
      questionTr: 'Aşağıdaki veri yapılarından hangisi anahtar-değer (key-value) çiftlerini depolamak için kullanılır?',
      questionEn: 'Which Python data structure stores key-value pairs with fast lookup time?',
      optionsTr: ['List (Liste)', 'Tuple (Demet)', 'Dictionary (Sözlük)', 'Set (Küme)'],
      optionsEn: ['List', 'Tuple', 'Dictionary', 'Set'],
      correctIndex: 2,
      explanationTr: 'Sözlükler (dict), süslü parantezlerle {"key": "value"} şeklinde anahtar-değer çiftlerini saklar.',
      explanationEn: 'Dictionaries (dict) store key-value mappings for rapid hash-based lookup.',
    },
    {
      id: 'q3',
      questionTr: 'Bir koşulun sağlanmadığı alternatif durumu kontrol etmek için Python\'da hangi blok kullanılır?',
      questionEn: 'Which block in Python is used for secondary conditional checking when the initial "if" is false?',
      optionsTr: ['else if', 'elif', 'otherwise', 'case'],
      optionsEn: ['else if', 'elif', 'otherwise', 'case'],
      correctIndex: 1,
      explanationTr: 'Python "else if" yerine "elif" anahtar kelimesini kullanır.',
      explanationEn: 'Python uses "elif" (short for else if) for subsequent conditional evaluations.',
    },
  ],
}
