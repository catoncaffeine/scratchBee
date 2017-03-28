describe('Test ScratchPad',function(){
  beforeEach(function(){
    $("<div id='test'></div>").appendTo('body');
  });
  afterEach(function(){
    ScratchPad.destroyAll();
    $('#test').remove();
  });
  it('tests buildMenu ', function(){
    ScratchPad.init("#test");
    var $menu = $("#test").find(".sp-menu");
    expect($menu.html().indexOf('sp-pencil')).not.toBe(-1);
    expect($menu.html().indexOf("sp-trash")).not.toBe(-1);
    expect($menu.html().indexOf("selector")).not.toBe(-1);
  });
  it('tests buildInstance', function(){
    var instance = ScratchPad.init('#test');
    expect(instance.id).not.toBeNull();
    expect(instance.menu).toEqual(ScratchPad.getDefaultMenu());
    expect(instance.dimension).toEqual(ScratchPad.getDefaultDimension());
  });

  it('tests buildInstance with a config', function(){
    var dimension = {width:10, height:20};
    var menu = ["menu1",  "menu2"];
    var instance = ScratchPad.init('#test', {
      dimension : dimension,
      menu : menu,
    });
    expect(instance.id).not.toBeNull();
    expect(instance.menu).toBe(menu);
    expect(instance.dimension).toBe(dimension);
  });
  it('tests buildPad adds html canvas to scratch pad', function(){
    var instance = ScratchPad.init('#test');
    expect($("#test canvas").length).toBe(2);
    expect($("#test .sp-canvas-wrapper .sp-canvas#"+instance.id).length).toBe(1);
  });
  it('tests convert to Fabric calls FabricJS', function(){
    spyOn(fabric,'Canvas').andReturn({
      on: jasmine.createSpy("on"),
      observe: jasmine.createSpy("observe"),
      dispose: jasmine.createSpy("dispose")
    });
    var instance = ScratchPad.init("#test", {dimension: {width:200,height:200}});
    expect(fabric.Canvas).toHaveBeenCalledWith(instance.id,{isDrawingMode:true,stateful:true, enableRetinaScaling: false});
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
describe('Scrath Pad Menu - ', function(){
  var instance;
  beforeEach(function(){
    $("<div id='test'></div>").appendTo('body');
    instance = ScratchPad.init("#test", {menu: ["undo","text", "shapes"]});
  });
  afterEach(function(){
    ScratchPad.destroyAll();
    $('#test').remove();
  });
  it("sets pencil as default menu", function(){
    console.log($("#test .active")[0]);
    expect($("#test .active").data("action")).toBe("pencil");
  });
  it("sets clicked item as active, and turns back to pencil if unselected", function(){
    $("#test [data-action='trash']").click();
    expect($("#test [data-action='pencil']").hasClass("active")).toBe(false);
    expect($("#test [data-action='trash']").hasClass("active")).toBe(true);

    $("#test [data-action='trash']").click();
    expect($("#test [data-action='trash']").hasClass("active")).toBe(false);
    expect($("#test [data-action='pencil']").hasClass("active")).toBe(true);
  });
  it("turns pencil mode on and off", function(){
    expect(instance.canvas.isDrawingMode).toBe(true);
    $("#test [data-action='selector']").click();
    expect(instance.canvas.isDrawingMode).toBe(false);
    $("#test [data-action='pencil']").click();
    expect(instance.canvas.isDrawingMode).toBe(true);
  });
  it("does not set current tool if action is immediate", function(){
    $("#test [data-action='trash']").click();
    expect(instance.currentTool).toBe("trash");
  });
  it("sets current tool to selector if redo or undo", function(){
    $("#test [data-action='undo']").click();
    expect(instance.currentTool).toBe("selector");  
    $("#test [data-action='trash']").click();
    expect(instance.currentTool).toBe("trash");
    $("#test [data-action='redo']").click();
    expect(instance.currentTool).toBe("selector");  
  });
  it("sets current tool if action is defered or both", function(){
    $("#test [data-action='selector']").click();
    expect(instance.currentTool).toBe("selector");
    $("#test [data-action='trash']").click();
    expect(instance.currentTool).toBe("trash");
  });
});

describe('Text - ',function(){
  var instance, setSpy, textSpy, onSpy;
  beforeEach(function(){
    $("body").append("<div id='test'></div>");
    instance = ScratchPad.init("#test", {menu:["text"]});

    instance.canvas.getPointer = function(obj) {return {x:2,y:3};};
    spyOn(instance.canvas, "add");

    setSpy = jasmine.createSpy("set");
    onSpy = jasmine.createSpy("on");
    textSpy = jasmine.createSpy("Textbox").andReturn({
        name: "textbox", set:setSpy, on: onSpy
    });
    fabric.Textbox = textSpy;
  });
  afterEach(function(){
    ScratchPad.destroyAll();
    $('#test').remove();
  });
  it('adds text just one time', function(){
    $("#test [data-action='text']").click();
    expect(instance.currentTool).toBe("text");
    instance.canvas.trigger('mouse:down');

    expect(textSpy).toHaveBeenCalledWith('Click to add text',{
      fontSize: 20,
      width: 150
    });
    expect(instance.currentTool).toBe("selector");
  });
});

describe("Trash Can -", function(){
    var instance;
    beforeEach(function(){
        $("body").append("<div id='test'></div>");
        instance = ScratchPad.init("#test", {menu:["text", "shapes"]});
        instance.canvas.getPointer = function(obj) {return {x:2,y:3};};
		 spyOn(instance.canvas, "renderAll");
    });
    afterEach(function(){
        ScratchPad.instances = {};
        $('#test').remove();
    });
    it('deletes selected object', function(){
        spyOn(instance.canvas, "remove").andCallThrough();
        expect((instance.canvas._objects).length).toBe(0);
        $("#test [data-action='line']").click();
        instance.canvas.trigger("mouse:down");
        expect(instance.canvas._objects.length).toBe(1);
        
        var object = instance.canvas._objects[0];
		object.active = true;
        instance.canvas._activeObject = object;
        
        $("#test [data-action='trash']").click();
        expect(instance.canvas._objects.length).toBe(0);
        expect(instance.canvas.renderAll).toHaveBeenCalled();
    });
    it("deletes object groups", function(){
        spyOn(instance.canvas, "remove");
        expect((instance.canvas._objects).length).toBe(0);
        $("#test [data-action='line']").click();
        instance.canvas.trigger("mouse:down");
        $("#test [data-action='circle']").click();
        instance.canvas.trigger("mouse:down");
        expect((instance.canvas._objects).length).toBe(2);
        var objects = instance.canvas._objects;
		objects.forEach(function(obj){
			obj.active = true;
		});
        $("#test [data-action='trash']").click();
        expect(instance.canvas.renderAll.calls.length).toBe(2);
    });
});
describe('test undo / redo', function(){
	var instance;
	beforeEach(function(){
        $("body").append("<div id='test'></div>");
        instance = ScratchPad.init("#test", {menu:["text","shapes"]});
        instance.canvas.getPointer = function(obj) {return {x:2,y:3};};
	});
    afterEach(function(){
        ScratchPad.destroyAll();
        $('#test').remove();
    });
	
	it('tests trackObjectHistory with object added', function(){
		$("#test [data-action='line']").click();
        instance.canvas.trigger('mouse:down');
		expect(instance.canvas).toBeDefined();
		expect(instance.undo.length).toBe(1);
		var undo = instance.undo[0];
		expect(undo.itemIndex[0]).toBe(0);
		expect(undo.itemType).toBe('Object');
		expect(undo.action).toBe(1);
	});
	it('test trackObjectHistory with object modified', function(){
		$("#test [data-action='line']").click();
        instance.canvas.trigger('mouse:down');
		instance.selectedObject = [];
		instance.selectedObject[0]={itemIndex:[0],itemType:'Object', itemProperties:{}};
		instance.canvas.trigger('object:modified');
		
		expect(instance.undo.length).toBe(2);
		var undo = instance.undo[0];
		expect(undo.itemIndex[0]).toBe(0);
		expect(undo.itemType).toBe('Object');
		expect(undo.action).toBe(1);
		undo = instance.undo[1];
		expect(undo.itemIndex[0]).toBe(0);
		expect(undo.itemType).toBe('Object');
		expect(undo.action).toBe(3);
	});
	it('test trackObjectHistory with object removed', function(){
		$("#test [data-action='line']").click();
        instance.canvas.trigger('mouse:down');
		
		instance.canvas.setActiveObject(instance.canvas.item(0));//.active=true;
		$('#test [data-action="trash"]').click();
		expect(instance.undo.length).toBe(2);
		var undo = instance.undo[0];
		expect(undo.itemIndex[0]).toBe(0);
		expect(undo.itemType).toBe('Object');
		expect(undo.action).toBe(1);
		undo = instance.undo[1];
		expect(undo.itemIndex[0]).toBe(0);
		expect(undo.itemType).toBe('Object');
		expect(undo.action).toBe(2);
	});
	it('test trackObjectHistory with objects removed', function(){
		$("#test [data-action='line']").click();
        instance.canvas.trigger('mouse:down');
		instance.currentTool='line';
		instance.canvas.trigger('mouse:down');
		instance.currentTool='line';
		instance.canvas.trigger('mouse:down');
		var obj1 = instance.canvas.item(0);
		var obj2 = instance.canvas.item(1);
		var obj3 = instance.canvas.item(2);
		var group = new fabric.Group();
		group.addWithUpdate(obj1);
		group.addWithUpdate(obj2);
		group.addWithUpdate(obj3);
		instance.canvas.setActiveGroup(group);
		$('#test [data-action="trash"]').click();
		instance.canvas.trigger('mouse:down');
		expect(instance.undo.length).toBe(4);
		var undo = instance.undo[0];
		expect(undo.itemIndex[0]).toBe(0);
		expect(undo.itemType).toBe('Object');
		expect(undo.action).toBe(1);
		undo = instance.undo[3];
		expect(undo.itemIndex).toEqual([0,1,2]);
		expect(undo.itemType).toBe('Object');
		expect(undo.action).toBe(2);
	});
	it('test trackObjectHistory with objects modified', function(){
		$("#test [data-action='line']").click();
        instance.canvas.trigger('mouse:down');
		instance.currentTool='line';
		instance.canvas.trigger('mouse:down');
		instance.currentTool='line';
		instance.canvas.trigger('mouse:down');
		instance.canvas.item(0).active=true;
		instance.canvas.item(1).active=true;
		instance.canvas.item(2).active=true;
		instance.selectedObject = [];
		instance.selectedObject[0]={'itemType':'Group','action':'3','itemProperties':''};
		instance.canvas.trigger('object:modified');
		expect(instance.undo.length).toBe(4);
		var undo = instance.undo[0];
		expect(undo.itemIndex[0]).toBe(0);
		expect(undo.itemType).toBe('Object');
		expect(undo.action).toBe(1);
		undo = instance.undo[3];
		expect(undo.itemType).toBe('Group');
		expect(undo.action).toBe(3);
	});
	
	it('test trackObjectHistory making sure it holds only 10 objects', function(){
		$("#test [data-action='line']").click();
		for(var i =0;i<10;i++){
        	instance.canvas.trigger('mouse:down');
			instance.currentTool='line';
		
		}
		expect(instance.undo.length).toBe(10);
		var undo = instance.undo[9];
		expect(undo.itemIndex[0]).toBe(9);
		undo = instance.undo[0];
		expect(undo.itemIndex[0]).toBe(0);
		instance.canvas.trigger('mouse:down');
		expect(instance.undo[0].itemIndex[0]).toBe(1);
		expect(instance.undo.length).toBe(10);
		expect(instance.undo[9].itemIndex[0]).toBe(10);
	});
});
describe('Build Lines - ', function(){
  var instance, setSpy, lineSpy, polygonSpy;
  beforeEach(function(){
    $("body").append("<div id='test'></div>");
    instance = ScratchPad.init("#test", {menu:["shapes"]});

    instance.canvas.getPointer = function(obj) {return {x:2,y:3};};
    spyOn(instance.canvas, "add");

    setSpy = jasmine.createSpy("set");
    lineSpy = jasmine.createSpy("Line").andReturn({name: "line", set:setSpy});
    polygonSpy = jasmine.createSpy("Polygon").andReturn({name: "polygon", set:setSpy});

    fabric.Line = lineSpy;
    fabric.Polygon = polygonSpy;
  });
  afterEach(function(){
    $('#test').remove();
    ScratchPad.destroyAll();
  });
  it('builds line', function(){
    $("#test [data-action='line']").click();
    expect(instance.currentTool).toBe("line");
    instance.canvas.trigger('mouse:down');

    expect(lineSpy).toHaveBeenCalledWith([ 2, 3, 102, 3 ], { left : 2, top : 3, stroke : 'black', strokeWidth : 2 });
    expect(polygonSpy).not.toHaveBeenCalled();
    expect(instance.currentTool).toBe("selector");
  });
  it('builds ray', function(){
    $("#test [data-action='ray']").click();
    expect(instance.currentTool).toBe("ray");
    instance.canvas.trigger('mouse:down');

    expect(lineSpy).toHaveBeenCalledWith([ 2, 3, 102, 3 ], { left : 2, top : 3, stroke : 'black', strokeWidth : 2 });
    expect(polygonSpy).toHaveBeenCalledWith([ { x : 2, y : 3 }, { x : 102, y : 3 }, { x : 95, y : -4.000000000000001 }, { x : 116, y : 5 }, { x : 95, y : 14 }, { x : 102, y : 7 }, { x : 2, y : 7 } ]);
    expect(instance.currentTool).toBe("selector");
  });
  it('builds double ray', function(){
    $("#test [data-action='doubleray']").click();
    expect(instance.currentTool).toBe("doubleray");
    instance.canvas.trigger('mouse:down');

    expect(lineSpy).toHaveBeenCalledWith([ 2, 3, 102, 3 ], { left : 2, top : 3, stroke : 'black', strokeWidth : 2 });
    expect(polygonSpy).toHaveBeenCalledWith([ { x : 17, y : 3 }, { x : 117, y : 3 }, { x : 110, y : -4.000000000000001 }, { x : 131, y : 5 }, { x : 110, y : 14 }, { x : 117, y : 7 }, { x : 17, y : 7 }, { x : 24, y : 14 }, { x : 2.9999999999999982, y : 5 }, { x : 24, y : -4.000000000000001 } ]);
    expect(instance.currentTool).toBe("selector");
  });
});

describe('Build Shapes - ',function(){
  var instance, setSpy, circleSpy, triangleSpy, rectSpy, polygonSpy;
  beforeEach(function(){
    $("body").append("<div id='test'></div>");
    instance = ScratchPad.init("#test", {menu:["shapes"]});

    instance.canvas.getPointer = function(obj) {return {x:2,y:3};};
    spyOn(instance.canvas, "add");

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
    ScratchPad.destroyAll();
    $('#test').remove();
  });
  it('builds circle', function(){
    $("#test [data-action='circle']").click();
    expect(instance.currentTool).toBe("circle");
    instance.canvas.trigger('mouse:down');

    expect(circleSpy).toHaveBeenCalledWith({radius:50, fill:'black'});
    expect(triangleSpy).not.toHaveBeenCalled();
    expect(rectSpy).not.toHaveBeenCalled();
    expect(polygonSpy).not.toHaveBeenCalled();
    expect(instance.currentTool).toBe("selector");
  });
  it('builds equilateral triangle', function(){
    $("#test [data-action='eq_triangle']").click();
    expect(instance.currentTool).toBe("eq_triangle");
    instance.canvas.trigger('mouse:down');

    expect(circleSpy).not.toHaveBeenCalled();
    expect(triangleSpy).toHaveBeenCalledWith({height:100, width:100});
    expect(rectSpy).not.toHaveBeenCalled();
    expect(polygonSpy).not.toHaveBeenCalledWith();
    expect(instance.currentTool).toBe("selector");
  });
  it('builds right angled triangle', function(){
    $("#test [data-action='right_triangle']").click();
    expect(instance.currentTool).toBe("right_triangle");
    instance.canvas.trigger('mouse:down');

    expect(circleSpy).not.toHaveBeenCalled();
    expect(triangleSpy).not.toHaveBeenCalled();
    expect(rectSpy).not.toHaveBeenCalled();
    expect(polygonSpy).toHaveBeenCalledWith([{x:0,y:0}, {x:0, y:100},{x:100, y:100}]);
    expect(instance.currentTool).toBe("selector");
  });
  it('builds scelene triangle', function(){
    $("#test [data-action='scelene_triangle']").click();
    expect(instance.currentTool).toBe("scelene_triangle");
    instance.canvas.trigger('mouse:down');

    expect(circleSpy).not.toHaveBeenCalled();
    expect(triangleSpy).not.toHaveBeenCalled();
    expect(rectSpy).not.toHaveBeenCalled();
    expect(polygonSpy).toHaveBeenCalledWith([{x:100,y:100},{x:200,y:35},{x:160,y:100}]);
    expect(instance.currentTool).toBe("selector");
  });
  it("builds parallelogram", function(){
    $("#test [data-action='parallelogram']").click();
    expect(instance.currentTool).toBe("parallelogram");
    instance.canvas.trigger('mouse:down');

    expect(circleSpy).not.toHaveBeenCalled();
    expect(triangleSpy).not.toHaveBeenCalled();
    expect(rectSpy).toHaveBeenCalledWith({width:100, height:50, fill:'black',skewX:320});
    expect(polygonSpy).not.toHaveBeenCalled();
    expect(instance.currentTool).toBe("selector");
  });
  it('builds square', function(){
    $("#test [data-action='square']").click();
    expect(instance.currentTool).toBe("square");
    instance.canvas.trigger('mouse:down');

    expect(circleSpy).not.toHaveBeenCalled();
    expect(triangleSpy).not.toHaveBeenCalled();
    expect(rectSpy).toHaveBeenCalledWith({width:100, height:100, fill:'black'});
    expect(polygonSpy).not.toHaveBeenCalled();
    expect(instance.currentTool).toBe("selector");
  });
  it('builds eq trapezoid', function(){
    $("#test [data-action='eq_trapezoid']").click();
    expect(instance.currentTool).toBe("eq_trapezoid");
    instance.canvas.trigger('mouse:down');

    expect(circleSpy).not.toHaveBeenCalled();
    expect(triangleSpy).not.toHaveBeenCalled();
    expect(rectSpy).not.toHaveBeenCalled();
    expect(polygonSpy).toHaveBeenCalledWith([{x:30, y:150}, {x:120, y:150}, {x:150, y: 225}, {x:0, y:225}],{fill:'black'});
    expect(instance.currentTool).toBe("selector");
  });
  it('builds trapezoid', function(){
    $("#test [data-action='trapezoid']").click();
    expect(instance.currentTool).toBe("trapezoid");
    instance.canvas.trigger('mouse:down');

    expect(circleSpy).not.toHaveBeenCalled();
    expect(triangleSpy).not.toHaveBeenCalled();
    expect(rectSpy).not.toHaveBeenCalled();
    expect(polygonSpy).toHaveBeenCalledWith([{x:60,y:150}, {x:150, y: 150}, {x:150, y: 225}, {x:0, y:225}],{fill:'black'});
    expect(instance.currentTool).toBe("selector");
  });
  it('builds hexagon', function(){
    $("#test [data-action='hexagon']").click();
    expect(instance.currentTool).toBe("hexagon");
    instance.canvas.trigger('mouse:down');

    expect(circleSpy).not.toHaveBeenCalled();
    expect(triangleSpy).not.toHaveBeenCalled();
    expect(rectSpy).not.toHaveBeenCalled();
    expect(polygonSpy).toHaveBeenCalledWith([ { x : 160, y : 100 }, { x : 130, y : 151.96 }, { x : 70, y : 151.96 }, { x : 40, y : 100 }, { x : 70, y : 48.04 }, { x : 130, y : 48.04 }, { x : 160, y : 100 } ], { stroke : 'black', fill : 'black' });
    expect(instance.currentTool).toBe("selector");
  });
  it('builds pentagon', function(){
    $("#test [data-action='pentagon']").click();
    expect(instance.currentTool).toBe("pentagon");
    instance.canvas.trigger('mouse:down');

    expect(circleSpy).not.toHaveBeenCalled();
    expect(triangleSpy).not.toHaveBeenCalled();
    expect(rectSpy).not.toHaveBeenCalled();
    expect(polygonSpy).toHaveBeenCalledWith([ { x : 160, y : 100 }, { x : 118.54, y : 157.06 }, { x : 51.46, y : 135.27 }, { x : 51.46, y : 64.73 }, { x : 118.54, y : 42.94 }, { x : 160, y : 100 } ], { stroke : 'black', fill : 'black' });
    expect(instance.currentTool).toBe("selector");
  });
  it('builds octagon', function(){
    $("#test [data-action='octagon']").click();
    expect(instance.currentTool).toBe("octagon");
    instance.canvas.trigger('mouse:down');

    expect(circleSpy).not.toHaveBeenCalled();
    expect(triangleSpy).not.toHaveBeenCalled();
    expect(rectSpy).not.toHaveBeenCalled();
    expect(polygonSpy).toHaveBeenCalledWith([ { x : 160, y : 100 }, { x : 142.43, y : 142.43 }, { x : 100, y : 160 }, { x : 57.57, y : 142.43 }, { x : 40, y : 100 }, { x : 57.57, y : 57.57 }, { x : 100, y : 40 }, { x : 142.43, y : 57.57 }, { x : 160, y : 100 } ], { stroke : 'black', fill : 'black' });
    expect(instance.currentTool).toBe("selector");
  });
  it('builds decagon', function(){
    $("#test [data-action='decagon']").click();
    expect(instance.currentTool).toBe("decagon");
    instance.canvas.trigger('mouse:down');

    expect(circleSpy).not.toHaveBeenCalled();
    expect(triangleSpy).not.toHaveBeenCalled();
    expect(rectSpy).not.toHaveBeenCalled();
    expect(polygonSpy).toHaveBeenCalledWith( [ { x : 160, y : 100 }, { x : 148.54, y : 135.27 }, { x : 118.54, y : 157.06 }, { x : 81.46, y : 157.06 }, { x : 51.46, y : 135.27 }, { x : 40, y : 100 }, { x : 51.46, y : 64.73 }, { x : 81.46, y : 42.94 }, { x : 118.54, y : 42.94 }, { x : 148.54, y : 64.73 }, { x : 160, y : 100 } ], { stroke : 'black', fill : 'black' });
    expect(instance.currentTool).toBe("selector");
  });
});

describe("Scratch Pad Toggleable Setup - ", function(){
  beforeEach(function(){
    $("body").append("<div id='test'></div>");
    ScratchPad.init("#test", {toggleable: true});
  });
  afterEach(function(){
    ScratchPad.destroyAll();
    $("#test").empty();
  });
  it("adds hide/show buttons if toggleable setup is enabled", function(){
    expect($("#test .sp-hide").length).toBe(1);
    expect($("#test .sp-show").length).toBe(1);
  });
  it("toggles the scratch pad", function(){
    expect($("#test .sp-wrapper.sp-hidden").length).toBe(0);
    $("#test .sp-hide").click();
    expect($("#test .sp-wrapper.sp-hidden").length).toBe(1);
    $("#test .sp-show").click();
    expect($("#test .sp-wrapper.sp-hidden").length).toBe(0);
  });
});
