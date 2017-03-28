(function(){
	showBuffer = function(){
		var instance = Object.values(ScratchPad.instances)[0];
		console.log('undo buffer');
		console.log(instance.undo);
		console.log('redo buffer');
		console.log(instance.redo);
	}
	showDebug = function(){
		return showDebugForInstance(0);
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
		return instance.canvas;
	}
	
	captureImage = function(){
		captureImageOf(0);
	}
	captureImageOf = function(index){
		var canvas = Object.values(ScratchPad.instances)[index].canvas;
		var image = '<img src="'+canvas.toDataURL()+'" style="border:2px dotted green;"/>';
		$('#test').empty();
		$('#test').append(image);		
	}
	
})();