# Hướng dẫn tích hợp chức năng chỉ đường cho ứng dụng Shipper

## Tổng quan

Hệ thống này tích hợp chức năng chỉ đường Google Maps vào ứng dụng shipper, cho phép shipper:
- Xem địa chỉ giao hàng chi tiết
- Tap vào địa chỉ để mở Google Maps
- Tự động chỉ đường đến địa chỉ giao hàng
- Hỗ trợ cả địa chỉ text và tọa độ

## Các file đã tạo

### 1. `lib/mapsConfig.ts`
- Cấu hình Google Maps
- Class `MapsService` với các utility functions
- Hàm mở Google Maps với chỉ đường

### 2. `lib/geocodingService.ts`
- Service xử lý geocoding với caching
- Chuyển đổi tọa độ thành địa chỉ
- Hỗ trợ tiếng Việt và khu vực Việt Nam

### 3. `hooks/useDirections.ts`
- Custom hook để xử lý chức năng chỉ đường
- Quản lý state loading
- Xử lý lỗi và validation

### 4. `components/AddressWithDirections.tsx`
- Component hiển thị địa chỉ với icon chỉ đường
- Hỗ trợ cả địa chỉ text và tọa độ
- Icon chỉ đường gọn nhẹ với tam giác phải ▶️, màu xanh nhạt (#e3f2fd), để đặt cạnh icon điện thoại và lá thư đã có sẵn

## Cách sử dụng

### 1. Trong trang chi tiết đơn hàng

```tsx
import { AddressWithDirections } from '@/components/AddressWithDirections';

// Sử dụng component với icon chỉ đường
<AddressWithDirections
  address={order.shipping_address_snapshot?.fullAddress}
  coordinates={order.shipping_address_snapshot?.coordinates}
  showDirectionsButton={true}
/>
```

### 2. Trong trang danh sách đơn hàng

```tsx
import { AddressWithDirections } from '@/components/AddressWithDirections';

// Sử dụng component (không hiển thị icon chỉ đường)
<AddressWithDirections
  address={item.shipping_address_snapshot?.fullAddress}
  coordinates={item.shipping_address_snapshot?.coordinates}
  showDirectionsButton={false}
/>
```

### 3. Sử dụng hook trực tiếp

```tsx
import { useDirections } from '@/hooks/useDirections';

const { openDirections, openDirectionsToCoordinates } = useDirections();

// Mở chỉ đường với địa chỉ
await openDirections('123 Đường ABC, Quận 1, TP.HCM');

// Mở chỉ đường với tọa độ
await openDirectionsToCoordinates(10.762622, 106.660172);
```

## Tính năng

### ✅ Đã hoàn thành
- [x] Mở Google Maps với chỉ đường
- [x] Hỗ trợ cả iOS và Android
- [x] Fallback về trình duyệt web
- [x] Geocoding tọa độ thành địa chỉ
- [x] Caching để tối ưu hiệu suất
- [x] Hỗ trợ tiếng Việt
- [x] Validation tọa độ
- [x] Error handling
- [x] Loading states

### 🔄 Cần cấu hình
- [ ] Google Maps API Key
- [ ] Environment variables
- [ ] Backend API endpoints (nếu cần)

## Cấu hình

### 1. Google Maps API Key

Thêm API key vào file `.env`:

```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 2. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

## Luồng hoạt động

1. **Shipper xem đơn hàng** → Thấy địa chỉ giao hàng
2. **Tap vào nút "Đường đi"** → Tự động mở Google Maps
3. **Google Maps hiển thị** → Chỉ đường đến địa chỉ giao hàng
4. **Shipper có thể** → Xem route, thời gian, khoảng cách

## Lưu ý

- Hệ thống tự động detect platform (iOS/Android)
- Fallback về web browser nếu không mở được app
- Cache địa chỉ để giảm API calls
- Hỗ trợ cả địa chỉ text và tọa độ
- Validation tọa độ trước khi sử dụng
- **Địa chỉ không thể tap** - chỉ hiển thị thông tin
- **Icon mũi tên** - gọn gàng, tương tự icon điện thoại và lá thư

## Troubleshooting

### Lỗi "Không thể mở ứng dụng bản đồ"
- Kiểm tra Google Maps đã được cài đặt
- Kiểm tra quyền truy cập
- Fallback về web browser

### Lỗi "Không thể xác định địa chỉ"
- Kiểm tra tọa độ hợp lệ
- Kiểm tra Google Maps API key
- Kiểm tra kết nối internet

## Tương lai

- [ ] Tích hợp với backend API
- [ ] Lưu lịch sử địa chỉ
- [ ] Địa chỉ yêu thích
- [ ] Tối ưu route giao hàng
- [ ] Thông báo real-time
