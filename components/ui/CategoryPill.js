export const categoryConfig = {
  Technical: { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200', dot: 'bg-violet-500' },
  Cultural:  { bg: 'bg-amber-50',  text: 'text-amber-800',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
  Sports:    { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Workshop:  { bg: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  Social:    { bg: 'bg-pink-50',   text: 'text-pink-800',   border: 'border-pink-200',   dot: 'bg-pink-500'   },
  Academic:  { bg: 'bg-teal-50',   text: 'text-teal-800',   border: 'border-teal-200',   dot: 'bg-teal-500'   },
}

export const categoryImageBg = {
  Technical: 'bg-violet-100',
  Cultural:  'bg-amber-100',
  Sports:    'bg-emerald-100',
  Workshop:  'bg-blue-100',
  Social:    'bg-pink-100',
  Academic:  'bg-teal-100',
}

export default function CategoryPill({ name, size = 'md' }) {
  const config = categoryConfig[name] || {
    bg: 'bg-stone-50', text: 'text-stone-600', border: 'border-stone-200', dot: 'bg-stone-400',
  }
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${sizeClass} ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {name}
    </span>
  )
}
