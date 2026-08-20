import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Clipboard,
  Animated,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Play, Pause, Trash2, Copy, Search } from 'lucide-react-native';

interface LogTerminalProps {
  logs: string;
  isLive?: boolean;
  title?: string;
  onClear?: () => void;
}

export const LogTerminal: React.FC<LogTerminalProps> = ({
  logs,
  isLive = false,
  title = 'Runtime Output Stream',
  onClear,
}) => {
  const [filter, setFilter] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  // Pulse animation for live stream
  useEffect(() => {
    if (isLive && !isPaused) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }
  }, [isLive, isPaused]);

  // Auto-scroll to end when new logs arrive unless paused
  useEffect(() => {
    if (!isPaused && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [logs, isPaused]);

  const handleCopy = () => {
    Clipboard.setString(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs
    .split('\n')
    .filter((line) => !filter || line.toLowerCase().includes(filter.toLowerCase()))
    .join('\n');

  return (
    <View style={styles.container}>
      {/* Terminal Bar */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <View style={styles.dotGroup}>
            <View style={[styles.windowDot, { backgroundColor: '#F43F5E' }]} />
            <View style={[styles.windowDot, { backgroundColor: '#F59E0B' }]} />
            <View style={[styles.windowDot, { backgroundColor: '#10B981' }]} />
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {isLive && (
          <View style={styles.liveBadge}>
            <Animated.View style={[styles.liveDot, { opacity: isPaused ? 0.3 : pulseAnim }]} />
            <Text style={styles.liveText}>{isPaused ? 'PAUSED' : 'LIVE'}</Text>
          </View>
        )}
      </View>

      {/* Filter and Action Controls */}
      <View style={styles.controlBar}>
        <View style={styles.searchBox}>
          <Search size={14} color={colors.textMuted} />
          <TextInput
            placeholder="Filter logs (e.g. error, 200, db)..."
            placeholderTextColor={colors.textMuted}
            value={filter}
            onChangeText={setFilter}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.actionGroup}>
          {isLive && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsPaused(!isPaused)}
              style={[styles.btn, isPaused && styles.btnActive]}
            >
              {isPaused ? (
                <Play size={14} color={colors.primary} />
              ) : (
                <Pause size={14} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity activeOpacity={0.7} onPress={handleCopy} style={styles.btn}>
            <Copy size={14} color={copied ? colors.success : colors.textSecondary} />
          </TouchableOpacity>

          {onClear && (
            <TouchableOpacity activeOpacity={0.7} onPress={onClear} style={styles.btn}>
              <Trash2 size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Terminal Body */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.terminalBody}
        contentContainerStyle={styles.logContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.logText}>{filteredLogs || '> No log output available'}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.terminalBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    height: 380,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.terminalHeader,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dotGroup: {
    flexDirection: 'row',
    gap: 5,
  },
  windowDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  title: {
    ...typography.mono,
    color: colors.textSecondary,
    fontSize: 11.5,
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successBg,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.successBorder,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  liveText: {
    ...typography.badge,
    color: colors.success,
    fontSize: 9.5,
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#090B12',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  searchInput: {
    ...typography.mono,
    color: colors.textPrimary,
    fontSize: 11,
    flex: 1,
    padding: 0,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  btn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceHighlight,
  },
  btnActive: {
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  terminalBody: {
    flex: 1,
    padding: 14,
  },
  logContent: {
    paddingBottom: 24,
  },
  logText: {
    ...typography.mono,
    color: colors.terminalText,
    fontSize: 11.5,
    lineHeight: 18,
  },
});
