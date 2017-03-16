var ScratchPad = { // allows the client to create, manipulate, and destroy scratchpad instances
	instances: {},
    builder: null,
    drawer: null,
	init: function(wrapper, config) {
        if(!ScratchPad.builder) {
            ScratchPad.builder = new ScratchPadBuilder();
        }
        if(!ScratchPad.drawer) {
            ScratchPad.drawer = new ScratchPadDrawer();
        }
		var instance = ScratchPad.builder.build(wrapper, config, ScratchPad.drawer);
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
		return ScratchPad.instances[id] ?  ScratchPad.instances[id].canvas.toDataURL() : "";
	},
	destroyAll:  function(){
		Object.keys(ScratchPad.instances).forEach(function(ele){ 
			var instance = ScratchPad.instances[ele]; 
			ScratchPad.destroyInstance(instance);
		}); 
		ScratchPad=null
	},
	destroyInstance: function(instance){
		if(instance !== undefined && ScratchPad.instances[instance.id]){
			instance.canvas.dispose();

			$(instance.domElement).empty();
			delete ScratchPad.instances[instance.id];
		}
	},
	destroyInstanceById: function(id){
		if(ScratchPad.instances[id]){
			ScratchPad.destroyInstance(ScratchPad.instances[id]);
		}
	}
}

