import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../theme/colors';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  testID?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecciona...',
  disabled = false,
  testID,
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        testID={testID}
        style={styles.trigger}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        activeOpacity={0.7}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueRow}>
          <Text
            style={[
              styles.valueText,
              !selected && styles.valuePlaceholder,
            ]}>
            {selected ? selected.label : placeholder}
          </Text>
          <Icon
            name="chevron-down"
            size={18}
            color={Colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          testID={testID ? `${testID}-backdrop` : undefined}
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}>
          <View
            style={styles.sheet}
            testID={testID ? `${testID}-sheet` : undefined}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({item}) => {
                const active = item.value === value;
                return (
                  <TouchableOpacity
                    testID={testID ? `${testID}-option-${item.value}` : undefined}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => handleSelect(item.value)}
                    accessibilityRole="button"
                    accessibilityState={{selected: active}}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.optionText,
                        active && styles.optionTextActive,
                      ]}>
                      {item.label}
                    </Text>
                    {active && (
                      <Icon
                        name="checkmark"
                        size={18}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    borderColor: Colors.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  valuePlaceholder: {
    color: Colors.gray,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  optionActive: {
    backgroundColor: Colors.grayLight,
  },
  optionText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  optionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
