import {
    Component,
    PostConstruct,
    _
} from "@ag-grid-community/core";
import { DateTimeListViewModel, IDateTimeListViewModel } from "./dateTimeListViewModel";


export class DateTimeList extends Component {

    private static TEMPLATE = `<div class="ag-date-time-list"></div>`;

    private model: IDateTimeListViewModel = new DateTimeListViewModel();

    constructor() {
        super(DateTimeList.TEMPLATE);
    }

    @PostConstruct
    private init(): void {
        
    }
}
