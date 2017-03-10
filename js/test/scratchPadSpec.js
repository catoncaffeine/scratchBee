describe('Test ScratchPad',function(){
    beforeEach(function(){
        $("<div id='test'></div>").appendTo('body');
    });
    afterEach(function(){
        $('#test').remove();
    });
    it('tests buildMenu ', function(){
        var instance = {};
        instance.id=1;
        instance.wrapper =  $('#test');
        instance.menu = ScratchPad.getDefaultMenu();
        ScratchPad.buildMenu(instance);
        var $menu = $(instance.wrapper).find(".sp-menu");
        expect($menu.html().indexOf('sp-drawing')).not.toBe(-1);
    });
    it('tests buildMenu with unknown items', function(){
        var instance = {};
        instance.id=1;
        instance.wrapper =  $('#test');
        instance.menu =["menu1","menu2",ScratchPad.menuItem.eraser];
        ScratchPad.buildMenu(instance);
        var $menu = $(instance.wrapper).find(".sp-menu");
        expect($menu.html().indexOf("sp-eraser")).not.toBe(-1);
    });
    it('tests init', function(){
        var instance = {id:1, canvas:{}};
        spyOn(ScratchPad,'buildInstance').andCallFake(function(){
            return instance;
        })
        spyOn(ScratchPad,'buildMenu').andCallFake(function(){});
        spyOn(ScratchPad,'buildPad').andCallFake(function(){ return {};});

        spyOn(ScratchPad,'bindEvents').andCallFake(function(){});

        spyOn(ScratchPad,'convertToFabric').andCallFake(function(){ return {};});
		spyOn(ScratchPad,'bindEventsToMouseDown').andCallFake(function(){ return {};});
        ScratchPad.init('#test',{});
        expect(ScratchPad.buildInstance).toHaveBeenCalledWith('#test',{});
        expect(ScratchPad.buildMenu).toHaveBeenCalledWith(instance);
        expect(ScratchPad.buildPad).toHaveBeenCalledWith(instance);
        expect(ScratchPad.bindEvents).toHaveBeenCalledWith(instance);
        expect(ScratchPad.instances[1]).toBe(instance);
    });
    
    it('tests buildInstance', function(){
       var instance = ScratchPad.buildInstance('#test',{});
        expect(instance.id).not.toBeNull();
        expect(instance.menu).toEqual(ScratchPad.getDefaultMenu());
        expect(instance.dimension).toEqual(ScratchPad.getDefaultDimension());
    });
    
    it('tests buildInstance with a config', function(){
        var dimension = {width:10, height:20};
        var menu = ["menu1",  "menu2"];
        var config = {menu:menu, dimension:dimension};
        var instance = ScratchPad.buildInstance('test', config);
        expect(instance.id).not.toBeNull();
        expect(instance.menu).toBe(menu);
        expect(instance.dimension).toBe(dimension);
    });
    it('tests buildPad adds html canvas to scratch pad', function(){
        var instance = {id: "1", wrapper:$('#test'), dimension:{width:200,height:200}};
        $('#test').append('<div class="sp-menu"></div>');
        ScratchPad.buildPad(instance);
        expect($("#test canvas").length).toBe(1);
        expect($("#test .sp-canvas-wrapper .sp-canvas#1").length).toBe(1);
        expect($("#test .sp-canvas-wrapper .sp-canvas#1").attr("width")).toBe("200");
        expect($("#test .sp-canvas-wrapper .sp-canvas#1").attr("height")).toBe("200");
    });
    it('tests convert to Fabric calls FabricJS', function(){
        spyOn(fabric,'Canvas');
        var config = {dimension:{width:200,height:200}};
		spyOn(ScratchPad, 'bindEventsToMouseDown').andCallFake(function(){});
        var instance = ScratchPad.init("#test", config);
        expect(fabric.Canvas).toHaveBeenCalledWith(instance.id,{isDrawingMode:true});
        expect($('#'+instance.id).attr('width')).toBe('200');
    });
});
describe('test scratchpad destroy methods', function(){
   it('tests single instance deletion by id', function(){
        var canvas = {
            dispose : function(){}
        };
        spyOn(canvas,'dispose');
        ScratchPad.instances = {
            1:{
                id:1,
                canvas : canvas,
                wrapper: $('#test')
            }
        }
        ScratchPad.destroyInstanceById('1');
        expect(ScratchPad.instances['1']).toBeUndefined();
        expect(canvas.dispose).toHaveBeenCalled();
    }); 
    it('tests single instance deletion by invalid id', function(){
        var canvas = {
            dispose : function(){}
        };
        spyOn(canvas,'dispose');
        ScratchPad.instances = {
            1:{
              id:1,
              canvas : canvas,
              wrapper: $('#test')
            }
        }
        ScratchPad.destroyInstanceById('2');
        expect(canvas.dispose).not.toHaveBeenCalled();
        expect(ScratchPad.instances['1']).toBeDefined();
    });
    it('tests single instance deletion by instance', function(){
        var canvas = {
            dispose : function(){}
        };
        var instance = {
            id:1,
            canvas : canvas,
            wrapper: $('#test')
        }
        spyOn(canvas,'dispose');
        ScratchPad.instances = {1: instance};
        ScratchPad.destroyInstance(instance);
        expect(canvas.dispose).toHaveBeenCalled();
        expect(ScratchPad.instances['1']).toBeUndefined();
    });
    it('tests single instance deletion by unknown instance', function(){
        var canvas = {
            dispose : function(){}
        };
        var instance = {
            id:1,
            canvas : canvas,
            wrapper: $('#test')
        }
        spyOn(canvas,'dispose');
        ScratchPad.instances = {1: instance};
        ScratchPad.destroyInstance({});
        expect(canvas.dispose).not.toHaveBeenCalled();
        expect(ScratchPad.instances['1']).toBeDefined();
    });
});
describe('tests events on scratchpad', function(){
    beforeEach(function(){
        $("<div id='test'></div>").appendTo('body');
    });
    afterEach(function(){
        $('#test').remove();
    });
    it('tests toggle class with active menu', function(){
        $('#test').append('<i class="sp-eraser active"></i>');
        var instance = {id:1, wrapper:$('#test')};
        ScratchPad.toggleActiveMenu(instance, $('.active'));
        expect($('.sp-eraser').hasClass('active')).toBeFalsy();
    });
    it('tests toggle class on non active menu', function(){
       $('#test').append('<i class="sp-eraser"></i>');
        $('#test').append('<i class="sp-drawing active"></i>');
        var instance = {id:1, wrapper:$('#test')}
        ScratchPad.toggleActiveMenu(instance, $('.sp-eraser'));
        expect($('.sp-eraser').hasClass('active')).toBeTruthy();
        expect($('.active').length).toBe(1);
    });
});

