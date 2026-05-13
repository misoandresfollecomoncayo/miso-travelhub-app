package com.misotravelhubapp

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    createDefaultNotificationChannel()
  }

  /**
   * Crea el canal por defecto que usa FCM para mostrar las push.
   *
   * En Android 8+ (API 26) un push debe pertenecer a un NotificationChannel
   * registrado en NotificationManager. Si no existe, FCM cae a un canal
   * fallback "Misc" con importance LOW — sin heads-up, sin sonido, y oculto
   * por completo en algunas OEMs (Samsung One UI). Lo creamos con
   * IMPORTANCE_HIGH para que las reservas/pagos se muestren como heads-up.
   *
   * createNotificationChannel es idempotente: si el canal ya existe con el
   * mismo ID, el usuario puede haberle ajustado importancia y conservamos
   * sus preferencias.
   */
  private fun createDefaultNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel =
        NotificationChannel(
          getString(R.string.default_notification_channel_id),
          getString(R.string.default_notification_channel_name),
          NotificationManager.IMPORTANCE_HIGH,
        )
      channel.description = getString(R.string.default_notification_channel_description)
      val manager = getSystemService(NotificationManager::class.java)
      manager?.createNotificationChannel(channel)
    }
  }
}
