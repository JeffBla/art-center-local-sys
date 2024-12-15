import firebaseService from '../services/FirebaseService';

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
}

export default EventModel;