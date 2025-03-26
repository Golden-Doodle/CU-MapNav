// hooks/useCampus.ts
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Campus } from "../utils/types";

export function useCampus(defaultCampus: Campus = "SGW") {
  const [campus, setCampus] = useState(defaultCampus);

  useEffect(() => {
    AsyncStorage.getItem("selectedCampus").then((val) =>
      val === "SGW" ? setCampus("SGW") : setCampus("LOY")
    );
  }, []);

  const toggle = useCallback(async () => {
    const next = campus === "LOY" ? "SGW" : "LOY";
    setCampus(next);
    await AsyncStorage.setItem("selectedCampus", next);
  }, [campus]);

  return { campus, toggle };
}
