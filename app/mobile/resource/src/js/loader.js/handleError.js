/*!
 * JavaScript Error Handler Utility
 * http://www.noindoin.com/
 *
 * Copyright 2013 Allen John
 * Released under the MIT license
 */

function handleError(err, handlers) {
	if (!err)
		return;

	var h = {};
	for (var k in handleError.handlers)
		h[k] = handleError.handlers[k];
	for (k in handlers)
		h[k] = handlers[k];

	handlers = h;

	handleError.bindElements(err);

	if (handlers[err.code])
		handlers[err.code](err);
	else if (handlers._default)
		handlers._default(err);

	if(handlers._finally)
		handlers._finally(err);
}

handleError.bindElements = function(err) {
	var elems = document.querySelectorAll('[error-bind~="' + err.code + '"]');
	for (var i = 0; i < elems.length; i++) {
		var elem = elems[i];
		var fn = elem.getAttribute('error-handler');
		if (fn && window[fn] && window[fn].constructor == Function)
			window[fn].call(elem, err);
	}
};

handleError.handlers = {
	_default: function(err) {
		alert(err.message);
	}
};
