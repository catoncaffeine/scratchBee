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
        expect($menu.html()).toContain('<div class="sp-drawing">Drawing</div><div class="sp-eraser">Eraser</div>');
    });
    it('tests buildMenu with unknown items', function(){
        var instance = {};
        instance.id=1;
        instance.wrapper =  $('#test');
        instance.menu = ["menu1","menu2","eraser"];
        ScratchPad.buildMenu(instance);
        var $menu = $(instance.wrapper).find(".sp-menu");
        expect($menu.html()).toContain('<div class="sp-eraser">Eraser</div>');
    });
    it('tests init', function(){
        var instance = {id:1, canvas:{}};
        spyOn(ScratchPad,'buildInstance').andCallFake(function(){
            return instance;
        })
        spyOn(ScratchPad,'buildMenu').andCallFake(function(){});
        spyOn(ScratchPad,'buildPad').andCallFake(function(){ return {};});
        spyOn(ScratchPad,'convertToFabric').andCallFake(function(){ return {};});
        ScratchPad.init('#test',{});
        expect(ScratchPad.buildInstance).toHaveBeenCalledWith('#test',{});
        expect(ScratchPad.buildMenu).toHaveBeenCalledWith(instance);
        expect(ScratchPad.buildPad).toHaveBeenCalledWith(instance);
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
        ScratchPad.buildPad(instance);
        expect($("#test canvas").length).toBe(1);
        expect($("#test .sp-canvas-wrapper .sp-canvas#1").length).toBe(1);
        expect($("#test .sp-canvas-wrapper .sp-canvas#1").attr("width")).toBe("200");
        expect($("#test .sp-canvas-wrapper .sp-canvas#1").attr("height")).toBe("200");
    });
    it('test convert to Fabric calls FabricJS', function(){
        spyOn(fabric,'Canvas');
        var config = {dimension:{width:200,height:200}};
        var instance = ScratchPad.init("#test", config);
        expect(fabric.Canvas).toHaveBeenCalledWith(instance.id,{isDrawingMode:true});
        expect($('#'+instance.id).attr('width')).toBe('200');
    });
});