var ScratchPadTools = {
	buildRay: function (config){
		var _length = (config.length || config.length<50)? config.length:50;
		var	_startX = config.startX ? config.startX: 100;
		var _startY = config.startY ? config.startY: 100;
		var _width = config.width? config.width: 2;
		var _doubleHeaded = config.doubleHeaded;

		var _arrowLength = _length*.07;
		var _arrowHeight = _length * .07;
		var _points = [];
		_points.push({x:_startX,y:_startY});
		_points.push({x:_startX+_length,y:_startY});
		_points.push({x: (_startX + _length) - _arrowLength, y: _startY-_arrowHeight});
		_points.push({x: (_startX + _length) +(2*_arrowLength),y: _startY +(_width/2)});
		_points.push({x: (_startX + _length) - _arrowLength, y: _startY+ (_width) +_arrowHeight});
		_points.push({x: _startX+ _length, y: _startY + _width});
		_points.push({x: _startX,y: _startY + _width});

		if(_doubleHeaded){
			_points.push({x: _startX + _arrowLength, y: _startY+_width + _arrowHeight});
			_points.push({x: _startX -( 2* _arrowLength), y: _startY+ (_width/2)});
			_points.push({x: _startX + _arrowLength, y: _startY - _arrowHeight});
		}
		
		var ray = new fabric.Polygon(_points);
		return ray;
	},
	createPolygon: function (config){
		//sides, centerX, centerY, size,fill
		var _stroke = config.stroke? config.stroke: 'black';
		var _fill = config.fill? config.fill:'black';
		var _sides = config.sides? config.sides: 8;
		var _centerX = config.centerX? config.centerX:100;
		var _centerY = config.centerY? config.centerY:100;
		var _size = config.size? config.size:100;


		var x = _centerX + _size * Math.cos(0);
		var y = _centerY + _size * Math.sin(0);
		var coords = [{x:x,y:y}];
		for(var i =1; i<= _sides;i++){

			var x= +(_centerX+ _size * Math.cos(i*2*Math.PI/_sides)).toFixed(2);
			var y = +(_centerY+ _size * Math.sin(i*2*Math.PI/_sides)).toFixed(2);
			coords.push({x:x,y:y});

		}

		var pol = new fabric.Polygon(coords,{
			stroke:_stroke,fill:_fill
		});
		return pol;

	}
}