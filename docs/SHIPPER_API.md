# Shipper App API & Feature Spec

Mục tiêu: tài liệu đầy đủ cho team frontend shipper để phát triển app mà không cần đọc BE code. Bao gồm endpoints, payloads, role requirements, event/notification, UI flows và các lưu ý.

## Tóm tắt role
- Hiện tại `User.roles` enum trong `model/user.js` chỉ chứa `['admin','user']`.
- Để support shipper, cần mở rộng enum hoặc chấp nhận giá trị `shipper` trong `roles`.
  - Cách nhanh: cập nhật `model/user.js` (roles enum) để thêm `'shipper'`.
  - Hoặc đảm bảo user record có `'shipper'` trong mảng `roles` (sau migration/DB update).

## Entities chính
- Order (model/order.js)
  - Thêm fields liên quan shipper:
    - `assigned_shipper_id` (ObjectId -> User)
    - `shipper_ack` (Pending/Accepted/Rejected)
    - `order_status` enum: `Pending`, `AwaitingPickup`, `OutForDelivery`, `Delivered`, `Returned`, `Cancelled`, `Refunded`

## Quy tắc permission ngắn
- Các endpoint shipper yêu cầu auth token (Bearer) và role `shipper`.
- Admin có thể gán shipper cho order và override trạng thái.
- User chỉ có thể hủy khi `Pending` và gửi yêu cầu refund khi `Delivered`.

---

## Base URL
- Base path backend hiện dùng: `https://<your-backend>/api`
- Shipper router mount: `/api/shipper`
- Order admin endpoints: `/api/orders` (đang có sẵn)

---

## Endpoints Shipper (chi tiết)

1) GET /api/shipper/orders
- Mô tả: Lấy danh sách đơn được gán cho shipper hiện tại.
- Method: GET
- Auth: Bearer token (role `shipper`)
- Query params:
  - `status` (optional): filter by `order_status` (ví dụ `AwaitingPickup`, `OutForDelivery`)
  - `page`, `limit` (optional)
- Response (200):
```
{ "orders": [ { "_id": "...", "order_id": "ORD...", "order_status": "AwaitingPickup", "assigned_shipper_id": "...", "shipper_ack": "Pending", "address_id": { ... }, "order_items": [ ... ], "payment_id": { ... } } ] }
```
- Errors: 401 unauthorized / 403 forbidden / 500 server error

2) POST /api/shipper/orders/:id/accept
- Mô tả: Shipper chấp nhận assignment cho order.
- Method: POST
- Auth: Bearer token (shipper)
- URL params: `:id` = order _id
- Body: none
- Action: sets `shipper_ack = 'Accepted'`. If `order_status === 'AwaitingPickup'` -> change `order_status = 'OutForDelivery'`.
- Response (200): { msg: 'Accepted', order }
- Errors: 403 nếu order không gán cho shipper, 404 nếu order not found.

3) POST /api/shipper/orders/:id/reject
- Mô tả: Shipper từ chối assignment.
- Method: POST
- Auth: Bearer token (shipper)
- Action: sets `shipper_ack = 'Rejected'`.
- Response (200): { msg: 'Rejected', order }

4) PATCH /api/shipper/orders/:id/status
- Mô tả: Shipper cập nhật tiến trình giao hàng.
- Method: PATCH
- Auth: Bearer token (shipper)
- Body (JSON):
```
{ "order_status": "OutForDelivery|Delivered|Returned", "note": "optional note or proof link" }
```
- Validation: only allow the three statuses above.
- Action: update `order.order_status`, append note to `order.notes`.
- Response (200): { msg: 'Status updated', order }

---

## Endpoints Admin (liên quan shipper)
1) PATCH /api/orders/:order_id/assign-shipper
- Mô tả: Admin gán shipper cho order.
- Method: PATCH
- Auth: Bearer token (admin)
- Body:
```
{ "shipper_id": "<user id of shipper>" }
```
- Action: set `assigned_shipper_id`, `shipper_ack = 'Pending'`.
- Response: { message: 'Shipper assigned', order }
- Lưu ý: admin nên gửi notification tới shipper (push).

---

## Events & Notification
- Khi admin gán shipper: gửi notification `order_assigned` tới shipper (qua device token hoặc push queue). Payload khuyến nghị:
```
{ "orderId": "ORD...", "_id": "<order _id>", "status": "AwaitingPickup", "pickup_address": {...}, "total": 123000 }
```
- Khi payment online thành công: backend đang emit `order_awaitingpickup` (nếu event naming không chuẩn thì sẽ là `order_awaitingpickup` vì code dùng `.toLowerCase()` của status). Frontend shipper cần subscribe/handle nhận push này.
- Khi shipper accept: emit `order_outfordelivery`.
- Khi shipper cập nhật Delivered: emit `order_delivered` -> triggers review prompt to user.