function ScratchPadBuilder() {
    var menuItems = {
            // can we use arrays here
            selector: {
                class: "sp-selector",
                title: "Select",
                icon: "fa fa-arrows-alt",
                menuActionType: 1
            },
            drawing: {
                class: "sp-drawing",
                title: "Pencil",
                icon: "fa fa-pencil",
                menuActionType: 1
            },
            trash: {
                class: "sp-trash",
                title: "Delete",
                icon: "fa fa-trash",
                menuActionType: 2
            },
            undo: {
                class:'sp-undo disabled',
                title: 'Undo',
                icon: "fa fa-undo",
                menuActionType: 0
            },
            redo: {
                class: 'sp-redo disabled',
                title: 'Redo',
                icon: "fa fa-repeat",
                menuActionType: 0
            },
            text: {
                class:'sp-text',
                title:'Add Text',
                icon: "fa fa-font",
                menuActionType: 1
            },
            line:{
                class: 'sp-line',
                icon: "sp-icon sp-line",
                title:'Line',
                menuActionType: 1,
                group: 0
            },
            ray: {
                class: 'sp-ray',
                icon: 'fa fa-long-arrow-right',
                title: 'Ray',
                menuActionType: 1,
                group: 0
            },
            doubleray: {
                class: 'sp-double-ray',
                icon: 'fa fa-arrows-h',
                title: 'Double Headed Ray',
                menuActionType: 1,
                group: 0
            },
            circle: {
                class: 'sp-circle',
                icon: 'fa fa-circle',
                title: 'Circle',
                menuActionType: 1,
                group: 0
            },
            eq_triangle :{
                class: 'sp-eq-triangle',
                icon:'sp-icon sp-eq-triangle',
                title: 'Equilateral Triangle',
                menuActionType: 1,
                group: 1
            },
            right_triangle: {
                class: 'sp-right-triangle',
                icon:'sp-icon sp-right-triangle',
                title:'Right Angled Triangle',
                menuActionType: 1,
                group: 1
            },
            scelene_triangle: {
                class: 'sp-scelene',
                icon: 'sp-icon sp-scelene',
                title: 'Scelene Triangle',
                menuActionType: 1,
                group: 1
            },
            rectangle:{
                class: 'sp-rectangle',
                icon:'sp-icon sp-rectangle',
                title: 'Rectangle',
                menuActionType: 1,
                group: 2
            },
            parallelogram:{
                class: 'sp-parallelogram',
                icon: 'sp-icon sp-parallelogram',
                title: 'Parallelogram',
                menuActionType: 1,
                group: 2
            },
            trapezoid_1: {
                class: 'sp-eq-trapezoid',
                icon: 'sp-icon sp-eq-trapezoid',
                title: 'Equilateral Trapezoid',
                menuActionType: 1,
                group: 2
            },
            trapezoid_2: {
                class: 'sp-trapezoid',
                icon:'sp-icon sp-trapezoid',
                title: 'Trapezoid',
                menuActionType: 1,
                group: 2
            },
            pentagon: {
                class: 'sp-pentagon',
                icon: 'sp-icon sp-pentagon',
                title: 'Pentagon',
                menuActionType: 1,
                group: 3
            },
            hexagon: {
                class: 'sp-hexagon',
                icon: 'sp-icon sp-hexagon',
                title: 'Hexagon',
                menuActionType: 1,
                group: 3
            },
            octagon: {
                class: 'sp-octagon',
                icon: 'sp-icon sp-octagon',
                title: 'Octagon',
                group: 3
            },
            decagon: {
            class: 'sp-decagon',
            icon: 'sp-icon sp-decagon',
            title: 'Decagon',
            menuActionType: 1,
            group: 3
        }
        },
        menuChunks = {
            basic: {
                class: "sp-menu-basic",
                items: [menuItems.selector, menuItems.drawing, menuItems.trash],
                type: "group"
            },
            undo: {
                class: "sp-menu-undo",
                items: [menuItems.undo, menuItems.redo],
                type: "group"
            },
            text: {
                class: "sp-menu-text",
                items: [menuItems.text],
                type: "group"
            },
            shapes: {
                class: "sp-menu-shapes",
                items:[
                    menuItems.line, menuItems.ray, menuItems.doubleray, menuItems.circle, 
                    menuItems.eq_triangle, menuItems.right_triangle, menuItems.scelene_triangle,
                    menuItems.rectangle, menuItems.parallelogram, menuItems.trapezoid_1, menuItems.trapezoid_2,
                    menuItems.pentagon, menuItems.hexagon, menuItems.octagon, menuItems.decagon
                ], 
                type: "dropdown",
                title: "Shapes",
                icon: "shapes-icon"
            }
        },
        menuActionType = {
            "immediate": 0,
            "defer": 1,
            "both": 2
        },
        buildInstance = function(wrapper, config) {
            var identifier = new Date().getTime();
            var instance = {id: "sp_" + identifier};
            instance.domElement = $(wrapper)[0];

            if(config === undefined || config.menu === undefined) {
                instance.menu = getDefaultMenu();
            } else {
                instance.menu = config.menu;
            }

            if(config === undefined || config.dimension === undefined) {
                instance.dimension = getDefaultDimension();
            } else {
                instance.dimension = config.dimension;
            }

            if(config !== undefined && config.menus !== undefined){
                instance.menus = config.menus;
            }
            instance.wrapper = $(""
                            +"<div class='sp-wrapper panel panel-default' data-sp-id='"+instance.id+"'"
                            +   "style='display:inline-block'>"+
                            +"</div>")[0];
            return instance;
        },
        buildMenu = function(instance) {
            $(instance.wrapper).append("<div class='sp-menu panel-heading'></div>");
            var $menu = $(instance.wrapper).find(".sp-menu");
            var divider = "<span class='vertical-divider'></span>";        
            Object.keys(menuChunks).forEach(function(key) {
                if(key === "basic"|| instance.menu.indexOf(key) !== -1) {
                    var $chunk;
                    if(menuChunks[key].type === "dropdown") {
                        $chunk = buildMenuDropDown(menuChunks[key]);
                    } else {
                        $chunk = buildMenuChunk(menuChunks[key]);    
                    }
                    $chunk.appendTo($menu);
                    $(divider).appendTo($menu);
                }
            });
            //make this user defined//
            $menu.find("[data-action='sp-drawing']").addClass("active");
        },
        buildMenuChunk = function(chunk) {
            var $chunk = $("<span class='sp-menu-chunk "+chunk.class+"'></span>");
            chunk.items.forEach(function(menuItem){
                $chunk.append(buildMenuButton(menuItem));
            });
            return $chunk;
        },
        buildMenuDropDown = function(chunk) {
            var $chunk = $(""
                +"<div class='btn-group sp-dropdown "+chunk.class+"'>"
                +   "<a class='btn dropdown-toggle' title='"+chunk.title+"' data-toggle='dropdown' href='#'>"
                +       "<i class='sp-menu-blank "+chunk.icon+"'></i>"
                +       "<i class='sp-menu-selected hidden'></i>"
                +   "</a>"
                +   "<ul class='min-dropdown-width dropdown-menu'></ul>"
                +"</div>"),
                
                $ul = $chunk.find("ul");
            
            chunk.items.forEach(function(menuItem){
                var group = menuItem.group || 0;
                var $li = $chunk.find("ul li[data-group='"+group+"']");
                if(!$li.length) {
                    if(group) {
                        $ul.append("<li class='divider'></li>");
                    }
                    $li = $("<li data-group='"+group+"'></li>");
                    $li.appendTo($ul);
                }
                
                $li.append(buildMenuButton(menuItem));
            });
            return $chunk;
        },
        buildMenuButton = function(menuItem) {
            return ""
                +"<div class='sp-menu-action' "
                    +"data-action='"+menuItem.class+"' "
                    +"data-action-type='"+menuItem.menuActionType+"'"
                    +"data-toggle='tooltip' "
                    +"title='"+menuItem.title+"'"
                +">"
                    +"<i class='"+menuItem.icon+"'></i>"
                +"</div>";
        },
        getDefaultMenu = function() {
            return [menuItems.selector, menuItems.drawing, menuItems.trash];
        },
        getDefaultDimension = function() {
            return {width: 500, height: 500};
        },
        buildPad = function(instance){
            var width = instance.dimension.width, height = instance.dimension.height;
            $(instance.wrapper).find(".sp-menu")
                               .after(""
                                   + "<div class='sp-canvas-wrapper panel-body'>"
                                   +    "<canvas class='sp-canvas' id='"+instance.id+"' width='"+width+"' height='"+height+"'></canvas>"
                                   + "</div>");
        },
        renderScratchPad = function(instance, drawer){
            $(instance.wrapper).appendTo($(instance.domElement));
            bindMenuEvents(instance, drawer);
        },
        convertToFabric = function(instance, drawer) {
            instance.canvas = new fabric.Canvas(instance.id, {isDrawingMode: true});
            instance.canvas.freeDrawingBrush = new fabric.PencilBrush(instance.canvas);
            instance.canvas.freeDrawingBrush.width = 2;
            drawer.bindMouseDownEvents(instance);
        },
        
        toggleActiveMenu =  function(instance, clickedElement){
            var $dropdown = $(clickedElement).closest(".sp-dropdown"),
                icon = $(clickedElement).find("i").attr("class");
            if($(clickedElement).hasClass('active')) {
                $(clickedElement).removeClass('active');
                if($dropdown) {
                    $dropdown.find(".sp-menu-blank").show();
                    $dropdown.find(".sp-menu-selected").attr("class", ".sp-menu-selected").hide();
                }
                return $(instance.wrapper).find("[data-action='sp-selector']").addClass("active");
            } else {
                $(instance.wrapper).find(".sp-menu .active").removeClass("active");
                $(clickedElement).addClass('active');
                if($dropdown) {
                    // highlight dropdown icon
                    $dropdown.find(".sp-menu-blank").hide();
                    $dropdown.find(".sp-menu-selected").attr("class", "sp-menu-selected " + icon).show();
                }
                return $(clickedElement);
            }
        },
        
        bindMenuEvents = function(instance, drawer) {
            $(instance.wrapper).on("click", ".sp-menu-action", function() {
                var actionType = $(this).data("action-type");
                if(actionType == menuActionType.immediate) {
                    drawer.takeMenuAction(instance, $(this));
                } else {
                    var $currentTool = toggleActiveMenu(instance, this);
                    drawer.changeCurrentTool(instance, $currentTool);
                    if(actionType == menuActionType.both){

                        drawer.takeMenuAction(instance, $currentTool);
                    }
                }
            });

            $(instance.wrapper).on('click', 'i.sp-undo', function(){

                var current = this;
                if($(current).hasClass('disabled')){
                    return;
                }
                if(instance.undo){
                    var obj = instance.undo.pop();
                    instance.canvas.remove(obj);
                    if(!instance.redo){
                        instance.redo = [];
                    }
                    instance.redo.push(obj);
                    $(instance.wrapper).find('i.sp-redo').removeClass('disabled');
                }
                if(instance.undo.length === 0){
                    $(current).addClass('disabled');
                }
            });
            $(instance.wrapper).on('click','i.sp-redo', function(){

                var current = this;
                if($(current).hasClass('disabled')){
                    return;
                }
                if(instance.redo){
                    var obj = instance.redo.pop();
                    instance.canvas.add(obj);
                }
                if(instance.redo.length ===0){
                    $(current).addClass('disabled');
                }
            });
        };
    
    var build = function(wrapper, config, drawer){
        var instance = buildInstance(wrapper, config);
        buildMenu(instance);
		buildPad(instance);
		renderScratchPad(instance, drawer);
		convertToFabric(instance, drawer);
        return instance;
    };
    return {
        build: build,
        getDefaultMenu: getDefaultMenu,
        getDefaultDimension: getDefaultDimension
    };
};

