# RULES: Frontend Dev Protocol

## Vibe Rules (FE)

1. **No Yapping**: Minimal talk. Output code directly.
2. **Mocking**: Use `useEffect` with hardcoded JSON to simulate API calls.
3. **Styling**: Tailwind CSS exclusively. No external CSS unless global.
4. **Icons**: Use `lucide-react`. Fallback to Unicode nếu cần.
5. **Components**: Functional components + Hooks. No classes.
6. **Colors**: Dùng biến root. Primary: #F59E0B, Secondary: #64748B, Background: #F8FAFC, Card Background: #ffffff, Card Box Shadow: #c7c7c7ff
7. **Fonts**: Inter (Google Fonts) for title, Merriweather for content.
8. **Text**: Title 18px or 20px, content 14px.
9. **Border Radius**: 8px or 12px (rounded-lg)

## Logic rules (Logic 4.3)

- **Soft Delete UI**: Chỉ ẩn item khỏi giao diện (update local state), không xóa thật.
- **Order Lifecycle UI**: PENDING -> PAID -> REFUND_PENDING.
- **i18n UI**: Quản lý bản dịch ArticleTranslation dạng side-by-side (song song).

## Workflow

- **BEFORE**: Cập nhật `activeContext.md` (Giải pháp UI).
- **AFTER**: Cập nhật `STATE.md` (Tiến độ).
