import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

type DropdownProps = {
  label: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  value: string | null;
  setValue: React.Dispatch<React.SetStateAction<string | null>>;
  items: { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
  zIndex?: number;
  zIndexInverse?: number;
};

export const BuildingDropdown = ({
  label,
  open,
  setOpen,
  value,
  setValue,
  items,
  placeholder = 'Select Building',
  zIndex = 3000,
  zIndexInverse = 1000,
}: DropdownProps) => {
  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.cardTitle}>{label}</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        placeholder={placeholder}
        style={styles.dropdown}
        containerStyle={{ marginTop: 5 }}
        dropDownContainerStyle={styles.dropdownMenu}
        zIndex={zIndex}
        zIndexInverse={zIndexInverse}
      />
    </View>
  );
};

export const FloorDropdown = ({
  label,
  open,
  setOpen,
  value,
  setValue,
  items,
  placeholder = 'Select Floor',
  disabled = false,
  zIndex = 2000,
  zIndexInverse = 2000,
}: DropdownProps) => {
  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.cardTitle}>{label}</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        placeholder={items.length ? placeholder : 'No Floors'}
        style={styles.dropdown}
        containerStyle={{ marginTop: 5 }}
        dropDownContainerStyle={styles.dropdownMenu}
        disabled={disabled}
        zIndex={zIndex}
        zIndexInverse={zIndexInverse}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dropdown: {
    borderColor: '#ddd',
    borderRadius: 8,
  },
  dropdownMenu: {
    borderColor: '#ddd',
  },
});
