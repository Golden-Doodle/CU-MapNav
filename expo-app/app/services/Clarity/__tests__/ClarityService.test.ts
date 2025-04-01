import * as ClarityService from '../ClarityService.ts'

jest.mock("@microsoft/react-native-clarity", () =>({
    expoConfig: {
        extra:{
            "clarityProjectId": "mock-project-id",
        },
    },
    initialize: jest.fn().mockReturnValue()
                .mockReturnValueOnce()
                .mockReturnValueOnce()
                .mockImplementation(()=>{throw new Error();}),
    resume: jest.fn().mockReturnValue(),
    getCurrentSessionUrl: jest.fn().mockResolvedValue()
                            .mockImplementationOnce(() => Promise.resolve("mocked-clarity-url"))
                            .mockResolvedValueOnce("could not find url"),
    isPaused: jest.fn().mockReturnValue()
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true),
    sendCustomEvent: jest.fn().mockReturnValue()
                                .mockReturnValueOnce(true)
                                .mockReturnValueOnce(false),
}));

initialize = jest.fn() as jest.Mock<Promise<Response>>;
getCurrentSessionUrl = jest.fn() as jestMock<Promise<Response>>;

describe("Clarity Access and Controls", () => {

    beforeEach(()=>{
        (initialize as jest.Mock).mockClear();
        (getCurrentSessionUrl as jest.Mock).mockClear();
    });
    
    it("Initiliaze clarity or resume if paused and return false when error occurs", async ()=>{
       const expectedSuccessResult: boolean = true;
       const expectedFailedResult: boolean = false;
       const mockConsoleError = jest.spyOn(console, "error").mockImplementation(()=>{});

       const results: boolean = await ClarityService.runClarity();
       const resultResume: boolean = await ClarityService.runClarity();
       const resultError: boolean = await ClarityService.runClarity();

       expect(results).toBe(expectedSuccessResult);
       expect(resultResume).toBe(expectedSuccessResult);
       expect(resultError).toBe(expectedFailedResult);
       expect(mockConsoleError).toHaveBeenCalled();

    });

    it("Pause Clarity, check Clarity is paused and resume Clarity", async () => {
        const expectedIsPausedResult: boolean = true;
        const expectedIsNotPausedResult: boolean = false;

        
    });
    
    it("Get the Clarity url or no url found message", async () => {
        const expectedUrlResponse: string = "mocked-clarity-url";
        const expectedNoUrlResponse: string = "could not find url";
        
        const response: string = await ClarityService.getClarityUrl();
        const noSessionResponse: string = await ClarityService.getClarityUrl();

        expect(response).toBe(expectedUrlResponse);
        expect(noSessionResponse).toBe(expectedNoUrlResponse);
    });

    it("Send custome events to Clarity", () => {
        const mockConsoleError = jest.spyOn(console, "error").mockImplementation(()=>{});//mocking error appears unneeded
        const expectedResultInvalidParamString: boolean = false;
        const expectedResultValidParamString: boolean = true;

        const resultValidString: boolean = ClarityService.sendCustomEventToClarity("a-valid-string");
        const resultInvalidString: boolean = ClarityService.sendCustomEventToClarity("");
        
        expect(resultValidString).toBe(expectedResultValidParamString);
        expect(resultInvalidString).toBe(expectedResultInvalidParamString);
        expect(mockConsoleError).toHaveBeenCalled();

    });

});

