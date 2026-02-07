# Token Dashboard Features

## Tính năng đã triển khai

### 1. Hiển thị 2 chế độ (View Modes)
- **Grid View**: Hiển thị dạng thẻ (cards) với layout responsive
- **List View**: Hiển thị dạng bảng với đầy đủ thông tin chi tiết

### 2. Filter & Sort
- **Sort by**: 
  - Newest (Mới nhất)
  - Market Cap (Vốn hóa)
  - 24h Volume (Khối lượng giao dịch)
  - 24h Change (Biến động giá)
- **Order**: Ascending / Descending
- **Filters**:
  - ⚡ Hydra L2 Only (Chỉ hiển thị token trên Hydra Layer 2)

### 3. Search
- Tìm kiếm theo tên token hoặc ticker
- Real-time search với debounce

### 4. Thông tin hiển thị trong bảng
- **#**: Thứ tự
- **Token**: Logo, tên, ticker
- **MCAP**: Market Cap (Vốn hóa thị trường)
- **Price**: Giá hiện tại
- **24H VOL**: Khối lượng giao dịch 24h
- **24H**: Biến động giá 24h (%)
- **Age**: Thời gian tạo token
- **Status**: L1 (Cardano) hoặc ⚡ L2 (Hydra)

### 5. Responsive Design
- Desktop: Hiển thị bảng đầy đủ
- Mobile: Hiển thị dạng compact list

### 6. Visual Indicators
- ✨ Sparkles icon: Token có hoạt động giao dịch
- 🔺 Green/Red arrows: Biến động giá tăng/giảm
- ⚡ Lightning badge: Token đang trên Hydra L2

## Cấu trúc dữ liệu

### Token Entity (Backend)
```typescript
{
  assetId: string;
  policyId: string;
  tokenName: string;
  ticker: string;
  totalSupply: string;
  decimals: number;
  ownerAddress: string;
  logoUrl?: string;
  description?: string;
  
  // Market data
  currentPrice: string;
  marketCap: string;
  volume24h: string;
  priceChange24h: number;
  
  // Hydra integration
  headPort?: number;
  head?: Head;
  
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### GET /tokens
Query parameters:
- `page`: Trang hiện tại (default: 1)
- `limit`: Số lượng items/trang (default: 10)
- `search`: Tìm kiếm theo tên hoặc ticker
- `headPort`: Lọc theo Head Port

Response:
```json
{
  "data": Token[],
  "meta": {
    "total": number,
    "page": number,
    "limit": number,
    "lastPage": number
  }
}
```

## Components

### TokenGrid
- Component chính quản lý hiển thị tokens
- Xử lý view mode switching
- Quản lý filter và sort state
- Pagination controls

### TokenTable
- Hiển thị dạng bảng cho desktop
- Hiển thị dạng compact list cho mobile
- Format số và giá trị
- Visual indicators

### TokenCard
- Hiển thị dạng card trong grid view
- Responsive design
- Hover effects

## Cách sử dụng

1. **Chuyển đổi view**: Click vào icon Grid hoặc List ở góc phải trên
2. **Filter**: Click nút "Filter" để mở menu filter
3. **Search**: Gõ tên hoặc ticker vào ô search
4. **Sort**: Chọn tiêu chí sort trong menu filter
5. **Pagination**: Sử dụng nút Previous/Next ở cuối trang

## Cải tiến trong tương lai

- [ ] Thêm column sorting trực tiếp trên header
- [ ] Thêm filter theo price range
- [ ] Thêm filter theo date range
- [ ] Export data to CSV
- [ ] Save filter preferences
- [ ] Real-time updates với WebSocket
- [ ] Chart preview trong table row
