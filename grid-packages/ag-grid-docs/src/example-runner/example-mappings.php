<?php
include dirname(__FILE__) . '/../config.php';

define('USE_LOCAL', AG_GRID_VERSION == '$$LOCAL$$');
$archiveMatch = '/archive\/\d+.\d+.\d+/';
$host = isset($_SERVER['HTTP_X_PROXY_HTTP_HOST']) ? $_SERVER['HTTP_X_PROXY_HTTP_HOST'] : $_SERVER['HTTP_HOST'];

if (preg_match($archiveMatch, $_SERVER['PHP_SELF'], $matches)) {
    $archiveSegment = $matches[0];
    $prefix = "//$host/$archiveSegment/dev";
    define('RUNNER_SOURCE_PREFIX', "/$archiveSegment");
    define('POLYMER_BASE_HREF_PREFIX', "//$host/$archiveSegment/");
} else {
    $prefix = "//$host/dev";
    define('RUNNER_SOURCE_PREFIX', "");
    define('POLYMER_BASE_HREF_PREFIX', "//$host/");
}

if (USE_LOCAL) {
    // plain js examples that require old skool umd bundles
    define('AG_GRID_CSS_PATHS', array(
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-grid.css",
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine-dark.css",
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css",
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css",
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css",
        "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-material.css"
    ));
    define('AG_GRID_SCRIPT_PATH', "$prefix/@ag-grid-community/all-modules/dist/ag-grid-community.js");
    define('AG_GRID_ENTERPRISE_SCRIPT_PATH', "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js");
    define('AG_CHARTS_SCRIPT_PATH', "$prefix/ag-charts-community/dist/ag-charts-community.js");

    $gridSystemJsMap = array(
        /* START OF GRID CSS DEV - DO NOT DELETE */
        "@ag-grid-community/all-modules/dist/styles/_ag-theme-alpine-common.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/_ag-theme-alpine-common.css",
        "@ag-grid-community/all-modules/dist/styles/ag-grid.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-grid.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine-dark.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine-dark.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark-mixin.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark-mixin.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-material-mixin.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-material-mixin.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-material.css" => "$prefix/@ag-grid-community/all-modules/dist/styles/ag-theme-material.css",
/* END OF GRID CSS DEV - DO NOT DELETE */
        /* START OF GRID MODULES DEV - DO NOT DELETE */
        "@ag-grid-community/all-modules" => "$prefix/@ag-grid-community/all-modules",
        "@ag-grid-community/client-side-row-model" => "$prefix/@ag-grid-community/client-side-row-model",
        "@ag-grid-community/core" => "$prefix/@ag-grid-community/core",
        "@ag-grid-community/csv-export" => "$prefix/@ag-grid-community/csv-export",
        "@ag-grid-community/infinite-row-model" => "$prefix/@ag-grid-community/infinite-row-model",
        "ag-charts-community" => "$prefix/ag-charts-community",
        "@ag-grid-enterprise/all-modules" => "$prefix/@ag-grid-enterprise/all-modules",
        "@ag-grid-enterprise/charts" => "$prefix/@ag-grid-enterprise/charts",
        "@ag-grid-enterprise/clipboard" => "$prefix/@ag-grid-enterprise/clipboard",
        "@ag-grid-enterprise/column-tool-panel" => "$prefix/@ag-grid-enterprise/column-tool-panel",
        "@ag-grid-enterprise/core" => "$prefix/@ag-grid-enterprise/core",
        "@ag-grid-enterprise/excel-export" => "$prefix/@ag-grid-enterprise/excel-export",
        "@ag-grid-enterprise/filter-tool-panel" => "$prefix/@ag-grid-enterprise/filter-tool-panel",
        "@ag-grid-enterprise/master-detail" => "$prefix/@ag-grid-enterprise/master-detail",
        "@ag-grid-enterprise/menu" => "$prefix/@ag-grid-enterprise/menu",
        "@ag-grid-enterprise/range-selection" => "$prefix/@ag-grid-enterprise/range-selection",
        "@ag-grid-enterprise/rich-select" => "$prefix/@ag-grid-enterprise/rich-select",
        "@ag-grid-enterprise/row-grouping" => "$prefix/@ag-grid-enterprise/row-grouping",
        "@ag-grid-enterprise/server-side-row-model" => "$prefix/@ag-grid-enterprise/server-side-row-model",
        "@ag-grid-enterprise/set-filter" => "$prefix/@ag-grid-enterprise/set-filter",
        "@ag-grid-enterprise/side-bar" => "$prefix/@ag-grid-enterprise/side-bar",
        "@ag-grid-enterprise/status-bar" => "$prefix/@ag-grid-enterprise/status-bar",
        "@ag-grid-enterprise/viewport-row-model" => "$prefix/@ag-grid-enterprise/viewport-row-model",
/* END OF GRID MODULES DEV - DO NOT DELETE */
        "@ag-grid-community/react" => "$prefix/@ag-grid-community/react",
        "@ag-grid-community/angular" => "$prefix/@ag-grid-community/angular",
        "@ag-grid-community/vue" => "$prefix/@ag-grid-community/vue",
        "ag-charts-react" => "$prefix/ag-charts-react",
        "ag-charts-angular" => "$prefix/ag-charts-angular",
        "ag-charts-vue" => "$prefix/ag-charts-vue"
    );

    $gridSystemJsCommunityPaths = array(
        /* START OF GRID COMMUNITY MODULES PATHS DEV - DO NOT DELETE */
        "@ag-grid-community/all-modules" => "$prefix/@ag-grid-community/all-modules/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/client-side-row-model" => "$prefix/@ag-grid-community/all-modules/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/core" => "$prefix/@ag-grid-community/all-modules/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/csv-export" => "$prefix/@ag-grid-community/all-modules/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/infinite-row-model" => "$prefix/@ag-grid-community/all-modules/dist/ag-grid-community.cjs.js",
/* END OF GRID COMMUNITY MODULES PATHS DEV - DO NOT DELETE */
        "ag-charts-community" => "$prefix/ag-charts-community/dist/ag-charts-community.cjs.js",
    );
    $gridSystemJsEnterprisePaths = array(
        /* START OF GRID ENTERPRISE MODULES PATHS DEV - DO NOT DELETE */
        "@ag-grid-community/all-modules" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/client-side-row-model" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/core" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/csv-export" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/infinite-row-model" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/all-modules" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/charts" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/clipboard" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/column-tool-panel" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/core" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/excel-export" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/filter-tool-panel" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/master-detail" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/menu" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/range-selection" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/rich-select" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/row-grouping" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/server-side-row-model" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/set-filter" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/side-bar" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/status-bar" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/viewport-row-model" => "$prefix/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js",
/* END OF GRID ENTERPRISE MODULES PATHS DEV - DO NOT DELETE */
        "ag-charts-community" => "$prefix/ag-charts-community/dist/ag-charts-community.cjs.js"
    );

    $chartSystemJsMap = array(
        /* START OF CHART MODULES DEV - DO NOT DELETE */
        "ag-charts-community" => "$prefix/ag-charts-community",
        /* END OF CHART MODULES DEV - DO NOT DELETE */
        "ag-charts-react" => "$prefix/ag-charts-react",
        "ag-charts-angular" => "$prefix/ag-charts-angular",
        "ag-charts-vue" => "$prefix/ag-charts-vue"
    );

    $chartSystemJsCommunityPaths = array(
        "ag-charts-community" => "$prefix/ag-charts-community/dist/ag-charts-community.cjs.js",
    );
} else {
    // production mode, return from unpkg
    define('AG_GRID_SCRIPT_PATH', "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/ag-grid-community.min.js");
    define('AG_GRID_ENTERPRISE_SCRIPT_PATH', "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.min.js");
    define('AG_CHARTS_SCRIPT_PATH', "https://unpkg.com/ag-charts-community@" . AG_CHARTS_VERSION . "/dist/ag-charts-community.min.js");

    $gridSystemJsMap = array(
        "@ag-grid-community/core/dist/styles/ag-grid.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-grid.css",
        "@ag-grid-community/core/dist/styles/ag-theme-balham.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-balham.css",
        /* START OF GRID CSS PROD - DO NOT DELETE */
        "@ag-grid-community/all-modules/dist/styles/_ag-theme-alpine-common.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/_ag-theme-alpine-common.css",
        "@ag-grid-community/all-modules/dist/styles/ag-grid.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-grid.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine-dark.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-alpine-dark.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-alpine.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark-mixin.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-balham-dark-mixin.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-balham-dark.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-balham.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-material-mixin.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-material-mixin.css",
        "@ag-grid-community/all-modules/dist/styles/ag-theme-material.css" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/styles/ag-theme-material.css",
/* END OF GRID CSS PROD - DO NOT DELETE */
        "@ag-grid-community/react" => "npm:@ag-grid-community/react@" . AG_GRID_REACT_VERSION . "/",
        "@ag-grid-community/angular" => "npm:@ag-grid-community/angular@" . AG_GRID_ANGULAR_VERSION . "/",
        "@ag-grid-community/vue" => "npm:@ag-grid-community/vue@" . AG_GRID_VUE_VERSION . "/",
        "ag-charts-community" => "https://unpkg.com/ag-charts-community@" . AG_CHARTS_VERSION . "/dist/ag-charts-community.cjs.js",
    );

    $gridSystemJsCommunityPaths = array(
        /* START OF GRID COMMUNITY MODULES PATHS PROD - DO NOT DELETE */
        "@ag-grid-community/all-modules" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/client-side-row-model" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/core" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/csv-export" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/ag-grid-community.cjs.js",
        "@ag-grid-community/infinite-row-model" => "https://unpkg.com/@ag-grid-community/all-modules@" . AG_GRID_VERSION . "/dist/ag-grid-community.cjs.js",
/* END OF GRID COMMUNITY MODULES PATHS PROD - DO NOT DELETE */
    );
    $gridSystemJsEnterprisePaths = array(
        /* START OF GRID ENTERPRISE MODULES PATHS PROD - DO NOT DELETE */
        "@ag-grid-community/all-modules" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/client-side-row-model" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/core" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/csv-export" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-community/infinite-row-model" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/all-modules" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/charts" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/clipboard" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/column-tool-panel" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/core" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/excel-export" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/filter-tool-panel" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/master-detail" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/menu" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/range-selection" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/rich-select" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/row-grouping" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/server-side-row-model" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/set-filter" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/side-bar" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/status-bar" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
        "@ag-grid-enterprise/viewport-row-model" => "https://unpkg.com/@ag-grid-enterprise/all-modules@" . AG_GRID_ENTERPRISE_VERSION . "/dist/ag-grid-enterprise.cjs.js",
/* END OF GRID ENTERPRISE MODULES PATHS PROD - DO NOT DELETE */
    );

    $chartSystemJsMap = array(
        "ag-charts-react" => "npm:ag-charts-react@" . AG_CHARTS_REACT_VERSION . "/",
        "ag-charts-angular" => "npm:ag-charts-angular@" . AG_CHARTS_ANGULAR_VERSION . "/",
        "ag-charts-vue" => "npm:ag-charts-vue@" . AG_CHARTS_VUE_VERSION . "/",
        "ag-charts-community" => "https://unpkg.com/ag-charts-community@" . AG_CHARTS_VERSION . "/dist/ag-charts-community.cjs.js",
    );

    $chartSystemJsCommunityPaths = array();
}
?>
