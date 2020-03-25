export interface IDateTimeListViewModel {
    readonly minPage: number;
    readonly maxPage: number;
    getPage(number: number): Page;
}

interface Page {
    title: string;
    entries: Date[][];
}

interface Entry {
    label: string;
    Value: Date;
}

export class DateTimeListViewModel implements IDateTimeListViewModel {
    
    public minPage: number;
    public maxPage: number;
    public currentPage: number;
    

    constructor() {
        this.minPage = -10;
        this.maxPage = 10;
    }
}