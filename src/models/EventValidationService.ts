import {EventDetail} from "../interface/EventInterface";
import {UserAlreadySelectedEventError, UserNotHaveEventError} from "../error/Errors";

class EventValidationService {
    public static validateEventAvailability(eventDetails: EventDetail | null): void {
        if (!eventDetails || eventDetails.目前餘額 <= 0) {
            throw new Error('No available slots or event not found');
        }
    }

    public static validateUserSelection(userChoices: string[], eventName: string, isAdding: boolean): void {
        const hasEvent = userChoices?.includes(eventName);
        if (isAdding && hasEvent) {
            throw new UserAlreadySelectedEventError();
        }
        if (!isAdding && !hasEvent) {
            throw new UserNotHaveEventError();
        }
    }
}

export default EventValidationService;