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
	toggleActiveMenu: function(instance, clickedElement){
		if($(clickedElement).hasClass('active')){
			$(clickedElement).toggleClass('active');
		}else{
            // could make the selector more specific//
			$(instance.wrapper).find(".active").removeClass('active');
			$(clickedElement).addClass('active');
		}
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
	},
	handleClickEvent: function(instance, element){
		instance.canvas.isDrawingMode = false;
		ScratchPad.toggleActiveMenu(instance, element);
		if($(element).hasClass('active')){
			instance.currentTool=$(element).data('action');
		}else{
			instance.currentTool='';
		}
	},
	bindTextPlaceHandler: function(instance, event){
		if(event.target){
			return;
		}
		var pointer = instance.canvas.getPointer(event.e);
		ScratchPad.addToCanvas(instance, new fabric.Textbox('Click to add text',{
			fontSize: 20, 
			left:pointer.x,
			top:pointer.y,
			width:150})
		);
		
	},
	bindDeletionHandler: function(canvas,event){
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
	bindTriangleHandler: function(instance ,event){
		if(event.target){
			return;
		}
		
		var pointer = instance.canvas.getPointer(event.e);
		var _left = pointer.x;
		var _top = pointer.y;
		var triangle = new fabric.Triangle({height:100, width:100});
		if(instance.currentTool ==='sp-right-triangle'){	
			triangle = new fabric.Polygon([{x:0,y:0}, {x:0, y:100},{x:100, y:100}]);
		}else if(instance.currentTool === 'sp-scelene' ){
			triangle = new fabric.Polygon([
				{x:100,y:100},{x:200,y:35},{x:160,y:100}
			])
		}
		triangle.set({left:_left,top:_top})
		ScratchPad.addToCanvas(instance, triangle);
	},
	bindLineTools: function(instance, event){
		if(event.target){
			return;
		}
		var pointer = instance.canvas.getPointer(event.e)
		var _x = pointer.x;
		var _y = pointer.y;
		var tool = new fabric.Line([_x,_y,_x+100,_y],{left:_x, top:_y,stroke:'black',strokeWidth:2});
		if(instance.currentTool === 'sp-ray'){
			tool = ScratchPadTools.buildRay({length:100, width:4,startX:_x, startY:_y });
		}else if(instance.currentTool === 'sp-double-ray'){
			tool = ScratchPadTools.buildRay({length:100, width:4,startX:_x+15, startY:_y, doubleHeaded:true });
		}
		ScratchPad.addToCanvas(instance,tool);
	},
	bindShapeTools: function(instance, event){ //clean this up//
		
		if(event.target){
			return;
		}
		var type = instance.currentTool;
		var obj;
		var pointer = instance.canvas.getPointer(event.e);
		
		switch (type){
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
			ScratchPad.addToCanvas(instance, obj);
		}
	},
	addToCanvas: function(instance, object){
		instance.canvas.add(object);
		ScratchPad.pushToUndoBuffer(instance,object); //put into mouse up event
	},
	pushToUndoBuffer: function(instance,object){
		$(instance.wrapper).find('i.sp-undo').removeClass('disabled');
		if(!instance.undo){
			instance.undo = [];
		}
		instance.undo.push(object);
	}
}

