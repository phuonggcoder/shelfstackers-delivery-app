import { changeLanguage, getCurrentLanguage } from '@/lib/i18n';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LanguageScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const currentLanguage = getCurrentLanguage();

  const handleLanguageChange = async (language: 'vi' | 'en') => {
    await changeLanguage(language);
    // Force re-render by updating i18n language
    i18n.changeLanguage(language);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('language.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Instruction */}
      <Text style={styles.instruction}>
        {t('language.instruction')}
      </Text>

      {/* Language Options */}
      <View style={styles.languageContainer}>
        {/* English Option */}
        <TouchableOpacity 
          style={[
            styles.languageOption, 
            currentLanguage === 'en' && styles.languageOptionSelected
          ]}
          onPress={() => handleLanguageChange('en')}
        >
          <View style={styles.languageLeft}>
            <View style={styles.flagContainer}>
              <Text style={styles.flag}>🇺🇸</Text>
            </View>
            <Text style={[
              styles.languageText, 
              currentLanguage === 'en' && styles.languageTextSelected
            ]}>
              {t('language.english')}
            </Text>
          </View>
          <View style={[
            styles.radioButton, 
            currentLanguage === 'en' && styles.radioButtonSelected
          ]}>
            <View style={currentLanguage === 'en' ? styles.radioButtonInnerSelected : styles.radioButtonInner} />
          </View>
        </TouchableOpacity>

        {/* Vietnamese Option */}
        <TouchableOpacity 
          style={[
            styles.languageOption, 
            currentLanguage === 'vi' && styles.languageOptionSelected
          ]}
          onPress={() => handleLanguageChange('vi')}
        >
          <View style={styles.languageLeft}>
            <View style={styles.flagContainer}>
              <Text style={styles.flag}>🇻🇳</Text>
            </View>
            <Text style={[
              styles.languageText, 
              currentLanguage === 'vi' && styles.languageTextSelected
            ]}>
              {t('language.vietnamese')}
            </Text>
          </View>
          <View style={[
            styles.radioButton, 
            currentLanguage === 'vi' && styles.radioButtonSelected
          ]}>
            <View style={currentLanguage === 'vi' ? styles.radioButtonInnerSelected : styles.radioButtonInner} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  languageContainer: {
    gap: 16,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  languageOptionSelected: {
    backgroundColor: '#F0E6FF',
    borderColor: '#8B5CF6',
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  flagContainer: {
    width: 32,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
  },
  languageText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  languageTextSelected: {
    color: '#222',
    fontWeight: '600',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#8B5CF6',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  radioButtonInnerSelected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
});
