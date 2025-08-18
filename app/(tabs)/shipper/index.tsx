import React from 'react';
import { Redirect } from 'expo-router';

export default function ShipperIndex() {
  // route the shipper tab to the orders screen by default
  return <Redirect href="./orders" />;
}
