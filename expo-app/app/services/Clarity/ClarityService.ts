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
export function runClarity(config = clarityDefaultConfig): Promise<boolean>{
    try{
        if(isClarityPaused()){
            resumeClarity();
        }
        Clarity.initialize(clarityProjectId, config);
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

// Resume Clarity Usability Testing Session
export function resumeClarity(){
    Clarity.resume();
}

// Get Clarity Usability Testing Session Recording
export function getClarityUrl(): Promise<string>{
    return Clarity.getCurrentSessionUrl()
        .then((url)=>{
            return url;
        });
}

// REMOVE, not supported by clarity
// Stop Clarity Recording
export function stopClarity(){
    Clarity.stop();
}

// Send a custom event to Clarity
export function sendCustomEventToClarity(event: string): Promise<boolean>{
    try{
        if(event == null || event.length < 1){
            throw new Error('An empty string is an invalid event for usability testing');
        }
        return Clarity.sendCustomEvent(event);
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
