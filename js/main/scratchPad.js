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

		if(instance.menu.indexOf(ScratchPad.menuItem.drawing) !== -1 ) {
			$menu.append("<i class='sp-drawing fa fa-pencil active' data-toggle='tooltip' title='Drawing'></i>");
		}        

		if(instance.menu.indexOf(ScratchPad.menuItem.eraser) !== -1) {
			$menu.append("<i class='sp-eraser fa fa-eraser' data-toggle='tooltip' title='Eraser'></i>");
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
    },
    
    renderScratchPad: function(instance){
        $(instance.wrapper).appendTo($(instance.domElement));

        ScratchPad.bindEvents(instance);
    },
    
    bindEvents: function(instance) {
        if(instance.menu.indexOf(ScratchPad.menuItem.eraser)!==-1){
            $(instance.wrapper).on('click','.sp-eraser',function(){
                instance.canvas.isDrawingMode = false;
                
               instance.canvas.on('object:selected', function(){ 
                   instance.canvas.remove(instance.canvas.getActiveObject());
                });
                ScratchPad.toggleActiveMenu(instance, this);
            });
        }
        
        if(instance.menu.indexOf(ScratchPad.menuItem.drawing) !==-1){
            $(instance.wrapper).on('click', '.sp-drawing', function(){
                instance.canvas.isDrawingMode = true;
                ScratchPad.toggleActiveMenu(instance, this);
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
        $(instance.wrapper).find(".active").removeClass('active');
        $(clickedElement).addClass('active');

    }


}