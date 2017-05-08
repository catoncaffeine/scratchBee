var ScratchPad = { // allows the client to create, manipulate, and destroy scratchpad instances
    instances: {},
    builder: null,
    init: function(wrapper, config) {
        if(!ScratchPad.builder) {
            ScratchPad.builder = new ScratchPadBuilder();
        }
        var instance = ScratchPad.builder.build(wrapper, config);
        ScratchPad.instances[instance.id]= instance;
        return instance;
    },
    getDefaultMenu: function() {
        return ScratchPad.builder.getDefaultMenu();
    },
    getDefaultDimension: function() {
        return ScratchPad.builder.getDefaultDimension();
    },

    // add methods for different format, json, jpeg, etc
    exportCanvas : function(id){
        if(ScratchPad.instances[id]){
            return ScratchPad.instances[id].canvas.toDataURL();
        }
    },
    hasContent: function(id) {
        if(ScratchPad.instances[id]) {
            return !ScratchPad.instances[id].canvas.isEmpty();
        }
        return false;
    },
    destroyAll:  function(){
        Object.keys(ScratchPad.instances).forEach(function(id){
            ScratchPad.destroyInstanceById(id);
        });
    },
    destroyInstance: function(instance){
        if(instance && instance.id){
            ScratchPad.destroyInstanceById(instance.id);
        }
    },
    destroyInstanceById: function(id){
        var instance = ScratchPad.instances[id];
        if(instance) {
            if(instance.canvas) instance.canvas.dispose();
            $(instance.domElement).empty();
            delete ScratchPad.instances[id];
        }
    },
    menu: {
        undo: "undo",
        text: "text",
        shapes: "shapes",
        colors: "colors",
        backgrounds: "backgrounds"
    }
};

