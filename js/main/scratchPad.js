var ScratchPad = {
	instances: [],
	defaultMenu: ["freeDrawing", "eraser"],
	defaultDimension: {width: 500,height: 500},
	init: function(wrapper, config) {
		var instance = ScratchPad.buildInstance(wrapper, config);
		ScratchPad.buildMenu(instance);
		instance.canvas = ScratchPad.buildPad(instance);
		ScratchPad.instances[instance.id]= instance;
	},
	buildInstance: function(wrapper, config) {
		var identifier = new Date().getTime();
		var instance = {id: "sp_" + identifier};
		instance.wrapper = $(wrapper)[0];
		if(config === undefined || config.menu === undefined) {
			instance.menu = ScratchPad.defaultMenu;
		} else {
			instance.menu = config.menu;
		}

		if(config === undefined || config.menu === undefined) {
			instance.dimension = ScratchPad.defaultDimension;
		} else {
			instance.dimension = config.dimension;
		}
		return instance;
	},

	buildMenu: function(instance) {
		$(instance.wrapper).append("<div class='sp-menu'></div>");
		var $menu = $(instance.wrapper).find(".sp-menu");

		if(instance.menu.indexOf("freeDrawing") !== -1 ) {
			$menu.append("<div class='sp-drawing'>Drawing</div>");
		}

		if(instance.menu.indexOf("eraser") !== -1) {
			$menu.append("<div class='sp-eraser'>Eraser</div>");
		}
	},

	buildPad: function(instance){
		var width = instance.dimension.width, height = instance.dimension.height;
		$(instance.wrapper).append(""
			+ "<div class='sp-canvas-wrapper'>"
			+ "<canvas class='sp-canvas-original' id='"+instance.id+"' width='"+width+"' height='"+height+"'></canvas>"
			+ "</div>");
		return new fabric.Canvas(instance.id, {isDrawingMode: true});
	}
}