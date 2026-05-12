import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';

interface CounterInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /**
   * Identificador opcional para localización en pruebas E2E. Se compone
   * como `counter-<testID>-dec`, `counter-<testID>-value`, `counter-<testID>-inc`.
   */
  testID?: string;
}

export const CounterInput: React.FC<CounterInputProps> = ({
  label,
  value,
  min = 0,
  max,
  onIncrement,
  onDecrement,
  testID,
}) => {
  const atMax = max !== undefined && value >= max;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <TouchableOpacity
          testID={testID ? `counter-${testID}-dec` : undefined}
          style={[styles.button, value <= min && styles.buttonDisabled]}
          onPress={onDecrement}
          disabled={value <= min}
          accessibilityRole="button"
          accessibilityLabel={`Disminuir ${label}`}
          accessibilityState={{disabled: value <= min}}>
          <Text
            style={[
              styles.buttonText,
              value <= min && styles.buttonTextDisabled,
            ]}>
            -
          </Text>
        </TouchableOpacity>
        <Text
          testID={testID ? `counter-${testID}-value` : undefined}
          style={styles.value}
          accessibilityLabel={`${label}: ${value}`}>
          {value}
        </Text>
        <TouchableOpacity
          testID={testID ? `counter-${testID}-inc` : undefined}
          style={[styles.button, atMax && styles.buttonDisabled]}
          onPress={onIncrement}
          disabled={atMax}
          accessibilityRole="button"
          accessibilityLabel={`Aumentar ${label}`}
          accessibilityState={{disabled: atMax}}>
          <Text
            style={[styles.buttonText, atMax && styles.buttonTextDisabled]}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    borderColor: Colors.grayLight,
  },
  buttonText: {
    fontSize: 20,
    color: Colors.textPrimary,
  },
  buttonTextDisabled: {
    color: Colors.gray,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    color: Colors.textPrimary,
  },
});
