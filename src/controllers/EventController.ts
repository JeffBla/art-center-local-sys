import {Request, Response} from 'express';
import EventModel from '../models/EventModel';
import {UserAlreadySelectedEventError, UserNotHaveEventError} from "../error/Errors";

class EventController {
    private eventModel: EventModel;

    constructor() {
        this.eventModel = new EventModel();
        this.displayEvents = this.displayEvents.bind(this);
        this.renderMainPage = this.renderMainPage.bind(this);
        this.renderSelectPage = this.renderSelectPage.bind(this);
        this.selectEvent = this.selectEvent.bind(this);
        this.getEventInfo = this.getEventInfo.bind(this);
        this.eventConfirmClicked = this.eventConfirmClicked.bind(this);
        this.getUnavailableEvents = this.getUnavailableEvents.bind(this);
        this.removeEvent = this.removeEvent.bind(this);
    }

    public async displayEvents(req: Request, res: Response): Promise<void> {
        try {
            const eventData = await this.eventModel.getEventSheetData();
            res.json(eventData);
        } catch (error) {
            console.error('Error fetching event data:', error);
            res.status(500).render('error', {message: 'Internal server error.'});
        }
    }

    public renderMainPage(req: Request, res: Response) {
        try {
            const username = req.cookies.username || 'Guest';
            const studentid = req.cookies.studentid || '0000';
            res.render('main', {username, studentid});
        } catch (error) {
            console.error('Error rendering main page:', error);
            res.status(500).render('error', {message: 'Internal server error.'});
        }
    }

    public renderSelectPage(req: Request, res: Response) {
        try {
            const username = req.cookies.username || 'Guest';
            res.render('select', {username});
        } catch (error) {
            console.error('Error rendering main page:', error);
            res.status(500).render('error', {message: 'Internal server error.'});
        }
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
            await this.eventModel.confirmEventSelection(username, eventName);
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

    public async getEventInfo(req: Request, res: Response): Promise<void> {
        try {
            const eventName = req.body['eventname'];
            const eventInfo = await this.eventModel.getEventInfo(eventName);
            if (!eventInfo) {
                res.status(404).json({error: 'Event not found'});
                return;
            }
            res.json(eventInfo);
        } catch (error) {
            console.error('Error fetching event info:', error);
            res.status(500).json({error: 'Internal server error'});
        }
    }

    public async eventConfirmClicked(req: Request, res: Response): Promise<void> {
        try {
            const {username, eventName} = req.body;
            await this.eventModel.confirmEventSelection(username, eventName);
            res.json({message: 'Event selection confirmed'});
        } catch (error) {
            console.error('Error confirming event selection:', error);
            res.status(500).json({error: 'Internal server error'});
        }
    }

    public async getUnavailableEvents(req: Request, res: Response): Promise<void> {
        try {
            const disabledOptions = await this.eventModel.getUnavailableEvents();
            res.json(disabledOptions);
        } catch (error) {
            console.error('Error fetching disabled options:', error);
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
            await this.eventModel.removeUserEvent(username as string, eventName as string);

            res.json({message: 'Event selection confirmed'});
        } catch (error) {
            if(error instanceof UserNotHaveEventError) {
                res.status(400).json({error: 'User does not have this event'});
                return;
            }
            console.error('Error cancelling event:', error);
            res.status(500).json({error: 'Internal server error'});
        }
    }
}

export default EventController;