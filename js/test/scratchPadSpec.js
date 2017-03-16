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
        expect($menu.html().indexOf("sp-trash")).not.toBe(-1);
        expect($menu.html().indexOf("sp-selector")).not.toBe(-1);
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
describe('tests events on scratchpad menu', function(){
    var instance;
    beforeEach(function(){
        $("<div id='test'></div>").appendTo('body');
        ScratchPad.init("#test", {menu: ["undo","text", "shapes"]});
        instance = Object.values(ScratchPad.instances)[0];
    });
    afterEach(function(){
        $('#test').remove();
        ScratchPad.instances = {};
    });
    it("sets drawing as default menu", function(){
        expect($("#test [data-action='sp-drawing']").hasClass("active")).toBe(true);
    });
    it("sets clicked item as active, and turns back to selector if unselected", function(){
        $("#test [data-action='sp-trash']").click();
        expect($("#test [data-action='sp-drawing']").hasClass("active")).toBe(false);
        expect($("#test [data-action='sp-trash']").hasClass("active")).toBe(true);
        
        $("#test [data-action='sp-trash']").click();
        expect($("#test [data-action='sp-trash']").hasClass("active")).toBe(false);
        expect($("#test [data-action='sp-selector']").hasClass("active")).toBe(true);
    });
    it("turns drawing mode on and off", function(){
        expect(instance.canvas.isDrawingMode).toBe(true);
        $("#test [data-action='sp-selector']").click();
        expect(instance.canvas.isDrawingMode).toBe(false);
        $("#test [data-action='sp-drawing']").click();
        expect(instance.canvas.isDrawingMode).toBe(true);
    });
    it("does not set current tool if action is immediate", function(){
        $("#test [data-action='sp-trash']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-trash");
        $("#test [data-action='sp-undo']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-trash");
    });
    it("sets current tool if action is defered or both", function(){
        $("#test [data-action='sp-selector']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-selector");
        $("#test [data-action='sp-trash']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-trash");
    });
});

describe('tests text',function(){
    var instance, setSpy, textSpy;
    beforeEach(function(){
        $("body").append("<div id='test'></div>");
        ScratchPad.init("#test", {menu:["text"]});
        instance = Object.values(ScratchPad.instances)[0];
        
        instance.canvas.getPointer = function(obj) {return {x:2,y:3};};
        spyOn(instance.canvas, "add");
        
        setSpy = jasmine.createSpy("set");
        textSpy = jasmine.createSpy("Textbox").andReturn({name: "textbox", set:setSpy});
        fabric.Textbox = textSpy;
    });
    afterEach(function(){
        $('#test').remove();
        ScratchPad.instances = {};
    });
	it('tests add text', function(){ 
		$("#test [data-action='sp-text']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-text");
        instance.canvas.trigger('mouse:down');
        
		expect(textSpy).toHaveBeenCalledWith('Click to add text',{
                fontSize: 20, 
                left: 2,
                top: 3,
                width: 150
        });
	});
});

describe("Trash Can", function(){
    var instance;
    beforeEach(function(){
        $("body").append("<div id='test'></div>");
        ScratchPad.init("#test", {menu:["text", "shapes"]});
        instance = Object.values(ScratchPad.instances)[0];
        instance.canvas.getPointer = function(obj) {return {x:2,y:3};};
        spyOn(instance.canvas, "discardActiveGroup");
    });
    afterEach(function(){
        $('#test').remove();
        ScratchPad.instances = {};
    });
    it('deletes selected object', function(){
        spyOn(instance.canvas, "remove").andCallThrough();
        expect((instance.canvas._objects).length).toBe(0);
        $("#test [data-action='sp-line']").click();
        instance.canvas.trigger("mouse:down");
        expect(instance.canvas._objects.length).toBe(1);
        
        var object = instance.canvas._objects[0];
        instance.canvas._activeObject = object;
        
        $("#test [data-action='sp-trash']").click();
        expect(instance.canvas._objects.length).toBe(0);
        expect(instance.canvas.remove).toHaveBeenCalledWith(object);
    });
    it("delete object groups", function(){
        spyOn(instance.canvas, "remove");
        expect((instance.canvas._objects).length).toBe(0);
        $("#test [data-action='sp-line']").click();
        instance.canvas.trigger("mouse:down");
        $("#test [data-action='sp-circle']").click();
        instance.canvas.trigger("mouse:down");
        expect((instance.canvas._objects).length).toBe(2);
        var objects = instance.canvas._objects;
        instance.canvas._activeGroup = {getObjects: function(){return objects}};
        $("#test [data-action='sp-trash']").click();
        expect(instance.canvas.remove.calls.length).toBe(2);
        expect(instance.canvas.discardActiveGroup).toHaveBeenCalled();
    });
});

