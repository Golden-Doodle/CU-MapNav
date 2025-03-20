import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import BuildingFloorSettingsModal from '../SetBuildingFloorModal';

jest.useFakeTimers();

jest.mock('@/app/components/IndoorNavigation/DropDownPicker', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return {
    BuildingDropdown: ({
      testID,
      setValue,
      value,
      label,
      items,
      open,
      setOpen,
    }: {
      testID: string;
      setValue: (val: any) => void;
      value: string | null;
      label?: string;
      items?: any[];
      open?: boolean;
      setOpen?: (open: boolean) => void;
    }) => {
      return (
        <TouchableOpacity
          testID={testID}
          onPress={() => setValue('new-building')}
        >
          <Text>{value || 'Select Building'}</Text>
        </TouchableOpacity>
      );
    },
    FloorDropdown: ({
      testID,
      setValue,
      value,
      label,
      items,
      open,
      setOpen,
      disabled,
    }: {
      testID: string;
      setValue: (val: any) => void;
      value: string | null;
      label?: string;
      items?: any[];
      open?: boolean;
      setOpen?: (open: boolean) => void;
      disabled?: boolean;
    }) => {
      return (
        <TouchableOpacity
          testID={testID}
          onPress={() => setValue('new-floor')}
          disabled={disabled}
        >
          <Text>{value || 'Select Floor'}</Text>
        </TouchableOpacity>
      );
    },
  };
});

jest.mock('../../../services/Mapped-In/MappedInService', () => ({
  fetchRoomItems: jest.fn(),
  generateDirections: jest.fn(),
  clearDirections: jest.fn(),
}));

const buildingItemsMock = [
  { label: 'Building A', value: 'building-a' },
  { label: 'Building B', value: 'building-b' },
];

const floorItemsMock = [
  { label: 'Floor 1', value: 'floor-1' },
  { label: 'Floor 2', value: 'floor-2' },
];

describe('BuildingFloorSettingsModal', () => {
  const mockOnRequestClose = jest.fn();
  const mockOnChangeBuilding = jest.fn();
  const mockOnChangeFloor = jest.fn();

  const defaultProps = {
    visible: true,
    onRequestClose: mockOnRequestClose,
    selectedBuilding: 'building-a',
    onChangeBuilding: mockOnChangeBuilding,
    buildingItems: buildingItemsMock,
    selectedFloor: 'floor-1',
    onChangeFloor: mockOnChangeFloor,
    floorItems: floorItemsMock,
    testID: 'customBFSModal',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByTestId } = render(
      <BuildingFloorSettingsModal {...defaultProps} />
    );
    expect(getByTestId('customBFSModal')).toBeTruthy();
    expect(getByTestId('bfsBackdrop')).toBeTruthy();
    expect(getByTestId('bfsModalCard')).toBeTruthy();
    expect(getByTestId('bfsModalTitle').props.children).toBe('Settings');
    expect(getByTestId('bfsBuildingLabel').props.children).toBe('Select Building:');
    expect(getByTestId('bfsFloorLabel').props.children).toBe('Select Floor:');
    expect(getByTestId('bfsCloseButton')).toBeTruthy();
  });

  it('calls onRequestClose when the backdropTouchable is pressed', () => {
    const { getByTestId } = render(
      <BuildingFloorSettingsModal {...defaultProps} />
    );
    act(() => {
      fireEvent.press(getByTestId('bfsBackdropTouchable'));
    });
    expect(mockOnRequestClose).toHaveBeenCalled();
  });

  it('calls onRequestClose when the Close button is pressed', () => {
    const { getByTestId } = render(
      <BuildingFloorSettingsModal {...defaultProps} />
    );
    act(() => {
      fireEvent.press(getByTestId('bfsCloseButton'));
    });
    expect(mockOnRequestClose).toHaveBeenCalled();
  });

  it('triggers building change and shows loading overlay', async () => {
    const { getByTestId, queryByTestId } = render(
      <BuildingFloorSettingsModal {...defaultProps} />
    );
    act(() => {
      fireEvent.press(getByTestId('buildingDropdown'));
    });
    expect(mockOnChangeBuilding).toHaveBeenCalledWith('new-building');
    expect(getByTestId('bfsLoadingOverlay')).toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() => {
      expect(queryByTestId('bfsLoadingOverlay')).toBeNull();
    });
  });

  it('triggers floor change when floor dropdown is pressed', () => {
    const { getByTestId } = render(
      <BuildingFloorSettingsModal {...defaultProps} />
    );
    act(() => {
      fireEvent.press(getByTestId('floorDropdown'));
    });
    expect(mockOnChangeFloor).toHaveBeenCalledWith('new-floor');
  });
});