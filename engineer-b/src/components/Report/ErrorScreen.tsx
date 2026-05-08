interface ErrorScreenProps {
  message: string;
  onReset: () => void;
}

export function ErrorScreen({ message, onReset }: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Audit Failed</h2>
        <p className="text-slate-500 text-sm mb-6">{message}</p>
        <button
          onClick={onReset}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
