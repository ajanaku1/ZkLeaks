import { useState, useEffect } from 'react'
import { refreshReports, getAllReports, type Category, type Report } from '../data/store'
import ReportCard from '../components/ReportCard'

type Filter = 'all' | Category | 'critical'

export default function Feed() {
  const [filter, setFilter] = useState<Filter>('all')
  const [reports, setReports] = useState<Report[]>(getAllReports())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshReports().then(r => {
      setReports(r)
      setLoading(false)
    })
  }, [])

  const filtered = reports.filter(r => {
    if (filter === 'all') return true
    if (filter === 'critical') return r.severity === 'critical'
    return r.category === filter
  })

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'financial_fraud', label: 'Financial Fraud' },
    { key: 'safety_violation', label: 'Safety Violation' },
    { key: 'corruption', label: 'Corruption' },
    { key: 'critical', label: 'Critical' },
  ]

  return (
    <div className="min-h-screen pt-14">
      <section className="px-8 md:px-16 py-20">
        <div className="text-[11px] text-text-muted tracking-[3px] uppercase mb-3">// PUBLIC FEED</div>
        <h2 className="font-mono text-[32px] font-bold mb-8">Verified reports</h2>

        <div className="flex flex-wrap gap-3 mb-8">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 border font-mono text-[11px] tracking-[1px] uppercase transition-all cursor-pointer ${
                filter === f.key
                  ? 'border-accent text-accent'
                  : 'border-border text-text-secondary hover:border-accent hover:text-accent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-8 text-text-muted text-xs tracking-[2px] uppercase">
            Loading reports from Aleo testnet...
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          {filtered.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-text-muted text-sm">
            No reports match this filter.
          </div>
        )}
      </section>
    </div>
  )
}
