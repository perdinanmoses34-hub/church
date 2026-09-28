import React, { useState, useMemo } from 'react';
import {
  Layout,
  PlusCircle,
  Grid,
  Layers,
  BellRing,
  Megaphone,
  BarChart3,
  Smartphone,
  Download,
  BookOpen,
  Calendar,
  MessageSquare,
  CreditCard,
  Tv,
  TrendingUp,
  PieChart,
  Clock,
  Activity,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  Search,
  SlidersHorizontal,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { AppSettings } from '../../types';
import {
  DASHBOARD_CATEGORIES,
  DASHBOARD_COMPONENT_DEFS,
  DashboardComponentDef,
  enableAllDashboardComponents,
  disableAllDashboardComponents,
  resetDefaultDashboardComponents
} from '../../data/dashboardComponents';

interface DashboardVisibilityManagerProps {
  settings: Partial<AppSettings>;
  onChange: (updatedSettings: Partial<AppSettings>) => void;
  compact?: boolean;
}

export const DashboardVisibilityManager: React.FC<DashboardVisibilityManagerProps> = ({
  settings,
  onChange,
  compact = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const renderIcon = (iconName: string) => {
    const props = { className: 'w-4 h-4' };
    switch (iconName) {
      case 'Layout': return <Layout {...props} />;
      case 'PlusCircle': return <PlusCircle {...props} />;
      case 'Grid': return <Grid {...props} />;
      case 'Layers': return <Layers {...props} />;
      case 'BellRing': return <BellRing {...props} />;
      case 'Megaphone': return <Megaphone {...props} />;
      case 'BarChart3': return <BarChart3 {...props} />;
      case 'Smartphone': return <Smartphone {...props} />;
      case 'Download': return <Download {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      case 'Calendar': return <Calendar {...props} />;
      case 'MessageSquare': return <MessageSquare {...props} />;
      case 'CreditCard': return <CreditCard {...props} />;
      case 'Tv': return <Tv {...props} />;
      case 'TrendingUp': return <TrendingUp {...props} />;
      case 'PieChart': return <PieChart {...props} />;
      case 'Clock': return <Clock {...props} />;
      case 'Activity': return <Activity {...props} />;
      default: return <SlidersHorizontal {...props} />;
    }
  };

  const handleToggle = (key: keyof AppSettings) => {
    const currentVal = settings[key] !== false;
    onChange({
      ...settings,
      [key]: !currentVal
    });
  };

  const handleEnableAll = () => {
    const updated = enableAllDashboardComponents(settings);
    onChange(updated);
  };

  const handleDisableAll = () => {
    const updated = disableAllDashboardComponents(settings);
    onChange(updated);
  };

  const handleResetDefault = () => {
    const updated = resetDefaultDashboardComponents(settings);
    onChange(updated);
  };

  // Filtered components based on category and search query
  const filteredComponents = useMemo(() => {
    return DASHBOARD_COMPONENT_DEFS.filter((comp) => {
      const matchCategory = selectedCategory === 'all' || comp.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        comp.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Statistics calculation
  const totalCount = DASHBOARD_COMPONENT_DEFS.length;
  const activeCount = DASHBOARD_COMPONENT_DEFS.filter(
    (comp) => settings[comp.key] !== false
  ).length;

  return (
    <div className="space-y-4">
      {/* Top Banner & Batch Actions */}
      <div className="p-4 rounded-2xl bg-white border-2 border-teal-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20 shrink-0">
            <SlidersHorizontal className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                Kontrol Visibilitas Komponen Dashboard Home
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
                {activeCount} / {totalCount} Aktif
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Atur seluruh widget &amp; elemen yang diizinkan tampil di Dashboard Home untuk Jemaat dan Admin.
            </p>
          </div>
        </div>

        {/* Quick Batch Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleEnableAll}
            className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Aktifkan & tampilkan semua komponen di dashboard"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Tampilkan Semua</span>
          </button>
          <button
            type="button"
            onClick={handleDisableAll}
            className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Sembunyikan semua komponen (dashboard minimalis)"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Sembunyikan Semua</span>
          </button>
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95 border border-slate-200"
            title="Kembalikan semua komponen ke status default rekomendasi"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Default</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {DASHBOARD_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/25'
                  : 'bg-white text-slate-700 hover:text-teal-800 border border-teal-100 shadow-2xs'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative shrink-0 w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari komponen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-teal-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Component Cards Grid */}
      {filteredComponents.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white border border-teal-100 text-slate-500 text-xs">
          Tidak ditemukan komponen dengan kata kunci "{searchQuery}".
        </div>
      ) : (
        <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {filteredComponents.map((comp) => {
            const isVisible = settings[comp.key] !== false;

            return (
              <div
                key={comp.key}
                onClick={() => handleToggle(comp.key)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between space-y-3 min-w-0 overflow-hidden ${
                  isVisible
                    ? 'bg-white border-teal-200/90 hover:border-teal-400 shadow-md shadow-teal-900/5 ring-2 ring-teal-50'
                    : 'bg-slate-50 border-slate-200/80 hover:border-slate-300 opacity-60'
                }`}
              >
                {/* Card Top Row */}
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isVisible
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-slate-200/70 text-slate-500 border border-slate-300/50'
                      }`}
                    >
                      {renderIcon(comp.iconName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            comp.targetRole === 'ALL'
                              ? 'bg-teal-50 text-teal-800 border border-teal-200'
                              : comp.targetRole === 'ADMIN'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {comp.targetRole === 'ALL'
                            ? 'Admin & Jemaat'
                            : comp.targetRole === 'ADMIN'
                            ? 'Khusus Admin'
                            : 'Khusus Jemaat'}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug break-words">
                        {comp.label}
                      </h4>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <div className="shrink-0 pt-0.5">
                    <div
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                        isVisible ? 'bg-teal-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform transform shadow-sm ${
                          isVisible ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-600 leading-relaxed break-words">
                  {comp.description}
                </p>

                {/* Status Indicator */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] gap-2 min-w-0">
                  <span className="text-slate-400 font-mono text-[10px] truncate max-w-[130px] sm:max-w-[160px]">{comp.key}</span>
                  <span
                    className={`font-bold flex items-center gap-1.5 shrink-0 text-xs ${
                      isVisible ? 'text-teal-700' : 'text-slate-400'
                    }`}
                  >
                    {isVisible ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-teal-600" />
                        <span>Tampil di Dashboard</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>Disembunyikan</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
