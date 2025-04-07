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
} from "react-native";
import * as Location from "expo-location";

// For Google Calendar events
import { fetchTodaysEventsFromSelectedSchedule } from "@/app/services/GoogleCalendar/fetchingUserCalendarData";

// For typed definitions
import { GoogleCalendarEvent, GooglePlace, Coordinates } from "@/app/utils/types";

// Import your buildings array:
import { LoyolaBuildings, SGWBuildings } from "@/app/components/CampusMap/data/buildingData";
const myBuildings = [...LoyolaBuildings, ...SGWBuildings];

// For Google Places
import { fetchNearbyPlaces } from "@/app/services/GoogleMap/googlePlacesService";
import { useRouter } from "expo-router";

// Extend your POICategory to include "campus"
type POICategory = "restaurant" | "cafe" | "washroom" | "campus";

interface Task {
  id: string;
  name: string;
  coordinates: Coordinates;
  selected: boolean;
  building?: any; // Or strongly typed if you prefer
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

  // For category dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // For start-location dropdown
  const [startDropdownOpen, setStartDropdownOpen] = useState(false);
  const [startTaskID, setStartTaskID] = useState("USER_LOC"); // default

  // All possible categories in the UI:
  const CATEGORY_OPTIONS: POICategory[] = ["restaurant", "cafe", "washroom", "campus"];

  // Your Distance Matrix API key
  const apiKey = "AIzaSyCXmkSx4RToDWaI54NlhVisIsQoCAQoZR8";

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
      // let loc = await Location.getCurrentPositionAsync({});
      // setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setUserLocation({ latitude: 45.495, longitude: -73.578 }); // fallback

