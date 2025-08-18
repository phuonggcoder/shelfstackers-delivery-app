export const MOCK_ORDERS = [
  {
    _id: 'ord1',
    order_id: 'SS-1001',
    recipient: 'Nguyễn Văn A',
    address: '403 Phan Huy Ích, P.14, Gò Vấp, HCM',
    total: 111200,
    order_status: 'AwaitingPickup',
    shipper_ack: 'Pending',
    items: [
      { name: 'Trà Táo Quế', qty: 1, price: 37000 },
      { name: 'Trà Đào Cam Sả', qty: 1, price: 37000 },
    ],
    destination: { lat: 10.803, lng: 106.682 },
  },
  {
    _id: 'ord2',
    order_id: 'SS-1002',
    recipient: 'Nguyễn Văn B',
    address: '123 Lê Lợi, Q.1, HCM',
    total: 74000,
    order_status: 'OutForDelivery',
    shipper_ack: 'Accepted',
    items: [
      { name: 'Trà X', qty: 2, price: 37000 },
    ],
    destination: { lat: 10.776889, lng: 106.700806 },
  },
];

export function getMockOrder(id: string) {
  return MOCK_ORDERS.find((o) => o._id === id || o.order_id === id) || null;
}
