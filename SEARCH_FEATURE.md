# Token Search Feature - Autocomplete Dropdown

## Tính năng đã triển khai

### 1. Search Bar với Dropdown Suggestions
- **Real-time search**: Hiển thị kết quả ngay khi gõ
- **Dropdown modal**: Hiện bên dưới search bar với tối đa 5 kết quả
- **Keyboard navigation**: 
  - `Arrow Up/Down`: Di chuyển giữa các kết quả
  - `Enter`: Chọn token được highlight
  - `Escape`: Đóng dropdown
- **Click outside**: Tự động đóng dropdown khi click ra ngoài

### 2. Hiển thị trong Dropdown
- **Token Logo**: Hiển thị logo hoặc ticker nếu không có logo
- **Token Name & Ticker**: Tên và symbol của token
- **Price**: Giá hiện tại (nếu có)
- **24h Change**: Biến động giá 24h với màu xanh/đỏ
- **Hydra Status**: Icon ⚡ nếu token đang trên L2

### 3. Empty State
- **No results**: Hiển thị message "No tokens found" với icon search
- **Helpful text**: Gợi ý thử search với tên khác

### 4. UX Features
- **Clear button**: Nút X để xóa nhanh search query
- **Highlight on hover**: Highlight kết quả khi hover
- **Loading state**: Hiển thị "Searching..." khi đang load
- **Auto-focus**: Focus vào input khi clear

## Component Structure

```
TokenSearchBar
├── Search Input (với icon Search và Clear button)
└── Dropdown Modal
    ├── Loading State
    ├── Results List (max 5 items)
    │   └── Token Item
    │       ├── Logo
    │       ├── Name & Ticker
    │       ├── Price Info
    │       └── Status Badge
    └── Empty State
```

## Props

```typescript
interface TokenSearchBarProps {
  onSearch: (query: string) => void;  // Callback khi search
  tokens: Token[];                     // Danh sách tokens để filter
  loading?: boolean;                   // Loading state
}
```

## Usage

```tsx
<TokenSearchBar 
  onSearch={handleSearch}
  tokens={tokens}
  loading={loading}
/>
```

## Styling
- **Responsive**: Hoạt động tốt trên mobile và desktop
- **Dark mode ready**: Sử dụng theme colors
- **Smooth animations**: Tra