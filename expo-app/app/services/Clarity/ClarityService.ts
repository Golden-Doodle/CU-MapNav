/*
 * See npm package details here: https://www.npmjs.com/package/@microsoft/react-native-clarity
 */
import * as Clarity from '@microsoft/react-native-clarity';
import Constants from 'expo-constants';

// Default config
const clarityDefaultConfig = {
  //logLevel: Clarity.LogLevel.Verbose
};

// Project ID set in environment variable
const clarityProjectId = Constants.expoConfig?.extra?.clarityProjectId;

// Initialize Clarity Usability Testing Session
export async function runClarity(config = clarityDefaultConfig): Promise<boolean>{
    try{
        if(await isClarityPaused()){
            Clarity.resume();
        }else{
            Clarity.initialize(clarityProjectId, config);
        }
    }catch(error){
        console.error(error);
        return false;
    }
    return true;
}

// Pause Clarity Usability Testing Session
export function pauseClarity(){
    Clarity.pause();
}

// Check if Clarity Usability Testing Session is paused
export function isClarityPaused(): Promise<boolean>{
    return Clarity.isPaused();
}

// Get Clarity Usability Testing Session Recording
export async function getClarityUrl(): Promise<string>{
    const url = await Clarity.getCurrentSessionUrl();
    if (!url)
        console.warn("Attempting to retrieve clarity URL without a session");
    return url ?? "";
}

// Send a custom event to Clarity
export async function sendCustomEventToClarity(event: string): Promise<boolean>{
    try{
        if(event == null || event.length < 1){
            throw new Error('An empty string is an invalid event for usability testing');
        }
        return await Clarity.sendCustomEvent(event);
    }catch(error){
        console.error(error);
        return false;
    }
}


// Toggle
export function toggleClarity(clarityIsOn: boolean, config = clarityDefaultConfig){
    if(clarityIsOn){
        runClarity(config);
        clarityIsOn = false;
    }else{
        pauseClarity();
        clarityIsOn = true;
    }
}
