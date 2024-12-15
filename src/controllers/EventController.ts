import { Request, Response } from 'express';
import EventModel from '../models/EventModel';

class EventController {
    private eventModel: EventModel;

    constructor() {
        this.eventModel = new EventModel();
        this.displayEvents = this.displayEvents.bind(this);
        this.renderMainPage = this.renderMainPage.bind(this);
    }

    public async displayEvents(req: Request, res: Response): Promise<void> {
        try {
            const eventData = await this.eventModel.getEventSheetData();
            res.json(eventData);
        } catch (error) {
            console.error('Error fetching event data:', error);
            res.status(500).render('error', { message: 'Internal server error.' });
        }
    }

    public async renderMainPage(req: Request, res: Response): Promise<void> {
        try {
            const username = req.cookies.username || 'Guest';
            const studentid = req.cookies.studentid || '0000';
            res.render('main', {username, studentid} );
        } catch (error) {
            console.error('Error rendering main page:', error);
            res.status(500).render('error', { message: 'Internal server error.' });
        }
    }
}

export default EventController;