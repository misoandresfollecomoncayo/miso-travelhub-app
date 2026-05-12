#!/usr/bin/env bash
# Script invocado desde el job `e2e-android` del workflow CI.
#
# El step `script:` de `reactivecircus/android-emulator-runner@v2` ejecuta
# cada línea de un bloque YAML como un `sh -c` independiente, lo que rompe
# los `while ... done`, asignaciones de variables y operadores que dependen
# de continuidad de shell. Empaquetando todo en un script bash propio
# garantizamos una sola invocación con la sintaxis que esperamos.
set -euo pipefail

echo "[e2e-android] starting Metro bundler in background"
npm start > metro.log 2>&1 &
METRO_PID=$!

echo "[e2e-android] waiting for Metro to respond on :8081"
for i in $(seq 1 30); do
  if curl -sf http://localhost:8081/status > /dev/null; then
    echo "[e2e-android] Metro is up after ${i}*2s"
    break
  fi
  sleep 2
done

# Prep del emulador: en modo headless (-no-window) el AVD arranca con el
# keyguard activo y sin foco de ventana, lo que dispara el error de Detox
# "Waited for the root of the view hierarchy to have window focus". Forzamos
# wake + dismiss-keyguard + stayon y silenciamos animaciones residuales antes
# de lanzar Detox.
echo "[e2e-android] preparing emulator (wake, unlock, stayon, no animations)"
adb wait-for-device
adb shell input keyevent KEYCODE_WAKEUP || true
adb shell wm dismiss-keyguard || true
adb shell svc power stayon true || true
adb shell settings put global window_animation_scale 0 || true
adb shell settings put global transition_animation_scale 0 || true
adb shell settings put global animator_duration_scale 0 || true

echo "[e2e-android] running detox"
# `--` separa los argumentos del script npm de los argumentos pasados al
# binario subyacente (detox). `--headless` evita ventana del emulator y
# `--record-logs all` graba logs de detox para diagnóstico en caso de fallo.
npm run e2e:test:android -- --headless --record-logs all
DETOX_EXIT=$?

echo "[e2e-android] stopping Metro (pid=$METRO_PID)"
kill "$METRO_PID" 2>/dev/null || true

exit "$DETOX_EXIT"
