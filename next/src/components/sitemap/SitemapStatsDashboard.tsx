'use client';

import React from 'react';

interface SitemapStatsProps {
  stats: {
    total: number;
    success: number;
    warning: number;
    error: number;
    testing: number;
  };
  isLoading: boolean;
  isInitialized?: boolean;
  onTestAll: () => void;
  onReset: () => void;
}

export default function SitemapStatsDashboard({
  stats,
  isLoading,
  isInitialized = true,
  onTestAll,
  onReset
}: SitemapStatsProps) {
  const getHealthColor = () => {
    if (!isInitialized) return 'text-gray-400';
    const healthRatio = stats.success / stats.total;
    if (healthRatio >= 0.8) return 'text-green-600';
    if (healthRatio >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthText = () => {
    if (!isInitialized) return '檢測中';
    const healthRatio = stats.success / stats.total;
    if (healthRatio >= 0.8) return '優秀';
    if (healthRatio >= 0.6) return '良好';
    return '需要關注';
  };

  const getHealthPercentage = () => {
    if (!isInitialized || stats.total === 0) return 0;
    return Math.round((stats.success / stats.total) * 100);
  };

  const SkeletonCard = () => (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 animate-pulse">
      <div className="text-center">
        <div className="w-8 h-8 bg-gray-300 rounded mx-auto mb-2"></div>
        <div className="w-12 h-4 bg-gray-300 rounded mx-auto"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
      {/* 標題區域 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Sitemap 狀態總覽</h2>
          <p className="text-gray-600 mt-1">
            {!isInitialized ? '正在初始化檢測...' : '快速監控所有網站地圖的整體健康狀況'}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getHealthColor()}`}>
            {!isInitialized ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>檢測中</span>
              </div>
            ) : (
              getHealthText()
            )}
          </div>
          <div className="text-sm text-gray-500">
            整體健康度
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {!isInitialized ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* 總計 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-base text-blue-700 font-medium">總計</div>
              </div>
            </div>

            {/* 正常 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                <div className="text-base text-green-700 font-medium">正常</div>
              </div>
            </div>

            {/* 警告 */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
                <div className="text-base text-yellow-700 font-medium">警告</div>
              </div>
            </div>

            {/* 錯誤 */}
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.error}</div>
                <div className="text-base text-red-700 font-medium">錯誤</div>
              </div>
            </div>

            {/* 測試中 */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.testing}</div>
                <div className="text-base text-purple-700 font-medium">測試中</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 進度條 */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>健康度進度</span>
          <span>{isInitialized ? `${getHealthPercentage()}%` : '--'}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          {!isInitialized ? (
            <div className="h-full bg-gradient-to-r from-gray-300 to-gray-400 animate-pulse" />
          ) : (
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 ease-out"
              style={{ width: `${getHealthPercentage()}%` }}
            />
          )}
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex space-x-3">
        <button
          onClick={onTestAll}
          disabled={isLoading || !isInitialized}
          className={`
            flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200
            ${(isLoading || !isInitialized)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:-translate-y-0.5'
            }
          `}
        >
          {!isInitialized ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              初始化中...
            </span>
          ) : isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              測試進行中...
            </span>
          ) : (
            '🚀 測試所有 Sitemap'
          )}
        </button>

        <button
          onClick={onReset}
          disabled={!isInitialized}
          className={`
            px-4 py-3 rounded-xl font-medium transition-all duration-200
            ${!isInitialized 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
            }
          `}
        >
          🔄 重置
        </button>
      </div>

      {/* 提示訊息 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <span className="text-blue-500 text-sm">💡</span>
          <div className="text-sm text-blue-700">
            <strong>提示：</strong>
            {!isInitialized ? (
              <span className="ml-1">首次載入會自動檢測所有 Sitemap 狀態，請稍候...</span>
            ) : (
              <>
                <span className="ml-1">狀態會自動快取 5 分鐘，可隨時手動重新測試。</span>
                <span className="block mt-1">⚠️ 標記的項目需要 MongoDB 數據才能顯示完整內容。</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}