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

// For building data
import { SGWBuildings, LoyolaBuildings } from "@/app/components/CampusMap/data/buildingData";

// For Google Places
import { fetchNearbyPlaces } from "@/app/services/GoogleMap/googlePlacesService";

// For typed definitions
import {
  GoogleCalendarEvent,
  GooglePlace,
  Building,
  Coordinates,
  RoomLocation,
} from "@/app/utils/types";

// A minimal "Task"
interface Task {
  id: string;
  name: string;
  coordinates: Coordinates;
  selected: boolean;
  building?: Building;
  room?: string;
}

type POICategory = "restaurant" | "cafe" | "washroom";

export default function CompleteDistanceMatrixChunked() {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [categories, setCategories] = useState<POICategory[]>([]);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routeSteps, setRouteSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // YOUR Distance Matrix API key
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

      // fetch events
      const dayEvents = await fetchTodaysEventsFromSelectedSchedule();
      dayEvents.sort(
        (a,b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
      );
      setEvents(dayEvents);
    } catch (err) {
      console.error("initialize error:", err);
      Alert.alert("Failed to init");
    } finally {
      setLoading(false);
    }
  }

  // when categories or userLocation changes, fetch POIs
  useEffect(() => {
    if (!userLocation || categories.length===0) return;
    fetchPOIs();
  }, [categories, userLocation]);

  // We also ensure no duplicates if a place appears in multiple categories
  async function fetchPOIs() {
    setLoading(true);
    try {
      const placeIDs = new Set<string>(); 
      const combined: GooglePlace[] = [];
      for (const cat of categories) {
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

  // build tasks from userLocation, events, places
  useEffect(() => {
    buildTasks();
  }, [userLocation, events, places]);

  function buildTasks() {
    const newTasks: Task[] = [];

    // Always add user location at index 0
    if (userLocation) {
      newTasks.push({
        id: "USER_LOC",
        name: "My Location (Start)",
        coordinates: userLocation,
        selected: true, // cannot be deselected
      });
    }

    // from calendar events
    for (const ev of events) {
      let coords: Coordinates | undefined;
      let buildingObj: Building | undefined;
      try {
        if (ev.location) {
          const raw = JSON.parse(ev.location);
          buildingObj = [...SGWBuildings, ...LoyolaBuildings].find(b => b.name === raw.building);
          if (buildingObj) {
            coords = buildingObj.coordinates[0]; // first coordinate
          }
        }
      } catch {
        console.warn("Invalid location JSON for event:", ev.summary);
      }

      if (coords) {
        const buildingName = buildingObj ? buildingObj.name : "Unknown Building";
        const className = ev.summary || "Class Event";
        // Combine them
        const combinedName = `${className} (${buildingName})`;

        newTasks.push({
          id: ev.id,
          name: combinedName,
          coordinates: coords,
          building: buildingObj,
          selected: false,
        });
      }
    }

    // from places
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

    setTasks(newTasks);
  }

  function toggleCategory(cat: POICategory, val: boolean) {
    setCategories(prev => {
      if (val) return [...prev, cat];
      else return prev.filter(c => c!==cat);
    });
  }

  function toggleTask(tid: string) {
    setTasks(prev => prev.map(t => {
      if (t.id==="USER_LOC") return t; // can't unselect user location
      if (t.id===tid) return { ...t, selected: !t.selected };
      return t;
    }));
  }

  // Break the destinations into chunks so we never exceed 25 destinations
  function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i=0; i<arr.length; i+=size) {
      chunks.push(arr.slice(i,i+size));
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
    maxDestPerRequest=25
  ): Promise<number[]> {
    const rowResult = new Array(allDestCoords.length).fill(Infinity);

    // chunk the destinations
    const chunks = chunkArray(allDestCoords, maxDestPerRequest);
    let startIndex = 0;
    for (const chunk of chunks) {
      // build chunk destinations param
      const chunkDest = chunk
        .map(c => `${c.latitude},${c.longitude}`)
        .join("|");

      const orgStr = `${originCoord.latitude},${originCoord.longitude}`;

      const base = "https://maps.googleapis.com/maps/api/distancematrix/json";
      const url = `${base}?origins=${orgStr}&destinations=${chunkDest}&units=metric&key=${apiKey}`;

      console.log("Chunk request:", url);
      const res = await fetch(url);
      const data = await res.json();

      if (data.status !== "OK") {
        console.warn("Chunk error for origin:", data.status, data.error_message);
        // fill chunk range with 999999
        for (let j=0; j<chunk.length; j++){
          rowResult[startIndex+j] = 999999;
        }
      } else {
        // data.rows[0].elements => distances for these chunk destinations
        const row = data.rows[0];
        for (let j=0; j<chunk.length; j++){
          const elem = row.elements[j];
          if (elem.status==="OK") {
            rowResult[startIndex+j] = elem.distance.value;
          } else {
            rowResult[startIndex+j] = 999999;
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
    const matrix = Array.from({ length: n }, ()=> new Array(n).fill(Infinity));

    // We'll do N "origin" queries
    // Each origin might have to do multiple chunk calls for destinations > 25
    const allDestCoords = selectedTasks.map(t => t.coordinates);

    for (let i=0; i<n; i++) {
      const originCoord = selectedTasks[i].coordinates;

      // get distances row for origin i
      const row = await getRowForOrigin(originCoord, allDestCoords, 25);
      matrix[i] = row;
    }
    return matrix;
  }

  // TSP with bitmask DP
  function solveTSPdp(matrix: number[][]): number[] {
    const n=matrix.length;
    const dp: number[][]= Array.from({ length: 1<<n }, () => new Array(n).fill(Infinity));
    const parent: number[][]= Array.from({ length: 1<<n }, () => new Array(n).fill(-1));

    dp[1][0]=0; // start at node 0 (user loc)

    for (let mask=0; mask<(1<<n); mask++) {
      for (let i=0; i<n; i++) {
        if (dp[mask][i]===Infinity) continue;
        if (!((mask>>i)&1)) continue;

        for (let j=0; j<n; j++){
          if ((mask>>j)&1) continue; // visited j
          const nextMask=mask|(1<<j);
          const cost=dp[mask][i]+matrix[i][j];
          if (cost<dp[nextMask][j]){
            dp[nextMask][j]=cost;
            parent[nextMask][j]=i;
          }
        }
      }
    }

    // final
    const fullMask=(1<<n)-1;
    let best=Infinity, endNode=-1;
    for (let i=0; i<n; i++){
      if (dp[fullMask][i]<best) {
        best=dp[fullMask][i];
        endNode=i;
      }
    }

    // backtrack
    const route=[];
    let cur=endNode, mask=fullMask;
    while (cur!==-1) {
      route.push(cur);
      const p=parent[mask][cur];
      if (p===-1) break;
      mask=mask^(1<<cur);
      cur=p;
    }
    route.reverse();
    return route; // e.g. [0, 2, 1, ...]
  }

  async function onBuildRoute() {
    // gather selected tasks
    const selected = tasks.filter(t => t.selected);
    if (selected.length<2) {
      Alert.alert("Select at least 2 tasks!");
      return;
    }
    // ensure index 0 => user loc
    const idx0= selected.findIndex(x => x.id==="USER_LOC");
    if (idx0!==0) {
      const tmp=selected[0];
      selected[0]=selected[idx0];
      selected[idx0]=tmp;
    }

    setLoading(true);
    try {
      // build chunked matrix
      const matrix=await buildDistanceMatrix(selected);
      // solve TSP
      const route=solveTSPdp(matrix);

      // build step strings
      const steps:string[]=[];
      let total=0;
      for (let i=0; i<route.length-1; i++){
        const a=route[i], b=route[i+1];
        const dist=matrix[a][b];
        total+=dist;
        steps.push(`Step ${i+1}: ${selected[a].name} -> ${selected[b].name}, ${dist}m`);
      }
      steps.push(`Total distance: ${total}m`);
      setRouteSteps(steps);

    } catch(err){
      console.error("onBuildRoute error:", err);
      Alert.alert("Failed to build route");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#912338"/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chunked Distance Matrix TSP (Split Destinations)</Text>

      <View style={styles.catRow}>
        <Text>Restaurant</Text>
        <Switch
          value={categories.includes("restaurant")}
          onValueChange={v => toggleCategory("restaurant", v)}
        />
        <Text>Cafe</Text>
        <Switch
          value={categories.includes("cafe")}
          onValueChange={v => toggleCategory("cafe", v)}
        />
        <Text>Washroom</Text>
        <Switch
          value={categories.includes("washroom")}
          onValueChange={v => toggleCategory("washroom", v)}
        />
      </View>

      <Text style={styles.subtitle}>Tasks:</Text>
      <FlatList
        data={tasks}
        keyExtractor={item=>item.id} // unique
        style={{maxHeight:200, borderWidth:1, borderColor:"#ccc"}}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <Switch
              value={item.selected}
              onValueChange={()=>toggleTask(item.id)}
              disabled={item.id==="USER_LOC"}
            />
            <Text style={styles.taskName}>{item.name}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.button} onPress={onBuildRoute}>
        <Text style={styles.buttonText}>Build Best Route (TSP)</Text>
      </TouchableOpacity>

      <ScrollView style={{flex:1, marginTop:10}}>
        {routeSteps.length===0 ? (
          <Text>No route yet</Text>
        ) : (
          routeSteps.map((s, i)=>(
            <Text key={i} style={styles.step}>{s}</Text>
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
  container:{
    flex:1,
    backgroundColor:"#fff",
    paddingTop:40,
    paddingHorizontal:16
  },
  title:{
    fontSize:18,
    fontWeight:"bold",
    color:"#912338",
    textAlign:"center",
    marginBottom:10
  },
  catRow:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-evenly",
    marginBottom:10
  },
  subtitle:{
    fontSize:16,
    fontWeight:"600",
    marginVertical:8
  },
  taskRow:{
    flexDirection:"row",
    alignItems:"center",
    paddingVertical:6,
    borderBottomWidth:1,
    borderColor:"#ccc"
  },
  taskName:{
    flex:1,
    flexWrap:"wrap",
    marginLeft:8
  },
  button:{
    backgroundColor:"#912338",
    padding:12,
    borderRadius:8,
    alignItems:"center",
    marginVertical:10
  },
  buttonText:{
    color:"#fff",
    fontWeight:"600"
  },
  step:{
    fontSize:14,
    marginBottom:6,
    color:"#333"
  }
});
