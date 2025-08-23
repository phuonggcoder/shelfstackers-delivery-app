import { Redirect } from 'expo-router';
import * as React from 'react';

// Start the app at the splash screen which will navigate to login.
export default function IndexRedirect() {
  return <Redirect href="/splash" />;
}
