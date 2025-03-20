import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SearchablePicker from '../SearchablePicker';

describe('SearchablePicker', () => {
  const items = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' }
  ];
  const placeholder = 'Select an item';
  const modalTitle = 'Pick an Item';
  const onValueChange = jest.fn();

  beforeEach(() => {
    onValueChange.mockClear();
  });

  test('renders placeholder when no value is selected', () => {
    const { getByText } = render(
      <SearchablePicker
        items={items}
        selectedValue=""
        onValueChange={onValueChange}
        placeholder={placeholder}
        modalTitle={modalTitle}
      />
    );
    expect(getByText(placeholder)).toBeTruthy();
  });

  test('opens modal on button press and displays modal title', () => {
    const { getByText, getByPlaceholderText } = render(
      <SearchablePicker
        items={items}
        selectedValue=""
        onValueChange={onValueChange}
        placeholder={placeholder}
        modalTitle={modalTitle}
      />
    );
    fireEvent.press(getByText(placeholder));
    expect(getByText(modalTitle)).toBeTruthy();
    expect(getByPlaceholderText('Search...')).toBeTruthy();
  });

  test('filters items based on search text', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <SearchablePicker
        items={items}
        selectedValue=""
        onValueChange={onValueChange}
        placeholder={placeholder}
        modalTitle={modalTitle}
      />
    );
    fireEvent.press(getByText(placeholder));
    const searchInput = getByPlaceholderText('Search...');
    fireEvent.changeText(searchInput, 'ban');
    await waitFor(() => {
      expect(getByText('Banana')).toBeTruthy();
      expect(queryByText('Apple')).toBeNull();
    });
  });

  test('selects an item and closes modal', async () => {
    const { getByText, queryByText } = render(
      <SearchablePicker
        items={items}
        selectedValue=""
        onValueChange={onValueChange}
        placeholder={placeholder}
        modalTitle={modalTitle}
      />
    );
    fireEvent.press(getByText(placeholder));
    fireEvent.press(getByText('Cherry'));
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith('cherry');
      expect(queryByText(modalTitle)).toBeNull();
    });
  });

  test('closes modal when close button is pressed', async () => {
    const { getByText, queryByText } = render(
      <SearchablePicker
        items={items}
        selectedValue=""
        onValueChange={onValueChange}
        placeholder={placeholder}
        modalTitle={modalTitle}
      />
    );
    fireEvent.press(getByText(placeholder));
    fireEvent.press(getByText('Close'));
    await waitFor(() => {
      expect(queryByText(modalTitle)).toBeNull();
    });
  });
});