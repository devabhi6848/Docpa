import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { TabType } from '../../types';
import { Activity, Calendar, Users, BarChart3, Settings } from 'lucide-react-native';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  waitingCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  waitingCount = 3,
}) => {
  const tabs = [
    { id: 'queue', label: 'Live Queue', icon: Activity, badge: waitingCount },
    { id: 'appointments', label: 'Bookings', icon: Calendar },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'overview', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Clinic', icon: Settings },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onTabChange(tab.id as TabType)}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                <Icon
                  size={20}
                  color={isActive ? colors.primary : colors.textMuted}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {tab.badge && tab.badge > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.primary : colors.textMuted },
                  isActive && styles.activeTabLabel,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.waiting,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textInverse,
  },
  tabLabel: {
    ...typography.tiny,
    fontSize: 10,
    fontWeight: '500',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
});
