export interface RoadmapTask {
  id: string
  title: string
  completed: boolean
}

export interface RoadmapStage {
  id: string
  step: string
  titleTr: string
  titleEn: string
  summaryTr: string
  summaryEn: string
  duration: string
  status: 'completed' | 'in_progress' | 'upcoming'
  skills: string[]
  tasksTr: string[]
  tasksEn: string[]
}

export const sampleRoadmapStages: RoadmapStage[] = [
  {
    id: 'stage-1',
    step: '01',
    titleTr: 'Mimari Tasarım ve Veri Modelleme',
    titleEn: 'Architecture Design & Data Modeling',
    summaryTr: 'Projenin veri tabanı şemasını belirleyin, API sözleşmelerini tanımlayın ve proje iskeletini oluşturun.',
    summaryEn: 'Define database schema, design API contracts, and scaffold repository structure.',
    duration: '1-2 Hafta / Weeks',
    status: 'completed',
    skills: ['Entity Relationship Diagrams', 'REST / gRPC Design', 'Git Conventions', 'Docker Scaffolding'],
    tasksTr: [
      'Gereksinim analizi ve varlık ilişkilerinin (ERD) çizilmesi',
      'PostgreSQL veritabanı tablolarının ve indekslerinin oluşturulması',
      'Proje dizin mimarisinin ve bağımlılıkların yapılandırılması',
    ],
    tasksEn: [
      'Requirement analysis & Entity-Relationship diagram mapping',
      'Setup PostgreSQL schema, primary keys, and indexing strategy',
      'Scaffold modular repository structure & configure linter/formatters',
    ],
  },
  {
    id: 'stage-2',
    step: '02',
    titleTr: 'Çekirdek API & Kimlik Doğrulama Katmanı',
    titleEn: 'Core API & Authentication Layer',
    summaryTr: 'Kullanıcı yetkilendirmesi, token yönetimi ve temel CRUD iş mantıklarının geliştirilmesi.',
    summaryEn: 'Implement user auth, secure token flow, and primary business logic endpoints.',
    duration: '2 Hafta / Weeks',
    status: 'in_progress',
    skills: ['JWT / OAuth2', 'Password Hashing', 'Middleware & Guarding', 'Validation Pipes'],
    tasksTr: [
      'Kayıt ve giriş uç noktaları için güvenli token mekanizması entegrasyonu',
      'Girdi doğrulama ve merkezi hata yakalama (Global Exception Handler) kurulumu',
      'Ana iş mantığı servislerinin ve veri erişim katmanının kodlanması',
    ],
    tasksEn: [
      'Implement secure sign-up/sign-in token flow with refresh tokens',
      'Global exception handling, input validation, and structured error responses',
      'Author core business services and database access repository methods',
    ],
  },
  {
    id: 'stage-3',
    step: '03',
    titleTr: 'Modern Ön Yüz ve Durum Yönetimi',
    titleEn: 'Modern Frontend & State Management',
    summaryTr: 'Kullanıcı dostu arayüz tasarımı, reaktif formlar ve istemci tarafı durum senkronizasyonu.',
    summaryEn: 'Build responsive UI components, robust client state management, and real-time feedback.',
    duration: '2-3 Hafta / Weeks',
    status: 'upcoming',
    skills: ['TypeScript', 'Component Design', 'Query Caching', 'Accessible UI Patterns'],
    tasksTr: [
      'Tasarım sistemi bileşenlerinin (Button, Card, Modal, Form) inşası',
      'API çağrılarının istemcide önbelleklenmesi (Query Caching) ve hata durumları',
      'Filtreleme, arama ve kullanıcı paneli etkileşimlerinin tamamlanması',
    ],
    tasksEn: [
      'Construct reusable design system components with accessibility guidelines',
      'Integrate client query caching, optimistic UI updates, and loading states',
      'Develop dashboard navigation, interactive filters, and error boundaries',
    ],
  },
  {
    id: 'stage-4',
    step: '04',
    titleTr: 'Test, Dağıtım ve CI/CD Pipeline',
    titleEn: 'Testing, Production Deployment & CI/CD',
    summaryTr: 'Birim ve entegrasyon testlerinin yazılması, container imajının oluşturulması ve buluta dağıtım.',
    summaryEn: 'Write automated unit & integration tests, containerize the service, and deploy to cloud.',
    duration: '1-2 Hafta / Weeks',
    status: 'upcoming',
    skills: ['Unit Testing', 'Docker Multi-stage Builds', 'GitHub Actions', 'Cloud Hosting'],
    tasksTr: [
      'Kritik iş kuralları için birim ve entegrasyon testlerinin yazılması',
      'Optimize edilmiş Dockerfile ile prodüksiyon imajının oluşturulması',
      'GitHub Actions ile otomatik derleme ve dağıtım hattının (Pipeline) devreye alınması',
    ],
    tasksEn: [
      'Write comprehensive unit and integration tests for critical business logic',
      'Author multi-stage Docker build for optimized container footprint',
      'Configure automated GitHub Actions workflow for linting, testing, and cloud deployment',
    ],
  },
]