describe('build lines', function(){
    var instance, setSpy, lineSpy, polygonSpy;
    beforeEach(function(){
        $("body").append("<div id='test'></div>");
        ScratchPad.init("#test", {menu:["shapes"]});
        instance = Object.values(ScratchPad.instances)[0];
        
        instance.canvas.getPointer = function(obj) {return {x:2,y:3};};
        spyOn(instance.canvas, "add");
        spyOn(ScratchPadTools, "buildRay").andCallThrough();
        
        setSpy = jasmine.createSpy("set");
        lineSpy = jasmine.createSpy("Line").andReturn({name: "line", set:setSpy});
        polygonSpy = jasmine.createSpy("Polygon").andReturn({name: "polygon", set:setSpy});
        
        fabric.Line = lineSpy;
        fabric.Polygon = polygonSpy;
    });
    afterEach(function(){
        $('#test').remove();
        ScratchPad.instances = {};
    });
    it('tests line', function(){
        $("#test [data-action='sp-line']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-line");
        instance.canvas.trigger('mouse:down');
		
        expect(lineSpy).toHaveBeenCalledWith([ 2, 3, 102, 3 ], { left : 2, top : 3, stroke : 'black', strokeWidth : 2 });
        expect(polygonSpy).not.toHaveBeenCalled();
        expect(ScratchPadTools.buildRay).not.toHaveBeenCalled();
	});
	it('tests ray', function(){
        $("#test [data-action='sp-ray']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-ray");
        instance.canvas.trigger('mouse:down');
		
        expect(lineSpy).toHaveBeenCalledWith([ 2, 3, 102, 3 ], { left : 2, top : 3, stroke : 'black', strokeWidth : 2 });
        expect(polygonSpy).toHaveBeenCalledWith([ { x : 2, y : 3 }, { x : 102, y : 3 }, { x : 95, y : -4.000000000000001 }, { x : 116, y : 5 }, { x : 95, y : 14 }, { x : 102, y : 7 }, { x : 2, y : 7 } ]);
        expect(ScratchPadTools.buildRay).toHaveBeenCalled();
	});
	it('tests double ray', function(){
		$("#test [data-action='sp-double-ray']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-double-ray");
        instance.canvas.trigger('mouse:down');
		
        expect(lineSpy).toHaveBeenCalledWith([ 2, 3, 102, 3 ], { left : 2, top : 3, stroke : 'black', strokeWidth : 2 });
        expect(polygonSpy).toHaveBeenCalledWith([ { x : 17, y : 3 }, { x : 117, y : 3 }, { x : 110, y : -4.000000000000001 }, { x : 131, y : 5 }, { x : 110, y : 14 }, { x : 117, y : 7 }, { x : 17, y : 7 }, { x : 24, y : 14 }, { x : 2.9999999999999982, y : 5 }, { x : 24, y : -4.000000000000001 } ]);
        expect(ScratchPadTools.buildRay).toHaveBeenCalled();
	});
});

