# 🗺️ Sitemap 測試與管理指南

## 快速開始

### 1. 🚀 訪問測試頁面
```
http://localhost:3000/admin/sitemap-test
```

### 2. 🧪 運行測試腳本
```bash
npm run test:sitemap
```

## 功能概覽

### 📄 可用的 Sitemap

| Sitemap | URL | 狀態 | 描述 |
|---------|-----|------|------|
| 主要 Sitemap | `/sitemap.xml` | ✅ 隨時可用 | 靜態頁面 + 少量動態內容 |
| Sitemap Index | `/sitemap-index.xml` | ✅ 隨時可用 | 管理所有 sitemap 的索引 |
| 企業 Sitemap | `/sitemap-companies.xml` | ⚠️ 需資料庫 | 最多 50,000 個企業頁面 |
| 標案 Sitemap | `/sitemap-tenders.xml` | ⚠️ 需資料庫 | 最多 25,000 個標案頁面 |
| AI 工具 Sitemap | `/sitemap-aitools.xml` | ⚠️ 需資料庫 | 最多 5,000 個工具頁面 |
| robots.txt | `/robots.txt` | ✅ 隨時可用 | 搜索引擎爬蟲指令 |

### 🛠️ 測試工具功能

1. **載入 Sitemap**: 查看選定的 sitemap 內容
2. **驗證 XML**: 檢查 XML 格式是否正確
3. **在新頁面開啟**: 直接在瀏覽器查看
4. **測試所有 Sitemap**: 一鍵檢查所有狀態

## 現階段測試重點

### ✅ 無需資料庫即可測試的項目

1. **robots.txt** - 確保搜索引擎指令正確
2. **主要 Sitemap** - 包含所有靜態頁面
3. **Sitemap Index** - 正確管理所有 sitemap 引用
4. **管理介面** - 測試工具正常運作

### ⚠️ 需要資料庫數據的項目

由於您的 MongoDB 集合目前為空，以下 sitemap 會顯示基本結構但無動態內容：

- 企業 Sitemap (sitemap-companies.xml)
- 標案 Sitemap (sitemap-tenders.xml)  
- AI 工具 Sitemap (sitemap-aitools.xml)

**這是正常的！** 當您添加資料後，這些 sitemap 會自動填充相應的 URL。

## 測試步驟建議

### Phase 1: 基礎功能驗證
```bash
# 1. 檢查服務狀態
docker-compose ps

# 2. 運行完整測試
npm run test:sitemap

# 3. 訪問管理頁面
open http://localhost:3000/admin/sitemap-test
```

### Phase 2: 介面測試
1. 在管理頁面中測試每個 sitemap
2. 使用「測試所有 Sitemap」功能
3. 驗證 XML 格式
4. 檢查快速連結

### Phase 3: 內容驗證
1. 確認靜態頁面都包含在主要 sitemap 中
2. 檢查 robots.txt 指向正確的 sitemap
3. 驗證 sitemap index 包含所有子 sitemap

## 常見測試結果

### ✅ 正常情況
- robots.txt: 200 (約 500-800 bytes)
- sitemap.xml: 200 (約 1000-2000 bytes)  
- sitemap-index.xml: 200 (約 500-800 bytes)
- sitemap-***.xml: 200 (約 100-300 bytes，因為無數據)

### ❌ 可能的問題
- 404 錯誤: 路由配置問題
- 500 錯誤: 資料庫連接或代碼錯誤
- XML 格式錯誤: sitemap 生成邏輯問題

## 後續數據添加指南

當您準備添加 MongoDB 數據時：

### 企業數據 (companies collection)
```javascript
{
  taxId: "12345678",
  name: "企業名稱",
  searchCount: 100, // 用於排序
  updatedAt: new Date()
}
```

### 標案數據 (tenders collection)
```javascript
{
  _id: ObjectId("..."),
  title: "標案標題",
  tenderValue: 1000000, // 用於排序
  status: "active", // 必須是 ['active', 'open', 'published']
  updatedAt: new Date()
}
```

### AI 工具數據 (ai_tools collection)
```javascript
{
  _id: ObjectId("..."),
  name: "工具名稱",
  usageCount: 50, // 用於排序
  rating: 4.5, // 用於排序
  status: "active", // 必須是 ['active', 'published']
  updatedAt: new Date()
}
```

## 故障排除

### 如果 sitemap 顯示空白
1. 檢查 MongoDB 連接: `docker-compose logs mongodb`
2. 檢查應用日誌: `docker-compose logs app-dev`
3. 確認集合存在但為空（這是正常的）

### 如果出現 500 錯誤
1. 檢查環境變數: `MONGODB_URI`
2. 確認 MongoDB 服務運行: `docker-compose ps`
3. 查看詳細錯誤: `docker-compose logs -f app-dev`

### 重置並重新測試
```bash
npm run fix:critters-issue
```

## 進階功能

### 緩存管理
- 每個 sitemap 都有不同的緩存時間
- 開發環境會自動刷新
- 生產環境建議定期清理緩存

### SEO 優化
- 所有 sitemap 都符合 XML Sitemap 標準
- 包含 lastmod, changefreq, priority 標籤
- 支援 gzip 壓縮（生產環境）

---

**🎉 準備就緒！** 您現在可以開始熟悉測試介面，並逐步添加 MongoDB 數據來看到 sitemap 的完整功能。