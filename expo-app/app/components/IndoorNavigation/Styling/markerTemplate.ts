// Template functions for generating HTML marker content
// These templates are used by the MapIn SDK to display markers on the indoor map

/**
 * Get HTML for a default marker
 * @param label Text to display in the marker
 * @returns HTML string for the marker
 */
export const getDefaultMarkerHtml = (label: string): string => {
  return `
  <div style="
    background-color: #5081B9; 
    border-radius: 4px; 
    padding: 4px 8px; 
    color: white; 
    font-weight: bold; 
    font-size: 12px; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    min-width: 80px;
    text-align: center;
  ">
    ${label}
  </div>
  `;
};

/**
 * Get HTML for a washroom marker
 * @param label Text to display in the marker
 * @returns HTML string for the marker
 */
export const getWashroomMarkerHtml = (label: string): string => {
  return `
  <div style="
    background-color: #3498DB; 
    border-radius: 4px; 
    padding: 4px 8px; 
    color: white; 
    font-weight: bold; 
    font-size: 12px; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    min-width: 80px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  ">
    <div style="font-size: 16px; margin-bottom: 2px;">🚻</div>
    ${label}
  </div>
  `;
};

/**
 * Get HTML for a water fountain marker
 * @param label Text to display in the marker
 * @returns HTML string for the marker
 */
export const getFountainMarkerHtml = (label: string): string => {
  return `
  <div style="
    background-color: #2ECC71; 
    border-radius: 4px; 
    padding: 4px 8px; 
    color: white; 
    font-weight: bold; 
    font-size: 12px; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    min-width: 80px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  ">
    <div style="font-size: 16px; margin-bottom: 2px;">💧</div>
    ${label}
  </div>
  `;
};

/**
 * Get HTML for a vertical connection marker (elevator, stairs, escalator)
 * @param label Text to display in the marker
 * @param fillColor Background color for the marker
 * @returns HTML string for the marker
 */
export const getVerticalMarkerHtml = (label: string, fillColor: string): string => {
  return `
  <div style="
    background-color: ${fillColor}; 
    border-radius: 4px; 
    padding: 4px 8px; 
    color: white; 
    font-weight: bold; 
    font-size: 12px; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    min-width: 80px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  ">
    <div style="font-size: 16px; margin-bottom: 2px;">
      ${label.toLowerCase().includes('elevator') ? '🔼' :
      label.toLowerCase().includes('escalator') ? '↗️' :
        '🪜'
    }
    </div>
    ${label}
  </div>
  `;
};

/**
 * Get HTML for an entrance/exit point marker
 * @param label Text to display in the marker
 * @returns HTML string for the marker
 */
export const getEntranceExitMarkerHtml = (label: string): string => {
  return `
  <div style="
    background-color: #E74C3C; 
    border-radius: 4px; 
    padding: 4px 8px; 
    color: white; 
    font-weight: bold; 
    font-size: 12px; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    min-width: 80px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  ">
    <div style="font-size: 16px; margin-bottom: 2px;">🚪</div>
    ${label}
  </div>
  `;
};

/**
 * Get HTML for a destination marker
 * @param label Text to display in the marker
 * @returns HTML string for the marker
 */
export const getDestinationMarkerHtml = (label: string): string => {
  return `
  <div style="
    background-color: #912338; 
    border-radius: 4px; 
    padding: 4px 8px; 
    color: white; 
    font-weight: bold; 
    font-size: 12px; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    min-width: 80px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  ">
    <div style="font-size: 16px; margin-bottom: 2px;">📍</div>
    ${label}
  </div>
  `;
};