describe('build shapes',function(){
	var instance, setSpy, circleSpy, triangleSpy, rectSpy, polygonSpy;
	beforeEach(function(){
        $("body").append("<div id='test'></div>");
        ScratchPad.init("#test", {menu:["shapes"]});
        instance = Object.values(ScratchPad.instances)[0];
        
        instance.canvas.getPointer = function(obj) {return {x:2,y:3};};
        spyOn(instance.canvas, "add");
        spyOn(ScratchPadTools, "createPolygon").andCallThrough();
        
        setSpy = jasmine.createSpy("set");
        circleSpy = jasmine.createSpy("Circle").andReturn({name: "circle", set:setSpy});
        triangleSpy = jasmine.createSpy("Triangle").andReturn({name: "triangle", set:setSpy});
        rectSpy = jasmine.createSpy("Rect").andReturn({name: "rect", set:setSpy});
        polygonSpy = jasmine.createSpy("Polygon").andReturn({name: "polygon", set:setSpy});
        
        fabric.Circle = circleSpy;
        fabric.Triangle = triangleSpy;
        fabric.Rect = rectSpy;
        fabric.Polygon = polygonSpy;
	});
    afterEach(function(){
        $('#test').remove();
        ScratchPad.instances = {};
    });
	it('tests circle', function(){        
        $("#test [data-action='sp-circle']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-circle");
        instance.canvas.trigger('mouse:down');
        
		expect(circleSpy).toHaveBeenCalledWith({radius:50, fill:'black'});
        expect(triangleSpy).not.toHaveBeenCalled();
		expect(rectSpy).not.toHaveBeenCalled();
		expect(polygonSpy).not.toHaveBeenCalled();
		expect(ScratchPadTools.createPolygon).not.toHaveBeenCalled();
	});	
    it('tests equilateral triangle', function(){ 
		$("#test [data-action='sp-eq-triangle']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-eq-triangle");
        instance.canvas.trigger('mouse:down');
        
		expect(circleSpy).not.toHaveBeenCalled();
        expect(triangleSpy).toHaveBeenCalledWith({height:100, width:100});
		expect(rectSpy).not.toHaveBeenCalled();
		expect(polygonSpy).not.toHaveBeenCalledWith();
		expect(ScratchPadTools.createPolygon).not.toHaveBeenCalled();
	});
	it('tests right angled triangle', function(){
		$("#test [data-action='sp-right-triangle']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-right-triangle");
        instance.canvas.trigger('mouse:down');
        
		expect(circleSpy).not.toHaveBeenCalled();
        expect(triangleSpy).not.toHaveBeenCalled();
		expect(rectSpy).not.toHaveBeenCalled();
		expect(polygonSpy).toHaveBeenCalledWith([{x:0,y:0}, {x:0, y:100},{x:100, y:100}]);
		expect(ScratchPadTools.createPolygon).not.toHaveBeenCalled();
	});
	it('tests scelene triangle', function(){
		$("#test [data-action='sp-scelene']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-scelene");
        instance.canvas.trigger('mouse:down');
        
		expect(circleSpy).not.toHaveBeenCalled();
        expect(triangleSpy).not.toHaveBeenCalled();
		expect(rectSpy).not.toHaveBeenCalled();
		expect(polygonSpy).toHaveBeenCalledWith([{x:100,y:100},{x:200,y:35},{x:160,y:100}]);
		expect(ScratchPadTools.createPolygon).not.toHaveBeenCalled();
	});
    it("test sp-parallelogram", function(){
        $("#test [data-action='sp-parallelogram']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-parallelogram");
        instance.canvas.trigger('mouse:down');
        
		expect(circleSpy).not.toHaveBeenCalled();
        expect(triangleSpy).not.toHaveBeenCalled();
		expect(rectSpy).toHaveBeenCalledWith({width:100, height:50, fill:'black',skewX:320});
		expect(polygonSpy).not.toHaveBeenCalled();
		expect(ScratchPadTools.createPolygon).not.toHaveBeenCalled();
    });
	it('tests rectangle', function(){
        $("#test [data-action='sp-rectangle']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-rectangle");
        instance.canvas.trigger('mouse:down');
        
		expect(circleSpy).not.toHaveBeenCalled();
        expect(triangleSpy).not.toHaveBeenCalled();
		expect(rectSpy).toHaveBeenCalledWith({width:100, height:100, fill:'black'});
		expect(polygonSpy).not.toHaveBeenCalled();
		expect(ScratchPadTools.createPolygon).not.toHaveBeenCalled();
	});	
	it('tests eq trapezoid', function(){
        $("#test [data-action='sp-eq-trapezoid']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-eq-trapezoid");
        instance.canvas.trigger('mouse:down');
        
		expect(circleSpy).not.toHaveBeenCalled();
        expect(triangleSpy).not.toHaveBeenCalled();
		expect(rectSpy).not.toHaveBeenCalled();
		expect(polygonSpy).toHaveBeenCalledWith([{x:30, y:150}, {x:120, y:150}, {x:150, y: 225}, {x:0, y:225}],{fill:'black'});
		expect(ScratchPadTools.createPolygon).not.toHaveBeenCalled();
	});	
	it('tests trapezoid', function(){
		$("#test [data-action='sp-trapezoid']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-trapezoid");
        instance.canvas.trigger('mouse:down');
        
		expect(circleSpy).not.toHaveBeenCalled();
        expect(triangleSpy).not.toHaveBeenCalled();
		expect(rectSpy).not.toHaveBeenCalled();
		expect(polygonSpy).toHaveBeenCalledWith([{x:60,y:150}, {x:150, y: 150}, {x:150, y: 225}, {x:0, y:225}],{fill:'black'});
		expect(ScratchPadTools.createPolygon).not.toHaveBeenCalled();
	});	
	it('tests hexagon', function(){
        $("#test [data-action='sp-hexagon']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-hexagon");
        instance.canvas.trigger('mouse:down');
        
		expect(circleSpy).not.toHaveBeenCalled();
        expect(triangleSpy).not.toHaveBeenCalled();
		expect(rectSpy).not.toHaveBeenCalled();
		expect(polygonSpy).toHaveBeenCalledWith([ { x : 62, y : 3 }, { x : 32, y : 54.96 }, { x : -28, y : 54.96 }, { x : -58, y : 3 }, { x : -28, y : -48.96 }, { x : 32, y : -48.96 }, { x : 62, y : 3 } ], { stroke : 'black', fill : 'black' });
		expect(ScratchPadTools.createPolygon).toHaveBeenCalledWith({sides:6,centerX:2,centerY:3,size: 60});
	});	
	it('tests pentagon', function(){
        $("#test [data-action='sp-pentagon']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-pentagon");
        instance.canvas.trigger('mouse:down');
        
		expect(circleSpy).not.toHaveBeenCalled();
        expect(triangleSpy).not.toHaveBeenCalled();
		expect(rectSpy).not.toHaveBeenCalled();
		expect(polygonSpy).toHaveBeenCalledWith([ { x : 62, y : 3 }, { x : 20.54, y : 60.06 }, { x : -46.54, y : 38.27 }, { x : -46.54, y : -32.27 }, { x : 20.54, y : -54.06 }, { x : 62, y : 3 } ], { stroke : 'black', fill : 'black' });
		expect(ScratchPadTools.createPolygon).toHaveBeenCalledWith({sides:5,centerX:2,centerY:3,size: 60});
	});	
	it('tests octagon', function(){
		$("#test [data-action='sp-octagon']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-octagon");
        instance.canvas.trigger('mouse:down');
        
		expect(circleSpy).not.toHaveBeenCalled();
        expect(triangleSpy).not.toHaveBeenCalled();
		expect(rectSpy).not.toHaveBeenCalled();
		expect(polygonSpy).toHaveBeenCalledWith([ { x : 62, y : 3 }, { x : 44.43, y : 45.43 }, { x : 2, y : 63 }, { x : -40.43, y : 45.43 }, { x : -58, y : 3 }, { x : -40.43, y : -39.43 }, { x : 2, y : -57 }, { x : 44.43, y : -39.43 }, { x : 62, y : 3 } ], { stroke : 'black', fill : 'black' });
		expect(ScratchPadTools.createPolygon).toHaveBeenCalledWith({sides:8,centerX:2,centerY:3,size: 60});
	});	
	it('tests decagon', function(){
		$("#test [data-action='sp-decagon']").click();
        expect($(instance.currentTool).data("action")).toBe("sp-decagon");
        instance.canvas.trigger('mouse:down');
        
		expect(circleSpy).not.toHaveBeenCalled();
        expect(triangleSpy).not.toHaveBeenCalled();
		expect(rectSpy).not.toHaveBeenCalled();
		expect(polygonSpy).toHaveBeenCalledWith([ { x : 62, y : 3 }, { x : 50.54, y : 38.27 }, { x : 20.54, y : 60.06 }, { x : -16.54, y : 60.06 }, { x : -46.54, y : 38.27 }, { x : -58, y : 3 }, { x : -46.54, y : -32.27 }, { x : -16.54, y : -54.06 }, { x : 20.54, y : -54.06 }, { x : 50.54, y : -32.27 }, { x : 62, y : 3 } ], { stroke : 'black', fill : 'black' });
		expect(ScratchPadTools.createPolygon).toHaveBeenCalledWith({sides:10,centerX:2,centerY:3,size: 60});
	});	
});