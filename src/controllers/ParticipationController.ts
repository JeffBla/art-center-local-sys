import {Request, Response} from "express";
import {UserNotHaveEventError, UserAlreadySelectedEventError} from "../error/Errors";
import ParticipationModel from "../models/ParticipationModel";

export class ParticipationController {
    private participationModel: ParticipationModel;

    constructor() {
        this.participationModel = new ParticipationModel();
        this.selectEvent = this.selectEvent.bind(this);
        this.eventConfirmClicked = this.eventConfirmClicked.bind(this);
        this.removeEvent = this.removeEvent.bind(this);
    }

    public async selectEvent(req: Request, res: Response): Promise<void> {
        const {username, eventName} = req.body;

        if (!username) {
            res.status(400).json({error: 'Username is required'});
            return;
        }

        if (!eventName) {
            res.status(400).json({error: 'Event name is required'});
            return;
        }

        try {
            await this.participationModel.confirmEventSelection(username, eventName);
            res.json({isSelectComplete: true, message: 'Event selection confirmed'});
        } catch (error) {
            if (error instanceof UserAlreadySelectedEventError) {
                res.status(400).json({error: 'User already selected this event'});
                return;
            }
            console.error('Error confirming event selection:', error);
            res.status(500).json({error: 'Internal server error'});
        }
    }

    public async eventConfirmClicked(req: Request, res: Response): Promise<void> {
        try {
            const {username, eventName} = req.body;
            await this.participationModel.confirmEventSelection(username, eventName);
            res.json({message: 'Event selection confirmed'});
        } catch (error) {
            console.error('Error confirming event selection:', error);
            res.status(500).json({error: 'Internal server error'});
        }
    }

    public async removeEvent(req: Request, res: Response): Promise<void> {
        const {eventName} = req.body;
        const username = req.cookies.username;

        if (!username) {
            res.status(400).json({error: 'Username is required'});
            return;
        }

        if (!eventName) {
            res.status(400).json({error: 'Event name is required'});
            return;
        }

        try {
            await this.participationModel.removeUserEvent(username as string, eventName as string);
            res.json({message: 'Event selection confirmed'});
        } catch (error) {
            if (error instanceof UserNotHaveEventError) {
                res.status(400).json({error: 'User does not have this event'});
                return;
            }
            console.error('Error cancelling event:', error);
            res.status(500).json({error: 'Internal server error'});
        }
    }
}