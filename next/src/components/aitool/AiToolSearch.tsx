'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ListFilter, Search } from 'lucide-react';
import { getCategoryThemes, getFullTagThemes, getToolsDataFromAPI } from '@/lib/aitool/apiHelpers';
import { iconMap } from '@/lib/aitool/iconMap';
import type { Tools, ColorTheme } from '@/lib/aitool/types';
import { sortToolsBySelectedTag } from '@/lib/aitool/toolSorter';
import NoSearchResults from '@/components/common/NoSearchResults';
import { InlineLoading } from '@/components/common/loading/LoadingTypes';
import { dynamicTitles, staticTitles } from '@/config/pageTitles';
import { useLoading } from '@/components/common/loading/LoadingProvider';
import { trackBusinessEvents } from '../GoogleAnalytics';
import LineBotBanner from './LineBotBanner';

// 添加預載功能
const preloadToolComponents = async () => {
  // 非同步導入各工具組件，但不顯示任何東西
  // 這些導入將被瀏覽器緩存，當用戶點擊相應工具時可以更快顯示
  const imports = [
    import('@/components/tools/seo/TitleGenerator'),
    import('@/components/tools/seo/DescriptionGenerator'),
    import('@/components/tools/seo/KeywordGenerator'),
    import('@/components/tools/seo/FaqGenerator'),
    import('@/components/tools/seo/ReviewGenerator'),
    import('@/components/tools/seo/FeatureGenerator'),
    import('@/components/tools/health/TCMCheck'),
    import('@/components/tools/common/PromptToolTemplate'),
    import('@/components/tools/finance/ROICalculator'),
    import('@/components/tools/finance/DepositCalculator'),
    import('@/components/tools/finance/LoanCalculator'),
    import('@/components/tools/finance/CurrencyConverter'),
    import('@/components/tools/finance/CompoundInterestCalculator'),
    import('@/components/tools/manufacturing/PackagingCalculator'),
    import('@/components/tools/manufacturing/YieldCalculator'),
    import('@/components/tools/manufacturing/OEECalculator'),
    import('@/components/tools/manufacturing/MetalWeightCalculator'),
    import('@/components/tools/manufacturing/ManufacturingCalculator'),
    import('@/components/tools/computer/ServerSpecCalculator'),
    import('@/components/tools/computer/WorkloadScalabilityCalculator'),
    import('@/components/tools/computer/ModelPerformanceCalculator'),
    import('@/components/tools/computer/AIInfrastructureCostCalculator'),
    import('@/components/tools/computer/GPUMemoryCalculator'),
  ];

  // 使用 Promise.all 並行請求所有模組，但我們不需要等待它們全部完成
  Promise.all(imports).catch(() => {
    // 忽略任何錯誤，這只是預載
  });
};

interface AiToolSearchProps {
  initialQuery: string;
  initialTag: string;
}

