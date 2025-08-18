import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
export function IconSymbol({ name, size = 24, color, style }: { name: string; size?: number; color: string; style?: any }) {
	// cast name to any because @expo/vector-icons has a large union type for glyph names
	return <MaterialIcons name={name as any} size={size} color={color} style={style} />;
}
