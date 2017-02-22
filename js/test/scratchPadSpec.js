describe('Test ScratchPad',function(){
    it('tests buildMenu ', function(){
       
        $("<div id='test'></div>").appendTo('body');
        var instance = {};
        instance.id=1;
        instance.wrapper =  $('#test');
        instance.menu = ScratchPad.defaultMenu;
        ScratchPad.buildMenu(instance);
        var $menu = $(instance.wrapper).find(".sp-menu");
        expect($menu.html()).toContain('<div class="sp-drawing">Drawing</div><div class="sp-eraser">Eraser</div>');
    });
    
});