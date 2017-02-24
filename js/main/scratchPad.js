var ScratchPad = {
	instances: [],
	init: function(wrapper, config) {
		var instance = ScratchPad.buildInstance(wrapper, config);
		ScratchPad.buildMenu(instance);
        ScratchPad.buildPad(instance);
		ScratchPad.instances[instance.id]= instance;
        ScratchPad.renderScratchPad(instance);
        ScratchPad.convertToFabric(instance);
        return instance;
	},
    getDefaultMenu: function() {
//        return ScratchPad.menuMode.default.slice();
        return [ScratchPad.menuItem.drawing, ScratchPad.menuItem.eraser];
    },
    getDefaultDimension: function() {
        return {width: 500, height: 500};
    },
	buildInstance: function(wrapper, config) {
		var identifier = new Date().getTime();
		var instance = {id: "sp_" + identifier};
        instance.domElement = $(wrapper)[0];
        
		if(config === undefined || config.menu === undefined) {
			instance.menu = ScratchPad.getDefaultMenu();
		} else {
			instance.menu = config.menu;
		}

		if(config === undefined || config.dimension === undefined) {
			instance.dimension = ScratchPad.getDefaultDimension();
		} else {
			instance.dimension = config.dimension;
		}
        instance.wrapper = $("<div class='sp-wrapper panel panel-default' data-sp-id='"+instance.id+"' style='width:"+instance.dimension.width+";height:"+instance.dimension.height+"'></div>");
		return instance;
	},
    
	buildMenu: function(instance) {
		$(instance.wrapper).append("<div class='sp-menu panel-heading'></div>");
		var $menu = $(instance.wrapper).find(".sp-menu");
        $menu.append("<i class='sp fa fa-th-large' data-toggle='tooltip' title='Scratchpad'></i>");
		if(instance.menu.indexOf(ScratchPad.menuItem.drawing) !== -1 ) {
			$menu.append("<i class='sp-drawing fa fa-pencil active' data-toggle='tooltip' title='Drawing'></i>");
		}        

		if(instance.menu.indexOf(ScratchPad.menuItem.eraser) !== -1) {
			$menu.append("<i class='sp-eraser fa fa-eraser' data-toggle='tooltip' title='Eraser'></i>");
		}
        if(instance.menu){
            $menu.append("<i class='vertical-divider'></i>");
        }
        
        
	},

	buildPad: function(instance){
		var width = instance.dimension.width, height = instance.dimension.height;
		$(instance.wrapper).find(".sp-menu").after(""
			+ "<div class='sp-canvas-wrapper panel-body'>"
			+    "<canvas class='sp-canvas' id='"+instance.id+"' width='"+width+"' height='"+height+"'></canvas>"
			+ "</div>");
	},
    
    convertToFabric: function(instance) {
        var headerHeight = +($(instance.wrapper).find('.sp-menu').css('height').slice(0,-2));
        var height = instance.dimension.height - headerHeight;
        $(instance.wrapper).find('#'+instance.id).attr('height',height);
        instance.canvas = new fabric.Canvas(instance.id, {isDrawingMode: true});
        instance.canvas.freeDrawingBrush = new fabric.PencilBrush(instance.canvas);
        instance.canvas.freeDrawingBrush.width = 2;
    },
    
    renderScratchPad: function(instance){
        $(instance.wrapper).appendTo($(instance.domElement));

        ScratchPad.bindEvents(instance);
    },
    
    bindEvents: function(instance) {
        if(instance.menu.indexOf(ScratchPad.menuItem.eraser)!==-1){
            $(instance.wrapper).on('click','.sp-eraser',function(){
                var current = this;
                instance.canvas.isDrawingMode = false;
                ScratchPad.toggleActiveMenu(instance, current);
                instance.canvas.on('object:selected', function(e){
                    if(e.target && ($(current).hasClass('sp-eraser') && $(current).hasClass('active'))){
                    
                        instance.canvas.remove(e.target);
                    }
                });
                if($(current).hasClass('active')){
//                    instance.canvas.getObjects().map(function(object){
//
//                            object.on('click', function(){
//                                console.log('i was clicked');
//                                instance.canvas.remove(object);
//                            });
//                       return object.set('active', true);
//                    });
//                    instance.canvas.renderAll();
                    var activeGroup = instance.canvas.getActiveGroup();
                    var activeObject = instance.canvas.getActiveObject();
                    if(activeGroup){
                        var objects = activeGroup.getObjects();
                        instance.canvas.discardActiveGroup(); 
                        objects.forEach(function(object){
                            instance.canvas.remove(object);
                        })
                    }else if(activeObject){
                        instance.canvas.remove(activeObject);
                    }
                }
            });
        }
        
        if(instance.menu.indexOf(ScratchPad.menuItem.drawing) !==-1){
            $(instance.wrapper).on('click', '.sp-drawing', function(){
                ScratchPad.toggleActiveMenu(instance, this);
                instance.canvas.isDrawingMode = $(this).hasClass('active'); 
            });
            
        }

    },
    
    menuItem: {
        eraser: "eraser",
        drawing: "drawing"
    },
    menuChucks: {
        basic: ["drawing", "eraser"]
    },
    menuMode: {
        default: ["drawing", "eraser"]
    },
    
    toggleActiveMenu: function(instance, clickedElement){
        if($(clickedElement).hasClass('active')){
            $(clickedElement).toggleClass('active');
        }else{
            $(instance.wrapper).find(".active").removeClass('active');
            $(clickedElement).addClass('active');
        }

    },
    exportCanvas : function(instance){
        
    }


}