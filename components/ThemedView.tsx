import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export function ThemedView({ style, children, ...rest }: ViewProps) {
	const bg = useThemeColor(undefined, 'background');
	return (
		<View style={[{ backgroundColor: bg, flex: 1 }, style]} {...rest}>
			{children}
		</View>
	);
}
