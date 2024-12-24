export class UserAlreadySelectedEventError extends Error {
    constructor() {
        super('User already selected this event');
        this.name = 'UserAlreadySelectedEventError';
    }
}

export class UserNotHaveEventError extends Error {
    constructor() {
        super('User has not selected this event');
        this.name = 'UserNotHaveEventError';
    }
}