// tests/models/UserModel.test.ts
import UserModel from '../../src/models/UserModel';
import firebaseService from '../../src/services/FirebaseService';

// Mock the firebaseService
jest.mock('../../src/services/FirebaseService');

describe('UserModel', () => {
    let userModel: UserModel;

    beforeEach(() => {
        userModel = new UserModel();
    });

    describe('getUserDetails', () => {
        it('should return user details if fetching is successful', async () => {
            const mockUserDetails = { username: 'JohnDoe', studentID: '1', email: 'john@example.com', phone: '1234567890' };
            (firebaseService.fetchFromFirebase as jest.Mock).mockResolvedValue(mockUserDetails);

            const result = await userModel.getUserDetails('1');

            expect(result).toEqual(mockUserDetails);
        });

        it('should throw an error if fetching user details fails', async () => {
            const mockError = new Error('User not found');
            (firebaseService.fetchFromFirebase as jest.Mock).mockRejectedValue(mockError);

            await expect(userModel.getUserDetails('1')).rejects.toThrow('User not found');
        });
    });

    describe('getUserEvents', () => {
        it('should return user events if fetching is successful', async () => {
            const mockUserEvents = ['event1', 'event2'];
            (firebaseService.fetchFromFirebase as jest.Mock).mockResolvedValue(mockUserEvents);

            const result = await userModel.getUserEvents('JohnDoe');

            expect(result).toEqual(mockUserEvents);
        });

        it('should return null if no events are found', async () => {
            (firebaseService.fetchFromFirebase as jest.Mock).mockResolvedValue(null);

            const result = await userModel.getUserEvents('JohnDoe');

            expect(result).toBeNull();
        });

        it('should throw an error if fetching user events fails', async () => {
            const mockError = new Error('Fetching user events failed');
            (firebaseService.fetchFromFirebase as jest.Mock).mockRejectedValue(mockError);

            await expect(userModel.getUserEvents('JohnDoe')).rejects.toThrow('Fetching user events failed');
        });
    });

    describe('getUserEventsDetail', () => {
        it('should return user event details if fetching is successful', async () => {
            const mockUserEvents = ['event1'];
            const mockEventDetails = {
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
            };
            (firebaseService.fetchFromFirebase as jest.Mock)
                .mockResolvedValueOnce(mockUserEvents)
                .mockResolvedValueOnce(mockEventDetails);

            const result = await userModel.getUserEventsDetail('JohnDoe');

            expect(result).toEqual([mockEventDetails.group1.event1]);
        });

        it('should return null if no events are found', async () => {
            (firebaseService.fetchFromFirebase as jest.Mock).mockResolvedValue(null);

            const result = await userModel.getUserEventsDetail('JohnDoe');

            expect(result).toBeNull();
        });

        it('should throw an error if fetching event details fails', async () => {
            const mockError = new Error('Fetching event details failed');
            (firebaseService.fetchFromFirebase as jest.Mock).mockRejectedValue(mockError);

            await expect(userModel.getUserEventsDetail('JohnDoe')).rejects.toThrow('Fetching event details failed');
        });
    });
});