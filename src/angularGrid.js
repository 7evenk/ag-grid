
//todo: full row group doesn't work when columns are pinned
//todo: compile into angular
//todo: moving & hiding columns
//todo: grouping

define([
    "angular",
    "text!./angularGrid.html",
    "./utils",
    "./filterManager",
    "./rowModel",
    "./constants",
    "css!./css/core.css",
    "css!./css/theme-dark.css",
    "css!./css/theme-fresh.css"
], function(angular, template, utils, FilterManager, RowModel, constants) {

    var module = angular.module("angularGrid", []);

    var MIN_COL_WIDTH = 10;
    var DEFAULT_ROW_HEIGHT = 30;

    var SVG_NS = "http://www.w3.org/2000/svg";

    var SORT_STYLE_SHOW = "display:inline;";
    var SORT_STYLE_HIDE = "display:none;";

    var ROW_BUFFER_SIZE = 5;

    module.directive("angularGrid", function () {
        return {
            restrict: "A",
            template: template,
            controller: ["$scope", "$element", "$compile", Grid],
            scope: {
                angularGrid: "="
            }
        };
    });

    function Grid($scope, $element, $compile) {

        var _this = this;
        $scope.grid = this;
        this.$scope = $scope;
        this.$compile = $compile;
        this.gridOptions = $scope.angularGrid;
        this.quickFilter = null;

        $scope.$watch("angularGrid.quickFilterText", function (newFilter) {
            _this.onQuickFilterChanged(newFilter);
        });
        $scope.$watch("angularGrid.pinnedColumnCount", function () {
            _this.onNewCols();
        });

        this.gridOptions.selectedRows = [];

        //done once
        //for virtualisation, maps keep track of which elements are attached to the dom
        this.rowsInBodyContainer = {};
        this.rowsInPinnedContainer = {};
        this.childScopesForRows = {};

        this.addApi();
        this.findAllElements($element);
        this.gridOptions.rowHeight = (this.gridOptions.rowHeight ? this.gridOptions.rowHeight : DEFAULT_ROW_HEIGHT); //default row height to 30
        this.filterManager = new FilterManager(this);

        this.rowModel = new RowModel(this.gridOptions, this, this.filterManager);

        this.addScrollListener();

        this.setBodySize(); //setting sizes of body (containing viewports), doesn't change container sizes

        //done when cols change
        this.setupColumns();

        //done when rows change
        this.setupRows(constants.STEP_EVERYTHING);

        //flag to mark when the directive is destroyed
        this.finished = false;
        var _this = this;
        $scope.$on("$destroy", function () {
            _this.finished = true;
        });
    }

    Grid.prototype.getRowData = function () {
        return this.gridOptions.rowData;
    };

    Grid.prototype.getPopupParent = function () {
        return this.eRoot;
    };

    Grid.prototype.getQuickFilter = function () {
        return this.quickFilter;
    };

    Grid.prototype.onQuickFilterChanged = function (newFilter) {
        if (newFilter === undefined || newFilter === "") {
            newFilter = null;
        }
        if (this.quickFilter !== newFilter) {
            //want 'null' to mean to filter, so remove undefined and empty string
            if (newFilter===undefined || newFilter==="") {
                newFilter = null;
            }
            if (newFilter !== null) {
                newFilter = newFilter.toUpperCase();
            }
            this.quickFilter = newFilter;
            this.onFilterChanged();
        }
    };

    Grid.prototype.onFilterChanged = function () {
        this.setupRows(constants.STEP_FILTER);
        this.updateFilterIcons();
    };

    Grid.prototype.onRowClicked = function (event, rowIndex) {
        var row = this.gridOptions.rowDataAfterGroupAndFilterAndSortAndMap[rowIndex];

        if (this.gridOptions.rowClicked) {
            this.gridOptions.rowClicked(row, event);
        }

        //if no selection method enabled, do nothing
        if (this.gridOptions.rowSelection !== "single" && this.gridOptions.rowSelection !== "multiple") {
            return;
        }

        //if not in array, then it's a new selection, thus selected = true
        var selected = this.gridOptions.selectedRows.indexOf(row) < 0;

        if (selected) {
            if (this.gridOptions.rowSelected && typeof this.gridOptions.rowSelected === "function") {
                this.gridOptions.rowSelected(row);
            }
            //if single selection, clear any previous
            if (selected && this.gridOptions.rowSelection === "single") {
                this.gridOptions.selectedRows.length = 0;
                var eRowsWithSelectedClass = this.eBody.querySelectorAll(".ag-row-selected");
                for (var i = 0; i < eRowsWithSelectedClass.length; i++) {
                    utils.removeCssClass(eRowsWithSelectedClass[i], "ag-row-selected");
                }
            }
            this.gridOptions.selectedRows.push(row);
        } else {
            utils.removeFromArray(this.gridOptions.selectedRows, row);
        }

        //update css class on selected row
        var eRows = this.eBody.querySelectorAll("[row='" + rowIndex + "']");
        for (var i = 0; i < eRows.length; i++) {
            if (selected) {
                utils.addCssClass(eRows[i], "ag-row-selected")
            } else {
                utils.removeCssClass(eRows[i], "ag-row-selected")
            }
        }

        if (this.gridOptions.selectionChanged && typeof this.gridOptions.selectionChanged === "function") {
            this.gridOptions.selectionChanged();
            this.$scope.$apply();
        }

    };

    Grid.prototype.setupColumns = function () {
        this.ensureEachColHasSize();
        this.showPinnedColContainersIfNeeded();
        this.insertHeader();
        this.setPinnedColContainerWidth();
        this.setBodyContainerWidth();
        this.updateFilterIcons();
    };

    Grid.prototype.setBodyContainerWidth = function () {
        var mainRowWidth = this.getTotalUnpinnedColWidth() + "px";
        this.eBodyContainer.style.width = mainRowWidth;
    };

    Grid.prototype.setupRows = function (step) {

        this.rowModel.setupRows(step);

        var rowCount = this.gridOptions.rowDataAfterGroupAndFilterAndSortAndMap.length;
        var containerHeight = this.gridOptions.rowHeight * rowCount;
        this.eBodyContainer.style.height = containerHeight + "px";
        this.ePinnedColsContainer.style.height = containerHeight + "px";

        this.refreshAllVirtualRows();
    };

    Grid.prototype.refreshAllVirtualRows = function () {
        //remove all current virtual rows, as they have old data
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);
        this.removeVirtualRows(rowsToRemove);

        //add in new rows
        this.drawVirtualRows();
    };

    Grid.prototype.addApi = function () {
        var _this = this;
        var api = {
            onNewRows: function () {
                _this.gridOptions.selectedRows.length = 0;
                _this.filterManager.clearAllFilters();
                _this.setupRows(constants.STEP_EVERYTHING);
                _this.updateFilterIcons();
            },
            onNewCols: function () {
                _this.onNewCols();
            },
            expandAll: function() {
                _this.expandOrCollapseAll(true, null);
                _this.setupRows(constants.STEP_MAP);
            },
            collapseAll: function() {
                _this.expandOrCollapseAll(false, null);
                _this.setupRows(constants.STEP_MAP);
            }
        };
        this.gridOptions.api = api;
    };

    Grid.prototype.expandOrCollapseAll = function(expand, list) {
        //if first call in recursion, we set list to parent list
        if (list==null) { list = this.gridOptions.rowDataAfterGroup; }

        if (!list) { return; }

        var _this = this;
        list.forEach(function(item) {
            var itemIsAGroup = item._angularGrid_group; //_angularGrid_group is set to true on groups
            if (itemIsAGroup) {
                item.expanded = expand;
                _this.expandOrCollapseAll(expand, item.children);
            }
        });
    };

    Grid.prototype.onNewCols = function () {
        this.setupColumns();
        this.setupRows(constants.STEP_EVERYTHING);
    };

    Grid.prototype.findAllElements = function ($element) {
        var eGrid = $element[0];
        this.eRoot = eGrid.querySelector(".ag-root");
        this.eBody = eGrid.querySelector(".ag-body");
        this.eHeaderContainer = eGrid.querySelector(".ag-header-container");
        this.eBodyContainer = eGrid.querySelector(".ag-body-container");
        this.eBodyViewport = eGrid.querySelector(".ag-body-viewport");
        this.ePinnedHeader = eGrid.querySelector(".ag-pinned-header");
        this.ePinnedColsContainer = eGrid.querySelector(".ag-pinned-cols-container");
        this.ePinnedColsViewport = eGrid.querySelector(".ag-pinned-cols-viewport");
        //this.eBodyViewportWrapper = eGrid.querySelector(".ag-body-viewport-wrapper");
        this.eHeader = eGrid.querySelector(".ag-header");
    };

    Grid.prototype.showPinnedColContainersIfNeeded = function () {
        var showingPinnedCols = this.getPinnedColCount() > 0;
        //some browsers had layout issues with the blank divs, so if blank,
        //we don't display them
        if (showingPinnedCols) {
            this.ePinnedHeader.style.display = 'inline-block';
            this.ePinnedColsViewport.style.display = 'inline';
        } else {
            this.ePinnedHeader.style.display = 'none';
            this.ePinnedColsViewport.style.display = 'none';
        }
    };

    Grid.prototype.setPinnedColContainerWidth = function () {
        var pinnedColWidth = this.getTotalPinnedColWidth();
        this.ePinnedColsContainer.style.width = pinnedColWidth + "px";
    };

    Grid.prototype.ensureRowsRendered = function (start, finish) {
        var pinnedColumnCount = this.getPinnedColCount();
        var mainRowWidth = this.getTotalUnpinnedColWidth();
        var _this = this;

        //at the end, this array will contain the items we need to remove
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);

        //add in new rows
        for (var rowIndex = start; rowIndex <= finish; rowIndex++) {
            //see if item already there, and if yes, take it out of the 'to remove' array
            if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                continue;
            }
            //check this row actually exists (in case overflow buffer window exceeds real data)
            var data = this.gridOptions.rowDataAfterGroupAndFilterAndSortAndMap[rowIndex];
            if (data) {
                _this.insertRow(data, rowIndex, mainRowWidth, pinnedColumnCount);
            }
        }

        //at this point, everything in our 'rowsToRemove' . . .
        this.removeVirtualRows(rowsToRemove);

        //if we are doing angular compiling, then do it here if not in digest
        //this.$scope.$$phase || this.$scope.$apply();
        //if(this.gridOptions.angularCompile && !this.$scope.$$phase) {
        //    this.$scope.$apply();
        //}
    };

    //takes array of row id's
    Grid.prototype.removeVirtualRows = function (rowsToRemove) {
        var _this = this;
        rowsToRemove.forEach(function (indexToRemove) {
            var pinnedRowToRemove = _this.rowsInPinnedContainer[indexToRemove];
            _this.ePinnedColsContainer.removeChild(pinnedRowToRemove);
            delete _this.rowsInPinnedContainer[indexToRemove];

            var bodyRowToRemove = _this.rowsInBodyContainer[indexToRemove];
            _this.eBodyContainer.removeChild(bodyRowToRemove);
            delete _this.rowsInBodyContainer[indexToRemove];

            var childScopeToDelete = _this.childScopesForRows[indexToRemove];
            if (childScopeToDelete) {
                childScopeToDelete.$destroy();
                delete _this.childScopesForRows[indexToRemove];
            }
        });
    };

    Grid.prototype.ensureEachColHasSize = function () {
        this.gridOptions.columnDefs.forEach(function (colDef) {
            if (!colDef.width || colDef.width < 10) {
                colDef.actualWidth = MIN_COL_WIDTH;
            } else {
                colDef.actualWidth = colDef.width;
            }
        });
    };

    //see if a grey box is needed at the bottom of the pinned col
    Grid.prototype.setPinnedColHeight = function () {
        //var bodyHeight = utils.pixelStringToNumber(this.eBody.style.height);
        var scrollShowing = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
        var bodyHeight = this.eBodyViewport.offsetHeight;
        if (scrollShowing) {
            this.ePinnedColsViewport.style.height = (bodyHeight - 20) + "px";
        } else {
            this.ePinnedColsViewport.style.height = bodyHeight + "px";
        }
    };

    Grid.prototype.setBodySize = function() {
        var _this = this;

        var bodyHeight = this.eBodyViewport.offsetHeight;

        if (this.bodyHeightLastTime != bodyHeight) {
            this.bodyHeightLastTime = bodyHeight;
            this.setPinnedColHeight();

            //only draw virtual rows if done sort & filter - this
            //means we don't draw rows if table is not yet initialised
            if (this.gridOptions.rowDataAfterGroupAndFilterAndSortAndMap) {
                this.drawVirtualRows();
            }
        }

        if (!this.finished) {
            setTimeout(function() {
                _this.setBodySize();
            }, 200);
        }
    };

    Grid.prototype.getTotalPinnedColWidth = function() {
        var pinnedColCount = this.getPinnedColCount();
        var widthSoFar = 0;
        var colCount = pinnedColCount;
        if (this.gridOptions.columnDefs.length < pinnedColCount) {
            colCount = this.gridOptions.columnDefs.length;
        }
        for (var colIndex = 0; colIndex<colCount; colIndex++) {
            widthSoFar += this.gridOptions.columnDefs[colIndex].actualWidth;
        }
        return widthSoFar;
    };

    Grid.prototype.getTotalUnpinnedColWidth = function() {
        var widthSoFar = 0;
        var pinnedColCount = this.getPinnedColCount();

        this.gridOptions.columnDefs.forEach(function(colDef, index) {
            if (index>=pinnedColCount) {
                widthSoFar += colDef.actualWidth;
            }
        });

        return widthSoFar;
    };

    Grid.prototype.getPinnedColCount = function() {
        if (this.gridOptions.pinnedColumnCount) {
            //in case user puts in a string, cast to number
            return Number(this.gridOptions.pinnedColumnCount);
        } else {
            return 0;
        }
    };

    Grid.prototype.createHeaderCell = function(colDef, colIndex, colPinned) {
        var headerCell = document.createElement("div");
        var _this = this;

        headerCell.className = "ag-header-cell";

        if (this.gridOptions.enableColResize) {
            var headerCellResize = document.createElement("div");
            headerCellResize.className = "ag-header-cell-resize";
            headerCell.appendChild(headerCellResize);
            this.addColResizeHandling(headerCellResize, headerCell, colDef, colIndex, colPinned);
        }

        //filter button
        if (this.gridOptions.enableFilter) {
            var eMenuButton = createMenuSvg();
            eMenuButton.setAttribute("class", "ag-header-cell-menu-button");
            eMenuButton.onclick = function () {
                _this.filterManager.showFilter(colDef, this);
            };
            headerCell.appendChild(eMenuButton);
        }

        //label div
        var headerCellLabel = document.createElement("div");
        headerCellLabel.className = "ag-header-cell-label";
        //add in sort icon
        if (this.gridOptions.enableSorting) {
            var headerSortIcon = createSortArrowSvg(colIndex);
            headerCellLabel.appendChild(headerSortIcon);
            this.addSortHandling(headerCellLabel, colDef);
        }

        //add in filter icon
        var filterIcon = createFilterSvg();
        this.headerFilterIcons[colDef.field] = filterIcon;
        headerCellLabel.appendChild(filterIcon);

        //add in text label
        var eInnerText = document.createElement("span");
        eInnerText.innerHTML = colDef.displayName;
        headerCellLabel.appendChild(eInnerText);

        headerCell.appendChild(headerCellLabel);
        headerCell.style.width = this.formatWidth(colDef.actualWidth);

        return headerCell;
    };

    Grid.prototype.updateFilterIcons = function() {
        var _this = this;
        this.gridOptions.columnDefs.forEach(function(colDef) {
            var filterPresent = _this.filterManager.isFilterPresentForCol(colDef.field);
            var displayStyle = filterPresent ? "inline" : "none";
            _this.headerFilterIcons[colDef.field].style.display = displayStyle;
        });
    };

    Grid.prototype.addSortHandling = function(headerCellLabel, colDef) {
        var _this = this;
        headerCellLabel.addEventListener("click", function() {

            //update sort on current col
            if (colDef.sort === constants.ASC) {
                colDef.sort = constants.DESC;
            } else if (colDef.sort === constants.DESC) {
                colDef.sort = null
            } else {
                colDef.sort = constants.ASC;
            }

            //clear sort on all columns except this one, and update the icons
            _this.gridOptions.columnDefs.forEach(function(colToClear, colIndex) {
                if (colToClear!==colDef) {
                    colToClear.sort = null;
                }

                //update visibility of icons
                var sortAscending = colToClear.sort===constants.ASC;
                var sortDescending = colToClear.sort===constants.DESC;
                var sortAny = sortAscending || sortDescending;

                var eSortAscending = _this.eHeader.querySelector(".ag-header-cell-sort-asc-" + colIndex);
                eSortAscending.setAttribute("style", sortAscending ? SORT_STYLE_SHOW : SORT_STYLE_HIDE);

                var eSortDescending = _this.eHeader.querySelector(".ag-header-cell-sort-desc-" + colIndex);
                eSortDescending.setAttribute("style", sortDescending ? SORT_STYLE_SHOW : SORT_STYLE_HIDE);

                var eParentSvg = eSortAscending.parentNode;
                eParentSvg.setAttribute("display", sortAny ? "inline" : "none");
            });

            _this.setupRows(constants.STEP_SORT);
        });
    };

    Grid.prototype.addColResizeHandling = function(headerCellResize, headerCell, colDef, colIndex, colPinned) {
        var _this = this;
        headerCellResize.onmousedown = function(downEvent) {
            _this.eRoot.style.cursor = "col-resize";
            _this.dragStartX = downEvent.clientX;
            _this.colWidthStart = colDef.actualWidth;

            _this.eRoot.onmousemove = function(moveEvent) {
                var newX = moveEvent.clientX;
                var change = newX - _this.dragStartX;
                var newWidth = _this.colWidthStart + change;
                if (newWidth < MIN_COL_WIDTH) {
                    newWidth = MIN_COL_WIDTH;
                }
                var newWidthPx = newWidth + "px";
                var selectorForAllColsInCell = ".cell-col-"+colIndex;
                var cellsForThisCol = _this.eRoot.querySelectorAll(selectorForAllColsInCell);
                for (var i = 0; i<cellsForThisCol.length; i++) {
                    cellsForThisCol[i].style.width = newWidthPx;
                }

                headerCell.style.width = newWidthPx;
                colDef.actualWidth = newWidth;

                if (colPinned) {
                    _this.setPinnedColContainerWidth();
                } else {
                    _this.setMainRowWidths();
                    _this.setBodyContainerWidth();
                }
            };
            _this.eRoot.onmouseup = function() {
                _this.eRoot.style.cursor = "";
                _this.stopDragging();
            };
            _this.eRoot.onmouseleave = function() {
                _this.stopDragging();
            };
        };
    };

    Grid.prototype.stopDragging = function() {
        this.eRoot.style.cursor = "";
        this.eRoot.onmouseup = null;
        this.eRoot.onmouseleave = null;
        this.eRoot.onmousemove = null;
    };

    Grid.prototype.addScrollListener = function() {
        var _this = this;

        this.eBodyViewport.addEventListener("scroll", function() {
            _this.scrollHeaderAndPinned();
            _this.drawVirtualRows();
        });
    };

    Grid.prototype.drawVirtualRows = function() {
        var topPixel = this.eBodyViewport.scrollTop;
        var bottomPixel = topPixel + this.eBodyViewport.offsetHeight;

        var firstRow = Math.floor(topPixel / this.gridOptions.rowHeight);
        var lastRow = Math.floor(bottomPixel / this.gridOptions.rowHeight);

        //add in buffer
        firstRow = firstRow - ROW_BUFFER_SIZE;
        lastRow = lastRow + ROW_BUFFER_SIZE;

        this.ensureRowsRendered(firstRow, lastRow);
    };

    Grid.prototype.scrollHeaderAndPinned = function() {
        this.eHeaderContainer.style.left = -this.eBodyViewport.scrollLeft + "px";
        this.ePinnedColsContainer.style.top = -this.eBodyViewport.scrollTop + "px";
    };

    Grid.prototype.setMainRowWidths = function() {
        var mainRowWidth = this.getTotalUnpinnedColWidth() + "px";

        var unpinnedRows = this.eBodyContainer.querySelectorAll(".ag-row");
        for (var i = 0; i<unpinnedRows.length; i++) {
            unpinnedRows[i].style.width = mainRowWidth;
        }
    };

    Grid.prototype.insertRow = function(data, rowIndex, mainRowWidth, pinnedColumnCount) {
        //if no cols, don't draw row
        if (!this.gridOptions.columnDefs || this.gridOptions.columnDefs.length==0) {
            return;
        }

        var rowIsAGroup = data._angularGrid_group; //_angularGrid_group is set to true on groups

        var ePinnedRow = this.createRowContainer(rowIndex, data, rowIsAGroup);
        var eMainRow = this.createRowContainer(rowIndex, data, rowIsAGroup);
        var _this = this;

        this.rowsInBodyContainer[rowIndex] = eMainRow;
        this.rowsInPinnedContainer[rowIndex] = ePinnedRow;

        eMainRow.style.width = mainRowWidth+"px";

        //if group item, insert the first row
        if (rowIsAGroup) {
            var firstCol = this.gridOptions.columnDefs[0];
            var groupHeaderTakesEntireRow = this.gridOptions.groupUseEntireRow;

            var eGroupRow = _this.createGroupElement(data, firstCol, groupHeaderTakesEntireRow);
            if (pinnedColumnCount>0) {
                ePinnedRow.appendChild(eGroupRow);
            } else {
                eMainRow.appendChild(eGroupRow);
            }

            if (!groupHeaderTakesEntireRow) {

                //draw in blank cells for the rest of the row
                var groupHasData = data.aggData!==undefined && data.aggData!==null;
                this.gridOptions.columnDefs.forEach(function(colDef, colIndex) {
                    if (colIndex==0) { //skip first col, as this is the group col we already inserted
                        return;
                    }
                    var item = null;
                    if (groupHasData) {
                        item = data.aggData[colDef.field];
                    }
                    _this.createCellFromColDef(colDef, item, data, rowIndex, colIndex, pinnedColumnCount, eMainRow, ePinnedRow);
                });
            }

        } else {
            this.gridOptions.columnDefs.forEach(function(colDef, colIndex) {
                _this.createCellFromColDef(colDef, data[colDef.field], data, rowIndex, colIndex, pinnedColumnCount, eMainRow, ePinnedRow);
            });
        }

        //experimental, try compiling as we insert rows
        if (this.gridOptions.angularCompile) {
            var newChildScope = this.$scope.$new();
            this.childScopesForRows[rowIndex] = newChildScope;
            newChildScope.rowData = data;
            var ePinnedRowCompiled = this.$compile(ePinnedRow)(newChildScope);
            var eMainRowCompiled = this.$compile(eMainRow)(newChildScope);
            this.ePinnedColsContainer.appendChild(ePinnedRowCompiled[0]);
            this.eBodyContainer.appendChild(eMainRowCompiled[0]);
        } else {
            this.ePinnedColsContainer.appendChild(ePinnedRow);
            this.eBodyContainer.appendChild(eMainRow);
        }

    };

    Grid.prototype.createCellFromColDef = function(colDef, value, data, rowIndex, colIndex, pinnedColumnCount, eMainRow, ePinnedRow) {
        var eGridCell = this.createCell(colDef, value, data, rowIndex, colIndex);

        if (colIndex>=pinnedColumnCount) {
            eMainRow.appendChild(eGridCell);
        } else {
            ePinnedRow.appendChild(eGridCell);
        }
    };

    Grid.prototype.createRowContainer = function(rowIndex, row, groupRow) {
        var eRow = document.createElement("div");
        var classesList = ["ag-row"];
        classesList.push(rowIndex%2==0 ? "ag-row-even" : "ag-row-odd");
        if (this.gridOptions.selectedRows.indexOf(row)>=0) {
            classesList.push("ag-row-selected");
        }
        var classes = classesList.join(" ");

        eRow.className = classes;

        eRow.setAttribute("row", rowIndex);

        eRow.style.top = (this.gridOptions.rowHeight * rowIndex) + "px";
        eRow.style.height = (this.gridOptions.rowHeight) + "px";

        if (!groupRow) {
            var _this = this;
            eRow.addEventListener("click", function(event) {
                _this.onRowClicked(event, Number(this.getAttribute("row")))
            });
        }

        return eRow;
    };

    Grid.prototype.createGroupElement = function(data, firstColDef, useEntireRow) {
        var eGridGroupRow = document.createElement("div");
        if (useEntireRow) {
            eGridGroupRow.className = "ag-group-row";
        } else {
            eGridGroupRow.className = "ag-cell cell-col-"+0;
        }

        var eSvg = createGroupSvg(data.expanded);
        eGridGroupRow.appendChild(eSvg);

        //if renderer provided, use it
        if (this.gridOptions.groupInnerCellRenderer) {
            var resultFromRenderer = this.gridOptions.groupInnerCellRenderer(data);
            if (utils.isNode(resultFromRenderer) || utils.isElement(resultFromRenderer)) {
                //a dom node or element was returned, so add child
                eGridGroupRow.appendChild(resultFromRenderer);
            } else {
                //otherwise assume it was html, so just insert
                var eTextSpan = document.createElement("span");
                eTextSpan.innerHTML = resultFromRenderer;
                eGridGroupRow.appendChild(eTextSpan);
            }
        //otherwise default is display the key along with the child count
        } else {
            var eText = document.createTextNode(" " + data.key + " (" + data.allChildrenCount + ")");
            eGridGroupRow.appendChild(eText);
        }

        if (!useEntireRow) {
            eGridGroupRow.style.width = this.formatWidth(firstColDef.actualWidth);
        }
        eGridGroupRow.style.paddingLeft = ((data.level + 1) * 10) + "px";

        var _this = this;
        eGridGroupRow.addEventListener("click", function(event) {
            data.expanded = !data.expanded;
            _this.setupRows(constants.STEP_MAP);
        });

        return eGridGroupRow;
    };

    Grid.prototype.createCell = function(colDef, value, data, rowIndex, colIndex) {
        var eGridCell = document.createElement("div");
        eGridCell.className = "ag-cell cell-col-"+colIndex;

        if (colDef.cellRenderer) {
            var resultFromRenderer = colDef.cellRenderer(value, data);
            if (utils.isNode(resultFromRenderer) || utils.isElement(resultFromRenderer)) {
                //a dom node or element was returned, so add child
                eGridCell.appendChild(resultFromRenderer);
            } else {
                //otherwise assume it was html, so just insert
                eGridCell.innerHTML = resultFromRenderer;
            }
        } else {
            //if we insert undefined, then it displays as the string 'undefined', ugly!
            if (value!==undefined) {
                eGridCell.innerText = value;
            }
        }

        if (colDef.cellCss) {
            Object.keys(colDef.cellCss).forEach(function(key) {
                eGridCell.style[key] = colDef.cellCss[key];
            });
        }

        if (colDef.cellCssFunc) {
            var cssObjFromFunc = colDef.cellCssFunc(value);
            if (cssObjFromFunc) {
                Object.keys(cssObjFromFunc).forEach(function(key) {
                    eGridCell.style[key] = cssObjFromFunc[key];
                });
            }
        }

        if (this.gridOptions.cellCssFormatter) {
            var cssStyles = this.gridOptions.cssCellFormatter(rowIndex, colIndex);
            if (cssStyles) {
                Object.keys(cssStyles).forEach(function(key) {
                    eGridCell.style[key] = cssStyles[key];
                });
            }
        }

        if (this.gridOptions.cellClassFormatter) {
            var classes = this.gridOptions.cellClassFormatter(rowIndex, colIndex);
            if (classes) {
                var newClassesString = classes.join(" ");
                if (eGridCell.className) {
                    newClassesString = eGridCell.className + " " + newClassesString;
                }
                eGridCell.className = newClassesString;
            }
        }

        eGridCell.style.width = this.formatWidth(colDef.actualWidth);

        return eGridCell;
    };

    Grid.prototype.formatWidth = function(width) {
        if (typeof width === "number") {
            return width + "px";
        } else {
            return width;
        }
    };

    Grid.prototype.insertHeader = function() {
        var ePinnedHeader = this.ePinnedHeader;
        var eHeaderContainer = this.eHeaderContainer;
        utils.removeAllChildren(ePinnedHeader);
        utils.removeAllChildren(eHeaderContainer);
        this.headerFilterIcons = {};

        var pinnedColumnCount = this.getPinnedColCount();
        var _this = this;

        this.gridOptions.columnDefs.forEach(function(colDef, index) {
            //only include the first x cols
            if (index<pinnedColumnCount) {
                var headerCell = _this.createHeaderCell(colDef, index, true);
                ePinnedHeader.appendChild(headerCell);
            } else {
                var headerCell = _this.createHeaderCell(colDef, index, false);
                eHeaderContainer.appendChild(headerCell);
            }
        });
    };

    function createFilterSvg() {
        var eSvg = document.createElementNS(SVG_NS, "svg");
        eSvg.setAttribute("width", "10");
        eSvg.setAttribute("height", "10");

        var eFunnel = document.createElementNS(SVG_NS, "polygon");
        eFunnel.setAttribute("points", "0,0 4,4 4,10 6,10 6,4 10,0");
        eFunnel.setAttribute("class", "ag-header-icon");
        eSvg.appendChild(eFunnel);

        return eSvg;
    }

    function createMenuSvg() {
        var eSvg = document.createElementNS(SVG_NS, "svg");
        var size = "12"
        eSvg.setAttribute("width", size);
        eSvg.setAttribute("height", size);

        ["0","5","10"].forEach(function(y) {
            var eLine = document.createElementNS(SVG_NS, "rect");
            eLine.setAttribute("y", y);
            eLine.setAttribute("width", size);
            eLine.setAttribute("height", "2");
            eLine.setAttribute("class", "ag-header-icon");
            eSvg.appendChild(eLine);
        });

        return eSvg;
    }

    function createSortArrowSvg(colIndex) {
        var eSvg = document.createElementNS(SVG_NS, "svg");
        eSvg.setAttribute("width", "10");
        eSvg.setAttribute("height", "10");
        eSvg.setAttribute("class", "ag-header-cell-sort");

        var eDescIcon = document.createElementNS(SVG_NS, "polygon");
        eDescIcon.setAttribute("points", "0,10 5,0 10,10");
        eDescIcon.setAttribute("style", SORT_STYLE_HIDE);
        eDescIcon.setAttribute("class", "ag-header-icon ag-header-cell-sort-desc-"+colIndex);
        eSvg.appendChild(eDescIcon);

        var eAscIcon = document.createElementNS(SVG_NS, "polygon");
        eAscIcon.setAttribute("points", "0,0 10,0 5,10");
        eAscIcon.setAttribute("style", SORT_STYLE_HIDE);
        eAscIcon.setAttribute("class", "ag-header-icon ag-header-cell-sort-asc-"+colIndex);
        eSvg.appendChild(eAscIcon);

        return eSvg;
    }


    function createGroupSvg(expanded) {
        var eSvg = document.createElementNS(SVG_NS, "svg");
        eSvg.setAttribute("width", "10");
        eSvg.setAttribute("height", "10");
        eSvg.setAttribute("class", "ag-header-cell-sort");

        if (expanded) {
            var eAscIcon = document.createElementNS(SVG_NS, "polygon");
            eAscIcon.setAttribute("points", "0,0 10,0 5,10");
            eSvg.appendChild(eAscIcon);
        } else {
            var eDescIcon = document.createElementNS(SVG_NS, "polygon");
            eDescIcon.setAttribute("points", "0,0 10,5 0,10");
            eSvg.appendChild(eDescIcon);
        }

        return eSvg;
    }

});
