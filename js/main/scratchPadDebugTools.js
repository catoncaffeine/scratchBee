(function(){
	showDebug = function(){
		showDebugForInstance(0);
	}
	showDebugForInstance = function(instanceIndex){
		var instance = Object.values(ScratchPad.instances)[instanceIndex];
		console.groupCollapsed('Current debug options for instance '+instanceIndex);
		console.log('instance');
		console.log(instance);
		console.log('canvas');
		console.log(instance.canvas);
		console.log('undo buffer');
		console.log(instance.undo);
		console.log('redo buffer');
		console.log(instance.redo);
		console.groupEnd();
	}
	
	captureImage = function(){
		captureImageOf(0);
	}
	captureImageOf = function(index){
		var canvas = Object.values(ScratchPad.instances)[index].canvas;
		var image = '<img src="'+canvas.toDataURL()+'" style="border:2px dotted green;"/>';
		//console.log(image)
		$('#test').empty();
		$('#test').append(image);
		
	}
})();