// does the actual instance creation
function ScratchPadBuilder() {
    var menuItems = {
            // can we use arrays here
            selector: {
                class: "sp-selector fa fa-arrows-alt hover",
                title: "Select"
            },
            drawing: {
                class: "sp-drawing fa fa-pencil active hover",
                title: "Pencil"
            },
            trash: {
                class: "sp-trash fa fa-trash",
                title: "Delete"
            },
            undo: {
                class:'sp-undo fa fa-undo hover',
                title:'Undo'
            },
            redo: {
                class: 'sp-redo fa fa-repeat hover',
                title:'Redo'
            },
            text: {
                class:'sp-text fa fa-font hover',
                title:'Add Text'
            },
            line:{
                class: 'sp-shape',
                icon: "sp-line",
                title:'Line',
                group: 0
            },
            ray: {
                class: 'sp-shape',
                icon: 'sp-ray',
                title: 'Ray',
                group: 0
            },
            doubleray: {
                class: 'sp-shape',
                icon: 'sp-double-ray',
                title: 'Double Headed Ray',
                group: 0
            },
            circle: {
                class: 'sp-shape',
                icon: 'sp-circle',
                title: 'Circle',
                group: 0
            },
            eq_triangle :{
                class: 'sp-shape',
                icon:'sp-eq-triangle',
                title: 'Equilateral Triangle',
                group: 1
            },
            right_triangle: {
                class: 'sp-shape',
                icon:'sp-right-triangle',
                title:'Right Angled Triangle',
                group: 1
            },
            scelene_triangle: {
                class: 'sp-shape',
                icon: 'sp-scelene',
                title: 'Scelene Triangle',
                group: 1
            },
            rectangle:{
                class: 'sp-shape',
                icon:'sp-rectangle',
                title: 'Rectangle',
                group: 2
            },
            parallelogram:{
                class: 'sp-shape',
                icon: 'sp-parallelogram',
                title: 'Parallelogram',
                group: 2
            },
            trapezoid_1: {
                class: 'sp-shape',
                icon: 'sp-eq-trapezoid',
                title: 'Equilateral Trapezoid',
                group: 2
            },
            trapezoid_2: {
                class: 'sp-shape',
                icon:'sp-trapezoid',
                title: 'Trapezoid',
                group: 2
            },
            pentagon: {
                class: 'sp-shape',
                icon: 'sp-pentagon',
                title: 'Pentagon',
                group: 3
            },
            hexagon: {
                class: 'sp-shape',
                icon: 'sp-hexagon',
                title: 'Hexagon',
                group: 3
            },
            octagon: {
                class: 'sp-shape',
                icon: 'sp-octagon',
                title: 'Octagon',
                group: 3
            },
            decagon: {
            class: 'sp-shape',
            icon: 'sp-decagon',
            title: 'Decagon',
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
                    menuItems.eq_triangle, menuItems.right_triangle, menuItems.scelene_triangle,menuItems.scelene_triangle,
                    menuItems.rectangle, menuItems.parallelogram, menuItems.trapezoid_1, menuItems.trapezoid_2,
                    menuItems.pentagon, menuItems.hexagon, menuItems.octagon, menuItems.decagon
                ], 
                type: "dropdown",
                title: "Shapes",
                icon: "shapes-icon"
            }
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
            var divider = "<i class='vertical-divider'></i>";        
            Object.keys(menuChunks).forEach(function(key) {
                if(key === "basic"|| instance.menu.indexOf(key) !== -1) {
                    var $chunk;
                    if(menuChunks[key].type === "dropdown") {
                        $chunk = buildMenuDropDown(menuChunks[key]);
                    } else {
                        $chunk = buildMenuChunk(menuChunks[key]);    
                    }
                    $chunk.append(divider);
                    $chunk.appendTo($menu);
                }
            });
        },
        buildMenuChunk = function(chunk) {
            var $chunk = $("<span class='sp-menu-chunk "+chunk.class+"'></span>");
            chunk.items.forEach(function(menuItem){
                $chunk.append("<i class='"+menuItem.class+"' data-toggle='tooltip' title='"+menuItem.title+"'></i>");
            });
            return $chunk;
        },
        buildMenuDropDown = function(chunk) {
            var $chunk = $(""
                +"<div class='btn-group "+chunk.class+"'>"
                +   "<a class='btn dropdown-toggle' title='"+chunk.title+"' data-toggle='dropdown' href='#'>"
                +       "<i class='"+chunk.icon+"'></i>"
                +   "</a>"
                +   "<ul class='min-dropdown-width dropdown-menu'></ul>"
                +"</div>"),
                
                $ul = $chunk.find("ul");
            chunk.items.forEach(function(menuItem){
                var $li = $chunk.find("ul li[data-group='"+menuItem.group+"']");
                if(!$li.length) {
                    if(menuItem.group) $ul.append("<li class='divider'></li>");
                    $li = $("<li data-group='"+menuItem.group+"'></li>");
                    $li.appendTo($ul);
                }
                $li.append(''
                           +'<div class="'+menuItem.class+'" data-action="'+menuItem.icon+'"> ' //change
                           +    '<i class="icon-size '+menuItem.icon+'" data-toggle="tooltip" " title="'+menuItem.title+'"></i>'
                           +'</div>');
            });
            return $chunk;
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
            bindMouseDownEvents(instance);
        },
        bindMenuEvents= function(instance, drawer) { //simplify//
            // set the currentTool //
            // take potential actions//
            
            $(instance.wrapper).on('click','.sp-trash',function(){
                var current = this;
                instance.canvas.isDrawingMode = false;
                ScratchPad.toggleActiveMenu(instance, current);
                ScratchPad.bindDeletionHandler(instance.canvas);
                if($(current).hasClass('sp-trash') && $(current).hasClass('active')){
                    instance.currentTool = 'Delete'
                }else {
                    instance.currentTool = '';
                }
            });

            $(instance.wrapper).on('click', '.sp-selector', function(){
                instance.currentTool = ''
                instance.canvas.isDrawingMode = false;
                ScratchPad.toggleActiveMenu(instance, this);
            });


            $(instance.wrapper).on('click', '.sp-drawing', function(){
                instance.currentTool = ''
                ScratchPad.toggleActiveMenu(instance, this);
                instance.canvas.isDrawingMode = $(this).hasClass('active'); 
                instance.canvas.freeDrawingBrush.color = '#000000'
            });

            $(instance.wrapper).on('click','.sp-text', function(){
                var current = this;

                instance.canvas.isDrawingMode = false;
                ScratchPad.toggleActiveMenu(instance, current);

                if($(current).hasClass('active')){
                    instance.currentTool='Text';
                }else{
                    instance.currentTool='';
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
            $(instance.wrapper).find('.sp-shape').on('click', function(){
                //extract
                ScratchPad.handleClickEvent(instance, this);
            });
        },
        bindMouseDownEvents = function(instance, drawer){
        instance.canvas.on('mouse:down', function(e){
            if(instance.currentTool){
                switch(instance.currentTool){	
                    case 'Text':
                        ScratchPad.bindTextPlaceHandler(instance,e);
                        ScratchPad.toggleActiveMenu(instance, $('.sp-text'));
                        instance.currentTool = '';
                        break;
                    case 'Delete':
                        ScratchPad.bindDeletionHandler(this,e);
                        break;
                    case 'sp-eq-triangle':		
                    case 'sp-right-triangle':
                    case 'sp-scelene':
                        ScratchPad.bindTriangleHandler(instance,e);
                        break;
                    case 'sp-line':
                    case 'sp-ray':
                    case 'sp-double-ray':
                        ScratchPad.bindLineTools(instance,e);
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
                        ScratchPad.bindShapeTools(instance,e);
                        break;
                }
            }
        })
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

// does the drawing inside a scratch pad
function ScratchPadDrawer() {
    // actions invoked by the menu goes here//
    // selection
    // draw shape
    // redo undo
    // trash
    // text
    
    
};