export default function AiToolSearch({
  initialQuery,
  initialTag,
}: AiToolSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { startLoading } = useLoading();

  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get('q') || initialQuery
  );
  const [selectedTag, setSelectedTag] = useState<string>(
    () => searchParams.get('tag') || initialTag
  );
  const [tools, setTools] = useState<Tools[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryThemes, setCategoryThemes] = useState<
    Record<string, ColorTheme>
  >({});
  const [fullTagThemes, setFullTagThemes] = useState<
    Record<string, ColorTheme>
  >({});

  // 從 API 載入工具資料
  useEffect(() => {
    const loadToolsData = async () => {
      try {
        setIsLoading(true);

        // 並行載入工具資料和主題
        const [toolsData, categoryThemesData, fullTagThemesData] =
          await Promise.all([
            getToolsDataFromAPI(), // 使用統一的 API 函數
            getCategoryThemes(),
            getFullTagThemes(),
          ]);

        setTools(toolsData);
        setCategoryThemes(categoryThemesData);
        setFullTagThemes(fullTagThemesData);
      } catch (error) {
        console.error('Error loading tools data:', error);
        // 發生錯誤時設置空數組
        setTools([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadToolsData();

    // 當工具數據加載完成後，開始預載所有工具組件
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          preloadToolComponents();
        });
      } else {
        // 降級方案
        setTimeout(() => {
          preloadToolComponents();
        }, 2000); // 延遲2秒，讓頁面先渲染完成
      }
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    if (selectedTag) {
      params.set('tag', selectedTag);
    } else {
      params.delete('tag');
    }

    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;

    if (
      newUrl !==
      `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    ) {
      router.replace(newUrl, { scroll: false });
    }
  }, [searchQuery, selectedTag, router, pathname, searchParams]);

  const filteredTools = useCallback(() => {
    if (!tools.length) return [];

    let filtered = [...tools];
    const currentQueryFromUrl = (searchParams.get('q') || '').toLowerCase();
    const currentTagFromUrl = searchParams.get('tag') || '';

    if (currentQueryFromUrl) {
      filtered = filtered.filter(
        t =>
          t.name.toLowerCase().includes(currentQueryFromUrl) ||
          t.description.toLowerCase().includes(currentQueryFromUrl)
      );
    }

    if (currentTagFromUrl && currentTagFromUrl !== '全部') {
      filtered = filtered.filter(t => t.tags.includes(currentTagFromUrl));
    }

    return sortToolsBySelectedTag(filtered, currentTagFromUrl);
  }, [searchParams, tools]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const query = searchParams.get('q') || '';
      const tag = searchParams.get('tag') || '';
      const hasResults = filteredTools().length > 0 || (!query && !tag);

      if (!hasResults) {
        document.title = dynamicTitles.aiToolSearchNoResult(query, tag);
      } else if (query && tag) {
        document.title = dynamicTitles.aiToolSearchWithQueryAndTag(query, tag);
      } else if (query) {
        document.title = dynamicTitles.aiToolSearchWithQuery(query);
      } else if (tag) {
        document.title = dynamicTitles.aiToolSearchWithTag(tag);
      } else {
        document.title = staticTitles.aiToolSearch;
      }
    }
  }, [searchParams, filteredTools]);

  const handleTagSelect = (tag: string) => {
    setSelectedTag(prevTag => {
      const newTag = tag === '全部' || prevTag === tag ? '' : tag;
      
      // GA 追蹤 AI 工具分類選擇
      if (newTag) {
        trackBusinessEvents.aiToolSearch(newTag, filteredTools().length);
      }
      
      return newTag;
    });
  };

  const handleToolClick = (toolId: string) => {
    // 找到被點擊的工具資訊
    const clickedTool = tools.find(tool => tool.id === toolId);
    if (clickedTool) {
      // GA 追蹤 AI 工具使用
      trackBusinessEvents.aiToolUse(clickedTool.name, clickedTool.tags[0] || 'unknown');
    }

    sessionStorage.setItem('toolSearchParams', searchParams.toString());
    sessionStorage.setItem('toolSearchScroll', window.scrollY.toString());
    // 顯示頂部 Loading 指示器
    startLoading();
    router.push(`/aitool/detail/${toolId}`);
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-center py-12">
          <InlineLoading />
        </div>
      </div>
    );
  }

  const filtered = filteredTools();

  return (
    <>
      <LineBotBanner />
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="搜尋工具..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="ml-4 flex items-center rounded-lg bg-gray-50 px-4 py-2">
            <ListFilter className="mr-2 h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-600">
              {filtered.length} 個工具
            </span>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(categoryThemes).map(([tag, theme]) => (
            <motion.button
              key={tag}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTagSelect(tag)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                selectedTag === tag || (!selectedTag && tag === '全部')
                  ? `bg-gradient-to-r ${theme.gradient.from} ${theme.gradient.to} text-white ${theme.shadow}`
                  : `${theme.secondary} ${theme.text} ${theme.hover}`
              }`}
            >
              {tag}
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <NoSearchResults
            query={searchQuery}
            tag={selectedTag}
            onClear={() => {
              setSearchQuery('');
              setSelectedTag('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map(tool => {
                const IconComponent = iconMap[tool.iconName] || iconMap.Zap;
                const isAITool = tool.componentId === 'PromptToolTemplate';

                return (
                  <motion.div
                    key={tool.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 },
                    }}
                    className="group cursor-pointer rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg"
                    onClick={() => handleToolClick(tool.id)}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div
                        className={`rounded-lg p-3 ${isAITool ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-blue-50'} transition-transform duration-300 group-hover:scale-110`}
                      >
                        <IconComponent
                          className={`h-6 w-6 ${isAITool ? 'text-purple-600' : 'text-blue-600'}`}
                        />
                      </div>
                    </div>

                    <h3 className="mb-2 font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
                      {tool.name}
                    </h3>

                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                      {tool.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {tool.tags.slice(0, 3).map(tag => {
                        const tagTheme = fullTagThemes[tag];
                        if (!tagTheme) return null;

                        return (
                          <span
                            key={tag}
                            className={`rounded-full px-2 py-1 text-xs ${tagTheme.secondary} ${tagTheme.text}`}
                          >
                            {tag}
                          </span>
                        );
                      })}
                      {tool.tags.length > 3 && (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          +{tool.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}
