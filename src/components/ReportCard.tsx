import { Link } from 'react-router-dom'
import type { Report } from '../data/store'
import { formatTimeAgo, getCategoryLabel } from '../data/store'

const severityColors: Record<string, string> = {
  critical: 'bg-danger',
  high: 'bg-orange-500',
  medium: 'bg-accent',
  low: 'bg-text-muted',
}

export default function ReportCard({ report }: { report: Report }) {
  return (
    <Link
      to={`/app/reports/${report.id}`}
      className="block bg-bg-card border border-border hover:border-accent-dim transition-colors cursor-pointer"
    >
      <div className="grid grid-cols-[4px_1fr_auto] gap-6 p-6 items-start">
        <div className={`w-1 min-h-[60px] rounded-sm ${severityColors[report.severity]}`} />

        <div>
          <div className="flex gap-4 text-[11px] text-text-muted tracking-[1px] uppercase mb-2">
            <span>{report.organizationId}</span>
            <span>{getCategoryLabel(report.category)}</span>
            <span>{formatTimeAgo(report.timestamp)}</span>
          </div>
          <h3 className="font-mono text-[15px] font-semibold mb-2 leading-snug">{report.title}</h3>
          <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-2">
            {report.body.substring(0, 180)}...
          </p>
        </div>

        <div className={`flex items-center gap-2 text-[11px] tracking-[1px] uppercase whitespace-nowrap ${
          report.proofStatus === 'verified' ? 'text-success' : 'text-accent'
        }`}>
          {report.proofStatus === 'verified' && (
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
          )}
          {report.proofStatus === 'verified' ? 'ZK Verified' : 'Pending'}
        </div>
      </div>
    </Link>
  )
}
