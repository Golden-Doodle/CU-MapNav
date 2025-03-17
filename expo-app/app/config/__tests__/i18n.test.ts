/**
 * @jest-environment node
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock Expo Localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}));

describe("i18n initialization", () => {
  // Reset modules after each test so the i18n module is re-imported with updated mocks
  afterEach(() => {
    jest.resetModules();
  });

  test("should initialize with saved language from AsyncStorage", async () => {
    // Cast functions to jest.Mock so that TypeScript recognizes mockResolvedValue
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("fr");
    (Localization.getLocales as jest.Mock).mockReturnValue([{ languageCode: "en" }]);

    // Import i18n from the parent folder (adjust path accordingly)
    const i18n = require("../i18n").default;
    // Wait for the async initialization to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(i18n.language).toBe("fr");
  });

  test("should initialize with device language when no saved language", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (Localization.getLocales as jest.Mock).mockReturnValue([{ languageCode: "en" }]);

    const i18n = require("../i18n").default;
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(i18n.language).toBe("en");
  });

  test("should default to 'en' when no saved language and no device language", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (Localization.getLocales as jest.Mock).mockReturnValue([]);

    const i18n = require("../i18n").default;
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(i18n.language).toBe("en");
  });

  test("should save language on languageChanged event", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("en");
    (Localization.getLocales as jest.Mock).mockReturnValue([{ languageCode: "en" }]);

    const i18n = require("../i18n").default;
    await new Promise(resolve => setTimeout(resolve, 0));

    // Trigger a language change
    i18n.changeLanguage("fr");
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(AsyncStorage.setItem).toHaveBeenCalledWith("language", "fr");
  });
});