function ScratchPadBuilder() {
    var drawer = null,
        resourceImported = false,
        resourceBasePath = "",

        /* Format for menu Items
            action : same as its key value, intended to be used as id, added to data-action attribute to the menu button
            cssClass: class appended to the outer div of the button, can be used for both styling and events
            title: tooltip title
            icon: icon that goes inside the button for display, either use fa or custom image, not functional, no events
            menuActionType: see menuActionType section
            other attributes are specific to that particular menu item
        * */

        menuItems = {
            selector: {
                action: "selector",
                cssClass: "sp-selector",
                title: "Select",
                icon: "fa fa-arrows-alt",
                menuActionType: 1
            },
            pencil: {
                action: "pencil",
                cssClass: "sp-pencil",
                title: "Pencil",
                icon: "fa fa-pencil",
                menuActionType: 1
            },
            pencilSize2px:{
                action: "pencilSize2px",
                cssClass: 'sp-pencil-size',
                icon: 'sp-icon sp-pencilSize2px',
                title: '2px',
                menuActionType: 3,
                size:2
            },
            pencilSize5px:{
                action: "pencilSize5px",
                cssClass: 'sp-pencil-size',
                icon: 'sp-icon sp-pencilSize5px',
                title: '5px',
                menuActionType: 3,
                size:5
            },
            pencilSize10px:{
                action: "pencilSize10px",
                cssClass: 'sp-pencil-size',
                icon: 'sp-icon sp-pencilSize10px',
                title: '10px',
                menuActionType: 3,
                size:10
            },
            pencilSize20px:{
                action: "pencilSize20px",
                cssClass: 'sp-pencil-size',
                icon: 'sp-icon sp-pencilSize20px',
                title: '20px',
                menuActionType: 3,
                size:20
            },
            pencilSize50px:{
                action: "pencilSize50px",
                cssClass: 'sp-pencil-size',
                icon: 'sp-icon sp-pencilSize50px',
                title: '50px',
                menuActionType: 3,
                size:50
            },
            trash: {
                action: "trash",
                cssClass: "sp-trash",
                title: "Delete",
                icon: "fa fa-trash",
                menuActionType: 2
            },
            undo: {
                action: "undo",
                cssClass: 'sp-undo disabled',
                title: 'Undo',
                icon: "fa fa-undo",
                menuActionType: 0
            },
            redo: {
                action: "redo",
                cssClass: 'sp-redo disabled',
                title: 'Redo',
                icon: "fa fa-repeat",
                menuActionType: 0
            },
            text: {
                action: "text",
                cssClass: 'sp-draw sp-text',
                title:'Add Text',
                icon: "fa fa-font",
                menuActionType: 1
            },
            text16: {
                action: "text16",
                cssClass: 'sp-textsize sp-text16',
                title:'16px',
                icon: "fa",
                iconText: 16,
                size: 16,
                menuActionType: 3
            },
            text24: {
                action: "text24",
                cssClass: 'sp-textsize sp-text24',
                title:'24px',
                icon: "fa",
                iconText: 24,
                size: 24,
                menuActionType: 3
            },
            text30: {
                action: "text30",
                cssClass: 'sp-textsize sp-text30',
                title:'30px',
                icon: "fa",
                iconText: 30,
                size: 30,
                menuActionType: 3
            },
            line:{
                action: "line",
                cssClass: 'sp-draw sp-line',
                icon: "sp-icon sp-line-i",
                title:'Line',
                menuActionType: 1,
                sides: 1
            },
            ray: {
                action: "ray",
                cssClass: 'sp-draw sp-line',
                icon: 'fa fa-long-arrow-right',
                title: 'Ray',
                menuActionType: 1
            },
            doubleray: {
                action: "doubleray",
                cssClass: 'sp-draw sp-line',
                icon: 'fa fa-arrows-h',
                title: 'Double Headed Ray',
                menuActionType: 1
            },
            circle: {
                action: "circle",
                cssClass: 'sp-draw sp-shape',
                icon: 'fa fa-circle',
                title: 'Circle',
                menuActionType: 1,
                sides: 0
            },
            eq_triangle :{
                action: "eq_triangle",
                cssClass: 'sp-draw sp-shape',
                icon:'sp-icon sp-eq-triangle',
                title: 'Equilateral Triangle',
                menuActionType: 1,
                sides: 3
            },
            right_triangle: {
                action: "right_triangle",
                cssClass: 'sp-draw sp-shape',
                icon:'sp-icon sp-right-triangle',
                title:'Right Angled Triangle',
                menuActionType: 1
            },
            scalene_triangle: {
                action: "scalene_triangle",
                cssClass: 'sp-draw sp-shape',
                icon: 'sp-icon sp-scalene',
                title: 'Scalene Triangle',
                menuActionType: 1
            },
            square:{
                action: "square",
                cssClass: 'sp-draw sp-shape',
                icon:'sp-icon sp-square',
                title: 'Square',
                menuActionType: 1,
                sides: 4
            },
            parallelogram:{
                action: "parallelogram",
                cssClass: 'sp-draw sp-shape',
                icon: 'sp-icon sp-parallelogram',
                title: 'Parallelogram',
                menuActionType: 1
            },
            eq_trapezoid: {
                action: "eq_trapezoid",
                cssClass: 'sp-draw sp-shape',
                icon: 'sp-icon sp-eq-trapezoid',
                title: 'Equilateral Trapezoid',
                menuActionType: 1
            },
            trapezoid: {
                action: "trapezoid",
                cssClass: 'sp-draw sp-shape',
                icon:'sp-icon sp-trapezoid',
                title: 'Trapezoid',
                menuActionType: 1
            },
            pentagon: {
                action: "pentagon",
                cssClass: 'sp-draw sp-shape',
                icon: 'sp-icon sp-pentagon',
                title: 'Pentagon',
                menuActionType: 1,
                sides: 5
            },
            hexagon: {
                action: "hexagon",
                cssClass: 'sp-draw sp-shape',
                icon: 'sp-icon sp-hexagon',
                title: 'Hexagon',
                menuActionType: 1,
                sides: 6
            },
            octagon: {
                action: "octagon",
                cssClass: 'sp-draw sp-shape',
                icon: 'sp-icon sp-octagon',
                title: 'Octagon',
                sides: 8
            },
            decagon: {
                action: "decagon",
                cssClass: 'sp-draw sp-shape',
                icon: 'sp-icon sp-decagon',
                title: 'Decagon',
                menuActionType: 1,
                sides: 10
            },
            black: {
                action: "black",
                title: "Black",
                cssClass: "sp-color sp-black",
                hex: "#000000",
                icon: "fa",
                menuActionType: 3
            },
            white: {
                action: "white",
                title: "White",
                cssClass: "sp-color sp-white",
                hex: "#ffffff",
                icon: "fa",
                menuActionType: 3
            },
            darkblue: {
                action: "darkblue",
                title: "Dark Blue",
                cssClass: "sp-color sp-darkblue",
                hex: "#00008b",
                icon: "fa",
                menuActionType: 3
            },
            grey: {
                action: "grey",
                title: "Grey",
                cssClass: "sp-color sp-grey",
                hex: "#808080",
                icon: "fa",
                menuActionType: 3
            },
            red: {
                action: "red",
                title: "Red",
                cssClass: "sp-color sp-red",
                hex: "#ff0000",
                icon: "fa",
                menuActionType: 3
            },
            yellow: {
                action: "yellow",
                title: "Yellow",
                cssClass: "sp-color sp-yellow",
                hex: "#ffff00",
                icon: "fa",
                menuActionType: 3
            },
            orange: {
                action: "orange",
                title: "Orange",
                cssClass: "sp-color sp-orange",
                hex: "#ff8c00",
                icon: "fa",
                menuActionType: 3
            },
            pink: {
                action: "pink",
                title: "Pink",
                cssClass: "sp-color sp-pink",
                hex: "#ff69b4",
                icon: "fa",
                menuActionType: 3
            },
            green: {
                action: "green",
                title: "Green",
                cssClass: "sp-color sp-green",
                hex: "#008000",
                icon: "fa",
                menuActionType: 3
            },
            lightblue: {
                action: "lightblue",
                title: "Sky Blue",
                cssClass: "sp-color sp-lightblue",
                hex: "#add8e6",
                icon: "fa",
                menuActionType: 3
            },
            brown: {
                action: "brown",
                title: "Brown",
                cssClass: "sp-color sp-brown",
                hex: "#8b4513",
                icon: "fa",
                menuActionType: 3
            },
            purple: {
                action: "purple",
                title: "Purple",
                cssClass: "sp-color sp-purple",
                hex: "#800080",
                icon: "fa",
                menuActionType: 3
            },
            background_nobg: {
                action: "background_nobg",
                title: "White Background",
                cssClass: "sp-background sp-nobg hidden",
                icon: "sp-icon sp-nobg-icon",
                menuActionType: 3
            },
            // background_line: {
            //     action: "background_line",
            //     title: "Line Paper",
            //     cssClass: "sp-background sp-line-paper",
            //     source: "resource/img/linePaper.png",
            //     icon: "sp-icon sp-line-paper-icon",
            //     menuActionType: 0
            // },
            background_grid: {
                action: "background_grid",
                title: "Large Grid",
                cssClass: "sp-background sp-grid sp-deselect",
                source: "grid.png",
                icon: "sp-icon sp-grid-icon",
                deselect: "background_nobg",
                menuActionType: 3
            },
            background_sgrid: {
                action: "background_sgrid",
                title: "Small Grid",
                cssClass: "sp-background sp-sgrid sp-deselect",
                source: "sGrid.png",
                icon: "sp-icon sp-sgrid-icon",
                deselect: "background_nobg",
                menuActionType: 3
            },
            background_ruler: {
                action: "background_ruler",
                title: "Lined Paper",
                cssClass: "sp-background sp-ruler-paper sp-deselect",
                source: "rulerPaper.png",
                repeat: "no-repeat",
                icon: "sp-icon sp-ruler-paper-icon",
                deselect: "background_nobg",
                menuActionType: 3
            },
            background_alphabet: {
                action: "background_alphabet",
                title: "Alphabet Paper",
                cssClass: "sp-background sp-alphabet-paper sp-deselect",
                source: "alphabetPaper.png",
                icon: "sp-icon sp-alphabet-paper-icon",
                deselect: "background_nobg",
                menuActionType: 3
            }
        },
        /* Format for menu Chunks
             menuId: used to determine wither there should be a vertical divider (append one when menu id changes)
             type: either group or dropdown (for now)
                - group: a list of buttons that will be shown together on menu (e.g. selector + trash + pencil)
                - dropdown: a list of buttons that hides behind a display button. The display button can be either actionable or just for display
             action: used if the display button in the dropdown is actionable (e.g. pencil, text)
             items: the group of actionable items that goes into that chunk (group/dropdown)
             cssClass: the css class for the whole group
                - sp-permanent: actionable items in this group will permanently change the config of the canvas
                  (e.g. pencil size, color, text size)
             title: title for tooltip to be put on the display icon
             icon: the display button for dropdown, this icon will be displayed when nothing in this dropdown is selected
             group: how many items goes into 1 row in the dropdown
         * */
        menuChunks = {
            basic: {
                menuId: 0,
                cssClass: "sp-menu-basic",
                items: [menuItems.selector],
                type: "group"
            },
            pencil: {
                menuId: 0,
                cssClass: "sp-menu-basic sp-menu-pencil sp-permanent",
                items:[
                    menuItems.pencilSize2px,
                    menuItems.pencilSize5px,
                    menuItems.pencilSize10px,
                    menuItems.pencilSize20px,
                    menuItems.pencilSize50px
                ],
                type: "dropdown",
                title: "Pencil Size",
                icon: "fa fa-pencil",
				action: menuItems.pencil,
				group:5
            },
            trash:{
                menuId: 0,
                cssClass:'sp-menu-basic',
                items:[menuItems.trash],
                type:"group"
            },
            undo: {
                menuId: 1,
                cssClass: "sp-menu-undo",
                items: [menuItems.undo, menuItems.redo],
                type: "group"
            },
            colors: {
                menuId: 2,
                cssClass: "sp-menu-color sp-permanent",
                items: [
                    menuItems.black, menuItems.white, menuItems.darkblue, menuItems.grey,
                    menuItems.red, menuItems.yellow, menuItems.orange, menuItems.pink,
                    menuItems.green, menuItems.lightblue, menuItems.brown, menuItems.purple

                ],
                type: "dropdown",
                title: "Colors",
                icon: "fa fa-eyedropper"
            },
            text: {
                menuId: 3,
                cssClass: "sp-menu-text sp-permanent",
                items: [menuItems.text16, menuItems.text24, menuItems.text30],
                type: "dropdown",
                action: menuItems.text,
                group: 3
            },
            shapes: {
                menuId: 4,
                cssClass: "sp-menu-shapes",
                items:[
                    menuItems.line, menuItems.ray, menuItems.doubleray, "",
                    menuItems.circle, menuItems.eq_triangle, menuItems.right_triangle, menuItems.scalene_triangle,
                    menuItems.square, menuItems.parallelogram, menuItems.eq_trapezoid, menuItems.trapezoid,
                    menuItems.pentagon, menuItems.hexagon, menuItems.octagon, menuItems.decagon
                ],
                type: "dropdown",
                title: "Shapes",
                icon: "sp-icon shapes-icon"
            },
            backgrounds: {
                menuId: 5,
                cssClass: "sp-menu-backgrounds sp-permanent",
                items: [
                    menuItems.background_nobg,
                    menuItems.background_sgrid,
                    menuItems.background_grid,
                    menuItems.background_ruler,
                    menuItems.background_alphabet
                ],
                type: "dropdown",
                title: "Background",
                icon: "fa fa-picture-o",
                group: 3
            }
        },

        /*
        Action Type Explained -
            immediate: take an immediate action on the canvas, but don't change current tool (e.g. undo, redo)
            defer: no immediate action is taken, change current tool and WHAT canvas draws (e.g. pencil, text, all shapes)
            sticky: take an immediate action and change current tool (e.g. trash)
            permanent: no action taken, change HOW canvas draws (e.g. pencil size, text size, color)
        */

        menuActionType = {
            "immediate": 0,
            "defer": 1,
            "sticky": 2,
            "permanent": 3
        };

    var _buildInstance = function(wrapper, config) {
            var identifier = new Date().getTime();
            var instance = {id: "sp_" + identifier};
            var config = config || {};
            instance.domElement = $(wrapper)[0];
            instance.readonly = !!config.readonly;
            instance.dimension = config.dimension || getDefaultDimension();
            instance.toggleable = !!config.toggleable;
            instance.wrapper = $("<div class='sp-wrapper' data-sp-id='"+instance.id+"'></div>")[0];
            $(instance.wrapper).append("<div class='sp-panel panel panel-default'></div>");

            if(!instance.readonly) {
                instance.menu = config.menu || getDefaultMenu();
                instance.defaultAction = config.defaultAction || getDefaultAction();
                instance.pencilSize = menuItems.pencilSize2px.size;
                instance.undo = [];
                instance.redo = [];
                if(instance.menu.indexOf("colors") !== -1) instance.fillColor = menuItems.black.hex;
                if(instance.menu.indexOf("text") !== -1) instance.textsize = menuItems.text16.size;
                if(instance.menu.indexOf("backgrounds") !== -1) {
                    instance.backgrounds = {};
                    instance.currentBackground = menuItems.background_nobg
                };
            }

            return instance;
        },
        _buildToggleButton = function(instance) {
            $(instance.wrapper).append(""
                +"<div class='sp-toggle-btn sp-hide'>"
                +"  <i class='fa fa-minus'></i>"
                +"</div>"
                +"<div class='sp-toggle-btn sp-show'>"
                +"  <i class='fa fa-paint-brush'></i>"
                +"</div>");
            _bindToggleEvents(instance);
        },
        _buildTitle = function(instance, title) {
            var title = title || "Scratch Pad";
            $(instance.wrapper).find(".sp-panel").append(""
                +"<div class='sp-title panel-heading'>"
                +" <span>"+title+"</span>"
                +"</div>");
        },
        _buildMenu = function(instance) {
            $(instance.wrapper).find(".sp-panel").append("<div class='sp-menu panel-heading'></div>");
            var $menu = $(instance.wrapper).find(".sp-menu");
            var divider = "<span class='vertical-divider'></span>";
            var menuId = 0;
            Object.keys(menuChunks).forEach(function(key) {
                if(menuId !== menuChunks[key].menuId){
                    menuId = menuChunks[key].menuId;
                    $(divider).appendTo($menu);
                }
                if( menuId === 0 || instance.menu.indexOf(key) !== -1) {
                    var $chunk;
                    if(menuChunks[key].type === "dropdown") {
                        $chunk = _buildMenuDropDown(menuChunks[key]);
                    } else {
                        $chunk = _buildMenuChunk(menuChunks[key]);
                    }
                    $chunk.appendTo($menu);
                }
            });

            if (instance.menu.indexOf("text") !== -1) {
                $(instance.wrapper).append("<textarea class='sp-textarea' style='display: none' maxlength='200' textsize='"+instance.textsize+"'/>");
            }
        },
        _buildMenuChunk = function(chunk) {
            var $chunk = $("<span class='sp-menu-chunk "+chunk.cssClass+"'></span>");
            chunk.items.forEach(function(menuItem){
                $chunk.append(_buildMenuButton(menuItem));
            });
            return $chunk;
        },

        /*
            Dropdowns -
                can contain a list of actionable items, each item in such dropdown changes WHAT canvas draws
                    e.g. Shapes dropdown
                can also contain a list of config items, each item in such dropdown changes HOW canvas draws
                    e.g. Colors dropdown
            The icon(s) for the Dropdowns -
                can be simple for presentation to indicate what is selected
                    e.g. Shapes and Colors
                can be an actionable item
                    e.g. Pencil and Text
                    This means simply clicking on the Pencil dropdown changes the current tool to pencil
                    with pencil size set to the most recently selected size
                    and will also show the list of pencil sizes available, most recently selected size highlighted
        * */
        _buildMenuDropDown = function(chunk) {
            var itemsInGroup = chunk.group || 4,
                permanent = chunk.cssClass.indexOf("sp-permanent") !== -1,
                genericChunk = chunk.action ?  chunk.action : chunk,
                actionClass = chunk.action ?  " sp-menu-action " + chunk.action.cssClass : "",
                dataAction = chunk.action ? " data-action='" + chunk.action.action + "'" : "";
            var $chunk = $(""
                    +"<div class='btn-group sp-dropdown "+chunk.cssClass+"'>"
                    +   "<div class='dropdown-toggle" + actionClass + "' data-toggle='dropdown'" + dataAction + ">"
                    +       _buildDropdownIcons(permanent, genericChunk)
                    +   "</div>"
                    +   "<ul class='dropdown-menu'></ul>"
                    +"</div>"),
                $ul = $chunk.find("ul");

            chunk.items.forEach(function(menuItem, index) {

                var group = Math.floor((index)/itemsInGroup);
                var $li = $chunk.find("ul li[data-group='"+group+"']");
                if(!$li.length) {
                    if(group) {
                        $ul.append("<li class='divider'></li>");
                    }
                    $li = $("<li data-group='"+group+"'></li>");
                    $li.appendTo($ul);
                }
                if(menuItem) {
                    $li.append(_buildMenuButton(menuItem));
                }
            });
            return $chunk;
        },
        _buildDropdownIcons = function(permanent, genericChunk) {
            var primaryIcon = "";
            if(permanent) {
                primaryIcon = "<i class='sp-dropdown-icon "+genericChunk.icon+"' data-toggle='tooltip' title='"+genericChunk.title+"'></i>";
            } else {
                primaryIcon = "<i class='sp-menu-blank "+genericChunk.icon+"' data-toggle='tooltip' title='"+genericChunk.title+"'></i>";
            }
            return primaryIcon + "<i class='sp-menu-selected' data-toggle='tooltip' title='"+genericChunk.title+"'></i>";
        },
        _buildMenuButton = function(menuItem) {
            var iconText = menuItem.iconText || "";
            return ""
                +"<div class='sp-menu-action "+menuItem.cssClass + "' "
                +"data-action='"+menuItem.action+"' "
                +"data-toggle='tooltip' "
                +"title='"+menuItem.title+"'"
                +">"
                +"<i class='"+menuItem.icon+"'>"+iconText+"</i>"
                +"</div>";
        },
        _buildPad = function(instance){
            var width = instance.dimension.width, height = instance.dimension.height,
                $panel = $(instance.wrapper).find(".sp-panel"),
                nativeCanvas = ""
                    + "<div class='sp-canvas-wrapper panel-body'>"
                    +    "<canvas class='sp-canvas' id='"+instance.id+"' width='"+width+"' height='"+height+"'></canvas>"
                    + "</div>";
            $panel.append(nativeCanvas)
        },
        _renderScratchPad = function(instance){
            $(instance.wrapper).appendTo($(instance.domElement));
        },
        _convertToFabric = function(instance, drawer) {
            var canvasInitOptions = {
                isDrawingMode: true,
                stateful: true,
                enableRetinaScaling: false,
                allowTouchScrolling: true
            };
            instance.canvas = new fabric.Canvas(instance.id, canvasInitOptions);
            instance.canvas.freeDrawingBrush = new fabric.PencilBrush(instance.canvas);
            instance.canvas.freeDrawingBrush.width = 2;
            drawer.bindCanvasEvents(instance, menuItems);
        },
        _convertToStaticCanvas = function(instance) {
            instance.canvas = new fabric.StaticCanvas(instance.id, {
                enableRetinaScaling: false,
                allowTouchScrolling: true
            });
        },
        /*
            If a menu dropdown is marked with .sp-permanent, and the item inside has actionType of permanent (3)
            clicking an item inside that dropdown permanently changes HOW canvas draws (e.g. pencil size)
            until another item inside the same dropdown is selected
            One of the items in such dropdowns have to be selected
            Making a selection on this dropdown does not affect other dropdowns
            Selected items in such dropdowns is indicated with class .selected
            e.g.
                pencil size 1px is currently selected,
                clicking 5px will change drawing brush size to 5px and mark 5px as selected
                clicking inside canvas will now scratch with 5px wide lines
                but will NOT affect drawing color
        * */
        _changeConfigMenu = function(clickedElement, deselect) {
            var $dropdown = $(clickedElement).closest(".sp-permanent"),
            icon = $(clickedElement).find("i"),
            currentSelect = deselect ?  false : $(clickedElement).data("action"),
            iconClass = deselect ? "" : $(icon).attr("class");

            $dropdown.find(".sp-dropdown-icon").attr("current-selected", currentSelect);
            $dropdown.find(".selected").removeClass("selected");
            $dropdown.find(".sp-menu-selected").attr("class", "sp-menu-selected " + iconClass);

            $(clickedElement).toggleClass("selected", !deselect);
        },

        /*
            If a menu dropdown is NOT marked with .sp-permanenet, and the item inside has actionType of deferred (1)
            clicking an item inside that dropdown will change the current tool and WHAT canvas draws
            The clicked item will be marked with class .active
            and all other tools with class .active will have this class removed
            e.g.
                pencil is the active current tool
                circle under shapes menu is clicked
                pencil is no longer the active current tool, and circle is
                clicking inside canvas will draw a circle
        * */
        _toggleActiveMenu =  function(instance, clickedElement){
            var $menu = $(instance.wrapper).find(".sp-menu"),
                $dropdown = $(clickedElement).closest(".sp-dropdown:not(.sp-permanent)");
            if(!$(clickedElement).hasClass('active')) {
                _resetDropdowns($menu);
                $(instance.wrapper).find(".sp-menu .active").removeClass("active");
                $(clickedElement).addClass('active');
                if($dropdown) {
                    $dropdown.find(".dropdown-toggle").addClass("active");
                    $dropdown.find(".sp-menu-blank").hide();
                    $dropdown.find(".sp-menu-selected").attr("class", "sp-menu-selected " + $(clickedElement).find("i").attr("class")).css("display","block");
                }
                _changeCurrentTool(instance, $(clickedElement).data("action"));
            }
        },
        _resetDropdowns = function($menu) {
            var $dropdowns = $menu.find(".sp-dropdown:not(.sp-permanent)");
            if($dropdowns.length) {
                $dropdowns.find(".dropdown-toggle").removeClass("active");
                $dropdowns.find(".sp-menu-blank").show();
                $dropdowns.find(".sp-menu-selected").attr("class", "sp-menu-selected").hide();
            }
        },
        _changeCurrentTool = function(instance, action) {
            instance.currentTool = action;
            if(action.indexOf("pencil") !== -1){
                instance.currentTool = 'pencil'
                instance.canvas.isDrawingMode = true;
            } else {
                instance.canvas.isDrawingMode = false;
            }
        },
        _bindToggleEvents = function(instance) {
            $(instance.wrapper).on("click", ".sp-toggle-btn", function(){
                var $wrapper = $(instance.wrapper),
                    width = instance.dimension.width,
                    left = $wrapper.hasClass("sp-hidden") ? "auto": (width-28) + "px";

                $(instance.wrapper).toggleClass("sp-hidden");
                $(instance.wrapper).css({left: left});
            });
        },
        _bindMenuEvents = function(instance, drawer) {
            $(instance.wrapper).on("click", ".sp-menu-action", function(event) {
                var action = $(this).data("action"),
                    menuItem = menuItems[action],
                    actionType = menuItems[action].menuActionType;

                drawer.hideTextArea(instance);

                if(actionType == menuActionType.immediate) {
                    drawer.takeAction(event, instance, menuItem);
                } else if(actionType == menuActionType.permanent) {
                    var selected = $(this).hasClass("selected"),
                        deselect = $(this).hasClass("sp-deselect"),
                        menuItemToChangeTo;
                    if((!selected) || deselect) {
                        menuItemToChangeTo = selected ?  menuItems[menuItem.deselect] : menuItem;
                        if(menuItem.action.indexOf("background") !== -1) {
                            var currentMenuItem = menuItems[$(this).closest(".sp-dropdown").find(".selected").data("action")];
                            drawer.pushToUndoBuffer(instance, {
                                action: 4,
                                whichConfig: "background",
                                menuItem: currentMenuItem || menuItems.background_nobg
                            });
                        }
                        _changeConfigMenu(this, selected);
                        drawer.changeDrawConfig(instance, menuItemToChangeTo);
                    }
                } else {
                    _toggleActiveMenu(instance, this);
                    if(actionType == menuActionType.sticky) {
                        drawer.takeAction(event, instance, menuItem);
                    }
                }
            });

            $(instance.wrapper).on("configchange", ".sp-menu", function(event, menuItem) {
                var menuItem = $(instance.wrapper).find("[data-action='"+menuItem.action+"']");
                _changeConfigMenu(menuItem, menuItem.hasClass("selected"));
            });
        },
        _setupDefaultInMenu = function(instance) {
            $(instance.wrapper).find('[data-action="'+instance.defaultAction+'"]').addClass('active');
            instance.currentTool = instance.defaultAction;
            if(instance.textsize) $(instance.wrapper).find("[data-action='text"+instance.textsize+"']").click();
            if(instance.pencilSize) $(instance.wrapper).find("[data-action='pencilSize"+instance.pencilSize+"px']").click();
        },
        _importResource = function() {
            var $jsFile = $("script[src*='scratchPad.js']");
			
            if($jsFile.length) {
				
                var jsPath = $jsFile.attr("src").toString(), cssPath, cssFile, cssName = "scratchpad.css";
				if(jsPath.indexOf("?")!== -1){
					cssName += jsPath.substr(jsPath.indexOf("?"));
				}
                resourceBasePath = jsPath.substr(0, jsPath.indexOf("js/main/scratchPad.js")) + "resource/";

                cssPath = resourceBasePath + cssName;
                cssFile = document.createElement("link");
                cssFile.setAttribute("rel", "stylesheet");
                cssFile.setAttribute("href", cssPath);
                $jsFile.after($(cssFile));
                resourceImported = true;
            }
        };

    var build = function(wrapper, config){
            if (!resourceImported) {
                _importResource();
            }
            if(!drawer) {
                drawer = new ScratchPadDrawer(resourceBasePath);
            }

            var instance = _buildInstance(wrapper, config);
            if(instance.toggleable) {
                _buildToggleButton(instance);
            }

            if(instance.readonly) {
                _buildTitle(instance);
                _buildPad(instance);
                _renderScratchPad(instance);
                _convertToStaticCanvas(instance);
            } else {
                _buildMenu(instance);
                _buildPad(instance);
                _renderScratchPad(instance);
                _bindMenuEvents(instance, drawer);
                _convertToFabric(instance, drawer);
                _setupDefaultInMenu(instance);
            }

            if(config && config.image) {
                // use alt passed in or default if readonly. don't load alt if editable
                var altURL = false;
                if(instance.readonly) {
                    altURL = config.imageAlt || resourceBasePath + "img/brokenImage.png";
                }
                drawer.loadImage(instance, config.image, altURL);
            }
            return instance;
        },
        getDefaultMenu = function() {
            return [menuItems.selector, menuItems.pencil, menuItems.trash];
        },
        getDefaultDimension = function() {
            return {width: 500, height: 500};
        },
        getDefaultAction = function() {
            return menuItems.pencil.action;
        };
    return {
        build: build,
        getDefaultMenu: getDefaultMenu,
        getDefaultDimension: getDefaultDimension,
        getDefaultAction: getDefaultAction
    };
};

