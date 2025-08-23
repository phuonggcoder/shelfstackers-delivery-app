import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../constants/Colors';

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
        style={[
          styles.tabItem,
          activeTab === 'orders' && styles.activeTabItem,
        ]}
        onPress={() => handleTabPress('orders')}
        activeOpacity={0.8}
      >
        <View style={styles.iconWrapper}>
          <Ionicons
            name={activeTab === 'orders' ? 'clipboard' : 'clipboard-outline'}
            size={24}
            color={activeTab === 'orders' ? Colors.light.tabIconSelected : Colors.light.tabIconDefault}
          />
        </View>
        <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Đơn hàng</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabItem,
          activeTab === 'profile' && styles.activeTabItem,
        ]}
        onPress={() => handleTabPress('profile')}
        activeOpacity={0.8}
      >
        <View style={styles.iconWrapper}>
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={24}
            color={activeTab === 'profile' ? Colors.light.tabIconSelected : Colors.light.tabIconDefault}
          />
        </View>
        <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Cá nhân</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeTabItem: {
    // show a thin green border to indicate active
    borderTopWidth: 2,
    borderTopColor: Colors.light.tabIconSelected,
    paddingTop: 6,
  },
  tabText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.light.tabIconSelected,
    fontWeight: '700',
  },
});
