import firebaseService from '../services/FirebaseService';
import {EventDetail} from "../interface/EventInterface";

class EventModel {
    private eventPath = '/EVENT';

    public async getEventSheetData(): Promise<any> {
        return await firebaseService.fetchFromFirebase(this.eventPath);
    }

    public async getEventInfo(eventName: string): Promise<EventDetail | null> {
        const eventsData = await firebaseService.fetchFromFirebase(this.eventPath);
        for (const groupName in eventsData) {
            const groupEvents = eventsData[groupName];
            if (eventName in groupEvents) {
                return groupEvents[eventName];
            }
        }
        return null;
    }

    public async getUnavailableEvents(): Promise<string[]> {
        const eventsData = await firebaseService.fetchFromFirebase(this.eventPath);
        const disableItem: string[] = [];

        for (const groupName in eventsData) {
            const groupEvents = eventsData[groupName];
            for (const eventName in groupEvents) {
                if (groupEvents[eventName]["目前餘額"] <= 0) {
                    disableItem.push(eventName);
                }
            }
        }

        return disableItem;
    }
}

export default EventModel;