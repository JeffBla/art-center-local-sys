import * as admin from 'firebase-admin';

var serviceAccount = require("../../art-center-service-learning-firebase-adminsdk-71cle-9ae6a911f3.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://art-center-service-learning-default-rtdb.asia-southeast1.firebasedatabase.app'
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