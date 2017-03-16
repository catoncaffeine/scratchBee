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
                action: "selector",
                class: "sp-selector",
                title: "Select",
                icon: "fa fa-arrows-alt",
                menuActionType: 1
            },
            drawing: {
                action: "drawing",
                class: "sp-drawing",
                title: "Pencil",
                icon: "fa fa-pencil",
                menuActionType: 1
            },
            trash: {
                action: "trash",
                class: "sp-trash",
                title: "Delete",
                icon: "fa fa-trash",
                menuActionType: 2
            },
            undo: {
                action: "undo",
                class:'sp-undo disabled',
                title: 'Undo',
                icon: "fa fa-undo",
                menuActionType: 0
            },
            redo: {
                action: "redo",
                class: 'sp-redo disabled',
                title: 'Redo',
                icon: "fa fa-repeat",
                menuActionType: 0
            },
            text: {
                action: "text",
                class:'sp-text',
                title:'Add Text',
                icon: "fa fa-font",
                menuActionType: 1
            },
            line:{
                action: "line",
                class: 'sp-draw sp-line',
                icon: "sp-icon sp-line-i",
                title:'Line',
                menuActionType: 1,
                sides: 1,
                group: 0
            },
            ray: {
                action: "ray",
                class: 'sp-draw sp-line',
                icon: 'fa fa-long-arrow-right',
                title: 'Ray',
                menuActionType: 1,
                group: 0
            },
            doubleray: {
                action: "doubleray",
                class: 'sp-draw sp-line',
                icon: 'fa fa-arrows-h',
                title: 'Double Headed Ray',
                menuActionType: 1,
                group: 0
            },
            circle: {
                action: "circle",
                class: 'sp-draw sp-shape',
                icon: 'fa fa-circle',
                title: 'Circle',
                menuActionType: 1,
                sides: 0,
                group: 0
            },
            eq_triangle :{
                action: "eq_triangle",
                class: 'sp-draw sp-shape',
                icon:'sp-icon sp-eq-triangle',
                title: 'Equilateral Triangle',
                menuActionType: 1,
                sides: 3,
                group: 1
            },
            right_triangle: {
                action: "right_triangle",
                class: 'sp-draw sp-shape',
                icon:'sp-icon sp-right-triangle',
                title:'Right Angled Triangle',
                menuActionType: 1,
                group: 1
            },
            scelene_triangle: {
                action: "scelene_triangle",
                class: 'sp-draw sp-shape',
                icon: 'sp-icon sp-scelene',
                title: 'Scelene Triangle',
                menuActionType: 1,
                group: 1
            },
            square:{
                action: "square",
                class: 'sp-draw sp-shape',
                icon:'sp-icon sp-rectangle',
                title: 'Square',
                menuActionType: 1,
                sides: 4,
                group: 2
            },
            parallelogram:{
                action: "parallelogram",
                class: 'sp-draw sp-shape',
                icon: 'sp-icon sp-parallelogram',
                title: 'Parallelogram',
                menuActionType: 1,
                group: 2
            },
            eq_trapezoid: {
                action: "eq_trapezoid",
                class: 'sp-draw sp-shape',
                icon: 'sp-icon sp-eq-trapezoid',
                title: 'Equilateral Trapezoid',
                menuActionType: 1,
                group: 2
            },
            trapezoid: {
                action: "trapezoid",
                class: 'sp-draw sp-shape',
                icon:'sp-icon sp-trapezoid',
                title: 'Trapezoid',
                menuActionType: 1,
                group: 2
            },
            pentagon: {
                action: "pentagon",
                class: 'sp-draw sp-shape',
                icon: 'sp-icon sp-pentagon',
                title: 'Pentagon',
                menuActionType: 1,
                sides: 5,
                group: 3
            },
            hexagon: {
                action: "hexagon",
                class: 'sp-draw sp-shape',
                icon: 'sp-icon sp-hexagon',
                title: 'Hexagon',
                menuActionType: 1,
                sides: 6,
                group: 3
            },
            octagon: {
                action: "octagon",
                class: 'sp-draw sp-shape',
                icon: 'sp-icon sp-octagon',
                title: 'Octagon',
                sides: 8,
                group: 3
            },
            decagon: {
                action: "decagon",
                class: 'sp-draw sp-shape',
                icon: 'sp-icon sp-decagon',
                title: 'Decagon',
                menuActionType: 1,
                sides: 10,
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
                    menuItems.square, menuItems.parallelogram, menuItems.eq_trapezoid, menuItems.trapezoid,
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
            var config = config || {};
            instance.domElement = $(wrapper)[0];
            instance.menu = config.menu || getDefaultMenu();
            instance.dimension = config.dimension || getDefaultDimension();
            instance.defaultAction = config.defaultAction || getDefaultAction();
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
            $menu.find("[data-action='drawing']").addClass("active");
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
                +"<div class='sp-menu-action "+menuItem.class+"' "
                    +"data-action='"+menuItem.action+"' "
                    +"data-toggle='tooltip' "
                    +"title='"+menuItem.title+"'"
                +">"
                    +"<i class='"+menuItem.icon+"'></i>"
                +"</div>";
        },
        getDefaultMenu = function() {
            //extract this//
            return [menuItems.selector, menuItems.drawing, menuItems.trash];
        },
        getDefaultDimension = function() {
            return {width: 500, height: 500};
        },
        getDefaultAction = function() {
            return menuItems.selector.action;
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
            drawer.bindMouseDownEvents(instance, menuItems);
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
                $(instance.wrapper).find("[data-action='"+instance.defaultAction+"']").addClass("active");
                changeCurrentTool(instance, instance.defaultAction);
            } else {
                $(instance.wrapper).find(".sp-menu .active").removeClass("active");
                $(clickedElement).addClass('active');
                if($dropdown) {
                    // highlight dropdown icon
                    $dropdown.find(".sp-menu-blank").hide();
                    $dropdown.find(".sp-menu-selected").attr("class", "sp-menu-selected " + icon).show();
                }
                changeCurrentTool(instance, $(clickedElement).data("action"));
            }
        },
        changeCurrentTool = function(instance, action) {
            instance.currentTool = action;
            if(action === "drawing") {
                instance.canvas.isDrawingMode = true;
            } else {
                instance.canvas.isDrawingMode = false;
            }
        },
        
        bindMenuEvents = function(instance, drawer) {
            $(instance.wrapper).on("click", ".sp-menu-action", function() {
                var action = $(this).data("action");
                var actionType = menuItems[action].menuActionType;
                if(actionType == menuActionType.immediate) {
                    drawer.takeAction(null, instance, action);
                } else {
                    toggleActiveMenu(instance, this);
                    if(actionType == menuActionType.both){
                        drawer.takeAction(null, instance, instance.currentTool);
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
        getDefaultDimension: getDefaultDimension,
        getDefaultAction: getDefaultAction
    };
};

function ScratchPadDrawer() {
    var bindMouseDownEvents = function(instance, menuItems){
        var drawer = this;
            instance.canvas.on('mouse:down', function(e){
                if(instance.currentTool) {
                    var menuItem = menuItems[instance.currentTool];
                    if(menuItem.class.indexOf("sp-draw") !== -1) {
                        drawer.draw(e, instance, menuItem);
                    } else {
                        drawer.takeAction(e, instance, menuItem.action);
                    }
                }
            })
        },
        draw = function(event, instance, menuItem) {
            var obj, pointer = instance.canvas.getPointer(event.e);
            if(event && event.target){
                return;
            }
            if(menuItem.class.indexOf("sp-line") !== -1) {
                obj = makeLine(instance, menuItem.action);
            } else if(menuItem.sides !== undefined) {
                obj = makeRegularShape(menuItem.sides);
            } else {
                obj = makeIrregularShape(instance.currentTool);
            }
            if(obj){
                obj.set({left:pointer.x,top:pointer.y})
                addToCanvas(instance, obj);
            }
        },
        makeLine = function(instance, event) {
            var pointer = instance.canvas.getPointer(event.e)
            var _x = pointer.x;
            var _y = pointer.y;
            var tool = new fabric.Line([_x,_y,_x+100,_y],{left:_x, top:_y,stroke:'black',strokeWidth:2});
            if(instance.currentTool === 'ray'){
                tool = makeRay({length:100, width:4,startX:_x, startY:_y });
            } else if(instance.currentTool === 'doubleray'){
                tool = makeRay({length:100, width:4,startX:_x+15, startY:_y, doubleHeaded:true });
            }
            return tool;
        },
        makeRay = function(config) {
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
        makeRegularShape = function(sides) {
            if(sides === 0) {
                return new fabric.Circle({radius:50, fill:'black'});
            } else if(sides === 3) {
                return  new fabric.Triangle({height:100, width:100});
            } else if(sides === 4) {
                return  new fabric.Rect({width:100, height:100, fill:'black'});
            } else {
                return makeEqualSidedShapes(sides);
            }
        },
        makeEqualSidedShapes = function(sides, config) {
            var _sides = sides || 4, //just in case
                _stroke = "black", //future feature
                _fill = 'black', //future feature
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

            var pol = new fabric.Polygon(coords,{
                stroke:_stroke,fill:_fill
            });
            return pol;
        },
        makeIrregularShape = function(shape) {
            switch (shape) { 
                case "right_triangle":
                    return new fabric.Polygon([{x:0,y:0}, {x:0, y:100},{x:100, y:100}]);
                case "scelene_triangle":
                    return new fabric.Polygon([{x:100,y:100},{x:200,y:35},{x:160,y:100}]);
                case 'parallelogram':
                    return new fabric.Rect({width:100, height:50, fill:'black',skewX:320});
                case 'eq_trapezoid':
                    return new fabric.Polygon([{x:30, y:150}, {x:120, y:150}, {x:150, y: 225}, {x:0, y:225}],{fill:'black'});
                case 'trapezoid':
                    return new fabric.Polygon([{x:60,y:150}, {x:150, y: 150}, {x:150, y: 225}, {x:0, y:225}],{fill:'black'});
                default: 
                    return;
            }
        },
        takeAction = function(event, instance, action) {
            //text, trash, redo, undo
            //both from menu and mouse down
            if(typeof this[action] === 'function') {
                this[action](instance, event);    
            }
        },
        text = function(instance, event){
            if(event && event.target){
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
        trash = function(instance, event){
            var canvas = instance.canvas;
            instance.canvas.isDrawingMode = false;
            var activeGroup = canvas.getActiveGroup();
            var activeObject = canvas.getActiveObject();
            if(activeGroup) {
                var objects = activeGroup.getObjects();
                canvas.discardActiveGroup(); 
                objects.forEach(function(object){
                    canvas.remove(object);
                })
            } else if(activeObject){
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
        takeAction: takeAction,
        trash: trash,
        text: text,
        draw: draw
    }
};
