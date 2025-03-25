import { defaultIcon } from './Constants';

export function getMarkerContainer(content: string): string {
  return `<div style="
      background: #fff;
      padding: 6px 8px;
      border-radius: 8px;
      font-size: 12px;
      font-family: 'Helvetica, sans-serif';
      text-align: center;
      color: #800020;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    ">
      ${content}
    </div>`;
}

export function getWashroomMarkerHtml(locationName: string): string {
  const lowerName = locationName.toLowerCase();
  let washroomIcon: string;
  if (lowerName.includes("women's")) {
    washroomIcon = defaultIcon.replace(/fill="white"/gi, 'fill="#FF69B4"');
  } else if (lowerName.includes("men's")) {
    washroomIcon = defaultIcon.replace(/fill="white"/gi, 'fill="#0000FF"');
  } else {
    washroomIcon = defaultIcon.replace(/fill="white"/gi, 'fill="#00008b"');
  }
  return getMarkerContainer(`${washroomIcon}<div style="margin-top: 4px;">${locationName}</div>`);
}

export function getFountainMarkerHtml(locationName: string): string {
  const fountainIcon = defaultIcon.replace(/fill="white"/gi, 'fill="#008080"');
  return getMarkerContainer(`${fountainIcon}<div style="margin-top: 4px;">${locationName}</div>`);
}

export function getDefaultMarkerHtml(locationName: string): string {
  return `<div style="
      background: #fff;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 12px;
      font-family: 'Helvetica, sans-serif';
      text-align: center;
      color: #800020;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    ">${locationName}</div>`;
}

export function getVerticalMarkerHtml(label: string, fillColor: string): string {
  const coloredIcon = defaultIcon.replace(/fill="white"/gi, `fill="${fillColor}"`);
  return `<div style="
      background: #fff;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 12px;
      font-family: 'Helvetica, sans-serif';
      text-align: center;
      color: #800020;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      ${coloredIcon}
      <div style="margin-top: 4px;">${label}</div>
    </div>`;
}