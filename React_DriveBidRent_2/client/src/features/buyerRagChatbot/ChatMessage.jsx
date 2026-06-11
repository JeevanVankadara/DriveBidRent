import { Link } from 'react-router-dom';

function ListingResultCard({ result }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border bg-white" style={{ borderColor: '#fed7aa' }}>
      {result.image && (
        <img
          src={result.image}
          alt={result.title}
          className="h-36 w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <div className="p-3">
        <span
          className="mb-1 inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ backgroundColor: '#ffedd5', color: '#9a3412' }}
        >
          {result.badge || result.type}
        </span>
        <h4 className="text-sm font-semibold text-gray-900">{result.title}</h4>
        <p className="mt-0.5 text-lg font-bold text-gray-900">{result.price}</p>
        {Array.isArray(result.meta) && result.meta.length > 0 && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">{result.meta.join(' | ')}</p>
        )}
        <Link
          to={result.detailsPath}
          className="mt-2 block w-full rounded-lg py-2 text-center text-sm font-medium text-white transition hover:opacity-90"
          style={{ backgroundColor: '#f97316' }}
        >
          {result.type === 'auction' ? 'View Auction' : 'View Rental'}
        </Link>
      </div>
    </div>
  );
}

export default function ChatMessage({ sender, text, results = [] }) {
  const isUser = sender === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[88%] px-4 py-3 text-sm leading-relaxed"
        style={{
          backgroundColor: isUser ? '#f97316' : '#ffffff',
          color: isUser ? '#fff' : '#1f2937',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          border: isUser ? '1px solid #ea580c' : '1px solid #fed7aa',
          boxShadow: isUser ? '0 10px 24px rgba(249, 115, 22, 0.22)' : '0 10px 24px rgba(15, 23, 42, 0.08)',
        }}
      >
        <p className="whitespace-pre-wrap">{text}</p>
        {!isUser && results.length > 0 && (
          <div className="grid gap-3">
            {results.map((result) => (
              <ListingResultCard key={`${result.type}-${result.id}`} result={result} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
