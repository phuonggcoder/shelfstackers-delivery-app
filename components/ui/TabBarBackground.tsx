import React from 'react';
import { View } from 'react-native';

export default function TabBarBackground({ children }: { children?: React.ReactNode }) {
	return <View style={{ backgroundColor: 'transparent' }}>{children}</View>;
}
