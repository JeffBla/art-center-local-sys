import EventModel from '../../src/models/EventModel';
import firebaseService from '../../src/services/FirebaseService';

// Mock the firebaseService
jest.mock('../../src/services/FirebaseService');

describe('EventModel', () => {
    let eventModel: EventModel;

    beforeEach(() => {
        eventModel = new EventModel();
    });

    describe('getEventSheetData', () => {
        it('should return event data', async () => {
            const mockEventData = {
                group1: {
                    event1: {
                        "支援時間(日期-星期-24小時制)": "2023-10-01",
                        "工作地點(校區-地點)": "Campus A",
                        "工作時數(時)": "2",
                        "人數需求上限(人)": "10",
                        "目前餘額": "5",
                        "服務總時數": "20",
                        "備註說明": "Note 1"
                    }
                }
            };
            (firebaseService.fetchFromFirebase as jest.Mock).mockResolvedValue(mockEventData);

            const result = await eventModel.getEventSheetData();

            expect(result).toEqual({
                group1: {
                    event1: {
                        活動支援時間: "2023-10-01",
                        "工作地點(校區/地點)": "Campus A",
                        "工作時數(時)": 2,
                        "人數需求上限(人)": 10,
                        目前餘額: 5,
                        服務總時數: 20,
                        備註說明: "Note 1"
                    }
                }
            });
        });

        it('should throw an error if fetching event data fails', async () => {
            const mockError = new Error('Test error');
            (firebaseService.fetchFromFirebase as jest.Mock).mockRejectedValue(mockError);

            await expect(eventModel.getEventSheetData()).rejects.toThrow('Test error');
        });
    });
});