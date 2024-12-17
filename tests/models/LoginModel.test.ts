import LoginModel from '../../src/models/LoginModel';
import firebaseService from '../../src/services/FirebaseService';

// Mock the firebaseService
jest.mock('../../src/services/FirebaseService');

describe('LoginModel', () => {
    let loginModel: LoginModel;

    beforeEach(() => {
        loginModel = new LoginModel();
    });

    describe('authenticateUser', () => {
        it('should return user data if authentication is successful', async () => {
            const mockUserData = {username: 'JohnDoe', password: 'password123'};
            (firebaseService.fetchFromFirebase as jest.Mock).mockResolvedValue(mockUserData);

            const result = await loginModel.checkLogin('JohnDoe', 'password123');

            expect(result).toEqual(mockUserData);
        });

        it('should throw an error if authentication fails', async () => {
            const mockError = new Error('Authentication failed');
            try {
                (firebaseService.fetchFromFirebase as jest.Mock).mockRejectedValue(mockError);
            } catch (error) {
                await expect(loginModel.checkLogin('JohnDoe', 'wrongpassword')).rejects.toThrow('Authentication failed');
            }
        });
    });
});