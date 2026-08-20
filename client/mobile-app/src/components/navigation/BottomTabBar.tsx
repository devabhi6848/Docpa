import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { TabType } from '../../types';
import { Layers, Server, Activity, GitCommit, Settings } from 'lucide-react-native';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  appsCount?: number;
  serversCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  appsCount,
  serversCount,
}) => {
  const tabs: { key: TabType; label: string; icon: any; count?: number }[] = [
    { key: 'apps', label: 'Apps', icon: Layers, count: appsCount },
    { key: 'servers', label: 'Nodes', icon: Server, count: serversCount },
    { key: 'telemetry', label: 'Metrics', icon: Activity },
    { key: 'deployments', label: 'Deploys', icon: GitCommit },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => onTabChange(tab.key)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
            >
              <View style={styles.iconWrapper}>
                <IconComponent
                  size={20}
                  color={isActive ? colors.primary : colors.textMuted}
                />
                {tab.count !== undefined && tab.count > 0 && (
                  <View style={[styles.badge, isActive && styles.badgeActive]}>
                    <Text style={styles.badgeText}>{tab.count}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.primary : colors.textMuted },
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
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0E101AEE',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  tabItemActive: {
    backgroundColor: colors.surfaceHighlight,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    ...typography.badge,
    fontSize: 10,
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 14,
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 8.5,
    fontWeight: '700',
  },
});
