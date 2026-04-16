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
import {Colors} from '../theme/colors';
import {useAuth} from '../auth/AuthContext';

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

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que deseas cerrar la sesión?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  const placeholder = (feature: string) => () =>
    Alert.alert(feature, 'Funcionalidad próximamente');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Mi perfil</Text>

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
            label="Mi información"
            onPress={placeholder('Mi información')}
          />
          <View style={styles.divider} />
          <MenuItem
            testID="profile-notifications"
            icon="notifications-outline"
            label="Notificaciones"
            onPress={placeholder('Notificaciones')}
          />
          <View style={styles.divider} />
          <MenuItem
            testID="profile-security"
            icon="shield-checkmark-outline"
            label="Seguridad"
            onPress={placeholder('Seguridad')}
          />
          <View style={styles.divider} />
          <MenuItem
            testID="profile-settings"
            icon="settings-outline"
            label="Configuración"
            onPress={placeholder('Configuración')}
          />
          <View style={styles.divider} />
          <MenuItem
            testID="profile-about"
            icon="information-circle-outline"
            label="Acerca de TravelHub"
            onPress={placeholder('Acerca de TravelHub')}
          />
        </View>

        <TouchableOpacity
          testID="profile-logout-button"
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          activeOpacity={0.85}>
          <Icon name="log-out-outline" size={20} color="#D32F2F" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
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
