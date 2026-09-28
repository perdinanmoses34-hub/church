import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  props: Props;
  state: State = {
    hasError: false,
    error: null
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CMS Pro Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            registration.unregister();
          }
        });
      }
    } catch (e) {
      console.error('Error clearing cache:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-4">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center backdrop-blur-xl">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">Terjadi Kesalahan Sistem</h2>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Aplikasi mengalami kendala saat memuat data. Anda dapat mereset data lokal untuk memulihkan sistem ke kondisi awal.
            </p>
            {this.state.error && (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/50 text-left font-mono text-xs text-rose-300 mb-6 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 animate-spin-reverse" />
                <span>Reset Data & Muat Ulang</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all cursor-pointer text-sm"
              >
                Coba Muat Ulang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
