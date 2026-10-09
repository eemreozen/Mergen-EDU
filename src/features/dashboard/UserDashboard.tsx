import { AnimatePresence, motion } from 'motion/react'
import {
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Layers,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trash2,
  Trophy,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LanguageSelector } from '@/components/shared/LanguageSelector'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { TeacherAdvisorFigure } from '@/components/landing/TeacherAdvisorFigure'
import { useAuthStore, type UserRoadmap } from '@/store/useAuthStore'
import { useRoadmapStore } from '@/store/useRoadmapStore'

export function UserDashboard() {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')
  const navigate = useNavigate()

  const user = useAuthStore(s => s.user)
  const roadmaps = useAuthStore(s => s.roadmaps)
  const logout = useAuthStore(s => s.logout)
  const deleteRoadmap = useAuthStore(s => s.deleteRoadmap)
  const createRoadmapFromIdea = useAuthStore(s => s.createRoadmapFromIdea)
  const resetRoadmapsToDefault = useAuthStore(s => s.resetRoadmapsToDefault)

  const setProjectName = useRoadmapStore(s => s.setProjectName)

  const [newIdeaText, setNewIdeaText] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'in_progress' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletedId, setDeletedId] = useState<string | null>(null)

  // Calculations
  const filteredRoadmaps = roadmaps.filter(r => {
    const matchesTab =
      filterTab === 'all'
        ? true
        : filterTab === 'in_progress'
        ? r.status === 'in_progress'
        : r.status === 'completed'
    const matchesSearch =
      (isEn ? r.titleEn : r.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTab && matchesSearch
  })

  const totalCompletedMilestones = roadmaps.reduce((acc, r) => acc + r.completedMilestones, 0)
  const totalMilestones = roadmaps.reduce((acc, r) => acc + r.totalMilestones, 0)

  const handleOpenRoadmap = (roadmap: UserRoadmap) => {
    setProjectName(isEn ? roadmap.titleEn : roadmap.title)
    navigate('/canvas')
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletedId(id)
    setTimeout(() => {
      deleteRoadmap(id)
      setDeletedId(null)
    }, 250)
  }

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newIdeaText.trim()) return
    const created = createRoadmapFromIdea(newIdeaText)
    setNewIdeaText('')
    setProjectName(isEn ? created.titleEn : created.title)
    navigate('/canvas')
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 select-none">
      
      {/* 1. TOP PROFILE & WELCOME BANNER (Hero Aesthetic) */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative rounded-3xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-xl p-5 sm:p-7 overflow-hidden"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2B660E]/5 dark:bg-[#B7F36B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* User Info & Welcome */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] font-mono font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-lg">
                {user?.avatar || 'EÖ'}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#2B660E] dark:bg-[#B7F36B] border-2 border-white dark:border-[#171A20]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#111318] dark:text-[#E9EDF3] tracking-tight">
                  {isEn ? `Welcome back, ${user?.name || 'Emre'}!` : `Hoş geldin, ${user?.name || 'Emre'}!`} 👋
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B]">
                  {isEn ? 'Pro Learner' : 'Pro Öğrenici'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#68717D] dark:text-[#9CA3AF] mt-1 font-mono">
                {isEn
                  ? 'The path climbing to your idea · Manage your project roadmaps.'
                  : 'Fikrine tırmanan yol · Yol haritalarını yönet ve keşfe devam et.'}
              </p>
            </div>
          </div>

          {/* Quick Controls: Lang, Theme & Logout */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-end md:self-center">
            <LanguageSelector />
            <div className="h-5 w-[1px] bg-[#E3E7EC] dark:bg-[#2A3038]" />
            <ThemeToggle />
            <div className="h-5 w-[1px] bg-[#E3E7EC] dark:bg-[#2A3038]" />
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shadow-xs active:scale-95"
              title={isEn ? 'Sign Out' : 'Çıkış Yap'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isEn ? 'Sign Out' : 'Çıkış Yap'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat 1: Roadmaps */}
        <div className="p-4 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B] flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold font-mono text-[#111318] dark:text-[#E9EDF3]">
              {roadmaps.length}
            </div>
            <div className="text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF]">
              {isEn ? 'Active Roadmaps' : 'Kayıtlı Rotalar'}
            </div>
          </div>
        </div>

        {/* Stat 2: Total XP */}
        <div className="p-4 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold font-mono text-[#111318] dark:text-[#E9EDF3]">
              {user?.totalXp || 1420} XP
            </div>
            <div className="text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF]">
              {isEn ? `Level ${user?.level || 4}` : `Seviye ${user?.level || 4}`}
            </div>
          </div>
        </div>

        {/* Stat 3: Completed Milestones */}
        <div className="p-4 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold font-mono text-[#111318] dark:text-[#E9EDF3]">
              {totalCompletedMilestones} / {totalMilestones}
            </div>
            <div className="text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF]">
              {isEn ? 'Milestones Completed' : 'Tamamlanan Adım'}
            </div>
          </div>
        </div>

        {/* Stat 4: Streak */}
        <div className="p-4 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold font-mono text-[#111318] dark:text-[#E9EDF3]">
              {user?.streakDays || 5} {isEn ? 'Days' : 'Gün'}
            </div>
            <div className="text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF]">
              {isEn ? 'Learning Streak 🔥' : 'Öğrenme Serisi 🔥'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. NEW PROJECT QUICK-INPUT BOX (Similar to Landing Hero Prompt Box) */}
      <div className="rounded-3xl border-2 border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-xl p-4 sm:p-5 transition-all focus-within:border-[#2B660E] dark:focus-within:border-[#B7F36B] focus-within:ring-4 focus-within:ring-[#2B660E]/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#2B660E] dark:text-[#B7F36B]" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111318] dark:text-[#E9EDF3]">
            {isEn ? 'START A NEW PROJECT ROADMAP' : 'YENİ BİR PROJE HARİTASI OLUŞTUR'}
          </h2>
        </div>

        <form onSubmit={handleCreateNew} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={newIdeaText}
            onChange={e => setNewIdeaText(e.target.value)}
            placeholder={
              isEn
                ? 'e.g., I want to build a real-time multiplayer drawing game...'
                : 'Örn: Arkadaşlarımla çizim tahmin edebileceğimiz gerçek zamanlı bir oyun geliştirmek istiyorum...'
            }
            className="w-full bg-[#F7F8FA] dark:bg-[#111318] border border-[#E3E7EC] dark:border-[#2A3038] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#111318] dark:text-[#E9EDF3] placeholder:text-[#9CA3AF] outline-none focus:border-[#2B660E] dark:focus:border-[#B7F36B]"
          />
          <button
            type="submit"
            disabled={!newIdeaText.trim()}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              newIdeaText.trim()
                ? 'bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] hover:bg-[#22520B] dark:hover:bg-[#C5F785] cursor-pointer shadow-md shadow-[#2B660E]/15'
                : 'bg-[#E3E7EC] dark:bg-[#2A3038] text-[#9CA3AF] cursor-not-allowed opacity-60'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isEn ? 'Create Roadmap →' : 'Rotayı Oluştur →'}</span>
          </button>
        </form>
      </div>

      {/* 4. ROADMAPS SECTION (LIST, FILTER, ACTIONS) */}
      <div className="space-y-4">
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-[#111318] dark:text-[#E9EDF3]">
              {isEn ? 'My Learning Expeditions' : 'Kayıtlı Yol Haritalarım'}
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#E3E7EC] dark:bg-[#2A3038] text-[#68717D] dark:text-[#9CA3AF]">
              {filteredRoadmaps.length}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'Search...' : 'Ara...'}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] text-[#111318] dark:text-[#E9EDF3] outline-none"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20]">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] font-bold'
                    : 'text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318]'
                }`}
              >
                {isEn ? 'All' : 'Tümü'}
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('in_progress')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  filterTab === 'in_progress'
                    ? 'bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] font-bold'
                    : 'text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318]'
                }`}
              >
                {isEn ? 'Ongoing' : 'Devam Eden'}
              </button>
            </div>

            {/* Restore Default Roadmaps */}
            <button
              type="button"
              onClick={resetRoadmapsToDefault}
              className="p-1.5 rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] text-[#68717D] dark:text-[#9CA3AF] hover:text-[#2B660E] dark:hover:text-[#B7F36B] transition-colors cursor-pointer"
              title={isEn ? 'Reset to 3 Mock Roadmaps' : 'Varsayılan 3 Mock Rotayı Geri Yükle'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Roadmaps Grid */}
        {filteredRoadmaps.length === 0 ? (
          <div className="p-12 rounded-3xl border-2 border-dashed border-[#E3E7EC] dark:border-[#2A3038] text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E3E7EC]/50 dark:bg-[#2A3038]/50 flex items-center justify-center text-[#9CA3AF]">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#111318] dark:text-[#E9EDF3]">
              {isEn ? 'No Roadmaps Found' : 'Herhangi Bir Rota Bulunamadı'}
            </h4>
            <p className="text-xs text-[#68717D] dark:text-[#9CA3AF] max-w-sm">
              {isEn
                ? 'You deleted all roadmaps or none match your search filter. Click below to restore default mock roadmaps.'
                : 'Mevcut rotaları sildiniz veya aramanızla eşleşen sonuç yok. Varsayılan rotaları geri yükleyebilirsiniz.'}
            </p>
            <button
              type="button"
              onClick={resetRoadmapsToDefault}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isEn ? 'Restore 3 Mock Roadmaps' : '3 Mock Rotayı Geri Yükle'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredRoadmaps.map(roadmap => {
                const isDeleting = deletedId === roadmap.id
                return (
                  <motion.div
                    key={roadmap.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: isDeleting ? 0 : 1, scale: isDeleting ? 0.9 : 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleOpenRoadmap(roadmap)}
                    className="group relative rounded-3xl border-2 border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] hover:border-[#2B660E] dark:hover:border-[#B7F36B] p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer text-left"
                  >
                    <div>
                      {/* Top Pills & Delete Button */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B]">
                            {isEn ? roadmap.difficultyEn : roadmap.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#E3E7EC] dark:bg-[#2A3038] text-[#68717D] dark:text-[#9CA3AF]">
                            %{roadmap.progress}
                          </span>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={e => handleDelete(roadmap.id, e)}
                          className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title={isEn ? 'Delete Roadmap' : 'Yol Haritasını Sil'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title */}
                      <h4 className="text-base font-bold text-[#111318] dark:text-[#E9EDF3] group-hover:text-[#2B660E] dark:group-hover:text-[#B7F36B] transition-colors leading-snug">
                        {isEn ? roadmap.titleEn : roadmap.title}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-[#68717D] dark:text-[#9CA3AF] mt-2 line-clamp-2 leading-relaxed">
                        {isEn ? roadmap.descriptionEn : roadmap.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF]">
                          <span>{isEn ? 'Expedition Progress' : 'Tırmanış İlerlemesi'}</span>
                          <span className="font-bold text-[#111318] dark:text-[#E9EDF3]">
                            {roadmap.completedMilestones} / {roadmap.totalMilestones}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#E3E7EC] dark:bg-[#2A3038] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#2B660E] dark:bg-[#B7F36B] transition-all duration-500"
                            style={{ width: `${roadmap.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {roadmap.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F7F8FA] dark:bg-[#111318] border border-[#E3E7EC]/60 dark:border-[#2A3038]/60 text-[#68717D] dark:text-[#9CA3AF]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-5 pt-3 border-t border-[#E3E7EC]/60 dark:border-[#2A3038]/60 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] font-mono text-[#9CA3AF]">
                        <Clock className="w-3 h-3" />
                        <span>{isEn ? roadmap.lastActiveEn : roadmap.lastActive}</span>
                      </div>

                      <div className="inline-flex items-center gap-1 text-xs font-bold text-[#2B660E] dark:text-[#B7F36B] group-hover:translate-x-1 transition-transform">
                        <span>{isEn ? 'Open Canvas →' : 'Kanvasa Git →'}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 5. LAB-COAT TEACHER ADVISOR DAILY TIP BOX */}
      <div className="rounded-3xl border border-[#2B660E]/30 dark:border-[#B7F36B]/30 bg-[#2B660E]/5 dark:bg-[#B7F36B]/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-5 text-left">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <TeacherAdvisorFigure
              size="sm"
              showBubble={false}
              showCaption={false}
              onClick={() => navigate('/canvas')}
            />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2B660E] dark:text-[#B7F36B] flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>{isEn ? 'MENTOR TEACHER RECOMMENDATION' : 'REHBER ÖĞRETMEN GÜNLÜK TAVSİYESİ'}</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#111318] dark:text-[#E9EDF3] mt-1 leading-relaxed">
              {isEn
                ? 'Great progress on your journeys! We recommend diving into the Computer Vision milestones on the AI Fitness canvas to test live pose tracking.'
                : 'Harika bir tempo yakaladın! "AI Fitness" rotasında bir sonraki adım Computer Vision modellerini canlı videoya bağlamak. Kanvasa geçip keşfetmeye hazır mısın?'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/canvas')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#111318] dark:bg-[#E9EDF3] text-white dark:text-[#0B0D10] hover:bg-[#2B660E] dark:hover:bg-[#B7F36B] transition-all shrink-0 cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
        >
          <span>{isEn ? 'Go to Canvas →' : 'Kanvasa Geç →'}</span>
        </button>
      </div>

    </div>
  )
}
