import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';

interface CounterInputProps {
  label: string;
  value: number;
  min?: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const CounterInput: React.FC<CounterInputProps> = ({
  label,
  value,
  min = 0,
  onIncrement,
  onDecrement,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, value <= min && styles.buttonDisabled]}
          onPress={onDecrement}
          disabled={value <= min}>
          <Text
            style={[
              styles.buttonText,
              value <= min && styles.buttonTextDisabled,
            ]}>
            -
          </Text>
        </TouchableOpacity>
        <Text style={styles.value}>{value}</Text>
        <TouchableOpacity style={styles.button} onPress={onIncrement}>
          <Text style={styles.buttonText}>+</Text>
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
