import firebaseService from "../services/FirebaseService";
import {EventDetail} from "../interface/EventInterface";
import {ParticipationDetails} from "../interface/ParticipationInterface";
import EventValidationService from "./EventValidationService";

type FirebaseUpdates = {
    [key: string]: EventDetail | ParticipationDetails | string[];
};

type ProcessEventParams = {
    selectGroupName: string;
    username: string;
    eventName: string;
    userChoices: string[];
    isAdding: boolean;
};

class ParticipationModel {
    private eventPath = '/EVENT';
    private choicePath = '/CHOICE';
    private participatePath = '/PARTICIPATE';

    private async processEventOperation(params: {
        username: string;
        eventName: string;
        isAdding: boolean;
    }): Promise<void> {
        const {username, eventName, isAdding} = params;

        const [eventData, userChoices] = await Promise.all([
            firebaseService.fetchFromFirebase(this.eventPath),
            firebaseService.fetchFromFirebase(this.buildUserPath(username))
        ]);

        EventValidationService.validateUserSelection(userChoices, eventName, isAdding);

        const selectGroupName = this.findAvailableEventGroup(eventData, eventName);
        if (!selectGroupName) {
            throw new Error(isAdding ? 'Event not found or no available slots' : 'Event not found');
        }

        const updates = await this.processEvent({
            selectGroupName,
            username,
            eventName,
            userChoices,
            isAdding
        });

        await firebaseService.updateFirebase('/', updates);
    }

    public async confirmEventSelection(username: string, eventName: string): Promise<void> {
        await this.processEventOperation({
            username,
            eventName,
            isAdding: true
        });
    }

    public async removeUserEvent(username: string, eventName: string): Promise<void> {
        await this.processEventOperation({
            username,
            eventName,
            isAdding: false
        });
    }

    private buildUserPath(username: string): string {
        return `${this.choicePath}/${username}`;
    }

    private buildPaths(groupName: string, username: string, eventName: string) {
        return {
            eventPath: `${this.eventPath}/${groupName}/${eventName}`,
            participationPath: `${this.participatePath}/${groupName}/${eventName}`,
            userPath: this.buildUserPath(username)
        };
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

    private async processEvent(params: ProcessEventParams): Promise<FirebaseUpdates> {
        const {selectGroupName, username, eventName, userChoices, isAdding} = params;
        const paths = this.buildPaths(selectGroupName, username, eventName);

        const [eventDetails, participationDetail] = await Promise.all([
            firebaseService.fetchFromFirebase(paths.eventPath),
            firebaseService.fetchFromFirebase(paths.participationPath)
        ]);

        if (isAdding) {
            EventValidationService.validateEventAvailability(eventDetails);
        }

        return {
            [paths.eventPath]: this.updateEventDetails(eventDetails, isAdding ? -1 : 1),
            [paths.participationPath]: this.updateParticipationDetails(participationDetail, username, isAdding),
            [paths.userPath]: this.updateUserChoices(userChoices, eventName, isAdding)
        };
    }

    private updateEventDetails(details: EventDetail, change: number): EventDetail {
        return {
            ...details,
            目前餘額: details.目前餘額 + change
        };
    }

    private updateParticipationDetails(details: ParticipationDetails, username: string, isAdding: boolean): any {
        const participantsList = details?.參與名單 || [];
        const updatedParticipants = isAdding
            ? [...participantsList, username]
            : participantsList.filter(name => name !== username);

        const updatedCount = (details?.當前人數 || 0) + (isAdding ? 1 : -1);

        details["參與名單"] = updatedParticipants;
        details["當前人數"] = updatedCount;

        return details;
    }

    private updateUserChoices(choices: string[], eventName: string, isAdding: boolean): string[] {
        const currentChoices = choices || [];

        if (isAdding) {
            return [...currentChoices, eventName];
        }

        return currentChoices.filter(choice => choice !== eventName);
    }
}

export default ParticipationModel;