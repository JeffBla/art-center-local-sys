import EventModel from '../../src/models/EventModel';
import firebaseService from '../../src/services/FirebaseService';
import { UserAlreadySelectedEventError, UserNotHaveEventError } from '../../src/error/Errors';

jest.mock('../../src/services/FirebaseService');

describe('EventModel', () => {
    let eventModel: EventModel;
    const mockFirebaseService = firebaseService as jest.Mocked<typeof firebaseService>;

    beforeEach(() => {
        eventModel = new EventModel();
        jest.clearAllMocks();
    });

    describe('getEventSheetData', () => {
        const mockEventData = {
            "公共藝術-藝術典藏": {
                "文創品盤點與包裝": {
                    "支援時間(日期-星期-24小時制)": "10-15(二)10:00-12:00",
                    "工作地點(校區-地點)": "藝術中心",
                    "工作時數(時)": "2",
                    "人數需求上限(人)": "2",
                    "目前餘額": "0",
                    "服務總時數": "4",
                    "備註說明": "Note 1"
                },
                "校園藝術品維護": {
                    "支援時間(日期-星期-24小時制)": "10-16(三)14:00-16:00",
                    "工作地點(校區-地點)": "校園",
                    "工作時數(時)": "2",
                    "人數需求上限(人)": "3",
                    "目前餘額": "2",
                    "服務總時數": "6",
                    "備註說明": "Note 2"
                }
            }
        };

        it('should transform event data correctly', async () => {
            mockFirebaseService.fetchFromFirebase.mockResolvedValue(mockEventData);

            const result = await eventModel.getEventSheetData();

            expect(result["公共藝術-藝術典藏"]["文創品盤點與包裝"]).toEqual({
                活動支援時間: "10-15(二)10:00-12:00",
                "工作地點(校區/地點)": "藝術中心",
                "工作時數(時)": 2,
                "人數需求上限(人)": 2,
                目前餘額: 0,
                服務總時數: 4,
                備註說明: "Note 1"
            });
            expect(mockFirebaseService.fetchFromFirebase).toHaveBeenCalledWith('/EVENT');
        });

        it('should handle empty event data', async () => {
            mockFirebaseService.fetchFromFirebase.mockResolvedValue({});
            const result = await eventModel.getEventSheetData();
            expect(result).toEqual({});
        });

        it('should propagate firebase errors', async () => {
            mockFirebaseService.fetchFromFirebase.mockRejectedValue(new Error('Firebase error'));
            await expect(eventModel.getEventSheetData()).rejects.toThrow('Firebase error');
        });
    });

    describe('getEventInfo', () => {
        const mockEventData = {
            "公共藝術-藝術典藏": {
                "文創品盤點與包裝": {
                    details: "event details"
                }
            }
        };

        it('should return correct event details', async () => {
            mockFirebaseService.fetchFromFirebase.mockResolvedValue(mockEventData);
            const result = await eventModel.getEventInfo('文創品盤點與包裝');
            expect(result).toEqual({ details: "event details" });
        });

        it('should return null for non-existent event', async () => {
            mockFirebaseService.fetchFromFirebase.mockResolvedValue(mockEventData);
            const result = await eventModel.getEventInfo('non-existent-event');
            expect(result).toBeNull();
        });
    });

    describe('confirmEventSelection', () => {
        const mockEventData = {
            "公共藝術-藝術典藏": {
                "文創品盤點與包裝": {
                    "目前餘額": 2,
                }
            }
        };

        it('should handle event with no participants list', async () => {
            // Setup initial event data
            const initialEventDetails = {
                "目前餘額": 2
            };

            // Setup mock responses
            mockFirebaseService.fetchFromFirebase
                .mockResolvedValueOnce(mockEventData) // First call for event data
                .mockResolvedValueOnce([]) // Second call for user choices
                .mockResolvedValueOnce(initialEventDetails) // Event details
                .mockResolvedValueOnce({}); // Empty participation details

            await eventModel.confirmEventSelection('lisa', '文創品盤點與包裝');

            // Verify the exact update payload
            expect(mockFirebaseService.updateFirebase).toHaveBeenCalledWith('/', {
                '/EVENT/公共藝術-藝術典藏/文創品盤點與包裝': {
                    "目前餘額": 1
                },
                '/PARTICIPATE/公共藝術-藝術典藏/文創品盤點與包裝': {
                    "參與名單": ['lisa'],
                    "當前人數": 1
                },
                '/CHOICE/lisa': ['文創品盤點與包裝']
            });

            // Verify the Firebase service was called correctly
            expect(mockFirebaseService.fetchFromFirebase).toHaveBeenCalledTimes(4);
            expect(mockFirebaseService.updateFirebase).toHaveBeenCalledTimes(1);
        });

        it('should prevent double booking', async () => {
            mockFirebaseService.fetchFromFirebase
                .mockResolvedValueOnce(mockEventData)
                .mockResolvedValueOnce(['文創品盤點與包裝']);

            await expect(eventModel.confirmEventSelection('lisa', '文創品盤點與包裝'))
                .rejects.toThrow(UserAlreadySelectedEventError);
        });
    });

    describe('removeUserEvent', () => {
        const mockEventData = {
            "公共藝術-藝術典藏": {
                "文創品盤點與包裝": {
                    "目前餘額": 1,
                    "參與名單": ["lisa"]
                }
            }
        };

        it('should successfully remove user from event', async () => {
            mockFirebaseService.fetchFromFirebase
                .mockResolvedValueOnce(['文創品盤點與包裝']) // User choices
                .mockResolvedValueOnce(mockEventData) // Event data
                .mockResolvedValueOnce({ "目前餘額": 1 }) // Event details
                .mockResolvedValueOnce({ "參與名單": ["lisa"], "當前人數": 1 }); // Participation details

            await eventModel.removeUserEvent('lisa', '文創品盤點與包裝');

            expect(mockFirebaseService.updateFirebase).toHaveBeenCalledWith('/', expect.objectContaining({
                '/EVENT/公共藝術-藝術典藏/文創品盤點與包裝': expect.objectContaining({
                    "目前餘額": 2
                })
            }));
        });

        it('should handle non-existent user choice', async () => {
            mockFirebaseService.fetchFromFirebase.mockResolvedValueOnce([]);

            await expect(eventModel.removeUserEvent('lisa', '文創品盤點與包裝'))
                .rejects.toThrow(UserNotHaveEventError);
        });

        it('should handle missing participation details', async () => {
            mockFirebaseService.fetchFromFirebase
                .mockResolvedValueOnce(['文創品盤點與包裝'])
                .mockResolvedValueOnce(mockEventData)
                .mockResolvedValueOnce({ "目前餘額": 1 })
                .mockResolvedValueOnce({});

            await eventModel.removeUserEvent('lisa', '文創品盤點與包裝');
            expect(mockFirebaseService.updateFirebase).toHaveBeenCalled();
        });
    });

    describe('getUnavailableEvents', () => {
        it('should return all events with no availability', async () => {
            const mockEventData = {
                "公共藝術-藝術典藏": {
                    "文創品盤點與包裝": { "目前餘額": 0 },
                    "校園藝術品維護": { "目前餘額": 2 },
                    "藝術展覽導覽": { "目前餘額": 0 }
                },
                "音樂會": {
                    "場地布置": { "目前餘額": 0 }
                }
            };

            mockFirebaseService.fetchFromFirebase.mockResolvedValue(mockEventData);

            const result = await eventModel.getUnavailableEvents();
            expect(result).toEqual(['文創品盤點與包裝', '藝術展覽導覽', '場地布置']);
            expect(result).toHaveLength(3);
        });

        it('should handle empty event data', async () => {
            mockFirebaseService.fetchFromFirebase.mockResolvedValue({});
            const result = await eventModel.getUnavailableEvents();
            expect(result).toEqual([]);
        });
    });
});