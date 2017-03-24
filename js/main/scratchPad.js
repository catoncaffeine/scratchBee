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
		return ScratchPad.instances[id] ?  ScratchPad.instances[id].canvas.toDataURL() : "";
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
		if(ScratchPad.instances[id]) {         
            ScratchPad.instances[id].canvas.dispose();
            $(ScratchPad.instances[id].domElement).empty();
            delete ScratchPad.instances[id];
		}
	},
    menu: {
        undo: "undo",
        text: "text",
        shapes: "shapes"
    }
};

function ScratchPadBuilder() {
    var drawer = null,
        resourceImported = false,
        menuItems = {
            selector: {
                action: "selector",
                class: "sp-selector",
                title: "Select",
                icon: "fa fa-arrows-alt",
                menuActionType: 1
            },
            pencil: {
                action: "pencil",
                class: "sp-pencil",
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
                class:'sp-draw sp-text',
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
                icon:'sp-icon sp-square',
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
                items: [menuItems.selector, menuItems.pencil, menuItems.trash],
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
            instance.toggleable = !!config.toggleable;
            instance.wrapper = $("<div class='sp-wrapper' data-sp-id='"+instance.id+"'></div>")[0];
            return instance;
        },
        buildToggleButton = function(instance) {
            $(instance.wrapper).append(""
                +"<div class='sp-toggle-btn sp-hide'>"
                +"  <i class='fa fa-minus'></i>"
                +"</div>"
                +"<div class='sp-toggle-btn sp-show'>"
                +"  <i class='fa fa-paint-brush'></i>"
                +"</div>");
        },
        buildMenu = function(instance) {
            $(instance.wrapper).append(""
                    +"<div class='sp-panel panel panel-default'>"
                    +"  <div class='sp-menu panel-heading'>"
                    +"  </div>"
                    +"</div>");
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
            //make this user defined
            $menu.find("[data-action='pencil']").addClass("active");
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
                +   "<div class='dropdown-toggle' title='"+chunk.title+"' data-toggle='dropdown'>"
                +       "<i class='sp-menu-blank "+chunk.icon+"'></i>"
                +       "<i class='sp-menu-selected hidden'></i>"
                +   "</div>"
                +   "<ul class='min-dropdown-width dropdown-menu'></ul>"
                +"</div>"),
                
                $ul = $chunk.find("ul");
            
            chunk.items.forEach(function(menuItem) {
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
            return [menuItems.selector, menuItems.pencil, menuItems.trash];
        },
        getDefaultDimension = function() {
            return {width: 500, height: 500};
        },
        getDefaultAction = function() {
            return menuItems.pencil.action;
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
            if(instance.toggleable) {
                bindToggleEvents(instance);
            }
        },
        convertToFabric = function(instance, drawer) {
            instance.canvas = new fabric.Canvas(instance.id, {
                isDrawingMode: true,
                stateful:true,
                enableRetinaScaling:false
            });
            instance.canvas.freeDrawingBrush = new fabric.PencilBrush(instance.canvas);
            instance.canvas.freeDrawingBrush.width = 2;
            drawer.bindCanvasEvents(instance, menuItems);
        },
        
        toggleActiveMenu =  function(instance, clickedElement){
            var $menu = $(instance.wrapper).find(".sp-menu"),
                $dropdowns = $menu.find(".sp-dropdown"),
                $dropdown = $(clickedElement).closest(".sp-dropdown"),
                icon = $(clickedElement).find("i").attr("class");
            
            //reset all icons in dropdown sub menus
            if($dropdowns.length) {
                $dropdowns.find(".dropdown-toggle").removeClass("active");
                $dropdowns.find(".sp-menu-blank").show();
                $dropdowns.find(".sp-menu-selected").attr("class", "sp-menu-selected").hide();
            }
            
            if($(clickedElement).hasClass('active')) {
                $(clickedElement).removeClass('active');
                $(instance.wrapper).find("[data-action='"+instance.defaultAction+"']").addClass("active");
                changeCurrentTool(instance, instance.defaultAction);
            } else {
                $(instance.wrapper).find(".sp-menu .active").removeClass("active");
                $(clickedElement).addClass('active');
                
                //change icon for this particular drop down
                if($dropdown) {
                    $dropdown.find(".dropdown-toggle").addClass("active");
                    $dropdown.find(".sp-menu-blank").hide();
                    $dropdown.find(".sp-menu-selected").attr("class", "sp-menu-selected " + icon).show();
                }
                changeCurrentTool(instance, $(clickedElement).data("action"));
            }
        },
        changeCurrentTool = function(instance, action) {
            instance.currentTool = action;
            if(action === "pencil") {
                instance.canvas.isDrawingMode = true;
            } else {
                instance.canvas.isDrawingMode = false;
            }
        },
        bindToggleEvents = function(instance) {
            $(instance.wrapper).on("click", ".sp-toggle-btn", function(){
                var $wrapper = $(instance.wrapper),
                    width = instance.dimension.width,
                    left = $wrapper.hasClass("sp-hidden") ? "auto": (width-28) + "px";
                
                $(instance.wrapper).toggleClass("sp-hidden");
                $(instance.wrapper).css({left: left});
                
            });
        },
        bindMenuEvents = function(instance, drawer) {
            $(instance.wrapper).on("click", ".sp-menu-action", function(event) {
                var action = $(this).data("action");
                var actionType = menuItems[action].menuActionType;
                if(actionType == menuActionType.immediate) {
                    drawer.takeAction(event, instance, action);
                } else {
                    toggleActiveMenu(instance, this);
                    if(actionType == menuActionType.both){
                        drawer.takeAction(event, instance, instance.currentTool);
                    }
                }
            });
        },
        importResource = function() {
            var $jsFile = $("script[src*='scratchPad.js']"),
                jsPath = $jsFile.attr("src").toString(),
                cssPath = jsPath.replace("js/main/scratchPad.js", "resource/scratchpad.css");
            
            var cssFile = document.createElement("link");
            cssFile.setAttribute("rel", "stylesheet");
            cssFile.setAttribute("href", cssPath);
            $jsFile.after($(cssFile));
            resourceImported = true;
        },
        build = function(wrapper, config){
            if (!resourceImported) {
                importResource()
            } 
            if(!drawer) {
                drawer = new ScratchPadDrawer();
            }

            var instance = buildInstance(wrapper, config);
            if(instance.toggleable) {
                buildToggleButton(instance);
            }
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
	var _add = 1, _delete = 2, _modify = 3,
        bindCanvasEvents = function(instance, menuItems) {
            bindMouseDownEvents(instance, menuItems);
            bindObjectEvents(instance);
        },
        bindObjectEvents = function(instance){
            instance.canvas.on('object:modified', function(e){
                if(!instance.onUndoRedo  && instance.currentTool !=='trash'){
                    trackObjectHistory(instance,_modify);
                }
            });
            instance.canvas.on('object:selected', function(e){
                if(instance.currentTool !== 'trash'){
                    captureSelectedObject(instance);
                }
            });

            instance.canvas.on('object:added', function(e){
                if(!instance.onUndoRedo){
                    trackObjectHistory(instance,_add);
                }
            });
        },
        bindMouseDownEvents = function(instance, menuItems){
            instance.canvas.on('mouse:down', function(e){
                if(instance.currentTool) {
                    var menuItem = menuItems[instance.currentTool];
                    if(menuItem.class.indexOf("sp-draw") !== -1) {
                        draw(e, instance, menuItem);
                    } else {
                        takeAction(e, instance, menuItem.action);
                    }
                }
            })
        },
        draw = function(event, instance, menuItem) {
            var obj, pointer = instance.canvas.getPointer(event.e);
            if(!!event.target){
                return;
            }
            if(menuItem.class.indexOf("sp-text") !== -1) {
                obj = makeTextBox();
            } else if(menuItem.class.indexOf("sp-line") !== -1) {
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
            
            $(instance.wrapper).find("[data-action='selector']").click();
        },
        makeTextBox = function() {
            return new fabric.Textbox('Click to add text',{
                fontSize: 20, 
                width:150});
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
            if(action === "trash") trash(instance, event);
            if(action === "undo" || action === "redo") undoOrRedo(instance, event);
        },
        trash = function(instance, event){
			var canvas = instance.canvas;
			var itemNums = []; // item numbers on the canvas

			$.each(canvas.getObjects(), function(index, item){
			 if (item.active === true ) {
			   item.set({ selectable: false, visible: false });
			   itemNums.push(index);
			 }
			});

			if(itemNums.length>0){
				
				instance.undo.push({
				   "action" : _delete,
				   "itemIndex": itemNums,
					"itemType":'Object'
				});
				canvas.deactivateAll();
				canvas.renderAll();
			}
        },
        
        addToCanvas = function(instance, object){
            instance.canvas.add(object);
        },
		trackObjectHistory = function(instance, action){
			$(instance.wrapper).find('.sp-undo').removeClass('disabled');
			if(!instance.undo){
				instance.undo = [];
			}
			if(instance.undo.length === 10){
				instance.undo.shift();
			}
			var objects = instance.canvas.getObjects();

			if(action === _modify){
				var activeObject = instance.canvas.getActiveObject();
				var activeGroup = instance.canvas.getActiveGroup();
				if(activeGroup){
					
					instance.undo.push(instance.selectedObject.pop());
					if(activeGroup){
						captureSelectedObject(instance, activeGroup);
					}
				}else {
					
					if(instance.selectedObject){
						//iText instances are not an active object. Hence read any object changes when it is selected.
						var selectedObject = instance.selectedObject.pop();

						$.extend(selectedObject,{'action':action});
						instance.undo.push(selectedObject);
						if(activeObject){
							activeObject.saveState();
							//track further changes while still selected (anything other than text objects).
							captureSelectedObject(instance, activeObject);
						}
					}
				}

			}else{

				instance.undo.push({"action": action,"itemIndex": [objects.length - 1],"itemType":"Object"});
			}
		},
		undoOrRedo = function(instance, event){
            if(!instance.undo) instance.undo = [];
            if(!instance.redo) instance.redo = [];
            
            var buttonOn = $(event.currentTarget),
                action = buttonOn.data("action"),
                antiAction = action === "undo" ?  "redo" : "undo",
                buttonOff = $(instance.wrapper).find("[data-action='"+antiAction+"']"),
                bufferToUse = action === "undo" ? instance.undo : instance.redo,
                bufferToPush = action === "undo" ? instance.redo : instance.undo;
            
			if(bufferToUse.length) {
				var itemNums = [];
				var properties = '';
				var state = bufferToUse.pop();
				var action = state.action;
				var show = true;
				var itemType = state.itemType;
				//turn on flag to prevent event firing
				instance.onUndoRedo = true;
				if (action === _add || action === _delete) {
					if(action === _add){
						action = _delete;
						show = false;
					}else {
						action = _add;
					}
					state.itemIndex.forEach(function(itemIndex){
						instance.canvas.item(itemIndex).set({
							selectable: show,
							visible: show
						});
						
						itemNums.push(itemIndex);
						instance.canvas.item(itemIndex).setCoords();
					});
					instance.canvas.deactivateAll();
				}else if(action ===_modify){

					if(itemType === 'Group'){
						//groups work differently in fabric. it has its own properties and 
						//do not respect properties of the objects in the group.
						properties = JSON.stringify(instance.canvas);
						instance.canvas.clear();
						instance.canvas.loadFromJSON(state.itemProperties, function(){
							//call as callback to make sure json is properly loaded.
							instance.canvas.renderAll();
						});
					}else{
						var item = instance.canvas.item(state.itemIndex[0]);
						properties = JSON.stringify(item._stateProperties);
						item.set(JSON.parse(state.itemProperties));
						item.selectable = item.visible;
						item.setCoords();
						item.saveState();
						itemNums.push(state.itemIndex[0]);
					}

				}

				bufferToPush.push({
					"action": action,
					"itemIndex": itemNums,
					"itemProperties": properties,
					"itemType":itemType
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
		captureSelectedObject = function(instance){
			instance.selectedObject = [];
			var activeGroup = instance.canvas.getActiveGroup();
			if(activeGroup){

				instance.selectedObject.push({"itemType":"Group", "itemProperties": JSON.stringify(instance.canvas), "action":_modify});
			}else{
				$.each(instance.canvas.getObjects(), function(index, item){
					if(item.active === true){
						instance.selectedObject.push({"itemIndex":[index],"itemType":"Object", "itemProperties": JSON.stringify(item._stateProperties)});
					}
				})
			}
			
		};
    return {
        bindCanvasEvents: bindCanvasEvents,
        takeAction: takeAction,
        draw: draw
    }
};
