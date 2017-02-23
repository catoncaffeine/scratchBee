var ScratchPad = {
	instances: [],
	init: function(wrapper, config) {
		var instance = ScratchPad.buildInstance(wrapper, config);
		ScratchPad.buildMenu(instance);
        ScratchPad.buildPad(instance);
		ScratchPad.instances[instance.id]= instance;
        ScratchPad.renderScratchPad(instance);
        ScratchPad.convertToFabric(instance);
	},
    getDefaultMenu: function() {
        return ScratchPad.menuMode.default.slice();
    },
    getDefaultDimension: function() {
        return {width: 500, height: 500};
    },
	buildInstance: function(wrapper, config) {
		var identifier = new Date().getTime();
		var instance = {id: "sp_" + identifier};
        instance.domElement = $(wrapper)[0];
        instance.wrapper = $("<div class='sp-wrapper' data-sp-id='"+instance.id+"'></div>");
		if(config === undefined || config.menu === undefined) {
			instance.menu = ScratchPad.getDefaultMenu();
		} else {
			instance.menu = config.menu;
		}

		if(config === undefined || config.menu === undefined) {
			instance.dimension = ScratchPad.getDefaultDimension();
		} else {
			instance.dimension = config.dimension;
		}
		return instance;
	},
    
	buildMenu: function(instance) {
		$(instance.wrapper).append("<div class='sp-menu'></div>");
		var $menu = $(instance.wrapper).find(".sp-menu");

		if(instance.menu.indexOf(ScratchPad.menuItem.drawing) !== -1 ) {
			$menu.append("<div class='sp-drawing'>Drawing</div>");
		}        

		if(instance.menu.indexOf(ScratchPad.menuItem.eraser) !== -1) {
			$menu.append("<div class='sp-eraser'>Eraser</div>");
		}
	},

	buildPad: function(instance){
		var width = instance.dimension.width, height = instance.dimension.height;
		$(instance.wrapper).find(".sp-menu").after(""
			+ "<div class='sp-canvas-wrapper'>"
			+    "<canvas class='sp-canvas' id='"+instance.id+"' width='"+width+"' height='"+height+"'></canvas>"
			+ "</div>");
	},
    
    convertToFabric: function(instance) {
        instance.canvas = new fabric.Canvas(instance.id, {isDrawingMode: true});
    },
    
    renderScratchPad: function(instance){
        $(instance.wrapper).appendTo($(instance.domElement));
        ScratchPad.bindEvents(instance);
    },
    
    bindEvents: function(instance) {
        // should events go here or with menu build?
    },
    
    menuItem: {
        eraser: "eraser",
        drawing: "drawing"
    },
    menuChucks: {
        basic: [ScratchPad.menuItem.drawing, ScratchPad.menuItem.eraser]
    },
    menuMode: {
        default: ScratchPad.menuChucks.basic
    }
}