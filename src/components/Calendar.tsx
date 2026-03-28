import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';

interface CalendarProps {
  year: number;
  month: number;
  startDate: number | null;
  endDate: number | null;
  onSelectDate: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const Calendar: React.FC<CalendarProps> = ({
  year,
  month,
  startDate,
  endDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const isInRange = (day: number): boolean => {
    if (startDate === null || endDate === null) {
      return false;
    }
    return day >= startDate && day <= endDate;
  };

  const isStartOrEnd = (day: number): boolean => {
    return day === startDate || day === endDate;
  };

  const renderDays = () => {
    const rows: React.ReactNode[] = [];
    let cells: React.ReactNode[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const inRange = isInRange(day);
      const isEdge = isStartOrEnd(day);

      cells.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            inRange && styles.dayInRange,
            isEdge && styles.dayEdge,
          ]}
          onPress={() => onSelectDate(day)}>
          <Text
            style={[
              styles.dayText,
              inRange && styles.dayTextInRange,
              isEdge && styles.dayTextEdge,
            ]}>
            {day}
          </Text>
        </TouchableOpacity>,
      );

      if ((firstDayOfWeek + day) % 7 === 0 || day === daysInMonth) {
        rows.push(
          <View key={`row-${day}`} style={styles.weekRow}>
            {cells}
          </View>,
        );
        cells = [];
      }
    }

    return rows;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.navButton}>
          <Text style={styles.navText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <TouchableOpacity onPress={onNextMonth} style={styles.navButton}>
          <Text style={styles.navText}>{'>'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.weekRow}>
        {DAY_NAMES.map(name => (
          <View key={name} style={styles.dayCell}>
            <Text style={styles.dayHeaderText}>{name}</Text>
          </View>
        ))}
      </View>
      {renderDays()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
  },
  navText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  dayHeaderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dayText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dayInRange: {
    backgroundColor: Colors.accent,
  },
  dayEdge: {
    backgroundColor: Colors.accent,
    borderRadius: 0,
  },
  dayTextInRange: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  dayTextEdge: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
