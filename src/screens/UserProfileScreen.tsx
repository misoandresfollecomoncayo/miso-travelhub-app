import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors} from '../theme/colors';
import {useAuth} from '../auth/AuthContext';
import {useT} from '../i18n/useT';
import {UserStackParamList} from '../navigation/UserStackNavigator';

type ProfileNavigationProp = NativeStackNavigationProp<
  UserStackParamList,
  'UserProfile'
>;

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'U';
  }
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  testID?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  value,
  onPress,
  testID,
}) => (
  <TouchableOpacity
    testID={testID}
    style={styles.menuItem}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    activeOpacity={0.7}>
    <Icon name={icon} size={22} color={Colors.textSecondary} />
    <Text style={styles.menuItemLabel}>{label}</Text>
    {value && <Text style={styles.menuItemValue}>{value}</Text>}
    <Icon
      name="chevron-forward"
      size={18}
      color={Colors.textSecondary}
      style={styles.chevron}
    />
  </TouchableOpacity>
);

export const UserProfileScreen: React.FC = () => {
  const {user, logout} = useAuth();
  const navigation = useNavigation<ProfileNavigationProp>();
  const t = useT();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirmMessage'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('profile.logoutConfirm'),
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ],
    );
  };

  const placeholder = (feature: string) => () =>
    Alert.alert(feature, t('common.comingSoon'));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>

        <View style={styles.profileHeader} testID="profile-header">
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
          </View>
          <Text style={styles.userName} testID="profile-name">
            {user.name}
          </Text>
          {user.email.length > 0 && (
            <Text style={styles.userEmail} testID="profile-email">
              {user.email}
            </Text>
          )}
          {user.phone && user.phone.length > 0 && (
            <Text style={styles.userEmail} testID="profile-phone">
              {user.phone}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <MenuItem
            testID="profile-my-info"
            icon="person-outline"
            label={t('profile.myInfo')}
            onPress={placeholder(t('profile.myInfo'))}
          />
          <View style={styles.divider} />
          <MenuItem
            testID="profile-notifications"
            icon="notifications-outline"
            label={t('profile.notifications')}
            onPress={placeholder(t('profile.notifications'))}
          />
          <View style={styles.divider} />
          <MenuItem
            testID="profile-security"
            icon="shield-checkmark-outline"
            label={t('profile.security')}
            onPress={placeholder(t('profile.security'))}
          />
          <View style={styles.divider} />
          <MenuItem
            testID="profile-settings"
            icon="settings-outline"
            label={t('profile.settings')}
            onPress={() => navigation.navigate('Settings')}
          />
          <View style={styles.divider} />
          <MenuItem
            testID="profile-about"
            icon="information-circle-outline"
            label={t('profile.about')}
            onPress={placeholder(t('profile.about'))}
          />
        </View>

        <TouchableOpacity
          testID="profile-logout-button"
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel={t('profile.logout')}
          activeOpacity={0.85}>
          <Icon name="log-out-outline" size={20} color="#D32F2F" />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.white,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 48,
  },
  menuItemLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  menuItemValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  chevron: {
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayLight,
    marginLeft: 48,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#D32F2F',
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 8,
    color: '#D32F2F',
    fontSize: 15,
    fontWeight: '700',
  },
});
