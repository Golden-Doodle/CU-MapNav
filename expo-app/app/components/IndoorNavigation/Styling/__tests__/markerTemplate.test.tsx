import { 
    getMarkerContainer, 
    getWashroomMarkerHtml, 
    getFountainMarkerHtml, 
    getDefaultMarkerHtml, 
    getVerticalMarkerHtml 
  } from '../markerTemplate';

  describe("Marker Templates", () => {
    describe("getMarkerContainer", () => {
      it("should return a container with the provided content", () => {
        const content = "<div>Test Content</div>";
        const result = getMarkerContainer(content);
        expect(result).toContain(content);
        expect(result).toContain("background: #fff;");
        expect(result).toContain("box-shadow: 0 2px 6px rgba(0,0,0,0.15);");
      });
    });
  
    describe("getWashroomMarkerHtml", () => {
      it("should return a marker with pink fill for women's washroom", () => {
        const locationName = "Women's Restroom";
        const result = getWashroomMarkerHtml(locationName);
        expect(result).toContain('fill="#FF69B4"');
        expect(result).toContain(locationName);
      });
  
      it("should return a marker with blue fill for men's washroom", () => {
        const locationName = "Men's Washroom";
        const result = getWashroomMarkerHtml(locationName);
        expect(result).toContain('fill="#0000FF"');
        expect(result).toContain(locationName);
      });
  
      it("should return a marker with dark blue fill for an unspecified washroom", () => {
        const locationName = "Unisex Washroom";
        const result = getWashroomMarkerHtml(locationName);
        expect(result).toContain('fill="#00008b"');
        expect(result).toContain(locationName);
      });
    });
  
    describe("getFountainMarkerHtml", () => {
      it("should return a fountain marker with teal fill", () => {
        const locationName = "Campus Fountain";
        const result = getFountainMarkerHtml(locationName);
        expect(result).toContain('fill="#008080"');
        expect(result).toContain(locationName);
      });
    });
  
    describe("getDefaultMarkerHtml", () => {
      it("should return a default marker container with the location name", () => {
        const locationName = "Default Location";
        const result = getDefaultMarkerHtml(locationName);
        expect(result).toContain(locationName);
        expect(result).toContain("background: #fff;");
      });
    });
  
    describe("getVerticalMarkerHtml", () => {
      it("should return a vertical marker with the given label and fill color", () => {
        const label = "Stairs";
        const fillColor = "green";
        const result = getVerticalMarkerHtml(label, fillColor);
        expect(result).toContain(`fill="${fillColor}"`);
        expect(result).toContain(label);
        expect(result).toContain("box-shadow: 0 2px 6px rgba(0,0,0,0.15);");
      });
    });
  });