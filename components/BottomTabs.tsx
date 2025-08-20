import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface BottomTabsProps {
  activeTab?: 'orders' | 'profile';
  onTabPress?: (tab: 'orders' | 'profile') => void;
}

export default function BottomTabs({ activeTab = 'orders', onTabPress }: BottomTabsProps) {
  const handleTabPress = (tab: 'orders' | 'profile') => {
    if (onTabPress) {
      onTabPress(tab);
    }
  };

  return (
    <View style={styles.bottomTabs}>
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => handleTabPress('orders')}
      >
        <Ionicons 
          name="clipboard-outline" 
          size={24} 
          color={activeTab === 'orders' ? '#4A90E2' : '#999'} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'orders' && styles.activeTabText
        ]}>
          Đơn hàng
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => handleTabPress('profile')}
      >
        <Ionicons 
          name="person" 
          size={24} 
          color={activeTab === 'profile' ? '#4A90E2' : '#999'} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'profile' && styles.activeTabText
        ]}>
          Cá nhân
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
});
