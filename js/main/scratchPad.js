var ScratchPad = {
	instances: [],
	init: function(wrapper, config) {
		var instance = ScratchPad.buildInstance(wrapper, config);
		ScratchPad.buildMenu(instance);
		ScratchPad.buildPad(instance);
		ScratchPad.instances[instance.id]= instance;
		ScratchPad.renderScratchPad(instance);
		ScratchPad.convertToFabric(instance);
		ScratchPad.bindEventsToMouseDown(instance);
		return instance;
	},
	getDefaultMenu: function() {
		//        return ScratchPad.menuMode.default.slice();
		return [ScratchPad.menuItem.drawing,ScratchPad.menuItem.eraser, ScratchPad.menuItem.delete];
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

		if(config !== undefined || config.menus !== undefined){
			instance.menus = config.menus;
		}
		instance.wrapper = $("<div class='sp-wrapper panel panel-default' data-sp-id='"+instance.id+"' style='width:"+instance.dimension.width+";height:"+instance.dimension.height+"'></div>");
		return instance;
	},

	buildMenu: function(instance) {
		$(instance.wrapper).append("<div class='sp-menu panel-heading'></div>");
		var $menu = $(instance.wrapper).find(".sp-menu");
		$menu.append("<i class='sp fa fa-th-large' data-toggle='tooltip' title='Scratchpad'></i>");
		if(instance.menu.indexOf(ScratchPad.menuItem.drawing) !== -1 ) {
			$menu.append("<i class='sp-drawing fa fa-pencil active hover' data-toggle='tooltip' title='Pencil'></i>");
		}        

		if(instance.menu.indexOf(ScratchPad.menuItem.eraser) !== -1){
			$menu.append("<i class='sp-eraser fa fa-eraser hover' data-toggle='tooltip' title='Eraser'></i>")    
		}

		//		if(instance.menu.indexOf(ScratchPad.menuItem.delete) !== -1) {
		//			$menu.append("<i class='sp-trash fa fa-trash' data-toggle='tooltip' title='Delete'></i>");
		//		}
		if(instance.menu){
			$menu.append("<i class='vertical-divider'></i>");
		}

		if(instance.menus){
			instance.menus.forEach(function(menu){
				var type = menu.type;
				var title = menu.title;
				if(type && type ==='dropdown'){
					$menu.append("<div class='btn-group'><a class='btn dropdown-toggle' title='"+title+"' data-toggle='dropdown' href='#'>"
								+"<i class='shapes-icon'></i></a>"
								+"<ul class='dropdown-menu'></ul></div>");
					for (var menuItems in menu){
						var menuItem = menu[menuItems];
							
							if(typeof menuItem === 'object'){
								$(instance.wrapper).find('ul.dropdown-menu').append("<li></li>");
								var lastLi = $(instance.wrapper).find('ul.dropdown-menu li:last-child');
								for(var menuElements in menuItem){
									var menuElement = menuItem[menuElements];
									$(lastLi).append('<div class="shape-menu" <a href="#" style="display:inline-block"><i class="'+menuElement.class+'" data-toggle="tooltip" title="'+menuElement.title+'"></i></a></div>');
								}
								$(instance.wrapper).find('ul.dropdown-menu').append('<li class="divider"></li>');
							}
//						}
					}
				}else{
					for(var menuElements in menu ){
						var menuElement = menu[menuElements];
						$menu.append("<i class='"+menuElement.class+"' data-toggle='tooltip' title='"+menuElement.title+"'></i>");
					}
					$menu.append("<i class='vertical-divider'></i>");
				}
			});
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

	menuItem: {
		eraser: "eraser",
		drawing: "drawing",
		delete: "delete"
	},
	menuChucks: {
		basic: {	
			undo: {
				class:'sp-undo fa fa-undo hover',
				title:'Undo'
			},
			redo:{
				class: 'sp-redo fa fa-repeat hover',
				title:'Redo'
			},
			delete :{ 
				class:'sp-trash fa fa-trash hover',
				title:'Delete'
			}
	   	},
		text:{
			text:{
				class:'sp-text fa fa-font hover',
				title:'Add Text'
			}
		},
		shapes: {
			menu1:{
				line:{
					class: 'sp-line',
					title:'Line'
				},
				ray: {
					class: 'sp-ray',
					title: 'Ray'
				},
				circle: {
					class: 'sp-circle',
					title: 'Circle'
				}
			},
			menu2:{
				eq_triangle :{
					class:'sp-eq-triangle',
					title: 'Equilateral Triangle'
				},
				right_triangle: {
					class:'sp-right-triangle',
					title:'Right Angled Triangle'
				},
				scelene_triangle: {
					class: 'sp-scelene',
					title: 'Scelene Triangle'
				}
			},
			menu3:{
				rectangle:{
					class:'sp-rectangle',
					title: 'Rectangle'
				},
				parallelogram:{
					class: 'sp-parallelogram',
					title: 'Parallelogram'
				},
				trapezoid_1: {
					class: 'sp-eq-trapezoid',
					title: 'Equilateral Trapezoid'
				},
				trapezoid_2: {
					class:'sp-trapezoid',
					title: 'Trapezoid'
				}
				
			},
			menu4: {
				pentagon: {
					class: 'sp-pentagon',
					title: 'Pentagon'
				},
				hexagon: {
					class: 'sp-hexagon',
					title: 'Hexagon'
				},
				octagon: {
					class: 'sp-octagon',
					title: 'Octagon'
				},
				decagon: {
					class: 'sp-decagon',
					title: 'Decagon'
				}
			},
			type:'dropdown',
			title: 'Shapes'
		}
	},
	menuMode: {
		default: ["delete", "undo","redo"]
	},

	toggleActiveMenu: function(instance, clickedElement){
		if($(clickedElement).hasClass('active')){
			$(clickedElement).toggleClass('active');
		}else{
			$(instance.wrapper).find(".active").removeClass('active');
			$(clickedElement).addClass('active');
		}

	},
	exportCanvas : function(id){
		return ScratchPad.instances[id]? ScratchPad.instances[id].canvas.toDataURL():"";
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
	bindEvents: function(instance) {
		if(instance.menu.indexOf(ScratchPad.menuItem.delete)!==-1){
			$(instance.wrapper).on('click','.sp-trash',function(){
				var current = this;
				instance.canvas.isDrawingMode = false;
				ScratchPad.toggleActiveMenu(instance, current);
				ScratchPad.bindDeletionHandler(instance.canvas);
				if($(current).hasClass('sp-trash') && $(current).hasClass('active')){
					
					instance.currentTool = 'Delete'
				}else{

					instance.currentTool = '';
				}
			});
		}

		if(instance.menu.indexOf(ScratchPad.menuItem.eraser) !== -1){
			$(instance.wrapper).on('click', '.sp-eraser', function(){
				var current = this;
//				ScratchPad.toggleActiveMenu (instance,current);
				//                instance.canvas.isDrawingMode = $(current).hasClass('active');
				//                instance.canvas.freeDrawingBrush.color = '#FFFFFF';
				//                instance.canvas.on("path:created", function(e){
				//                   if($(current).hasClass('sp-eraser') && $(current).hasClass('active')){
				//                       e.selectable = false;
				//                       instance.canvas.forEachObject(function(obj){
				//                           console.log(obj);
				////                           }
				//                       });
				//                   } 
				//                });
			});  
		}

		if(instance.menu.indexOf(ScratchPad.menuItem.drawing) !==-1){
			$(instance.wrapper).on('click', '.sp-drawing', function(){
				instance.currentTool = ''
				ScratchPad.toggleActiveMenu(instance, this);
				instance.canvas.isDrawingMode = $(this).hasClass('active'); 
				instance.canvas.freeDrawingBrush.color = '#000000'
			});

		}
		$(instance.wrapper).off('click','.sp-text').on('click','.sp-text', function(){
			var current = this;

			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			
			if($(current).hasClass('active')){
				instance.currentTool='Text';
			}else{
				instance.currentTool='';
			}
		})
		$(instance.wrapper).find('.shape-menu .sp-eq-triangle').parent().on('click','', function(){
			var current = this;
			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			if($(current).hasClass('active')){
				instance.currentTool='eq-triangle';
			}else{
				instance.currentTool='';
			}
		});
		$(instance.wrapper).find('.shape-menu .sp-right-triangle').parent().on('click', function(){
			var current = this;
			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			if($(current).hasClass('active')){
				instance.currentTool='right-triangle';
			}else{
				instance.currentTool='';
			}
		});
		$(instance.wrapper).find('.shape-menu .sp-scelene').parent().on('click', function(){
			var current = this;
			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			if($(current).hasClass('active')){
				instance.currentTool='scelene-triangle';
			}else{
				instance.currentTool='';
			}
		});
		$(instance.wrapper).find('.shape-menu .sp-line').parent().on('click', function(){
			var current = this;
			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			if($(current).hasClass('active')){
				instance.currentTool='line';
			}else{
				instance.currentTool='';
			}
		});
		$(instance.wrapper).find('.shape-menu .sp-ray').parent().on('click', function(){
			var current = this;
			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			if($(current).hasClass('active')){
				instance.currentTool='ray';
			}else{
				instance.currentTool='';
			}
		});
		$(instance.wrapper).find('.shape-menu .sp-circle').parent().on('click', function(){
			var current = this;
			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			if($(current).hasClass('active')){
				instance.currentTool='circle';
			}else{
				instance.currentTool='';
			}
		});
		$(instance.wrapper).find('.shape-menu .sp-rectangle').parent().on('click', function(){
			var current = this;
			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			if($(current).hasClass('active')){
				instance.currentTool='rectangle';
			}else{
				instance.currentTool='';
			}
		});
		$(instance.wrapper).find('.shape-menu .sp-parallelogram').parent().on('click', function(){
			var current = this;
			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			if($(current).hasClass('active')){
				instance.currentTool='parallelogram';
			}else{
				instance.currentTool='';
			}
		});
		$(instance.wrapper).find('.shape-menu .sp-eq-trapezoid').parent().on('click', function(){
			var current = this;
			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			if($(current).hasClass('active')){
				instance.currentTool='eq-trapezoid';
			}else{
				instance.currentTool='';
			}
		});
		$(instance.wrapper).find('.shape-menu .sp-trapezoid').parent().on('click', function(){
			var current = this;
			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			if($(current).hasClass('active')){
				instance.currentTool='trapezoid';
			}else{
				instance.currentTool='';
			}
		});
		$(instance.wrapper).find('.shape-menu .sp-hexagon').parent().on('click', function(){
			var current = this;
			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			if($(current).hasClass('active')){
				instance.currentTool='hexagon';
			}else{
				instance.currentTool='';
			}
		});
		$(instance.wrapper).find('.shape-menu .sp-pentagon').parent().on('click', function(){
			var current = this;
			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			if($(current).hasClass('active')){
				instance.currentTool='pentagon';
			}else{
				instance.currentTool='';
			}
		});
		$(instance.wrapper).find('.shape-menu .sp-octagon').parent().on('click', function(){
			var current = this;
			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			if($(current).hasClass('active')){
				instance.currentTool='octagon';
			}else{
				instance.currentTool='';
			}
		});
		$(instance.wrapper).find('.shape-menu .sp-decagon').parent().on('click', function(){
			var current = this;
			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			if($(current).hasClass('active')){
				instance.currentTool='decagon';
			}else{
				instance.currentTool='';
			}
		});

	},
	bindTextPlaceHandler: function(canvas, event){
		if(event.target){
			return;
		}
		canvas.add(new fabric.Textbox('Click to add text',{
			fontSize: 20, 
			left:event.e.pageX,
			top:event.e.offsetY,
			width:150})
		);
		
	},
	bindDeletionHandler: function(canvas,event){
		var activeGroup = canvas.getActiveGroup();
		var activeObject = canvas.getActiveObject();
		if(activeGroup){
			var objects = activeGroup.getObjects();
			this.discardActiveGroup(); 
			objects.forEach(function(object){
				canvas.remove(object);
			})
		}else if(activeObject){
			
			activeObject.evented=false;
			activeObject.remove();
//			if(event)
//				activeObject._stopEvent(event)
			
//			activeObject.remove();
//			canvas.remove(activeObject);
		}
		
	},
	bindTriangleHandler: function(canvas ,event,type){
		if(event.target){
			return;
		}
		
		var pointer = canvas.getPointer(event.e);
		var _left = pointer.x;
		var _top = pointer.y;
		var triangle = new fabric.Triangle({height:100, width:100});
		if(type ==='right-triangle'){	
			triangle = new fabric.Polygon([{x:0,y:0}, {x:0, y:100},{x:100, y:100}]);
		}else if(type === 'scelene-triangle' ){
			triangle = new fabric.Polygon([
				{x:100,y:100},{x:200,y:35},{x:160,y:100}
			])
		}
		triangle.set({left:_left,top:_top})
		canvas.add(triangle);
	},
	bindLineTools: function(canvas, event, type){
		if(event.target){
			return;
		}
		var pointer = canvas.getPointer(event.e)
		var _x = pointer.x;
		var _y = pointer.y;
		var tool = new fabric.Line([_x,_y,_x+100,_y],{left:_x, top:_y,stroke:'black'});
		if(type === 'ray'){
			tool = ScratchPadTools.buildRay({length:100, width:4,startX:_x, startY:_y });
		}
		canvas.add(tool);
	},
	bindShapeTools: function(canvas, event, type){
		
		if(event.target){
			return;
		}
		var obj;
		var pointer = canvas.getPointer(event.e);
		if(type==='circle'){
			obj = new fabric.Circle({radius:100, fill:'black'});
		}else if(type==='parallelogram'){
			obj = new fabric.Rect({width:200, height:100, fill:'black',skewX:320});
		} else if(type==='rectangle'){
			obj = new fabric.Rect({width:200, height:100, fill:'black'});
		}else if(type==='eq-trapezoid'){
			obj = new fabric.Polygon([{x:60, y:100}, {x:140, y:100}, {x:200, y: 200}, {x:0, y:200}],{fill:'black'});
		}else if(type==='trapezoid'){
			obj = new fabric.Polygon([{x:60,y:100}, {x:200, y: 100}, {x:200, y: 200}, {x:0, y:200}],{fill:'black'});
		}else if(type === 'hexagon'){
			obj = ScratchPadTools.createPolygon({sides:6,centerX:pointer.x,centerY:pointer.y,size: 60});
		}else if(type === 'pentagon'){
			obj = ScratchPadTools.createPolygon({sides:5,centerX:pointer.x,centerY:pointer.y,size: 60});
		}else if(type === 'octagon'){
			obj = ScratchPadTools.createPolygon({sides:8,centerX:pointer.x,centerY:pointer.y,size: 60});
		}else if(type === 'decagon'){
			obj = ScratchPadTools.createPolygon({sides:10,centerX:pointer.x,centerY:pointer.y,size: 60});
		}
		if(obj){
			obj.set({left:pointer.x,top:pointer.y})
			canvas.add(obj)
		}
	},
	bindEventsToMouseDown(instance){
		instance.canvas.on('mouse:down', function(e){
			console.log(e);
			if(instance.currentTool){
				if(instance.currentTool === 'Text'){
					ScratchPad.bindTextPlaceHandler(this,e);
					ScratchPad.toggleActiveMenu(instance, $('.sp-text'));
					instance.currentTool = '';
					
				}
				if(instance.currentTool === 'Delete'){
					ScratchPad.bindDeletionHandler(this,e);
				}
				if(instance.currentTool === 'eq-triangle'){
					ScratchPad.bindTriangleHandler(this,e,instance.currentTool);
				}
				if(instance.currentTool === 'right-triangle'){
					ScratchPad.bindTriangleHandler(this,e,instance.currentTool);
				}
				if(instance.currentTool === 'scelene-triangle'){
					ScratchPad.bindTriangleHandler(this,e,instance.currentTool);
				}
				if(instance.currentTool === 'line'){
					ScratchPad.bindLineTools(this,e,instance.currentTool);
				}
				if(instance.currentTool === 'ray'){
					ScratchPad.bindLineTools(this,e,instance.currentTool);
				}
				if(instance.currentTool === 'circle'){
					ScratchPad.bindShapeTools(this,e,instance.currentTool);
				}
				if(instance.currentTool === 'rectangle'){
					ScratchPad.bindShapeTools(this,e,instance.currentTool);
				}
				if(instance.currentTool === 'parallelogram'){
					ScratchPad.bindShapeTools(this,e,instance.currentTool);
				}
				if(instance.currentTool === 'eq-trapezoid'){
					ScratchPad.bindShapeTools(this,e,instance.currentTool);
				}
				if(instance.currentTool === 'trapezoid'){
					ScratchPad.bindShapeTools(this,e,instance.currentTool);
				}
				if(instance.currentTool === 'decagon'){
					ScratchPad.bindShapeTools(this,e,instance.currentTool);
				}
				if(instance.currentTool === 'octagon'){
					ScratchPad.bindShapeTools(this,e,instance.currentTool);
				}
				if(instance.currentTool === 'pentagon'){
					ScratchPad.bindShapeTools(this,e,instance.currentTool);
				}
				if(instance.currentTool === 'hexagon'){
					ScratchPad.bindShapeTools(this,e,instance.currentTool);
				}
				
			}
		})
	}


}