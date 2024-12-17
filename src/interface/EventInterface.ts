export interface EventDetail {
    id: number;
    "人數需求上限(人)": number;
    "工作地點(校區-地點)": string;
    "工作時數(時)": number;
    "支援時間(日期-星期-24小時制)": string;
    "服務總時數": number;
    "活動名稱-內容": string;
    "目前餘額": number;
    "備註說明"?: string;
}

export interface EventCategory {
    "公共藝術-藝術典藏": EventCategory;
    "展演組-表演藝術": EventCategory;
    "展演組-視覺展覽": EventCategory;
    "教育組-宣傳推廣": EventCategory;
    "教育組-教育講座": EventCategory;
}

export interface Events {
    [eventName: string]: EventDetail;
}

export interface EventStrcut{
    [category: string]: Events;
}