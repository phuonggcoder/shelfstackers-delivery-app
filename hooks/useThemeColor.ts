import { useColorScheme as rnUseColorScheme } from 'react-native';

const LightColors = {
  text: '#000',
  background: '#fff',
  tint: '#2E7D32',
};

const DarkColors = {
  text: '#fff',
  background: '#000',
  tint: '#2E7D32',
};

export function useThemeColor(customColors: { light?: string; dark?: string } | undefined, colorName: keyof typeof LightColors) {
  const scheme = rnUseColorScheme();
  const colors = scheme === 'dark' ? DarkColors : LightColors;
  if (customColors) {
    return scheme === 'dark' ? customColors.dark ?? colors[colorName] : customColors.light ?? colors[colorName];
  }
  return colors[colorName];
}
