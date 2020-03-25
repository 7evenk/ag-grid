import { Grid, Autowired, GridOptions } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import { Component, PostConstruct, _ } from '@ag-grid-community/core';
import { DateTimeList } from './dateTimeList/dateTimeList';

export class DevHarness extends Component {
    private static TEMPLATE = `<div class="ag-date-time-list"></div>`;

    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    constructor() {
        super(DevHarness.TEMPLATE);
    }
    
    @PostConstruct
    private init(): void {
        this.eGridDiv.appendChild(this.getGui());
        const list = new DateTimeList();
        this.getContext().wireBean(list);
        this.getGui().appendChild(list.getGui());
    }
}

const gridOptions: GridOptions = {
}

document.addEventListener('DOMContentLoaded', function() {
    const eDemoDiv = document.createElement('div');
    document.body.appendChild(eDemoDiv);
    eDemoDiv.id = 'component-demo';
    document.body.parentElement.style.height = '100%';
    document.body.style.height = '100%';
    eDemoDiv.style.height = '100%';
    new Grid(
        eDemoDiv,
        gridOptions,
        {
            rootComponent: DevHarness,
            modules: [
                ClientSideRowModelModule
            ]
        }
    );
});
