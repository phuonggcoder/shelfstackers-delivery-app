# 🗺️ Hướng dẫn sử dụng tính năng bản đồ cho Shipper

## Tổng quan

Tài liệu này mô tả các tính năng bản đồ và chỉ đường mới được tích hợp vào ứng dụng Shelf Stacker Delivery dành cho shipper. Các tính năng này giúp shipper có thể xem tọa độ GPS chính xác của đơn hàng và mở Google Maps để chỉ đường.

## ✨ Tính năng mới

### 1. Hiển thị tọa độ GPS chi tiết
- **Tọa độ chính xác**: Hiển thị vĩ độ và kinh độ với độ chính xác 6 chữ số thập phân
- **Nguồn dữ liệu**: Hiển thị nguồn tọa độ (OpenStreetMap, GeoJSON, thủ công)
- **Thứ tự ưu tiên**: Tự động chọn tọa độ có độ chính xác cao nhất

### 2. Tích hợp Google Maps
- **Mở trực tiếp**: Mở Google Maps với tọa độ chính xác
- **Fallback**: Mở Google Maps với địa chỉ text nếu không có tọa độ
- **Đa nền tảng**: Hỗ trợ cả iOS (Apple Maps) và Android (Google Maps)

### 3. Giao diện thân thiện
- **Thông tin rõ ràng**: Hiển thị đầy đủ thông tin địa chỉ và tọa độ
- **Nút hành động**: Nút chỉ đường dễ sử dụng
- **Thông báo trạng thái**: Hiển thị trạng thái và hướng dẫn sử dụng

## 🔧 Cách sử dụng

### Trong danh sách đơn hàng

1. **Xem thông tin tọa độ**:
   - Mỗi đơn hàng hiển thị component `OrderMapView`
   - Xem tọa độ GPS, nguồn dữ liệu và địa chỉ đầy đủ

2. **Chỉ đường nhanh**:
   - Tap vào nút "Chỉ đường" để mở Google Maps
   - Tự động sử dụng tọa độ nếu có, hoặc địa chỉ text

### Trong chi tiết đơn hàng

1. **Thông tin địa điểm**:
   - Section riêng biệt hiển thị thông tin địa điểm
   - Component `OrderMapView` với đầy đủ chi tiết

2. **Tọa độ chi tiết**:
   - Vĩ độ và kinh độ chính xác
   - Nguồn dữ liệu tọa độ
   - Nút mở Google Maps

### Trang bản đồ

1. **Tự động mở maps**:
   - Khi có tọa độ, tự động mở Google Maps sau 2 giây
   - Hiển thị thông báo countdown

2. **Thông tin chi tiết**:
   - Xem tọa độ GPS đầy đủ
   - Thông tin địa chỉ giao hàng
   - Nút hành động để mở maps

## 📱 Cấu trúc dữ liệu

### Thứ tự ưu tiên tọa độ

1. **OSM Data** (OpenStreetMap) - `address.osm.lat`, `address.osm.lng`
   - Độ chính xác cao nhất
   - Dữ liệu từ OpenStreetMap

2. **Location Coordinates** - `address.location.coordinates[0,1]`
   - Format GeoJSON: [longitude, latitude]
   - Dữ liệu từ hệ thống

3. **Manual Coordinates** - `address.latitude`, `address.longitude`
   - Tọa độ được nhập thủ công
   - Dữ liệu từ người dùng

4. **Legacy Coordinates** - `coordinates.latitude`, `coordinates.longitude`
   - Tọa độ cũ (hỗ trợ ngược)

### Format dữ liệu

```typescript
interface OrderCoordinates {
  coordinates?: [number, number]; // [longitude, latitude] - GeoJSON
  latitude?: number;
  longitude?: number;
  source?: string;
}

interface OSMData {
  lat: number;
  lng: number;
  displayName: string;
}
```

## 🚀 API Integration

### Endpoints sử dụng

- **GET /api/shipper/orders**: Lấy danh sách đơn hàng với tọa độ
- **GET /api/shipper/orders/:id**: Lấy chi tiết đơn hàng
- **GET /api/shipper/orders-coordinates**: Lấy tọa độ tất cả đơn hàng

### Response format

```json
{
  "orders": [
    {
      "_id": "string",
      "shipping_address_snapshot": {
        "coordinates": {
          "type": "Point",
          "coordinates": [106.632651, 10.850704] // [lng, lat]
        },
        "latitude": 10.850704,
        "longitude": 106.632651,
        "fullAddress": "123 Đường ABC, Phường 1, Quận 1, TP.HCM",
        "osm": {
          "lat": 10.850704,
          "lng": 106.632651,
          "displayName": "123 Đường ABC, Phường 1, Quận 1, TP.HCM"
        }
      }
    }
  ]
}
```

## 🎯 Best Practices

### 1. Xử lý tọa độ
- Luôn kiểm tra tính hợp lệ của tọa độ trước khi sử dụng
- Sử dụng fallback khi không có tọa độ
- Hiển thị nguồn dữ liệu để người dùng tin tưởng

### 2. Trải nghiệm người dùng
- Tự động mở maps khi có tọa độ
- Cung cấp thông báo rõ ràng về trạng thái
- Nút hành động dễ tiếp cận

### 3. Performance
- Lazy load tọa độ khi cần thiết
- Cache dữ liệu tọa độ để giảm API calls
- Xử lý lỗi gracefully

## 🔍 Troubleshooting

### Vấn đề thường gặp

1. **Không hiển thị tọa độ**:
   - Kiểm tra dữ liệu từ API
   - Xác nhận format tọa độ đúng
   - Kiểm tra quyền truy cập vị trí

2. **Không mở được Google Maps**:
   - Kiểm tra ứng dụng maps đã cài đặt
   - Xác nhận URL scheme đúng
   - Fallback về web browser

3. **Tọa độ không chính xác**:
   - Kiểm tra nguồn dữ liệu
   - Xác nhận format [longitude, latitude]
   - So sánh với địa chỉ thực tế

### Debug

```typescript
// Log tọa độ để debug
console.log('📍 Coordinates:', {
  osm: order.shipping_address_snapshot?.osm,
  location: order.shipping_address_snapshot?.location,
  manual: {
    lat: order.shipping_address_snapshot?.latitude,
    lng: order.shipping_address_snapshot?.longitude
  }
});
```

## 📋 Changelog

### Version 1.0.0 (December 2024)
- ✅ Tích hợp hiển thị tọa độ GPS
- ✅ Tích hợp Google Maps
- ✅ Component OrderMapView
- ✅ Cải tiến AddressWithDirections
- ✅ Trang map với thông tin chi tiết
- ✅ Hỗ trợ đa nền tảng (iOS/Android)

## 🔗 Liên kết

- [Address API Documentation](./ADDRESS_API.md)
- [Shipper API Documentation](./SHIPPER_API.md)
- [Coordinates Service](./COORDINATES_SERVICE.md)

---

**Lưu ý**: Đảm bảo ứng dụng có quyền truy cập vị trí và internet để sử dụng đầy đủ tính năng bản đồ.
