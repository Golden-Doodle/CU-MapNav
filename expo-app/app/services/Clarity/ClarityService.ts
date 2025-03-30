/*
 * See npm package details here: https://www.npmjs.com/package/@microsoft/react-native-clarity
 */
import * as Clarity from '@microsoft/react-native-clarity';

// Default config
const clarityDefaultConfig = {
  //logLevel: Clarity.LogLevel.Verbose
};

// Project ID set in environment variable
const clarityProjectId = process.env.CLARITY_PROJECT_ID;

// Initialize Clarity Usability Testing Session
export function runClarity(config = clarityDefaultConfig){
    try{
        Clarity.initialize(clarityProjectId, config);
    }catch(error){
        console.error(error);
    }
    
}

// Pause Clarity Usability Testing Session
export function pauseClarity(){
    Clarity.pause();
}

// Resume Clarity Usability Testing Session
export function resumeClarity(){
    Clarity.resume();
}

// Get Clarity Usability Testing Session Recording
export function getClarityUrl(): string{
    Clarity.getCurrentSessionUrl()
        .then((url)=>{
            return url || "could not find url";
        });
}

// REMOVE, not supported by clarity
// Stop Clarity Recording
export function stopClarity(){
    Clarity.stop();
}


// Send a custom event to Clarity
export function sendCustomEventToClarity(event: string){
    try{
        if(event == null || event.length == -1){
            throw new Error('An empty string is an invalid event for usability testing');
        }
        Clarity.sendCustomEvent(event);
    }catch(error){
        console.error(error);
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
