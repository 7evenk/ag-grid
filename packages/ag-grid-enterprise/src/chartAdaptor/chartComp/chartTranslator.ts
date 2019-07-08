import {Autowired, Bean, GridOptionsWrapper} from "ag-grid-community";

@Bean("chartTranslator")
export class ChartTranslator {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private static DEFAULT_TRANSLATIONS: {[name: string]: string} = {
        settings: 'Settings',
        data: 'Data',
        format: 'Format',
        categories: 'Categories',
        series: 'Series',
        axis: 'Axis',
        color: 'Color',
        thickness: 'Thickness',
        xRotation: 'X Rotation',
        yRotation: 'Y Rotation',
        ticks: 'Ticks',
        width: 'Width',
        length: 'Length',
        padding: 'Padding',
        chart: 'Chart',
        title: 'Title',
        font: 'Font',
        top: 'Top',
        right: 'Right',
        bottom: 'Bottom',
        left: 'Left',
        labels: 'Labels',
        size: 'Size',
        legend: 'Legend',
        position: 'Position',
        markerSize: 'Marker Size',
        markerStroke: 'Marker Stroke',
        markerPadding: 'Marker Padding',
        itemPaddingX: 'Item Padding X',
        itemPaddingY: 'Item Padding Y',
        strokeWidth: 'Stroke Width',
        offset: 'Offset',
        tooltips: 'Tooltips',
        offsets: 'Offsets',
        callout: 'Callout',
        markers: 'Markers',
        shadow: 'Shadow',
        blur: 'Blur',
        xOffset: 'X Offset',
        yOffset: 'Y Offset',
        lineWidth: 'Line Width',
        normal: 'Normal',
        bold: 'Bold',
        italic: 'Italic',
        boldItalic: 'Bold Italic'
    };

    public translate(toTranslate: string): string {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        let defaultTranslation = ChartTranslator.DEFAULT_TRANSLATIONS[toTranslate];
        return translate(toTranslate, defaultTranslation);
    }
}