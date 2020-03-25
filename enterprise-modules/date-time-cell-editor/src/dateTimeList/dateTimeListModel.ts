export interface IDateTimeListModel {
    readonly minPage: number;
    readonly maxPage: number;
    getPage(number: number): Page;
    formatEntryLabel(entry: Date): string;
}

interface Page {
    title: string;
    columns: Column[];
    entries: Date[];
}

interface Column {
    label: string;
}

interface EntryFormatter {
    formatToParts: Intl.DateTimeFormat["formatToParts"]
}

interface DateTimeListModelOptions {
    baseDate: ValueOrThunk<Date>;
    entryFormat: ValueOrThunk<EntryFormatter>;
    titleFormat: (page: number, entries: Date[]) => string;
}

type ValueOrThunk<T> = T | (() => T);

const getValue = <T>(source: ValueOrThunk<T>): T => {
    if (typeof source !== 'function') {
        return source;
    }
    return (source as any)();
}

const defaultDateTimeListModelOptions: DateTimeListModelOptions = {
    baseDate: () => new Date(),
    entryFormat: () => new Intl.DateTimeFormat(),
    titleFormat: (_, entries) => {
        const format = new Intl.DateTimeFormat('default', {
            month: '',
        });
        return format.format(entries[0]);
    }
}


export class DateTimeListModel implements IDateTimeListViewModel {
    public minPage = -10;
    public maxPage = 10;

    private baseDate: Date;
    private entryFormat: Intl.DateTimeFormat;
    private titleFormat: PageTitleFormatter;

    constructor(options: Partial<DateTimeListModelOptions> = {}) {
        this.baseDate = options.baseDate || new Date();
        this.entryFormat = options.entryFormat || new Intl.DateTimeFormat();
        this.titleFormat = options.titleFormat || defaultPageTitleFormatter;
    }

    public getPage(number: number): Page {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const entries: 
        const page: Page = {
            title: this.titleFormat(number, entries),
        };
    }
}
