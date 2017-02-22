describe('Test ScratchPad',function(){
    beforeEach(function(){
        $("<div id='test'></div>").appendTo('body');
    });
    it('tests buildMenu ', function(){
       
        
        var instance = {};
        instance.id=1;
        instance.wrapper =  $('#test');
        instance.menu = ScratchPad.defaultMenu;
        ScratchPad.buildMenu(instance);
        var $menu = $(instance.wrapper).find(".sp-menu");
        expect($menu.html()).toContain('<div class="sp-drawing">Drawing</div><div class="sp-eraser">Eraser</div>');
    });
    
    it('tests init', function(){
        var instance = {id:1, canvas:{}};
        spyOn(ScratchPad,'buildInstance').andCallFake(function(){
            return instance;
        })
        spyOn(ScratchPad,'buildMenu').andCallFake(function(){});
        spyOn(ScratchPad,'buildPad').andCallFake(function(){ return {};});
        ScratchPad.init('#test',{});
        expect(ScratchPad.buildInstance).toHaveBeenCalledWith('#test',{});
        expect(ScratchPad.buildMenu).toHaveBeenCalledWith(instance);
        expect(ScratchPad.buildPad).toHaveBeenCalledWith(instance);
        expect(ScratchPad.instances[1]).toBe(instance);
    });
    
    it('tests buildInstance', function(){
       var instance = ScratchPad.buildInstance('#test',{});
        expect(instance.id).not.toBeNull();
        expect(instance.menu).toBe(ScratchPad.defaultMenu);
        expect(instance.dimension).toBe(ScratchPad.defaultDimension);
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
});