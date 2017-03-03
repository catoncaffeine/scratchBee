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
    it('test buildPad adds html canvas to scratch pad', function(){
        var instance = {id: "1", wrapper:$('#test'), dimension:{width:200,height:200}};
        $('#test').append('<div class="sp-menu"></div>');
        ScratchPad.buildPad(instance);
        expect($("#test canvas").length).toBe(1);
        expect($("#test .sp-canvas-wrapper .sp-canvas#1").length).toBe(1);
        expect($("#test .sp-canvas-wrapper .sp-canvas#1").attr("width")).toBe("200");
        expect($("#test .sp-canvas-wrapper .sp-canvas#1").attr("height")).toBe("200");
    });
    it('test convert to Fabric calls FabricJS', function(){
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
describe('test events on scratchpad', function(){
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