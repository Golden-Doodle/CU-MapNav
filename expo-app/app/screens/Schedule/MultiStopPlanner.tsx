import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Switch,
  Modal,
} from "react-native";
import * as Location from "expo-location";

// For Google Calendar events
import { fetchTodaysEventsFromSelectedSchedule } from "@/app/services/GoogleCalendar/fetchingUserCalendarData";

// For typed definitions
import {
  GoogleCalendarEvent,
  GooglePlace,
  Coordinates,
} from "@/app/utils/types";

// Import your buildings array:
import {
  LoyolaBuildings,
  SGWBuildings,
} from "@/app/components/CampusMap/data/buildingData";
const myBuildings = [...LoyolaBuildings, ...SGWBuildings];

// For Google Places
import { fetchNearbyPlaces } from "@/app/services/GoogleMap/googlePlacesService";
import { useRouter } from "expo-router";
import Constants from "expo-constants";

// Import your Generic Header and Bottom Navigation components
import GenericHeader from "@/app/components/Header/GenericHeader";
import BottomNavigation from "@/app/components/BottomNavigation/BottomNavigation";

// Import the ListModal component
import ListModal from "./ListModal";

type POICategory = "restaurant" | "cafe" | "washroom" | "campus";

interface Task {
  id: string;
  name: string;
  coordinates: Coordinates;
  selected: boolean;
  building?: any;
  room?: string;
}