---

## UI screens & flows (Shipper app)
1) Login
- Email/phone + password -> token (use existing auth endpoints)
- After login, app checks user role contains `shipper`.

2) Dashboard (list)
- Tabs/filters: New assignments (AwaitingPickup), In-progress (OutForDelivery), Delivered, Returned, All.
- Each order card: order_id, customer name, phone, pickup address, delivery address (shipping snapshot), order value, items count, payment method, order notes, assigned time.
- Buttons on card: Accept / Reject (only when shipper_ack = Pending and status = AwaitingPickup), Navigate (open maps), Call customer, Update status.

3) Order detail
- Full order info, images, notes, buttons:
  - If Pending/AwaitingPickup & shipper assigned -> Accept/Reject.
  - If OutForDelivery -> Mark Delivered (capture signature/photo) or Mark Returned (reason + photo).
- When marking Delivered, allow to capture proof (photo/signature), record delivery time, optional collected amount (for COD). App should POST to `PATCH /api/shipper/orders/:id/status` with `{ order_status: 'Delivered', note: 'collected VND xxx; photo: <url>' }`.

4) Map & navigation
- Deep link to Google Maps / Waze with customer's address (build from `address` snapshot).

5) Offline behavior
- Cache assigned orders; optimistic updates; queue status updates when online.

6) Notifications handling
- Push on assignment / order changes. Tapping notification opens order detail.

---

## Sample flows (concrete)

Flow A — Online payment
1. User thanh toán qua ZaloPay -> BE callback -> order_status = AwaitingPickup -> notification to admin & optional auto-assign to shipper.
2. Admin assign shipper -> shipper receives `order_assigned` push.
3. Shipper accept -> POST /api/shipper/orders/:id/accept -> sets `OutForDelivery`.
4. Shipper giao -> PATCH /api/shipper/orders/:id/status { order_status: 'Delivered', note: 'photo_url, collected 0 VND' }.
5. BE (optionally) trừ stock / finalize payment for COD.

Flow B — COD
1. User order COD -> order_status = Pending.
2. Admin approves and assigns shipper -> admin sets order_status = AwaitingPickup -> assigned_shipper_id set.
3. Shipper accept -> OutForDelivery -> deliver -> when Delivered, BE sets payment_status Completed for COD.

---

## Error cases & edge cases
- Shipments assigned to other shippers: 403 if a shipper tries to accept someone else's order.
- If shipper rejects, admin should reassign or escalate.
- If shipper marks Delivered but customer disputes, admin needs to handle returns/refund.
- If multiple shippers try to accept simultaneously, the BE should have atomic checks (DB level). Frontend should handle 409 / failure responses.

---

## Auth & Tokens
- Reuse existing auth endpoints. Shipper app must include Authorization: Bearer <token> header.
- Ensure user has `shipper` role in `user.roles` array.

## Migration / admin helper to create shipper users
- Option 1: Update `model/user.js` roles enum to include `'shipper'` and create users with role `['shipper']`.
- Option 2: Use admin GUI / script to push `'shipper'` into existing user's `roles` array.

Example mongoose script (run once):
```js
// add-shipper-role.js (one-time)
const mongoose = require('mongoose');
const User = require('./model/user');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/BookData');
(async () => {
  const u = await User.findById('<userId>');
  if (u) {
    if (!u.roles.includes('shipper')) {
      u.roles.push('shipper');
      await u.save();
      console.log('Updated user to shipper');
    }
  }
  process.exit();
})();
```

---

## Recommendations kỹ thuật cho FE
- Map event names: BE emit `order_${status.toLowerCase()}`. Eg: `AwaitingPickup` -> `order_awaitingpickup`.
- Use push notifications + background fetch to surface new assignments immediately.
- Use optimistic UI but handle 4xx/5xx gracefully.
- Capture proof photo + signature for Delivered/Returned.

---

## Next steps tôi có thể làm
1. Thêm `sendDynamicNotification` gọi trong admin assign endpoint (`/api/orders/:id/assign-shipper`) để push notification tới shipper. (tự động)
2. Khi shipper cập nhật `Delivered`, gọi `deductStockForOrder` và xử lý COD -> tôi có thể wire helper này vào shipper router.
3. Thêm tests/smoke scripts.

Nêu bạn muốn tôi tiếp tục thực hiện (1) hoặc (2) thì reply `1` hoặc `2` hoặc `1,2`.

---

Tài liệu này đã tạo tại `docs/SHIPPER_API.md` trong repo.
