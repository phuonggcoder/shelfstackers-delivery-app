import React from 'react';
import { Redirect } from 'expo-router';

// Start the app at the splash screen which will navigate to login.
export default function IndexRedirect() {
  return <Redirect href="/splash" />;
}
