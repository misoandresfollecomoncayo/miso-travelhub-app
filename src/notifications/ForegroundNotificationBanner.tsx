import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {Colors} from '../theme/colors';
import {
  navigateToBooking,
  navigateToReservations,
} from '../navigation/navigationRef';
import {onForegroundMessage} from '../services/notifications';

const AUTO_DISMISS_MS = 5000;

interface BannerContent {
  id: string;
  title: string;
  body: string;
  bookingId?: string;
}

const pickString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const extractContent = (
  msg: FirebaseMessagingTypes.RemoteMessage,
): BannerContent | null => {
  // FCM normaliza el payload visible en `notification.{title,body}`. Si la
  // push es data-only (sin bloque `notification`), aceptamos `data.title` /
  // `data.body` como fallback — algunos backends prefieren ese formato para
  // controlar la presentación desde el cliente.
  const title =
    pickString(msg.notification?.title) ?? pickString(msg.data?.title);
  const body =
    pickString(msg.notification?.body) ?? pickString(msg.data?.body);
  if (!title && !body) {
    return null;
  }
  // Si la push trae `booking_id` (o variante camelCase), lo guardamos en el
  // banner para que el tap navegue directo a esa reserva. Aceptamos ambos
  // formatos por tolerancia con el backend.
  const bookingId =
    pickString(msg.data?.booking_id) ?? pickString(msg.data?.bookingId);
  return {
    id: msg.messageId || `msg-${Date.now()}`,
    title: title ?? '',
    body: body ?? '',
    bookingId,
  };
};

/**
 * Banner in-app que muestra una notificación push recibida con la app en
 * foreground. Por defecto FCM no presenta nada al usuario en ese estado
 * (Android y iOS asumen que la app maneja la UX), así que lo renderizamos
 * nosotros. Se auto-descarta a los 5s o al tap.
 */
export const ForegroundNotificationBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState<BannerContent | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return onForegroundMessage(msg => {
      const next = extractContent(msg);
      if (next) {
        setContent(next);
      }
    });
  }, []);

  useEffect(() => {
    if (!content) {
      return;
    }
    dismissTimer.current = setTimeout(() => {
      setContent(null);
    }, AUTO_DISMISS_MS);
    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
        dismissTimer.current = null;
      }
    };
  }, [content]);

  if (!content) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      testID="foreground-notification-banner"
      style={[styles.banner, {top: insets.top + 8}]}
      onPress={() => {
        const pendingBookingId = content.bookingId;
        setContent(null);
        if (pendingBookingId) {
          navigateToBooking(pendingBookingId);
        } else {
          navigateToReservations();
        }
      }}
      accessibilityRole="button"
      accessibilityLabel={
        content.title || content.body || 'Notificación recibida'
      }>
      {content.title.length > 0 && (
        <Text style={styles.title} numberOfLines={1}>
          {content.title}
        </Text>
      )}
      {content.body.length > 0 && (
        <Text style={styles.body} numberOfLines={3}>
          {content.body}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 9999,
    elevation: 12,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  title: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  body: {
    color: Colors.white,
    fontSize: 13,
    lineHeight: 18,
  },
});
