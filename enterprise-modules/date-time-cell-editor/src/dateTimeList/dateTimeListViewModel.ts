export interface IDateTimeListViewModel {
    readonly minPage: number;
    readonly maxPage: number;
    getPage(number: number): Page;
}

interface Page {
    title: string;
    Next up: add rest of model for a calendar
    entries: Date[][];
}

export class DateTimeListViewModel implements IDateTimeListViewModel {
    
    public minPage: number;
    public maxPage: number;
    public currentPage: number;
    

    constructor() {
        this.minPage = 
    }
}