function ScratchPadDrawer(resourceBasePath) {
    var _add = 1, _delete = 2, _modify = 3, _config = 4,
        _resourceBasePath = resourceBasePath,
        _textPlaceholder = "Click to add text",
        _bindObjectEvents = function(instance){
            var mouseOut = false;
            instance.canvas.on('object:modified', function(e){
                if(!instance.onUndoRedo  && instance.currentTool !=='trash'){
                    _trackObjectHistory(instance,_modify);
                }
            });
            instance.canvas.on('object:selected', function(e){
                if(instance.currentTool !== 'trash'){
                    _captureSelectedObject(instance);
                }
            });

            instance.canvas.on('object:added', function(e){
                if(!instance.onUndoRedo){
                    var id = new Date().getTime();
                    e.target.set({id:e.target.type+'_'+id});
                    _trackObjectHistory(instance,_add,e.target);
                }
            });
            instance.canvas.observe("object:moving", function(e) {
                if(mouseOut) {
                    var obj = e.target,
                        canvas = obj.canvas,
                        bound = obj.getBoundingRect();

                    var canvasH = canvas.height,
                        canvasW = canvas.width,
                        boundT = bound.top,
                        boundL = bound.left,
                        boundH = bound.height,
                        boundW = bound.width;

                    // if object is too big ignore
                    if(obj.currentHeight > canvasH || obj.currentWidth > canvasW){
                        return;
                    }
                    obj.setCoords();
                    // top-left  corner
                    if(boundT < 0 || boundL < 0){
                        obj.top = Math.max(obj.top, obj.top - boundT);
                        obj.left = Math.max(obj.left, obj.left - boundL);
                    }
                    // bot-right corner
                    if(boundT + boundH  > canvasH || boundL + boundW  > canvasW){
                        obj.top = Math.min(obj.top, canvasH - boundH + obj.top - boundT);
                        obj.left = Math.min(obj.left, canvasW - boundW + obj.left - boundL);
                    }
                }
            });
            instance.canvas.on("mouse:out", function(){
                mouseOut = true;
            });
            instance.canvas.on("mouse:over", function() {
                mouseOut = false;
            });
        },
        _bindMouseDownEvents = function(instance, menuItems){
            instance.canvas.on('mouse:down', function(e){
                hideTextArea(instance);
                if(instance.currentTool) {
                    var menuItem = menuItems[instance.currentTool];
                    if(menuItem.cssClass.indexOf("sp-draw") !== -1) {
                        draw(e, instance, menuItem);
                    } else {
                        takeAction(e, instance, menuItem);
                    }
                }
            })
        },
        _makeTextBox = function(instance) {
            var textsize = instance.textsize || 16,
                textbox = new fabric.Textbox(_textPlaceholder, {
                fontSize: textsize,
                width:150,
                fontFamily: "sans-serif"
            });
            textbox.off();
            textbox.on("mousedown",function(e) {
                if(instance.currentTool === 'trash'){
                    var index = instance.canvas.getObjects().indexOf(this);

					pushToUndoBuffer(instance, {
                        itemIndex: index,
                        items:[this],
                        itemType: 'Object',
                        action:2
                    });
                    instance.canvas.remove(this);
                    //return since there are some logic following.
                    return;
                }
                var time = new Date().getTime();
                if(this.lastTime && (time - this.lastTime < 500 )) {
                    var x = this.left > 0 ? this.left : e.clientX;
                    var y = this.top > 0 ? this.top : e.clientY;
                    showTextArea(instance, this, {x: x, y: y});
                }
                this.lastTime = time;
            });
            textbox.on("scaling", function(){
                if(textbox.width > instance.canvas.width) {
                    textbox.setWidth(instance.canvas.width);
                    textbox._initDimensions();
                    instance.canvas.renderAll();
                }
            });

            return textbox;
        },
        showTextArea = function (instance, activeTextArea, pointer) {
            var $textarea = $(instance.wrapper).find(".sp-textarea");
            $textarea[0].canvasObject = activeTextArea;
            var left, top;
            if (pointer.y - $textarea.outerHeight() < 0) {
                top = $textarea.outerHeight() - 13;
            } else {
                top = pointer.y;
            }
            if (pointer.x + $textarea.outerWidth() > instance.dimension.width) {
                left = instance.dimension.width - $textarea.outerWidth();
            } else {
                left = pointer.x;
            }

            $textarea[0].value = activeTextArea.getText();
            $textarea[0].setAttribute("textsize", activeTextArea.getFontSize());

            $textarea.css({left: left, top: top}).show(function () {
                if($textarea[0].value === _textPlaceholder) $textarea[0].select();
                $textarea.focus();
            });
        },
        hideTextArea = function (instance) {
            var $textarea = $(instance.wrapper).find("textarea");
            if($textarea.length) {
                var canvasObject = $textarea[0].canvasObject;
                if(canvasObject) {
                    var newText = $textarea.val(), originalText = canvasObject.getText();
                    instance.canvas.setActiveObject(canvasObject);
                    if(newText !== originalText) {
                        canvasObject.setText($textarea.val());
                        instance.canvas.trigger("object:modified");
                        instance.canvas.renderAll();
                    }
                    if(!canvasObject.getText()) _trash(instance, {});
                    $textarea[0].value = "";
                    $textarea[0].canvasObject = null;
                }
                $textarea.hide();
            }
        },
        _makeLine = function(instance, pointer) {
            var _x = pointer.x;
            var _y = pointer.y;
            var tool = new fabric.Line([_x,_y,_x+100,_y],{left:_x, top:_y,strokeWidth:2});
            if(instance.currentTool === 'ray'){
                tool = _makeRay({length:100, width:4,startX:_x, startY:_y });
            } else if(instance.currentTool === 'doubleray'){
                tool = _makeRay({length:100, width:4,startX:_x+15, startY:_y, doubleHeaded:true });
            }
            return tool;
        },
        _makeRay = function(config) {
            var _length = (config.length || config.length<50)? config.length:50;
            var	_startX = config.startX ? config.startX: 100;
            var _startY = config.startY ? config.startY: 100;
            var _width = config.width? config.width: 2;
            var _doubleHeaded = config.doubleHeaded;

            var _arrowLength = _length*.07;
            var _arrowHeight = _length * .07;
            var _points = [];
            _points.push({x:_startX,y:_startY});
            _points.push({x:_startX+_length,y:_startY});
            _points.push({x: (_startX + _length) - _arrowLength, y: _startY-_arrowHeight});
            _points.push({x: (_startX + _length) +(2*_arrowLength),y: _startY +(_width/2)});
            _points.push({x: (_startX + _length) - _arrowLength, y: _startY+ (_width) +_arrowHeight});
            _points.push({x: _startX+ _length, y: _startY + _width});
            _points.push({x: _startX,y: _startY + _width});

            if(_doubleHeaded){
                _points.push({x: _startX + _arrowLength, y: _startY+_width + _arrowHeight});
                _points.push({x: _startX -( 2* _arrowLength), y: _startY+ (_width/2)});
                _points.push({x: _startX + _arrowLength, y: _startY - _arrowHeight});
            }

            var ray = new fabric.Polygon(_points);
            return ray;
        },
        _makeRegularShape = function(sides) {
            if(sides === 0) {
                return new fabric.Circle({radius:50});
            } else if(sides === 3) {
                return  new fabric.Triangle({height:100, width:100});
            } else if(sides === 4) {
                return  new fabric.Rect({width:100, height:100});
            } else {
                return _makeEqualSidedShapes(sides);
            }
        },
        _makeEqualSidedShapes = function(sides, config) {
            var _sides = sides || 4, //just in case
                _size = 60, //future feature
                _centerX = 100,
                _centerY = 100;
            var x = _centerX + _size * Math.cos(0),
                y = _centerY + _size * Math.sin(0),
                coords = [{x:x,y:y}];

            for(var i =1; i<= _sides; i++) {
                var x = +(_centerX+ _size * Math.cos(i*2*Math.PI/_sides)).toFixed(2),
                    y = +(_centerY+ _size * Math.sin(i*2*Math.PI/_sides)).toFixed(2);
                coords.push({x:x,y:y});
            }

            var pol = new fabric.Polygon(coords);
            return pol;
        },
        _makeIrregularShape = function(shape) {
            switch (shape) {
                case "right_triangle":
                    return new fabric.Polygon([{x:0,y:0}, {x:0, y:100},{x:100, y:100}]);
                case "scalene_triangle":
                    return new fabric.Polygon([{x:100,y:100},{x:200,y:35},{x:160,y:100}]);
                case 'parallelogram':
                    return new fabric.Rect({width:100, height:50,skewX:320});
                case 'eq_trapezoid':
                    return new fabric.Polygon([{x:30, y:150}, {x:120, y:150}, {x:150, y: 225}, {x:0, y:225}]);
                case 'trapezoid':
                    return new fabric.Polygon([{x:60,y:150}, {x:150, y: 150}, {x:150, y: 225}, {x:0, y:225}]);
                default:
                    return;
            }
        },
        _makeImage = function(image, dimension){
            var fabricImage = new fabric.Image(image),
                canvasHeightRatio = dimension.height/dimension.width,
                imageHeightRatio = fabricImage.height / fabricImage.width,
                properties = {};
            if(canvasHeightRatio >= imageHeightRatio) {
                properties.width = dimension.width;
                properties.height = dimension.width * imageHeightRatio;
            } else {
                properties.width = dimension.height/imageHeightRatio;
                properties.height = dimension.height;
            }
            fabricImage.set(properties);
            return fabricImage;
        },
        _loadImage = function(instance, imageUrl, imageAltUrl) {
            var image = fabric.util.createImage(), error = false;
            image.src = imageUrl;
            image.onload = function(){
                var fabricImage = _makeImage(image, instance.dimension);
                if(!error) {
                    _addToCanvas(instance, fabricImage);
                } else {
                    _addBackgroundImage(instance, fabricImage)
                }
            };
            image.onerror = function() {
                if(imageAltUrl && !error) {
                    error = true;
                    image.src = imageAltUrl;
                }
            };
        },
        _changeBackground = function(instance, menuItem) {
            // track in undo and redo//

            if(!instance.backgrounds) instance.backgrounds = {};
            instance.currentBackground = menuItem;
            if(!menuItem.source) {
                _setBackgroundColor(instance.canvas, null);
                return;
            }

            if(instance.backgrounds[menuItem.action]) {
                _setBackgroundColor(instance.canvas, instance.backgrounds[menuItem.action]);
                return;
            }

            fabric.Image.fromURL(_resourceBasePath + "img/" + menuItem.source, function(img) {
                instance.backgrounds[menuItem.action] = _formatBackgroundPattern(instance, menuItem.repeat, img);
                _setBackgroundColor(instance.canvas, instance.backgrounds[menuItem.action]);
            });
        },
        _formatBackgroundPattern = function(instance, repeat, img) {
            var repeat = repeat || "repeat", source;
            if(!img) {
                return null;
            }
            if(repeat === "no-repeat") {
                var patternSourceCanvas = new fabric.StaticCanvas(), width = instance.dimension.width, height = instance.dimension.height;
                img.scaleToWidth(width-0.5);
                img.setTop(height/2 - img.height/2);
                patternSourceCanvas.setWidth(width);
                patternSourceCanvas.setHeight(height);
                patternSourceCanvas.getElement().setAttribute("width", width);
                patternSourceCanvas.getElement().setAttribute("height", height);
                patternSourceCanvas.add(img);
                source = patternSourceCanvas.getElement();
            } else {
                source = img.getElement();
            }
            return new fabric.Pattern({source: source, repeat: repeat});
        },
        _setBackgroundColor = function(canvas, pattern) {
            canvas.setBackgroundColor(pattern, canvas.renderAll.bind(canvas));
        },
        _addBackgroundImage = function(instance, imageObj){
            var canvas = instance.canvas;
            canvas.setBackgroundImage(imageObj, canvas.renderAll.bind(canvas), {
                originX: 'left',
                originY: 'top',
                crossOrigin: 'anonymous'
            });
        },
		pushToUndoBuffer = function(instance, object){
            $(instance.wrapper).find('.sp-undo').removeClass('disabled');
            if(instance.undo.length === 10){
                instance.undo.shift();
            }
			instance.redo=[];
			$(instance.wrapper).find("[data-action='redo']").addClass('disabled');
			instance.undo.push(object);	
		},
        _trash = function(instance, event){
            if(event.target && event.target.type==='textbox'){
                return;
            }
            var canvas = instance.canvas;
            var itemNums = []; // item numbers on the canvas
            var items = [];
            var itemId = [];
            var properties = [];
            var activeGroup = canvas.getActiveGroup();
            var activeObject = canvas.getActiveObject();
            var canvasObjects = canvas.getObjects();

            if(activeGroup){
                var objects = activeGroup.getObjects();

                canvas.discardActiveGroup();
                objects.forEach(function(object, i){

                    var index = canvasObjects.indexOf(object);
                    itemNums.push(index);
                    items.push(object);
                    itemId.push(object.id);
                    properties = $.extend({},object._stateProperties);
                });
            }else if (activeObject){
                itemNums.push(canvasObjects.indexOf(activeObject));
                items.push(activeObject);
                itemId.push(activeObject.id);
                properties = $.extend({}, activeObject._stateProperties);
            }


            items.forEach( function(element){
                canvas.remove(element);
            });
            if(itemNums.length>0){

               pushToUndoBuffer(instance,{
                    "action" : _delete,
                    "itemIndex": itemNums,
                    "itemType":'Object',
                    "items":items,
                    "itemId":itemId
                });
                canvas.renderAll();
            }
        },
        _addToCanvas = function(instance, object){
            instance.canvas.add(object);
        },
        _trackObjectHistory = function(instance, action, object){
            var objects = instance.canvas.getObjects();

            if(action === _modify){
                var activeObject = instance.canvas.getActiveObject();
                var activeGroup = instance.canvas.getActiveGroup();
                if(activeGroup){

					pushToUndoBuffer(instance, instance.selectedObject.pop());
                    if(activeGroup){
                        _captureSelectedObject(instance, activeGroup);
                    }
                }else {

                    if(instance.selectedObject){
                        //iText instances are not an active object. Hence read any object changes when it is selected.
                        var selectedObject = instance.selectedObject.pop();

                        $.extend(selectedObject,{'action':action});

						pushToUndoBuffer(instance, selectedObject);
                        if(activeObject){
                            activeObject.saveState();
                            //track further changes while still selected (anything other than text objects).
                            _captureSelectedObject(instance, activeObject);
                        }
                    }
                }

            }else{
				pushToUndoBuffer(instance, {
                    itemId: [object.id],
                    action: action,
                    itemIndex: [objects.length - 1],
                    itemType: "Object",
                    items: [object],
                    itemProperties: $.extend({},object._stateProperties)
                });

            }
        },
        _undoOrRedo = function(instance, event){
            if(instance.currentTool !== 'selector'){
                $(instance.wrapper).find("[data-action='selector']").click();
            }
			
            var buttonOn = $(event.currentTarget),
                menuAction = buttonOn.data("action"),
                antiAction = menuAction === "undo" ?  "redo" : "undo",
                buttonOff = $(instance.wrapper).find("[data-action='"+antiAction+"']"),
                bufferToUse = menuAction === "undo" ? instance.undo : instance.redo,
                bufferToPush = menuAction === "undo" ? instance.redo : instance.undo;

            if(bufferToUse.length) {
                var menuItem;
                var itemNums = [];
                var state = bufferToUse.pop();
                var properties = state.itemProperties;
                var action = state.action;
                var itemType = state.itemType;
                var items = [];
                //turn on flag to prevent object tracking
                instance.onUndoRedo = true;
                if(action === _add || action === _delete){

                    itemNums = state.itemIndex;
                    items = state.items;
                    if(action === _delete){
                        state.items.forEach(function(item, index){
                            action = _add;
                            var _index = state.itemIndex[index];
                            instance.canvas.insertAt(item, _index,false);
                            item.set(state.itemProperties);
                            item.setCoords();

                        });
                    }else {
                        action = _delete;
                        var itemsRemoved = _findAndRemove(state.itemId, instance.canvas);
                    }
                }else if(action === _modify){
                    if(itemType === 'Group'){
                        //groups work differently in fabric. it has its own properties and
                        //do not respect properties of the objects in the group.
                        properties = instance.canvas.toJSON(['id']);
                        instance.canvas.clear();
                        instance.canvas.loadFromJSON(state.itemProperties, function(){
                            //call as callback to make sure json is properly loaded.
                            instance.canvas.renderAll();
                        });
                    }else{
                        var item = instance.canvas.item(state.itemIndex[0]);
                        properties = $.extend({},item._stateProperties);
                        item.set(state.itemProperties);
                        item.setCoords();
                        item.saveState();
                        itemNums.push(state.itemIndex[0]);
                    };
                } else if(action === _config && state.whichConfig === "background") {
                    menuItem = instance.currentBackground;
                    _changeBackground(instance, state.menuItem);
                    $(instance.wrapper).find(".sp-menu").trigger("configchange", state.menuItem);
                    state.menuItem = menuItem;
                }

                bufferToPush.push({
                    "action": action,
                    "itemIndex": itemNums,
                    "itemProperties": properties,
                    "itemType":itemType,
                    "items":items,
                    "itemId":state.itemId,
                    "menuItem": menuItem,
                    "whichConfig": state.whichConfig
                });
                instance.canvas.renderAll();
                instance.onUndoRedo = false;
            }

            if(bufferToUse.length === 0){
                buttonOn.addClass('disabled');
            }
            if(bufferToPush.length !== 0){
                buttonOff.removeClass('disabled');
                if(bufferToPush.length > 10){
                    bufferToPush.shift();
                }
            }
        },
        _findAndRemove = function(ids, canvas){
            var _foundObjects = [];
            if(ids){
				
                canvas.getObjects().forEach(function(object){
                    if(object && ids.indexOf(object.id) !== -1){
                        _foundObjects.push(object);
                    }
                });
				_foundObjects.forEach(function (object){
					canvas.remove(object);
				});
            }
            return _foundObjects;
        },
        _captureSelectedObject = function(instance){
            instance.selectedObject = [];
            var activeGroup = instance.canvas.getActiveGroup();
            if(activeGroup){

                instance.selectedObject.push({"itemType":"Group", "itemProperties": instance.canvas.toJSON(['id']), "action":_modify});
            }else{

                $.each(instance.canvas.getObjects(), function(index, item){
                    if(item.active === true){

                        instance.selectedObject.push({"itemId":[item.id],"itemIndex":[index],"itemType":"Object", "itemProperties": $.extend({},item._stateProperties)});
                    }
                })
            }

        },
        _changeColor = function(instance, hex) {
            var hex = hex || "#000000";
            instance.canvas.freeDrawingBrush.color = hex;
            instance.fillColor = hex;
        },
        _changeTextsize = function(instance, size) {
            instance.textsize = size;
            $(instance.wrapper).find(".sp-textarea").attr("textsize", size);
        },
		_changePencilSize = function(instance, size) {
			if(!size){
				size = menuItem.pencilSize2px.size;
			}
			instance.pencilSize =size;
			instance.canvas.freeDrawingBrush.width = size;
		};

    var bindCanvasEvents = function(instance, menuItems) {
            _bindMouseDownEvents(instance, menuItems);
            _bindObjectEvents(instance);
        },
        draw = function(event, instance, menuItem) {
            var obj, pointer = instance.canvas.getPointer(event.e);
            if(!!event.target){
                return;
            }
            if(menuItem.cssClass.indexOf("sp-text") !== -1) {
                obj = _makeTextBox(instance);
            } else if(menuItem.cssClass.indexOf("sp-line") !== -1) {
                obj = _makeLine(instance, pointer);
            } else if(menuItem.sides !== undefined) {
                obj = _makeRegularShape(menuItem.sides);
            } else {
                obj = _makeIrregularShape(instance.currentTool);
            }

            $(instance.wrapper).find("[data-action='selector']").click();

            if(obj){
                obj.set({
                    left:pointer.x,
                    top:pointer.y,
                    fill: instance.fillColor,
                    stroke: instance.fillColor
                });
                _addToCanvas(instance, obj);
                if(obj.type === "textbox") {
                    showTextArea(instance, obj, pointer);
                }
            }
        },
        takeAction = function(event, instance, menuItem) {
            var action = menuItem.action;
            if(action === "trash") _trash(instance, event);
            if(action === "undo" || action === "redo") _undoOrRedo(instance, event);
        },
        changeDrawConfig = function(instance, menuItem) {
            if(menuItem.cssClass.indexOf("sp-color") !== -1) _changeColor(instance, menuItem.hex);
            if(menuItem.cssClass.indexOf("sp-textsize") !== -1) _changeTextsize(instance, menuItem.size);
			if(menuItem.cssClass.indexOf('sp-pencil-size') !== -1) _changePencilSize(instance, menuItem.size);
            if(menuItem.action.indexOf("background") !== -1) _changeBackground(instance, menuItem);
        },
        loadImage = function(instance, imageUrl, imageAltUrl) {
            _loadImage(instance, imageUrl, imageAltUrl);
        };
    return {
        bindCanvasEvents: bindCanvasEvents,
        takeAction: takeAction,
        loadImage: loadImage,
        draw: draw,
        changeDrawConfig: changeDrawConfig,
        showTextArea: showTextArea,
        hideTextArea: hideTextArea,
        pushToUndoBuffer: pushToUndoBuffer
    }
};
