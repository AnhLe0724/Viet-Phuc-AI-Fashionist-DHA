import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CrawlDataWorkspace from './components/CrawlDataWorkspace';
import WelcomeWorkspace from './components/WelcomeWorkspace';
import LibraryWorkspace from './components/LibraryWorkspace';
import RemixRoomWorkspace from './components/RemixRoomWorkspace';
import DressingRoomWorkspace from './components/DressingRoomWorkspace';
import TestingWorkspace from './components/TestingWorkspace';
import LookbookWorkspace from './components/LookbookWorkspace';
import CandidateModal from './components/CandidateModal';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('UI Crash Error caught by ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f8f4] flex items-center justify-center p-6 text-matcha-950">
          <div className="max-w-lg w-full bg-white p-8 rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto text-2xl">⚠️</div>
            <h2 className="font-fashion text-2xl font-bold text-rose-900">Đã xảy ra lỗi giao diện</h2>
            <p className="text-xs text-rose-700 font-mono bg-rose-50 p-3 rounded-xl text-left overflow-auto max-h-40">
              {this.state.error?.toString()}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-matcha-900 text-cream-50 font-bold text-xs hover:bg-matcha-950 transition"
            >
              Tải lại trang (F5)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('welcome'); // 'welcome' (default) | 'remix' | 'library' | 'lookbook'
  const [initialRemixLayers, setInitialRemixLayers] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [siglipStatus, setSiglipStatus] = useState(null);
  const [modalKeyword, setModalKeyword] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [toast, setToast] = useState(null);

  // Show temporary toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch all keywords, stats and SigLIP 2 status with quick timeout fallback
  const fetchData = useCallback(async () => {
    try {
      const fetchWithTimeout = (url, ms = 3000) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ms);
        return fetch(url, { signal: controller.signal })
          .then(r => {
            clearTimeout(timeoutId);
            return r.json();
          })
          .catch(() => null);
      };

      const [kwRes, statsRes, siglipRes] = await Promise.all([
        fetchWithTimeout('/api/keywords'),
        fetchWithTimeout('/api/stats'),
        fetchWithTimeout('/api/siglip-status')
      ]);

      if (kwRes && kwRes.success) {
        setKeywords(kwRes.keywords || []);
      }
      if (statsRes) {
        setStats(statsRes);
      }
      if (siglipRes) {
        setSiglipStatus(siglipRes);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle single keyword crawl (fetches top 3 images)
  const handleCrawlSingle = async (id, customQuery) => {
    setLoadingStates(prev => ({ ...prev, [`search_${id}`]: true }));
    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, customQuery })
      });
      const data = await res.json();

      if (data.success) {
        setKeywords(prev => prev.map(k => k.id === id ? data.keyword : k));
        if (modalKeyword && modalKeyword.id === id) {
          setModalKeyword(data.keyword);
        }
        showToast(`Đã tìm thấy ${data.candidates.length} ảnh chất lượng cho "${data.keyword.withAccent}"`);
      } else {
        showToast(data.message || 'Lỗi khi tra cứu ảnh', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Lỗi mạng khi crawl ảnh', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, [`search_${id}`]: false }));
    }
  };

  // Handle batch crawl
  const handleCrawlBatch = async (onlyUncrawled = false) => {
    setLoadingStates(prev => ({ ...prev, batchCrawl: true }));
    showToast('Bắt đầu Crawl hàng loạt... Quá trình này sẽ mất một chút thời gian.');
    try {
      const res = await fetch('/api/batch-crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onlyUncrawled })
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Đã hoàn tất crawl ${data.crawledCount} keywords!`);
        await fetchData();
      }
    } catch (err) {
      showToast('Lỗi khi crawl hàng loạt', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, batchCrawl: false }));
    }
  };

  // Handle saving chosen candidate image to local folder
  const handleSaveCandidate = async (keywordId, imageUrl) => {
    setLoadingStates(prev => ({ ...prev, [`save_${keywordId}`]: true }));
    try {
      const res = await fetch('/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: keywordId, imageUrl })
      });
      const data = await res.json();

      if (data.success) {
        setKeywords(prev => prev.map(k => k.id === keywordId ? data.keyword : k));
        if (modalKeyword && modalKeyword.id === keywordId) {
          setModalKeyword(data.keyword);
        }
        showToast(`✅ Đã lưu ảnh vào ${data.data.savedPath} (${data.data.dimensions})`);
        setModalKeyword(null); // close modal on success
      } else {
        showToast(data.message || 'Không thể lưu ảnh', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Lỗi khi lưu ảnh', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, [`save_${keywordId}`]: false }));
    }
  };

  // Handle batch auto-saving top #1 candidate
  const handleBatchSaveTop = async () => {
    setLoadingStates(prev => ({ ...prev, batchSave: true }));
    try {
      const res = await fetch('/api/batch-save-top', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Đã tự động lưu ${data.totalSaved} ảnh tốt nhất vào thư mục local!`);
        await fetchData();
      }
    } catch (err) {
      showToast('Lỗi khi auto-save', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, batchSave: false }));
    }
  };

  // Open dataset directory in Windows Explorer
  const handleOpenFolder = async (categoryId) => {
    try {
      const res = await fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đang mở thư mục dataset trên máy tính...');
      }
    } catch (e) {
      showToast('Không thể mở Explorer tự động', 'error');
    }
  };

  const savedCount = keywords.filter(k => k.status === 'saved').length;

  return (
    <div className="min-h-screen bg-[#f7f8f4] flex flex-col font-sans text-matcha-950 selection:bg-matcha-300 selection:text-matcha-950">
      
      {/* Top Fixed Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onRefresh={fetchData}
        onOpenFolder={() => handleOpenFolder()}
      />

      {/* Main Workspace Area (Expansive 2560x1600 Support) */}
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 2xl:px-8 ${
        activeTab === 'dressing' || activeTab === 'remix' || activeTab === 'welcome' || activeTab === 'stylist' ? 'max-w-[2500px] pt-3 pb-3' : 'max-w-7xl 2xl:max-w-[2400px] pt-4'
      }`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-36 space-y-4">
            <div className="w-10 h-10 border-3 border-matcha-200 border-t-matcha-800 rounded-full animate-spin" />
            <p className="text-sm font-fashion font-bold text-matcha-800 tracking-wide">Đang nạp 100 tác phẩm di sản...</p>
          </div>
        ) : (
          <>
            {activeTab === 'welcome' && (
              <WelcomeWorkspace
                keywords={keywords}
                onStartRemix={() => setActiveTab('dressing')}
                onGoToLibrary={() => setActiveTab('library')}
                onGoToLookbook={() => setActiveTab('lookbook')}
              />
            )}

            {activeTab === 'dressing' && (
              <DressingRoomWorkspace />
            )}

            {activeTab === 'remix' && (
              <RemixRoomWorkspace
                initialLayers={initialRemixLayers}
                onOpenFolder={() => handleOpenFolder()}
              />
            )}

            {activeTab === 'library' && (
              <LibraryWorkspace
                keywords={keywords}
                savedCount={savedCount}
                onSwitchToRemix={() => setActiveTab('remix')}
                onOpenFolder={() => handleOpenFolder()}
                onDeleteKeyword={(id) => {
                  setKeywords(prev => prev.filter(k => k.id !== id && k.code !== id));
                  showToast('Đã xóa món đồ khỏi Thư Viện');
                }}
              />
            )}

            {activeTab === 'lookbook' && (
              <LookbookWorkspace
                onGoToRemix={() => setActiveTab('remix')}
                onRemixAgain={(layers) => {
                  setInitialRemixLayers(layers);
                  setActiveTab('remix');
                }}
              />
            )}

            {/* Hidden developer fallbacks */}
            {activeTab === 'crawl' && (
              <CrawlDataWorkspace
                keywords={keywords}
                stats={stats}
                siglipStatus={siglipStatus}
                onCrawlSingle={handleCrawlSingle}
                onCrawlBatch={handleCrawlBatch}
                onSaveCandidate={handleSaveCandidate}
                onBatchSaveTop={handleBatchSaveTop}
                onOpenCandidateModal={(kw) => setModalKeyword(kw)}
                onOpenFolder={handleOpenFolder}
                loadingStates={loadingStates}
              />
            )}

            {activeTab === 'testing' && (
              <TestingWorkspace
                onOpenFolder={handleOpenFolder}
              />
            )}
          </>
        )}
      </main>

      {/* Candidate 3 Images Inspection Modal */}
      {modalKeyword && (
        <CandidateModal
          keyword={modalKeyword}
          onClose={() => setModalKeyword(null)}
          onSaveCandidate={handleSaveCandidate}
          onReCrawl={handleCrawlSingle}
          isSaving={Boolean(loadingStates[`save_${modalKeyword.id}`])}
          isSearching={Boolean(loadingStates[`search_${modalKeyword.id}`])}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div className={`px-5 py-3 rounded-2xl shadow-fashion border backdrop-blur-md flex items-center gap-3 text-xs font-semibold ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-white text-matcha-950 border-matcha-300'
          }`}>
            <span className="text-base">{toast.type === 'error' ? '⚠️' : '🍃'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
