import firebaseService from '../services/FirebaseService';
import {EventDetail, EventStrcut} from '../interface/EventInterface';

class UserModel {

    public async getUserDetails(studentID: string): Promise<{
        username: string,
        studentID: string,
        email: string,
        phone: string
    }> {
        try {
            return await firebaseService.fetchFromFirebase(`/USER/${studentID}`);
        } catch (error) {
            console.error('Error fetching user details:', error);
            throw new Error('User not found');
        }
    }

    public async getUserEventsDetail(username: string): Promise<EventDetail[] | null> {
        let userEvents = await firebaseService.fetchFromFirebase(`/CHOICE/${username}`);
        if (!userEvents) {
            return null;
        }

        let allEvents: EventStrcut = await firebaseService.fetchFromFirebase('/EVENT');
        let eventDetails: EventDetail[] = [];

        for (let category in allEvents) {
            for (let eventName in allEvents[category]) {
                if (userEvents.includes(eventName)) {
                    eventDetails.push(allEvents[category][eventName]);
                }
            }
        }

        return eventDetails;
    }
}

export default UserModel;