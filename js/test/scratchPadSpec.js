describe('Test ScratchPad',function(){
    beforeEach(function(){
        $("<div id='test'></div>").appendTo('body');
    });
    afterEach(function(){
        $('#test').remove();
        ScratchPad.instances = {};
    });
    it('tests buildMenu ', function(){
        ScratchPad.init("#test");
        var $menu = $("#test").find(".sp-menu");
        expect($menu.html().indexOf('sp-drawing')).not.toBe(-1);
    });
    it('tests buildMenu with unknown items', function(){
        ScratchPad.init("#test");
        var $menu = $("#test").find(".sp-menu");
        expect($menu.html().indexOf("sp-eraser")).not.toBe(-1);
    });
    it('tests init', function(){
        spyOn(ScratchPadBuilder.prototype,'buildInstance').andCallThrough();
        spyOn(ScratchPadBuilder.prototype,'buildMenu').andCallThrough();
        spyOn(ScratchPadBuilder.prototype,'buildPad').andCallThrough();
        spyOn(ScratchPadBuilder.prototype,'bindEvents').andCallThrough();
        spyOn(ScratchPadBuilder.prototype,'convertToFabric').andCallThrough();
		spyOn(ScratchPadBuilder.prototype,'bindEventsToMouseDown').andCallThrough();
        
        ScratchPad.init('#test');
        var instance = Object.values(ScratchPad.instances)[0];
        expect(ScratchPadBuilder.prototype.buildInstance).toHaveBeenCalledWith('#test', undefined);
        expect(ScratchPadBuilder.prototype.buildMenu).toHaveBeenCalledWith(instance);
        expect(ScratchPadBuilder.prototype.buildPad).toHaveBeenCalledWith(instance);
        expect(ScratchPadBuilder.prototype.bindEvents).toHaveBeenCalledWith(instance);
    });
    
    it('tests buildInstance', function(){
        ScratchPad.init('#test');
        var instance = Object.values(ScratchPad.instances)[0];
        expect(instance.id).not.toBeNull();
        expect(instance.menu).toEqual(ScratchPad.getDefaultMenu());
        expect(instance.dimension).toEqual(ScratchPad.getDefaultDimension());
    });
    
    it('tests buildInstance with a config', function(){
        var dimension = {width:10, height:20};
        var menu = ["menu1",  "menu2"];
        ScratchPad.init('#test', {
            dimension : dimension,
            menu : menu,
        });
        var instance = Object.values(ScratchPad.instances)[0];
        expect(instance.id).not.toBeNull();
        expect(instance.menu).toBe(menu);
        expect(instance.dimension).toBe(dimension);
    });
    it('tests buildPad adds html canvas to scratch pad', function(){
        ScratchPad.init('#test');
        var instance = Object.values(ScratchPad.instances)[0];
        expect($("#test canvas").length).toBe(2);
        expect($("#test .sp-canvas-wrapper .sp-canvas#"+instance.id).length).toBe(1);
    });
    it('tests convert to Fabric calls FabricJS', function(){
        spyOn(fabric,'Canvas').andReturn({
            on: jasmine.createSpy("on")
        });
        var config = {dimension:{width:200,height:200}};
        ScratchPad.init("#test", config);
        var instance = Object.values(ScratchPad.instances)[0];
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
    afterEach(function(){
        ScratchPad.instances = {};
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
	var instance, spyEvents = {};
	beforeEach(function(){
        $("<div id='test'></div>").appendTo('body');
		spyOn(ScratchPad,'bindTextPlaceHandler');
		spyOn(ScratchPad,'toggleActiveMenu');
		spyOn(ScratchPad,'bindLineTools');
		spyOn(ScratchPad,'bindShapeTools');
		spyOn(ScratchPad,'bindTriangleHandler');
		spyOn(ScratchPad,'bindDeletionHandler');
        spyOn(ScratchPadBuilder.prototype, "convertToFabric").andCallFake(function(spyInstance){
            spyInstance.canvas = {
                getPointer : function(obj){return {x:2,y:3};},
                on: function(event, callback){
                    spyEvents[event] = callback
                },
                trigger: function(event) {
                    spyEvents[event]();
                }
            };
        });
        ScratchPad.init("#test");
        instance = Object.values(ScratchPad.instances)[0];
	});
    afterEach(function(){
        $('#test').remove();
        ScratchPad.instances = {};
    });
	it('tests Text event firing', function(){
		instance.currentTool = 'Text';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).toHaveBeenCalled();
		expect(ScratchPad.toggleActiveMenu).toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests Delete event firing', function(){
		instance.currentTool = 'Delete';
        instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests equilateral triangle event firing', function(){
		instance.currentTool = 'sp-eq-triangle';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests right angled triangle event firing', function(){
		instance.currentTool = 'sp-right-triangle';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests scelene triangle event firing', function(){
		instance.currentTool = 'sp-right-triangle';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests line event firing', function(){
		instance.currentTool = 'sp-line';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests ray event firing', function(){
		instance.currentTool = 'sp-ray';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests double ray event firing', function(){
		instance.currentTool = 'sp-double-ray';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).not.toHaveBeenCalled();
	});
	it('tests circle event firing', function(){
		instance.currentTool = 'sp-circle';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests rectangle event firing', function(){
		instance.currentTool = 'sp-rectangle';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests parallelogram event firing', function(){
		instance.currentTool = 'sp-parallelogram';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests eq trapezoid event firing', function(){
		instance.currentTool = 'sp-eq-trapezoid';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests trapezoid event firing', function(){
		instance.currentTool = 'sp-trapezoid';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests decagon event firing', function(){
		instance.currentTool = 'sp-decagon';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests pentagon event firing', function(){
		instance.currentTool = 'sp-pentagon';
		instance.canvas.trigger('mouse:down');
        expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests hexagon event firing', function(){
		instance.currentTool = 'sp-hexagon';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});
	it('tests octagon event firing', function(){
		instance.currentTool = 'sp-octagon';
		instance.canvas.trigger('mouse:down');
		expect(ScratchPad.bindTextPlaceHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindDeletionHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindLineTools).not.toHaveBeenCalled();
		expect(ScratchPad.bindTriangleHandler).not.toHaveBeenCalled();
		expect(ScratchPad.bindShapeTools).toHaveBeenCalled();
	});

});