      // Fetch today's events
      const dayEvents = await fetchTodaysEventsFromSelectedSchedule();
      dayEvents.sort(
        (a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
      );
      setEvents(dayEvents);
    } catch (err) {
      console.error("initialize error:", err);
      Alert.alert("Failed to init");
    } finally {
      setLoading(false);
    }
  }

  // Whenever categories or userLocation change, fetch POIs (but only for non-"campus" categories)
  useEffect(() => {
    if (!userLocation) return;
    const nonCampusCats = categories.filter((c) => c !== "campus");
    if (nonCampusCats.length === 0) {
      // If no categories left to fetch from Google, clear places & skip
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
        // cat will never be "campus" here, due to our filter
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

  // Build tasks from userLocation, events, places, and possibly buildings
  useEffect(() => {
    buildTasks();
  }, [userLocation, events, places, categories]);

  function buildTasks() {
    const newTasks: Task[] = [];

    // Add user location as a normal task (can now be toggled!)
    if (userLocation) {
      newTasks.push({
        id: "USER_LOC",
        name: "My Location (Start)",
        coordinates: userLocation,
        selected: false, // can be toggled now
      });
    }

    // 1) Calendar events
    for (const ev of events) {
      let coords: Coordinates | undefined;
      try {
        if (ev.location) {
          // If you store building info in JSON, parse it here
          const raw = JSON.parse(ev.location);
          // Try to match the building in the combined array
          const foundBuilding = myBuildings.find((b) => b.name === raw.building);
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

    // 2) Google Places (from fetchPOIs)
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

    // 3) If "campus" is in categories, add your building tasks:
    if (categories.includes("campus")) {
      for (const b of myBuildings) {
        newTasks.push({
          id: b.id,
          name: b.name,
          coordinates: b.coordinates[0], // Use the first coordinate
          selected: false,
          building: b,
        });
      }
    }

    setTasks(newTasks);
  }

  /** Toggle the user’s selection of a given category. */
  function onToggleCategory(cat: POICategory) {
    setCategories((prev) => {
      if (prev.includes(cat)) {
        return prev.filter((c) => c !== cat);
      }
      return [...prev, cat];
    });
  }

  /** Toggle tasks on/off for the TSP route. */
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

  // *** Start location dropdown logic ***
  function onSelectStartLocation(taskId: string) {
    setStartTaskID(taskId);
    setStartDropdownOpen(false);
  }

  // Break the destinations into chunks so we never exceed 25 destinations
  function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * For a single origin, request distances in chunks of up to 25 destinations each,
   * then merge them into one row of length n.
   */
  async function getRowForOrigin(
    originCoord: Coordinates,
    allDestCoords: Coordinates[],
    maxDestPerRequest = 25
  ): Promise<number[]> {
    const rowResult = new Array(allDestCoords.length).fill(Infinity);

    const chunks = chunkArray(allDestCoords, maxDestPerRequest);
    let startIndex = 0;
    for (const chunk of chunks) {
      const chunkDest = chunk.map((c) => `${c.latitude},${c.longitude}`).join("|");
      const orgStr = `${originCoord.latitude},${originCoord.longitude}`;

      const base = "https://maps.googleapis.com/maps/api/distancematrix/json";
      const url = `${base}?origins=${orgStr}&destinations=${chunkDest}&units=metric&key=${apiKey}`;
      console.log("Chunk request:", url);

      const res = await fetch(url);
      const data = await res.json();

      if (data.status !== "OK") {
        console.warn("Chunk error for origin:", data.status, data.error_message);
        // fill chunk range with 999999
        for (let j = 0; j < chunk.length; j++) {
          rowResult[startIndex + j] = 999999;
        }
      } else {
        // data.rows[0].elements => distances for these chunk destinations
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

  // Build the NxN cost matrix by doing N separate "origins" requests, each chunked.
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

  // TSP with bitmask DP
  function solveTSPdp(matrix: number[][]): number[] {
    const n = matrix.length;
    const dp: number[][] = Array.from({ length: 1 << n }, () => new Array(n).fill(Infinity));
    const parent: number[][] = Array.from({ length: 1 << n }, () => new Array(n).fill(-1));

    // start at node 0 (the chosen start), mark visited
    dp[1][0] = 0;

    for (let mask = 0; mask < 1 << n; mask++) {
      for (let i = 0; i < n; i++) {
        if (dp[mask][i] === Infinity) continue;
        if (!((mask >> i) & 1)) continue;

        for (let j = 0; j < n; j++) {
          if ((mask >> j) & 1) continue; // j is visited
          const nextMask = mask | (1 << j);
          const cost = dp[mask][i] + matrix[i][j];
          if (cost < dp[nextMask][j]) {
            dp[nextMask][j] = cost;
            parent[nextMask][j] = i;
          }
        }
      }
    }

    // Find best path finishing at any node
    const fullMask = (1 << n) - 1;
    let best = Infinity,
      endNode = -1;
    for (let i = 0; i < n; i++) {
      if (dp[fullMask][i] < best) {
        best = dp[fullMask][i];
        endNode = i;
      }
    }

    // Backtrack to get the route
    const route: number[] = [];
    let cur = endNode,
      mask = fullMask;
    while (cur !== -1) {
      route.push(cur);
      const p = parent[mask][cur];
      if (p === -1) break;
      mask = mask ^ (1 << cur);
      cur = p;
    }
    route.reverse();
    return route; // e.g. [0, 2, 1, 3, ...]
  }

  async function onBuildRoute() {
    // Gather tasks that are selected OR the chosen startTask
    // Because we want to ensure the startTask is always included in the route:
    let selected = tasks.filter((t) => t.selected || t.id === startTaskID);
    if (selected.length < 2) {
      Alert.alert("Select at least 2 tasks (including your start)!");
      return;
    }

    // Reorder so that the chosen start location is at index 0:
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

      // Construct step strings
      const steps: string[] = [];
      let total = 0;
      for (let i = 0; i < route.length - 1; i++) {
        const a = route[i],
          b = route[i + 1];
        const dist = matrix[a][b];
        total += dist;
        steps.push(`Step ${i + 1}: ${selected[a].name} -> ${selected[b].name}, ${dist}m`);
      }
      steps.push(`Total distance: ${total}m`);
      setRouteSteps(steps);
    } catch (err) {
      console.error("onBuildRoute error:", err);
      Alert.alert("Failed to build route");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#912338" />
      </View>
    );
  }

  /** A simple label to show which categories are currently selected. */
  const selectedCatText = categories.length > 0 ? categories.join(", ") : "None selected";

  // The chosen startTask object
  const startTask = tasks.find((t) => t.id === startTaskID);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
        <Text style={{ color: "#912338", fontSize: 16 }}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Chunked Distance Matrix TSP (Choose Start)</Text>

      {/* Category Dropdown container */}
      <View style={styles.dropdown}>
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => setDropdownOpen(!dropdownOpen)}
        >
          <Text style={styles.dropdownHeaderText}>Select Categories: {selectedCatText}</Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownMenu}>
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = categories.includes(cat);
              return (
                <TouchableOpacity
                  key={cat}
                  style={styles.dropdownItem}
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

      {/* Start Location Dropdown */}
      <View style={styles.dropdown}>
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => setStartDropdownOpen(!startDropdownOpen)}
        >
          <Text style={styles.dropdownHeaderText}>
            Start Location: {startTask ? startTask.name : "None selected"}
          </Text>
        </TouchableOpacity>
        {startDropdownOpen && (
          <View style={styles.dropdownMenu}>
            {tasks.length === 0 ? (
              <Text style={{ padding: 12 }}>No tasks yet</Text>
            ) : (
              tasks.map((task) => {
                const isSelected = startTaskID === task.id;
                return (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.dropdownItem}
                    onPress={() => onSelectStartLocation(task.id)}
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

      <Text style={styles.subtitle}>Tasks (toggle them on/off below):</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        style={{ maxHeight: 200, borderWidth: 1, borderColor: "#ccc" }}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <Switch value={item.selected} onValueChange={() => toggleTask(item.id)} />
            <Text style={styles.taskName}>{item.name}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.button} onPress={onBuildRoute}>
        <Text style={styles.buttonText}>Build Best Route (TSP)</Text>
      </TouchableOpacity>

      <ScrollView style={{ flex: 1, marginTop: 10 }}>
        {routeSteps.length === 0 ? (
          <Text>No route yet</Text>
        ) : (
          routeSteps.map((s, i) => (
            <Text key={i} style={styles.step}>
              {s}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}

//
// Styles
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#912338",
    textAlign: "center",
    marginBottom: 10,
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
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  taskName: {
    flex: 1,
    flexWrap: "wrap",
    marginLeft: 8,
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
  },
  step: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
  },
});
