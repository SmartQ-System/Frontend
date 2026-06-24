import { FiExternalLink, FiHeart } from 'react-icons/fi'

interface DeveloperFooterProps {
  className?: string
}

export default function DeveloperFooter({ className = '' }: DeveloperFooterProps) {
  return (
    <div className={`text-center py-3 ${className}`}>
      <a
        href="https://zack-river.github.io/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs text-theme-muted hover:text-primary-400 transition-all duration-300 group"
      >
        <span className="opacity-70 group-hover:opacity-100">صنع بـ</span>
        <FiHeart className="text-red-400 group-hover:scale-110 transition-transform" size={12} />
        <span className="opacity-70 group-hover:opacity-100">بواسطة</span>
        <span className="font-semibold text-primary-400 group-hover:text-primary-300">
          م. عبدالله وجيه
        </span>
        <FiExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    </div>
  )
}
