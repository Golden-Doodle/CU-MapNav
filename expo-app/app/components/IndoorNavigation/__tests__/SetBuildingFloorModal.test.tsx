import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import BuildingFloorSettingsModal, {
  IBuildingFloorSettingsModalProps,
  IBuildingFloorSettingsModalHandles,
} from '../SetBuildingFloorModal';

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
      setOpen?: (open: boolean | ((prev: boolean) => boolean)) => void;
    }) => {
      return (
        <TouchableOpacity
          testID={testID}
          onPress={() => {
            if (setOpen) {
              setOpen(true);
            }
            setValue('new-building');
          }}
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
      setOpen?: (open: boolean | ((prev: boolean) => boolean)) => void;
      disabled?: boolean;
    }) => {
      return (
        <TouchableOpacity
          testID={testID}
          onPress={() => {
            if (!disabled) {
              if (setOpen) {
                setOpen((prev: boolean) => !prev);
              }
              setValue('new-floor');
            }
          }}
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

  const defaultProps: IBuildingFloorSettingsModalProps = {
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

  it('displays default text when selected building and floor are null', () => {
    const newProps = {
      ...defaultProps,
      selectedBuilding: null,
      selectedFloor: null,
    };
    const { getByText } = render(
      <BuildingFloorSettingsModal {...newProps} />
    );
    expect(getByText('Select Building')).toBeTruthy();
    expect(getByText('Select Floor')).toBeTruthy();
  });

  it('does not trigger floor change when floor dropdown is disabled', () => {
    const newProps = {
      ...defaultProps,
      floorItems: [],
    };
    const { getByTestId } = render(
      <BuildingFloorSettingsModal {...newProps} />
    );
    act(() => {
      fireEvent.press(getByTestId('floorDropdown'));
    });
    expect(mockOnChangeFloor).not.toHaveBeenCalled();
  });

  it('handleOpenBuilding boolean branch works', () => {
    const ref = React.createRef<IBuildingFloorSettingsModalHandles>();
    render(<BuildingFloorSettingsModal ref={ref} {...defaultProps} />);
    act(() => {
      ref.current?.handleOpenBuilding(false);
    });
    expect(ref.current?.getOpenBuilding()).toBe(false);
  });

  it('handleOpenBuilding function branch works', () => {
    const ref = React.createRef<IBuildingFloorSettingsModalHandles>();
    render(<BuildingFloorSettingsModal ref={ref} {...defaultProps} />);
    act(() => {
      ref.current?.handleOpenBuilding((prev) => !prev);
    });

    expect(ref.current?.getOpenBuilding()).toBe(true);
    expect(ref.current?.getOpenFloor()).toBe(false);
  });

  it('handleOpenFloor boolean branch works', () => {
    const ref = React.createRef<IBuildingFloorSettingsModalHandles>();
    render(<BuildingFloorSettingsModal ref={ref} {...defaultProps} />);
    act(() => {
      ref.current?.handleOpenFloor(false);
    });
    expect(ref.current?.getOpenFloor()).toBe(false);
  });

  it('handleOpenFloor function branch works', () => {
    const ref = React.createRef<IBuildingFloorSettingsModalHandles>();
    render(<BuildingFloorSettingsModal ref={ref} {...defaultProps} />);

    act(() => {
      ref.current?.handleOpenBuilding(true);
    });
    expect(ref.current?.getOpenBuilding()).toBe(true);

    act(() => {
      ref.current?.handleOpenFloor((prev) => true);
    });

    expect(ref.current?.getOpenFloor()).toBe(true);
    expect(ref.current?.getOpenBuilding()).toBe(false);
  });

  it('handleBuildingChange function branch works', () => {
    const ref = React.createRef<IBuildingFloorSettingsModalHandles>();
    render(<BuildingFloorSettingsModal ref={ref} {...defaultProps} />);
    act(() => {
      ref.current?.handleBuildingChange((prev) => 'updated-building');
    });
    expect(mockOnChangeBuilding).toHaveBeenCalledWith('updated-building');
  });
});