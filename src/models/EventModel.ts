import firebaseService from '../services/FirebaseService';
import {EventDetail} from "../interface/EventInterface";
import {UserAlreadySelectedEventError, UserNotHaveEventError} from "../error/Errors";

class EventModel {
    public async getEventSheetData(): Promise<any> {
        const path = '/EVENT';
        const eventsData = await firebaseService.fetchFromFirebase(path);
        const data: any = {};

        for (const groupName in eventsData) {
            data[groupName] = {};
            const groupEvents = eventsData[groupName];

            for (const eventName in groupEvents) {
                const eventDetails = groupEvents[eventName];
                data[groupName][eventName] = {
                    活動支援時間: eventDetails["支援時間(日期-星期-24小時制)"],
                    "工作地點(校區/地點)": eventDetails["工作地點(校區-地點)"],
                    "工作時數(時)": Number(eventDetails["工作時數(時)"]),
                    "人數需求上限(人)": Number(eventDetails["人數需求上限(人)"]),
                    目前餘額: Number(eventDetails["目前餘額"]),
                    服務總時數: Number(eventDetails["服務總時數"]),
                    備註說明: eventDetails["備註說明"],
                };
            }
        }
        return data;
    }

    public async getEventInfo(eventName: string): Promise<EventDetail | null> {
        const path = '/EVENT';
        const eventsData = await firebaseService.fetchFromFirebase(path);
        for (const groupName in eventsData) {
            const groupEvents = eventsData[groupName];
            if (eventName in groupEvents) {
                return groupEvents[eventName];
            }
        }
        return null;
    }

    public async confirmEventSelection(username: string, eventName: string): Promise<void> {
        const path = `/EVENT`;
        const eventData = await firebaseService.fetchFromFirebase(path);

        let {userChoices, isExist, userPath} = await this.checkAndAddUser(username, eventName);
        if (isExist) {
            throw new UserAlreadySelectedEventError();
        }

        let selectGroupName = this.findAvailableEventGroup(eventData, eventName);
        if (!selectGroupName) {
            throw new Error('Event not found or no available slots');
        }

        const updates = await this.userAddEvent(selectGroupName, username, eventName, userPath, userChoices);

        // Write updated data back to Firebase
        await firebaseService.updateFirebase('/', updates);
    }

    public async checkAndAddUser(username: string, eventName: string): Promise<any> {
        const userPath = `/CHOICE/${username}`;
        let userChoices = await firebaseService.fetchFromFirebase(userPath);
        let isExist = false;
        if (userChoices && userChoices.includes(eventName)) {
            isExist = true;
        }
        return {userChoices, isExist, userPath};
    }

    private findAvailableEventGroup(eventData: any, eventName: string): string | null {
        for (const groupName in eventData) {
            const groupEvents = eventData[groupName];
            if (eventName in groupEvents && groupEvents[eventName]["目前餘額"] > 0) {
                return groupName;
            }
        }
        return null;
    }

    private async userAddEvent(selectGroupName: string, username: string, eventName: string, userPath: string, userChoices: any): Promise<any> {
        const eventPath = `/EVENT/${selectGroupName}/${eventName}`;
        const participationPath = `/PARTICIPATE/${selectGroupName}/${eventName}`;

        let eventDetails = await firebaseService.fetchFromFirebase(eventPath);
        let participationDetail = await firebaseService.fetchFromFirebase(participationPath);

        if (!eventDetails || eventDetails["目前餘額"] <= 0) {
            throw new Error('No available slots or event not found');
        }

        eventDetails["目前餘額"] -= 1;

        participationDetail = await this.addParticipationDetails(participationDetail, username);
        userChoices = await this.addUserChoices(userChoices, eventName);

        return {
            [eventPath]: eventDetails,
            [participationPath]: participationDetail,
            [userPath]: userChoices
        };
    }

    private async addParticipationDetails(participationDetail: any, username: string): Promise<any> {
        if (!participationDetail["參與名單"]) {
            participationDetail["參與名單"] = [username];
        } else {
            participationDetail["參與名單"].push(username);
        }
        participationDetail["當前人數"] += 1;
        return participationDetail;
    }

    private async addUserChoices(userChoices: any, eventName: string): Promise<any> {
        if (!userChoices) {
            userChoices = [eventName];
        } else {
            userChoices.push(eventName);
        }
        return userChoices;
    }

    public async removeUserEvent(username: string, eventName: string): Promise<void> {
        const path = `/EVENT`;
        const eventData = await firebaseService.fetchFromFirebase(path);

        let {userChoices, isExist, userPath} = await this.checkAndRemoveUser(username, eventName);
        if (!isExist) {
            throw new UserNotHaveEventError();
        }

        let selectGroupName = this.findAvailableEventGroup(eventData, eventName);
        if (!selectGroupName) {
            throw new Error('Event not found');
        }

        const updates = await this.userRemoveEvent(selectGroupName, username, eventName, userPath, userChoices);

        await firebaseService.updateFirebase('/', updates);
    }

    public async checkAndRemoveUser(username: string, eventName: string): Promise<any> {
        const userPath = `/CHOICE/${username}`;
        let userChoices = await firebaseService.fetchFromFirebase(userPath);
        let isExist = false;
        if (userChoices && userChoices.includes(eventName)) {
            isExist = true;
        }
        return {userChoices, isExist, userPath};
    }

    private async userRemoveEvent(selectGroupName: string, username: string, eventName: string, userPath: string, userChoices: any): Promise<any> {
        const eventPath = `/EVENT/${selectGroupName}/${eventName}`;
        const participationPath = `/PARTICIPATE/${selectGroupName}/${eventName}`;

        let eventDetails = await firebaseService.fetchFromFirebase(eventPath);
        let participationDetail = await firebaseService.fetchFromFirebase(participationPath);

        if (!eventDetails) {
            throw new Error('Event not found');
        }

        eventDetails["目前餘額"] += 1;

        participationDetail = await this.removeParticipationDetails(participationDetail, username);
        userChoices = await this.removeUserChoices(userChoices, eventName);

        return {
            [eventPath]: eventDetails,
            [participationPath]: participationDetail,
            [userPath]: userChoices
        };
    }

    private async removeParticipationDetails(participationDetail: any, username: string): Promise<any> {
        if (participationDetail["參與名單"]) {
            const index = participationDetail["參與名單"].indexOf(username);
            if (index > -1) {
                participationDetail["參與名單"].splice(index, 1);
            }
        }
        participationDetail["當前人數"] -= 1;
        return participationDetail;
    }

    private async removeUserChoices(userChoices: any, eventName: string): Promise<any> {
        if (userChoices) {
            const index = userChoices.indexOf(eventName);
            if (index > -1) {
                userChoices.splice(index, 1);
            }
        }
        return userChoices;
    }

    public async getUnavailableEvents(): Promise<string[]> {
        const path = "/EVENT";
        const eventsData = await firebaseService.fetchFromFirebase(path);
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