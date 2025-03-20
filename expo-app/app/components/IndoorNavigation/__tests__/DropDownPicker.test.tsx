import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BuildingDropdown, FloorDropdown } from '../DropDownPicker';

jest.mock('react-native-dropdown-picker', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return ({ testID, placeholder, setValue, setOpen }: any) => (
    <TouchableOpacity
      testID={testID}
      onPress={() => {
        if (setOpen) {
          setOpen(true);
        }
        if (setValue) {
          setValue('option1');
        }
      }}
    >
      <Text>{placeholder}</Text>
    </TouchableOpacity>
  );
});

describe('Dropdown Components', () => {
  const items = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
  ];

  it('renders BuildingDropdown with label and default placeholder', () => {
    const setOpen = jest.fn();
    const setValue = jest.fn();
    const { getByTestId, getByText } = render(
      <BuildingDropdown
        label="Building"
        open={false}
        setOpen={setOpen}
        value={null}
        setValue={setValue}
        items={items}
      />
    );
    expect(getByTestId('buildingDropdownContainer')).toBeTruthy();
    expect(getByTestId('buildingDropdownPicker')).toBeTruthy();
    expect(getByText('Building')).toBeTruthy();
    expect(getByText('Select Building')).toBeTruthy();
  });

  it('renders FloorDropdown with label and "No Floors" placeholder when items array is empty', () => {
    const setOpen = jest.fn();
    const setValue = jest.fn();
    const { getByTestId, getByText } = render(
      <FloorDropdown
        label="Floor"
        open={false}
        setOpen={setOpen}
        value={null}
        setValue={setValue}
        items={[]} 
        disabled={true}
      />
    );
    expect(getByTestId('floorDropdownContainer')).toBeTruthy();
    expect(getByTestId('floorDropdownPicker')).toBeTruthy();
    expect(getByText('Floor')).toBeTruthy();
    expect(getByText('No Floors')).toBeTruthy();
  });

  it('calls setValue and setOpen callbacks when interacting with BuildingDropdown', () => {
    const setOpen = jest.fn();
    const setValue = jest.fn();
    const { getByTestId } = render(
      <BuildingDropdown
        label="Building"
        open={false}
        setOpen={setOpen}
        value={null}
        setValue={setValue}
        items={items}
      />
    );
    const picker = getByTestId('buildingDropdownPicker');
    fireEvent.press(picker);
    expect(setValue).toHaveBeenCalledWith('option1');
    expect(setOpen).toHaveBeenCalledWith(true);
  });
});