describe('tests build shape tools',function(){
	var instance ;
	beforeEach(function(){
		instance = {
			 canvas : {
				getPointer : function(obj){
					return {x:2,y:3};
				}
			}
		};
		spyOn(fabric,'Circle').andCallFake(function(obj){
			this.set = function(){
				
			}
			
		});
		spyOn(fabric,'Rect').andCallFake(function(obj){
			this.set = function(){
				
			}
			
		});
		spyOn(fabric,'Polygon').andCallFake(function(obj){
			this.set = function(){
				
			}
			
		});
		spyOn(ScratchPadTools,'createPolygon').andCallFake(function(obj){
			
		});
		
	});
	it('tests circle', function(){
		
		spyOn(ScratchPad, 'addToCanvas').andCallFake(function(){});
		instance.currentTool='sp-circle';
		ScratchPad.bindShapeTools(instance, {});
		expect(fabric.Circle).toHaveBeenCalled();
		expect(fabric.Rect).not.toHaveBeenCalled();
		expect(fabric.Polygon).not.toHaveBeenCalled();
		expect(ScratchPadTools.createPolygon).not.toHaveBeenCalled();
	});	
	it('tests parallelogram', function(){
		
		spyOn(ScratchPad, 'addToCanvas').andCallFake(function(){});
		instance.currentTool='sp-parallelogram';
		ScratchPad.bindShapeTools(instance, {});
		expect(fabric.Circle).not.toHaveBeenCalled();
		expect(fabric.Rect).toHaveBeenCalledWith({width:100, height:50, fill:'black',skewX:320});
		expect(fabric.Polygon).not.toHaveBeenCalled();
		expect(ScratchPadTools.createPolygon).not.toHaveBeenCalled();
	});	
	it('tests rectangle', function(){
		
		spyOn(ScratchPad, 'addToCanvas').andCallFake(function(){});
		instance.currentTool='sp-rectangle';
		ScratchPad.bindShapeTools(instance, {});
		expect(fabric.Circle).not.toHaveBeenCalled();
		expect(fabric.Rect).toHaveBeenCalledWith({width:100, height:100, fill:'black'});
		expect(fabric.Polygon).not.toHaveBeenCalled();
		expect(ScratchPadTools.createPolygon).not.toHaveBeenCalled();
	});	
	it('tests eq trapezoid', function(){
		
		spyOn(ScratchPad, 'addToCanvas').andCallFake(function(){});
		instance.currentTool='sp-eq-trapezoid';
		ScratchPad.bindShapeTools(instance, {});
		expect(fabric.Circle).not.toHaveBeenCalled();
		expect(fabric.Rect).not.toHaveBeenCalled();
		expect(fabric.Polygon).toHaveBeenCalledWith([{x:30, y:150}, {x:120, y:150}, {x:150, y: 225}, {x:0, y:225}],{fill:'black'});
		expect(ScratchPadTools.createPolygon).not.toHaveBeenCalled();
	});	
	it('tests trapezoid', function(){
		
		spyOn(ScratchPad, 'addToCanvas').andCallFake(function(){});
		instance.currentTool='sp-trapezoid';
		ScratchPad.bindShapeTools(instance, {});
		expect(fabric.Circle).not.toHaveBeenCalled();
		expect(fabric.Rect).not.toHaveBeenCalled();
		expect(fabric.Polygon).toHaveBeenCalledWith([{x:60,y:150}, {x:150, y: 150}, {x:150, y: 225}, {x:0, y:225}],{fill:'black'});
		expect(ScratchPadTools.createPolygon).not.toHaveBeenCalled();
	});	
	it('tests hexagon', function(){
		
		spyOn(ScratchPad, 'addToCanvas').andCallFake(function(){});
		instance.currentTool='sp-hexagon';
		ScratchPad.bindShapeTools(instance, {});
		expect(fabric.Circle).not.toHaveBeenCalled();
		expect(fabric.Rect).not.toHaveBeenCalled();
		expect(fabric.Polygon).not.toHaveBeenCalled();
		expect(ScratchPadTools.createPolygon).toHaveBeenCalledWith({sides:6,centerX:2,centerY:3,size: 60});
	});	
	it('tests pentagon', function(){
		
		spyOn(ScratchPad, 'addToCanvas').andCallFake(function(){});
		instance.currentTool='sp-pentagon';
		ScratchPad.bindShapeTools(instance, {});
		expect(fabric.Circle).not.toHaveBeenCalled();
		expect(fabric.Rect).not.toHaveBeenCalled();
		expect(fabric.Polygon).not.toHaveBeenCalled();
		expect(ScratchPadTools.createPolygon).toHaveBeenCalledWith({sides:5,centerX:2,centerY:3,size: 60});
	});	
	it('tests octagon', function(){
		
		spyOn(ScratchPad, 'addToCanvas').andCallFake(function(){});
		instance.currentTool='sp-octagon';
		ScratchPad.bindShapeTools(instance, {});
		expect(fabric.Circle).not.toHaveBeenCalled();
		expect(fabric.Rect).not.toHaveBeenCalled();
		expect(fabric.Polygon).not.toHaveBeenCalled();
		expect(ScratchPadTools.createPolygon).toHaveBeenCalledWith({sides:8,centerX:2,centerY:3,size: 60});
	});	
	it('tests decagon', function(){
		
		spyOn(ScratchPad, 'addToCanvas').andCallFake(function(){});
		instance.currentTool='sp-decagon';
		ScratchPad.bindShapeTools(instance, {});
		expect(fabric.Circle).not.toHaveBeenCalled();
		expect(fabric.Rect).not.toHaveBeenCalled();
		expect(fabric.Polygon).not.toHaveBeenCalled();
		expect(ScratchPadTools.createPolygon).toHaveBeenCalledWith({sides:10,centerX:2,centerY:3,size: 60});
	});	
});
describe('tests mouse down event firing',function(){
	var instance ;
	beforeEach(function(){
		instance = {
			 canvas : {
				getPointer : function(obj){
					return {x:2,y:3};
				},
				 on: function(event, callback){
					callback();
				}
			},
			
		};
		spyOn(ScratchPad,'bindTextPlaceHandler').andCallFake(function(i,e){});
		spyOn(ScratchPad,'toggleActiveMenu').andCallFake(function(i,e){});
		spyOn(ScratchPad,'bindLineTools').andCallFake(function(i,e){});
		spyOn(ScratchPad,'bindShapeTools').andCallFake(function(i,e){});
		spyOn(ScratchPad,'bindTriangleHandler').andCallFake(function(i,e){});
		spyOn(ScratchPad,'bindDeletionHandler').andCallFake(function(i,e){});
	});
	it('tests Text event firing', function(){
		
		instance.currentTool = 'Text';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).toHaveBeenCalled();
		expect(ScratchPad.toggleActiveMenu).toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests Delete event firing', function(){
		
		instance.currentTool = 'Delete';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests equilateral triangle event firing', function(){
		
		instance.currentTool = 'sp-eq-triangle';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests right angled triangle event firing', function(){
		
		instance.currentTool = 'sp-right-triangle';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests scelene triangle event firing', function(){
		
		instance.currentTool = 'sp-right-triangle';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests line event firing', function(){
		
		instance.currentTool = 'sp-line';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests ray event firing', function(){
		
		instance.currentTool = 'sp-ray';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests double ray event firing', function(){
		
		instance.currentTool = 'sp-double-ray';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests circle event firing', function(){
		
		instance.currentTool = 'sp-circle';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests rectangle event firing', function(){
		
		instance.currentTool = 'sp-rectangle';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests parallelogram event firing', function(){
		
		instance.currentTool = 'sp-parallelogram';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests eq trapezoid event firing', function(){
		
		instance.currentTool = 'sp-eq-trapezoid';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests trapezoid event firing', function(){
		
		instance.currentTool = 'sp-trapezoid';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests decagon event firing', function(){
		
		instance.currentTool = 'sp-decagon';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests pentagon event firing', function(){
		
		instance.currentTool = 'sp-pentagon';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests hexagon event firing', function(){
		
		instance.currentTool = 'sp-hexagon';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests octagon event firing', function(){
		
		instance.currentTool = 'sp-octagon';
		ScratchPad.bindEventsToMouseDown(instance);
		instance.canvas.on('mouse:down', function(){});
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	
});