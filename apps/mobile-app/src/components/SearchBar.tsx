import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/config';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Tìm kiếm...',
  onClear,
  onFocus,
  onBlur,
  onSubmitEditing,
  autoFocus = false,
}) => {
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={20} color={COLORS.gray[400]} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray[400]}
        autoFocus={autoFocus}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 12,
    height: 44,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.dark,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
});

export default SearchBar;
