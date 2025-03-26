import * as Clarity from '@microsoft/react-native-clarity';

// Default config
const clarityDefaultConfig = {
  logLevel: Clarity.LogLevel.Verbose
};

// Initialize Clarity Usability Testing Session
export function runClarity(projectId: string, config = clarityDefaultConfig){
    Clarity.initialize(projectId, config);
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
export function getClarityUrl(): string?{
    Clarity.getCurrentSessionUrl()
        .then((url)=>{
            return url || "could not find url";
        });
}

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


