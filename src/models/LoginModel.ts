import firebaseService from '../services/FirebaseService';

interface UserRecord {
    username: string;
    studentID: string;
    password: string;
    email: string;
    phone: string;
}

class LoginModel {
    public async checkLogin(studentID: string, password: string): Promise<UserRecord | null> {
        try {
            const userRecord = await firebaseService.fetchFromFirebase(`/USER/${studentID}`);
            if (userRecord && userRecord.password === password) {
                return userRecord;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error checking login credentials:', error);
            return null;
        }
    }
}

export default LoginModel;