function ScratchPadDrawer() {
    var bindMouseDownEvents = function(instance, drawer){
            instance.canvas.on('mouse:down', function(e){
                var action = $(instance.currentTool).data("action");
                if(instance.currentTool){
                    switch(action){	
                        case 'sp-text':
                            bindTextPlaceHandler(instance,e);
                            instance.currentTool = '';
                            break;
                        case 'sp-trash':
                            bindDeletionHandler(instance, e);
                            break;
                        case 'sp-eq-triangle':		
                        case 'sp-right-triangle':
                        case 'sp-scelene':
                            bindTriangleHandler(instance,e);
                            break;
                        case 'sp-line':
                        case 'sp-ray':
                        case 'sp-double-ray':
                            bindLineTools(instance,e);
                            break;
                        case 'sp-circle':
                        case 'sp-rectangle':
                        case 'sp-parallelogram':
                        case 'sp-eq-trapezoid':
                        case 'sp-trapezoid':
                        case 'sp-decagon':
                        case 'sp-octagon':
                        case 'sp-pentagon':
                        case 'sp-hexagon':
                            bindShapeTools(instance,e);
                            break;
                    }
                }
            })
        },
        changeCurrentTool = function(instance, tool) {
            var action = $(tool).data("action");
            instance.currentTool = tool;
            if(action === "sp-drawing") {
                instance.canvas.isDrawingMode = true;
            } else {
                instance.canvas.isDrawingMode = false;
            }
        },
        takeMenuAction = function(instance, tool) {
            var action = $(tool).data("action");
            if(action === "sp-trash") {
                var current = this;
                instance.canvas.isDrawingMode = false;
                bindDeletionHandler(instance);
            }
        },
        bindTextPlaceHandler = function(instance, event){
            if(event.target){
                return;
            }
            var pointer = instance.canvas.getPointer(event.e);
            addToCanvas(instance, new fabric.Textbox('Click to add text',{
                fontSize: 20, 
                left:pointer.x,
                top:pointer.y,
                width:150})
            );

        },
        bindDeletionHandler = function(instance,event){
            var canvas = instance.canvas;
            var activeGroup = canvas.getActiveGroup();
            var activeObject = canvas.getActiveObject();
            if(activeGroup){
                var objects = activeGroup.getObjects();
                canvas.discardActiveGroup(); 
                objects.forEach(function(object){
                    canvas.remove(object);
                })
            }else if(activeObject){

                /*
                 * I-Text objects bubble the mousedown event.
                 * Since it is being deleted, canvas object from iText is removed
                 * and mouse event fails with error. So removing the event from textbox
                */
                if(activeObject.type === 'textbox'){
                    activeObject.off('mousedown');
                }
                canvas.remove(activeObject);
            }

        },
        bindTriangleHandler = function(instance, event){
            if(event.target){
                return;
            }

            var pointer = instance.canvas.getPointer(event.e);
            var _left = pointer.x;
            var _top = pointer.y;
            var triangle;
            var action = $(instance.currentTool).data("action");
            
            if(action ==='sp-right-triangle') {	
                triangle = new fabric.Polygon([{x:0,y:0}, {x:0, y:100},{x:100, y:100}]);
            }else if(action === 'sp-scelene' ) {
                triangle = new fabric.Polygon([
                    {x:100,y:100},{x:200,y:35},{x:160,y:100}
                ])
            } else { //default to eq-triangle
                triangle = new fabric.Triangle({height:100, width:100});
            }
            triangle.set({left:_left,top:_top})
            addToCanvas(instance, triangle);
        },
        bindLineTools = function(instance, event){
            if(event.target){
                return;
            }
            var pointer = instance.canvas.getPointer(event.e)
            var _x = pointer.x;
            var _y = pointer.y;
            var tool = new fabric.Line([_x,_y,_x+100,_y],{left:_x, top:_y,stroke:'black',strokeWidth:2});
            var action = $(instance.currentTool).data("action");
            if(action === 'sp-ray'){
                tool = ScratchPadTools.buildRay({length:100, width:4,startX:_x, startY:_y });
            }else if(action === 'sp-double-ray'){
                tool = ScratchPadTools.buildRay({length:100, width:4,startX:_x+15, startY:_y, doubleHeaded:true });
            }
            addToCanvas(instance,tool);
        },
        bindShapeTools = function(instance, event){
            if(event.target){
                return;
            }
            var action = $(instance.currentTool).data("action");
            var obj;
            var pointer = instance.canvas.getPointer(event.e);

            switch (action){
                case 'sp-circle':
                    obj = new fabric.Circle({radius:50, fill:'black'});
                    break;
                case 'sp-parallelogram':
                    obj = new fabric.Rect({width:100, height:50, fill:'black',skewX:320});
                    break;
                case 'sp-rectangle':
                    obj = new fabric.Rect({width:100, height:100, fill:'black'});
                    break;
                case 'sp-eq-trapezoid':
                    obj = new fabric.Polygon([{x:30, y:150}, {x:120, y:150}, {x:150, y: 225}, {x:0, y:225}],{fill:'black'});
                    break;
                case 'sp-trapezoid':
                    obj = new fabric.Polygon([{x:60,y:150}, {x:150, y: 150}, {x:150, y: 225}, {x:0, y:225}],{fill:'black'});
                    break;
                case 'sp-hexagon':
                    obj = ScratchPadTools.createPolygon({sides:6,centerX:pointer.x,centerY:pointer.y,size: 60});
                    break;
                case 'sp-pentagon':
                    obj = ScratchPadTools.createPolygon({sides:5,centerX:pointer.x,centerY:pointer.y,size: 60});
                    break;
                case 'sp-octagon':
                    obj = ScratchPadTools.createPolygon({sides:8,centerX:pointer.x,centerY:pointer.y,size: 60});
                    break;
                case 'sp-decagon':
                    obj = ScratchPadTools.createPolygon({sides:10,centerX:pointer.x,centerY:pointer.y,size: 60});
                    break;

            }
            
            if(obj){
                obj.set({left:pointer.x,top:pointer.y})
                addToCanvas(instance, obj);
            }
        },
        pushToUndoBuffer = function(instance,object){
            $(instance.wrapper).find('i.sp-undo').removeClass('disabled');
            if(!instance.undo){
                instance.undo = [];
            }
            instance.undo.push(object);
        },
        addToCanvas = function(instance, object){
            instance.canvas.add(object);
            pushToUndoBuffer(instance,object);
        };
    return {
        bindMouseDownEvents: bindMouseDownEvents,
        changeCurrentTool: changeCurrentTool,
        takeMenuAction: takeMenuAction
    }
};
