// hooks/useCampus.ts
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Campus } from "../utils/types";

export function useCampus(defaultCampus: Campus = "SGW") {
  const [campus, setCampus] = useState<Campus>(defaultCampus);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCampus = async () => {
      try {
        const savedCampus = await AsyncStorage.getItem("selectedCampus");
        if (savedCampus === "SGW" || savedCampus === "LOY") {
          setCampus(savedCampus);
        }
      } catch (error) {
        console.error("Failed to load campus", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCampus();
  }, []);

  const toggle = useCallback(async () => {
    const next = campus === "LOY" ? "SGW" : "LOY";
    setCampus(next);
    try {
      await AsyncStorage.setItem("selectedCampus", next);
    } catch (error) {
      console.error("Failed to save campus", error);
    }
  }, [campus]);

  return { campus, toggle, isLoading };
}