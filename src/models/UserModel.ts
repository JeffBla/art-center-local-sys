import firebaseService from '../services/FirebaseService';

class UserModel {

    public async getUserDetails(studentID: string): Promise<{ username: string, studentID: string, email: string, phone: string }> {
        try {
            const userRecord = await firebaseService.fetchFromFirebase(`/USER/${studentID}`);
            return {
                username: userRecord.displayName || '',
                studentID: userRecord.uid,
                email: userRecord.email || '',
                phone: userRecord.phoneNumber || ''
            };
        } catch (error) {
            console.error('Error fetching user details:', error);
            throw new Error('User not found');
        }
    }

    public saveUser(username: string, studentID: string, email: string, phone: string, password: string): void {
        // Implement the function
    }
}

export default UserModel;