import * as admin from 'firebase-admin';

var firebaseAdmin = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://art-center-service-learning-default-rtdb.asia-southeast1.firebasedatabase.app'
});

firebaseAdmin.auth().updateUser("UwMftHx65lNjY3ZdX2AUhBRBo0F3", {emailVerified: true}).then((userRecord) => {
    console.log('Successfully updated user', userRecord.toJSON());
}).catch((error) => {
    console.error('Error updating user:', error);
});

class FirebaseService {
    private getDatabaseRef(path: string) {
        return admin.database().ref(path);
    }

    public async fetchFromFirebase(path: string): Promise<any> {
        const snapshot = await this.getDatabaseRef(path).once('value');
        return snapshot.val();
    }

    public async writeToFirebase(path: string, data: any): Promise<void> {
        await this.getDatabaseRef(path).set(data);
    }

    public async updateFirebase(path: string, data: any): Promise<void> {
        await this.getDatabaseRef(path).update(data);
    }

    public async deleteFromFirebase(path: string): Promise<void> {
        await this.getDatabaseRef(path).remove();
    }
}

const firebaseService = new FirebaseService();

export default firebaseService;