export default function CompleteDistanceMatrixChunked() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [categories, setCategories] = useState<POICategory[]>([]);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routeSteps, setRouteSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // For modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  // For category dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // For start-location dropdown
  const [startDropdownOpen, setStartDropdownOpen] = useState(false);
  const [startTaskID, setStartTaskID] = useState("USER_LOC"); // default

  const CATEGORY_OPTIONS: POICategory[] = [
    "restaurant",
    "cafe",
    "washroom",
    "campus",
  ];

  const apiKey = Constants.expoConfig?.extra?.distanceMatrixApiKey;

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission not granted; using fallback coords");
      }
      // Fallback location
      setUserLocation({ latitude: 45.495, longitude: -73.578 });

      // Fetch today's events
      const dayEvents = await fetchTodaysEventsFromSelectedSchedule();
      dayEvents.sort(
        (a, b) =>
          new Date(a.start.dateTime).getTime() -
          new Date(b.start.dateTime).getTime()
      );
      setEvents(dayEvents);
    } catch (err) {
      console.error("initialize error:", err);
      Alert.alert("Failed to init");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userLocation) return;
    const nonCampusCats = categories.filter((c) => c !== "campus");
    if (nonCampusCats.length === 0) {
      setPlaces([]);
      return;
    }
    fetchPOIs(nonCampusCats);
  }, [categories, userLocation]);

  async function fetchPOIs(selectedCats: POICategory[]) {
    setLoading(true);
    try {
      const placeIDs = new Set<string>();
      const combined: GooglePlace[] = [];

      for (const cat of selectedCats) {
        const results = await fetchNearbyPlaces(userLocation!, cat);
        for (const p of results) {
          if (!placeIDs.has(p.place_id)) {
            placeIDs.add(p.place_id);
            combined.push(p);
          }
        }
      }
      setPlaces(combined);
    } catch (err) {
      console.warn("fetchPOIs error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buildTasks();
  }, [userLocation, events, places, categories]);

  function buildTasks() {
    const newTasks: Task[] = [];
    if (userLocation) {
      newTasks.push({
        id: "USER_LOC",
        name: "My Location (Start)",
        coordinates: userLocation,
        selected: false,
      });
    }
    for (const ev of events) {
      let coords: Coordinates | undefined;
      try {
        if (ev.location) {
          const raw = JSON.parse(ev.location);
          const foundBuilding = myBuildings.find(
            (b) => b.name === raw.building
          );
          if (foundBuilding) {
            coords = foundBuilding.coordinates[0];
          }
        }
      } catch {
        console.warn("Invalid location JSON for event:", ev.summary);
      }
      if (coords) {
        newTasks.push({
          id: ev.id,
          name: ev.summary || "Class Event",
          coordinates: coords,
          selected: false,
        });
      }
    }
    for (const p of places) {
      newTasks.push({
        id: p.place_id,
        name: p.name,
        coordinates: {
          latitude: p.geometry.location.lat,
          longitude: p.geometry.location.lng,
        },
        selected: false,
      });
    }
    if (categories.includes("campus")) {
      for (const b of myBuildings) {
        newTasks.push({
          id: b.id,
          name: b.name,
          coordinates: b.coordinates[0],
          selected: false,
          building: b,
        });
      }
    }
    setTasks(newTasks);
  }

  function onToggleCategory(cat: POICategory) {
    setCategories((prev) => {
      if (prev.includes(cat)) {
        return prev.filter((c) => c !== cat);
      }
      return [...prev, cat];
    });
  }

  function toggleTask(tid: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === tid) {
          return { ...t, selected: !t.selected };
        }
        return t;
      })
    );
  }

  function onSelectStartLocation(taskId: string) {
    setStartTaskID(taskId);
    setStartDropdownOpen(false);
  }

  function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  async function getRowForOrigin(
    originCoord: Coordinates,
    allDestCoords: Coordinates[],
    maxDestPerRequest = 25
  ): Promise<number[]> {
    const rowResult = new Array(allDestCoords.length).fill(Infinity);
    const chunks = chunkArray(allDestCoords, maxDestPerRequest);
    let startIndex = 0;
    for (const chunk of chunks) {
      const chunkDest = chunk
        .map((c) => `${c.latitude},${c.longitude}`)
        .join("|");
      const orgStr = `${originCoord.latitude},${originCoord.longitude}`;
      const base = "https://maps.googleapis.com/maps/api/distancematrix/json";
      const url = `${base}?origins=${orgStr}&destinations=${chunkDest}&units=metric&key=${apiKey}`;
      console.log("Chunk request:", url);
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== "OK") {
        console.warn("Chunk error for origin:", data.status, data.error_message);
        for (let j = 0; j < chunk.length; j++) {
          rowResult[startIndex + j] = 999999;
        }
      } else {
        const row = data.rows[0];
        for (let j = 0; j < chunk.length; j++) {
          const elem = row.elements[j];
          if (elem.status === "OK") {
            rowResult[startIndex + j] = elem.distance.value;
          } else {
            rowResult[startIndex + j] = 999999;
          }
        }
      }
      startIndex += chunk.length;
    }
    return rowResult;
  }

  async function buildDistanceMatrix(selectedTasks: Task[]): Promise<number[][]> {
    const n = selectedTasks.length;
    const matrix = Array.from({ length: n }, () => new Array(n).fill(Infinity));
    const allDestCoords = selectedTasks.map((t) => t.coordinates);
    for (let i = 0; i < n; i++) {
      const originCoord = selectedTasks[i].coordinates;
      const row = await getRowForOrigin(originCoord, allDestCoords, 25);
      matrix[i] = row;
    }
    return matrix;
  }

  function solveTSPdp(matrix: number[][]): number[] {
    const n = matrix.length;
    const dp: number[][] = Array.from({ length: 1 << n }, () =>
      new Array(n).fill(Infinity)
    );
    const parent: number[][] = Array.from({ length: 1 << n }, () =>
      new Array(n).fill(-1)
    );
    dp[1][0] = 0;
    for (let mask = 0; mask < 1 << n; mask++) {
      for (let i = 0; i < n; i++) {
        if (dp[mask][i] === Infinity) continue;
        if (!((mask >> i) & 1)) continue;
        for (let j = 0; j < n; j++) {
          if ((mask >> j) & 1) continue;
          const nextMask = mask | (1 << j);
          const cost = dp[mask][i] + matrix[i][j];
          if (cost < dp[nextMask][j]) {
            dp[nextMask][j] = cost;
            parent[nextMask][j] = i;
          }
        }
      }
    }
    const fullMask = (1 << n) - 1;
    let best = Infinity, endNode = -1;
    for (let i = 0; i < n; i++) {
      if (dp[fullMask][i] < best) {
        best = dp[fullMask][i];
        endNode = i;
      }
    }
    const route: number[] = [];
    let cur = endNode, mask = fullMask;
    while (cur !== -1) {
      route.push(cur);
      const p = parent[mask][cur];
      if (p === -1) break;
      mask = mask ^ (1 << cur);
      cur = p;
    }
    route.reverse();
    return route;
  }

  async function onBuildRoute() {
    let selected = tasks.filter((t) => t.selected || t.id === startTaskID);
    if (selected.length < 2) {
      Alert.alert("Select at least 2 tasks (including your start)!");
      return;
    }
    const idx0 = selected.findIndex((x) => x.id === startTaskID);
    if (idx0 !== 0) {
      const tmp = selected[0];
      selected[0] = selected[idx0];
      selected[idx0] = tmp;
    }
    setLoading(true);
    try {
      const matrix = await buildDistanceMatrix(selected);
      const route = solveTSPdp(matrix);
      const steps: string[] = [];
      let total = 0;
      for (let i = 0; i < route.length - 1; i++) {
        const a = route[i], b = route[i + 1];
        const dist = matrix[a][b];
        total += dist;
        steps.push(
          `Step ${i + 1}: ${selected[a].name} -> ${selected[b].name}, ${dist}m`
        );
      }
      steps.push(`Total distance: ${total}m`);
      setRouteSteps(steps);
      // Open the list modal after computing the route
      setModalVisible(true);
    } catch (err) {
      console.error("onBuildRoute error:", err);
      Alert.alert("Failed to build route");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={stylesLocal.loadingContainer}>
        <ActivityIndicator
          testID="ActivityIndicator"
          size="large"
          color="#912338"
        />
      </View>
    );
  }

  const selectedCatText =
    categories.length > 0 ? categories.join(", ") : "None selected";
  const startTask = tasks.find((t) => t.id === startTaskID);

  return (
    <View style={stylesLocal.container}>
      <GenericHeader
        testID="generic-header"
        title="Multi-Stop Planner"
        noticeText="Smart Planner: Optimize your day"
        noticeIcon="lightbulb"
      />
      <View style={stylesLocal.content}>
        <View style={stylesLocal.dropdown}>
          <TouchableOpacity
            style={stylesLocal.dropdownHeader}
            onPress={() => setDropdownOpen(!dropdownOpen)}
            testID={"category-dropdown"}
          >
            <Text style={stylesLocal.dropdownHeaderText}>
              Select Categories: {selectedCatText}
            </Text>
          </TouchableOpacity>
          {dropdownOpen && (
            <View style={stylesLocal.dropdownMenu}>
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = categories.includes(cat);
                return (
                  <TouchableOpacity
                    key={cat}
                    style={stylesLocal.dropdownItem}
                    onPress={() => onToggleCategory(cat)}
                  >
                    <Text style={{ fontWeight: isSelected ? "bold" : "normal" }}>
                      {cat}
                      {isSelected ? " ✓" : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
        <View style={stylesLocal.dropdown}>
          <TouchableOpacity
            style={stylesLocal.dropdownHeader}
            onPress={() => setStartDropdownOpen(!startDropdownOpen)}
          >
            <Text style={stylesLocal.dropdownHeaderText}>
              Start Location: {startTask ? startTask.name : "None selected"}
            </Text>
          </TouchableOpacity>
          {startDropdownOpen && (
            <View style={stylesLocal.dropdownMenu}>
              {tasks.length === 0 ? (
                <Text style={{ padding: 12 }}>No tasks yet</Text>
              ) : (
                tasks.map((task) => {
                  const isSelected = startTaskID === task.id;
                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={stylesLocal.dropdownItem}
                      onPress={() => onSelectStartLocation(task.id)}
                      testID={`start-option-${task.id}`}
                    >
                      <Text style={{ fontWeight: isSelected ? "bold" : "normal" }}>
                        {task.name}
                        {isSelected ? " ✓" : ""}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
        </View>
        <Text style={stylesLocal.subtitle}>
          Tasks (toggle them on/off below):
        </Text>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          style={stylesLocal.taskList}
          renderItem={({ item }) => (
            <View style={stylesLocal.taskRow}>
              <Switch
                testID={`switch-${item.id}`}
                value={item.selected}
                onValueChange={() => toggleTask(item.id)}
              />
              <Text style={stylesLocal.taskName}>{item.name}</Text>
            </View>
          )}
        />
        <TouchableOpacity style={stylesLocal.button} onPress={onBuildRoute}>
          <Text style={stylesLocal.buttonText}>Build Best Route (TSP)</Text>
        </TouchableOpacity>
      </View>
      <BottomNavigation testID="bottom-navigation" />

      {/* List Modal for showing the route steps */}
      <ListModal
        visible={modalVisible}
        routeSteps={routeSteps}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const stylesLocal = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    marginBottom: 16,
  },
  dropdownHeader: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
  },
  dropdownHeaderText: {
    fontSize: 14,
    color: "#333",
  },
  dropdownMenu: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  taskList: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  taskName: {
    flex: 1,
    flexWrap: "wrap",
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#912338",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
