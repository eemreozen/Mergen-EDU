import { Link } from 'react-router-dom'

interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export function Logo({ className = '', iconOnly = false }: LogoProps) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 group select-none transition-opacity hover:opacity-90 ${className}`}
      aria-label="Mergen Ana Sayfa"
    >
      {/* Minimal geometric vector icon */}
      <div className="relative w-8 h-8 rounded-lg bg-[#171A20] dark:bg-[#171A20] border border-[#E3E7EC] dark:border-[#2A3038] flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:border-[#2B660E] dark:group-hover:border-[#B7F36B]/60">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          aria-hidden="true"
        >
          {/* Node 1 */}
          <circle cx="5" cy="18" r="2" fill="currentColor" className="text-[#9CA3AF] dark:text-[#64748B]" />
          {/* Node 2 */}
          <circle cx="12" cy="6" r="2.5" fill="#2B660E" className="dark:fill-[#B7F36B]" />
          {/* Node 3 */}
          <circle cx="19" cy="14" r="2" fill="currentColor" className="text-[#9CA3AF] dark:text-[#64748B]" />
          
          {/* Connecting geometric path lines */}
          <path
            d="M6.5 16.5L10.5 8"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="text-[#9CA3AF] dark:text-[#64748B]"
          />
          <path
            d="M13.5 7.5L17.5 12.5"
            stroke="#2B660E"
            strokeWidth="2"
            strokeLinecap="round"
            className="dark:stroke-[#B7F36B]"
          />
        </svg>
      </div>

      {!iconOnly && (
        <span className="font-semibold tracking-tight text-lg text-[#111318] dark:text-[#E9EDF3] font-mono lowercase">
          mer<span className="text-[#2B660E] dark:text-[#B7F36B]">gen</span>
        </span>
      )}
    </Link>
  )
}
