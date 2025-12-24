import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/config';

interface ToastNotification {
  _id: string;
  tieuDe: string;
  noiDung: string;
  loai: string;
  donHang?: {
    _id: string;
    maDonHang: string;
  };
}

interface NotificationToastProps {
  notification: ToastNotification | null;
  onClose: () => void;
  onPress: (notification: ToastNotification) => void;
}

const { width } = Dimensions.get('window');

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onPress,
}) => {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const currentNotificationId = useRef<string | null>(null);

  useEffect(() => {
    console.log('🎯 NotificationToast useEffect triggered');
    console.log('   - notification ID:', notification?._id);
    console.log('   - current ID:', currentNotificationId.current);
    console.log('   - notification object:', notification);

    if (notification && notification._id !== currentNotificationId.current) {
      console.log('✅ SHOWING NEW NOTIFICATION!');
      console.log('   - Title:', notification.tieuDe);
      console.log('   - Content:', notification.noiDung);

      // Update current ID first
      currentNotificationId.current = notification._id;

      // Reset animations to starting position
      slideAnim.setValue(-200);
      progressAnim.setValue(0);

      console.log('🎬 Starting animations...');

      // Slide in animation
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start(() => {
        console.log('✓ Slide animation completed');
      });

      // Progress bar animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start(() => {
        console.log('✓ Progress animation completed');
      });

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        console.log('⏰ Auto-closing toast after 5 seconds');
        handleClose();
      }, 5000);

      return () => {
        console.log('🧹 Cleaning up timer');
        clearTimeout(timer);
      };
    } else if (!notification) {
      console.log('🔄 No notification - resetting');
      currentNotificationId.current = null;
    } else {
      console.log('⏸️ Same notification ID - skipping');
    }
  }, [notification?._id]);

  const handleClose = () => {
    console.log('🚪 handleClose called - sliding out');
    Animated.spring(slideAnim, {
      toValue: -200,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start(() => {
      console.log('✓ Slide out completed - calling onClose');
      onClose();
      progressAnim.setValue(0);
    });
  };

  const handlePress = () => {
    if (notification) {
      onPress(notification);
      handleClose();
    }
  };

  if (!notification) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['100%', '0%'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.toastCard}
      >
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>

        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="notifications" size={24} color={COLORS.primary} />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {notification.tieuDe}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {notification.noiDung}
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  progressContainer: {
    height: 3,
    backgroundColor: COLORS.gray[100],
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  message: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default NotificationToast;
