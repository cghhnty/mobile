/*!
 * render.js - A Super tiny DOM-based template engine with two-way data binding
 * http://renderjs.noindoin.com/
 *
 * Copyright 2014 Jiang Fengming<jfm@noindoin.com>
 * Released under the MIT license
 */

function Renderer(elem, data) {
	if (elem.constructor == String)
		elem = document.querySelector(elem);

	if (elem.renderInst) {
		var me = elem.renderInst;
		if (data)
			me.data = data;
		me.resolve();
		return me;
	} else {
		var me = elem.renderInst = this;
		me.elem = elem;
		me.setting = me.compile(elem);
		me.init(elem, me.setting);
		me.data = data || {};
		me.resolve();
	}
}

Renderer._uid = 0;
Renderer.uid = function() {
	return Renderer._uid++;
};

Renderer.forEach = function(list, cb) {
	if (!list)
		return;

	if (list.constructor == Array || 'length' in list) {
		for (var i = 0; i < list.length; i++)
			cb(list[i], i, list);
	} else if (list instanceof Object) {
		for (var k in list)
			cb(list[k], k, list);
	}
};

Renderer._eval = function(exp, baseObj) {
	var depth = exp.split('.');
	var prop = depth.pop();
	depth = depth.join('.');
	if (!depth) {
		return {
			obj: baseObj,
			prop: prop,
			val: baseObj[prop]
		};
	} else {
		var tmp = (new Function('baseObj', '\
			try {\
				with(baseObj) {\
					var val = ' + exp + ';\
					var obj = ' + depth + ';\
				}\
				return {obj: obj, val: val};\
			} catch(e) {return null}'
		))(baseObj);

		if (tmp) {
			return {
				obj: tmp.obj,
				prop: prop,
				val: tmp.val
			};
		} else {
			return null;
		}
	}
};

Renderer.val = function(val, type) {
	if (type == 'number')
		val = val == null ? null : Number(val);
	else if (type == 'boolean')
		val = Boolean(val);
	return val;
};

Renderer.prototype = {
	/*
	scopeSetting: {
		nodes: [
			{
				renderer: Function, 
				binds: {
					elementProperty: dataProperty,
					...
				}
			},
			...
		],

		foreachScopes: [
			{
				nodes: [],
				foreachScopes: [],
				template: Element,
				getList: Function
			},
			...
		],

		childScopes: [
			Element,
			...
		]
	}


	scopeInst: {
		nodes: [
			{
				node: Node,
				setting: nodeSetting
			}
			...
		],

		foreachScopes: [
			{
				id: UID,
				placeholder: CommentNode,
				setting: foreachScopeSetting
			},
			...
		]
	}
	*/

	compile: function(elem, setting) {
		var me = this;

		var fnhead = 'function __val(val) {if (val == undefined) throw 1; return val} with(_scope) {';
		var fnfoot = '}';

		if (!setting) {
			setting = {
				nodes: [],
				foreachScopes: [],
				childScopes: []
			};
		}

		var fn = '';
		var binds = {};
		for (var j = 0; j < elem.attributes.length; j++) {
			var attr = elem.attributes[j];
			var attrName = attr.name;
			var attrVal = attr.value;
			if (attrName == 'rn-eval') {
				fn += 'try {' + attrVal + '} catch(e) {}';
			} else if (attrName == 'rn-text') {
				fn += 'try {this.textContent = __val(' + attrVal + ')} catch(e) {this.textContent = ""}';
			} else if (attrName == 'rn-html') {
				fn += 'try {this.innerHTML = __val(' + attrVal + ')} catch(e) {this.innerHTML = ""}';
			} else if (attrName == 'rn-attr') {
				attrVal.replace(/ +/g, '').split(';').forEach(function(literal) {
					var pos = literal.indexOf(':');
					var attr = literal.slice(0, pos);
					var expr = literal.slice(pos + 1);
					fn += 'try {this.setAttribute("' + attr + '", __val(' + expr + '))} catch(e) {this.removeAttribute("' + attr + '")}';
				});
			} else if (attrName == 'rn-prop') {
				attrVal = attrVal.replace(/ +/g, '').split(';').forEach(function(literal) {
					var pos = literal.indexOf(':');
					var prop = literal.slice(0, pos);
					var expr = literal.slice(pos + 1);
					fn += 'try {this.' + prop + ' = __val(' + expr + ')} catch(e) {if (this.' + prop + ') this.' + prop + ' = null}';					
				});
			} else if (attrName == 'rn-value') {
				binds.value = attrVal;
			} else if (attrName == 'rn-bind') {
				attrVal = attrVal.replace(/ +/g, '').split(';').forEach(function(literal) {
					var parts = literal.split(':');
					binds[parts[0]] = parts[1];					
				});
			} else if (attrName.indexOf('rn-') != 0) {
				if (attrVal.indexOf('{{') != -1 && attrVal.indexOf('}}') != -1) {
					attrVal = attrVal.split('{{').join('\x00') // use \x00 as open tag
						.split('}}').join('\x01') // use \x01 as close tag
						.replace(/(^|\x01)[^\x00]*/g, function(s) { // deal with raw string
							return s.replace(/\\/g, '\\\\') // escape \ to \\
								.replace(/"/g, '\\"'); // escape " to \"
						})
						.replace(/\x00([^\x01]*)\x01/g, '" + __val($1) + "'); // translate {{expression}} to " + (expression) + "
					attrVal = '"' + attrVal + '"';

					fn +=  'try {this.setAttribute("' +  attrName +  '", __val(' + attrVal + '))} catch(e) {this.removeAttribute("' + attrName + '")}';
				}
			}
		}

		var hasBinds = Object.keys(binds).length;
		if (fn || hasBinds) {
			var nodeSetting = {};
			if (fn) {
				fn = fnhead + fn + fnfoot;
				nodeSetting.renderer = new Function('_data', '_scope', '_value', '_key', '_list', '_parent', fn);
			}

			if (hasBinds)
				nodeSetting.binds = binds;

			var id = setting.nodes.push(nodeSetting) - 1;

			elem.setAttribute('rn-elem-id', id);
		}

		// childNodes is a *live* NodeList, change childNode of elem will have effect on it. we make a copy of static list.
		Array.prototype.slice.call(elem.childNodes).forEach(function(node) {
			if (node.nodeType == 1) { // ELEMENT_NODE
				if (node.hasAttribute('rn-foreach')) {
					var foreachScope = me.compile(node);
					foreachScope.template = node;
					var expr = node.getAttribute('rn-foreach');
					foreachScope.getList = new Function('_scope', 'try {with(_scope) {return ' + expr + '}} catch(e) {}');
					var id = setting.foreachScopes.push(foreachScope) - 1;
					var comment = document.createComment('_renderForeach:' + id);
					elem.insertBefore(comment, node);
					elem.removeChild(node);
				} else if (node.hasAttribute('rn-scope')) {
					setting.childScopes.push(node);
				} else if (node.nodeName != 'SCRIPT' && !node.hasAttribute('rn-escape')) {
					me.compile(node, setting);
				}
			} else if (node.nodeType == 3) { // TEXT_NODE
				if (node.nodeValue.indexOf('{{') != -1 && node.nodeValue.indexOf('}}') != -1) {
					node.nodeValue.split(/\{\{|\}\}/).forEach(function(val, i) {
						if (i % 2 == 0) { // text
							if (val != '') {
								var textNode = document.createTextNode(val);
								elem.insertBefore(textNode, node);
							}
						} else { // expression
							fn = fnhead + 'try {this.nodeValue = __val(' + val + ')} catch(e) {this.nodeValue = ""}' + fnfoot;
							var id = setting.nodes.push({renderer: new Function('_data', '_scope', '_value', '_key', '_list', '_parent', fn)}) - 1;
							var comment = document.createComment('_renderText:' + id);
							elem.insertBefore(comment, node);
						}						
					});
					elem.removeChild(node);
				}
			}
		});
		return setting;
	},

	init: function(elem, scopeSetting, scopeInst) {
		var me = this;

		if (!scopeInst) {
			scopeInst = elem.scopeInst = {
				nodes: [],
				foreachScopes: [],
				binds: []
			};
		}

		var id = elem.getAttribute('rn-elem-id');
		if (id) {
			scopeInst.nodes.push({
				node: elem,
				setting: scopeSetting.nodes[id]
			});

			elem.removeAttribute('rn-elem-id');
		}

		Array.prototype.slice.call(elem.childNodes).forEach(function(node) {
			if (node.nodeType == 1 && !node.hasAttribute('rn-scope')) { // ELEMENT_NODE
				me.init(node, scopeSetting, scopeInst);
			} else if (node.nodeType == 8) { // COMMENT_NODE
				if (node.nodeValue.indexOf('_renderText') == 0) {
					var index = node.nodeValue.split(':').pop();
					var nodeSetting = scopeSetting.nodes[index];
					var textNode = document.createTextNode('');
					elem.insertBefore(textNode, node);
					elem.removeChild(node);
					scopeInst.nodes.push({
						node: textNode,
						setting: nodeSetting
					});
				} else if (node.nodeValue.indexOf('_renderForeach') == 0) {
					var index = node.nodeValue.split(':').pop();
					var foreachScope = scopeSetting.foreachScopes[index];
					scopeInst.foreachScopes.push({
						id: Renderer.uid(),
						placeholder: node,
						setting: foreachScope
					});
				}
			}			
		});
	},

	resolve: function(elem, scopeInst, data, scopeData, value, key, list, parent) {
		var me = this;

		if (!elem) {
			elem = me.elem;
			scopeInst = elem.scopeInst;
			data = scopeData = parent = me.data;
		}

		scopeInst.nodes.forEach(function(n) {
			// binds
			if (n.setting.binds) {
				for (var elemProp in n.setting.binds) {
					var dataProp = n.setting.binds[elemProp];
					me.bindData(n.node, elemProp, scopeData, dataProp);
				}
			}

			if (n.setting.renderer)
				n.setting.renderer.call(n.node, data, scopeData, value, key, list, parent);
		});

		if (scopeInst.foreachScopes.length && !scopeData._parent) {
			Object.defineProperty(scopeData, '_parent', {
				value: parent
			});
		}

		parent = scopeData;

		scopeInst.foreachScopes.forEach(function(scope) {
			var nextSibling = scope.placeholder.nextSibling;
			list = scope.setting.getList(scopeData);
			Renderer.forEach(list, function(value, key) {
				if (value instanceof Object && value._foreachElements && value._foreachElements[scope.id] && value._foreachElements[scope.id].length != 0) {
					elem = value._foreachElements[scope.id][0];
					var pos = elem.compareDocumentPosition(nextSibling);
					if (pos == 0 || pos & (Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_DISCONNECTED)) {
						value._foreachElements[scope.id].shift();
						value._foreachElements[scope.id].push(elem);
					} else {
						elem = createForeachElement(value, scope);
					}
				} else {
					elem = createForeachElement(value, scope);
				}

				me.resolve(elem, elem.scopeInst, data, value instanceof Object ? value : parent, value, key, list, parent);

				if (elem != nextSibling)
					scope.placeholder.parentNode.insertBefore(elem, nextSibling);

				nextSibling = elem.nextSibling;
			});


			// remove deleted items
			Renderer.forEach(list, function(value, key) {
				if (value instanceof Object && value._foreachElements && value._foreachElements[scope.id]) {
					value._foreachElements[scope.id] = value._foreachElements[scope.id].filter(function(e) {
						// compare with last inserted element
						var pos = e.compareDocumentPosition(elem);
						return Boolean(pos == 0 || pos & Node.DOCUMENT_POSITION_FOLLOWING);
					});
				}
			});

			while (nextSibling && nextSibling._foreachScopeId == scope.id) {
				var _nextSibling =  nextSibling.nextSibling;
				scope.placeholder.parentNode.removeChild(nextSibling);
				nextSibling = _nextSibling;
			}
		});

		function createForeachElement(value, scope) {
			var elem = scope.setting.template.cloneNode(true);
			elem._foreachScopeId = scope.id;
			me.init(elem, scope.setting);

			if (value instanceof Object) {
				if (!value._foreachElements) {
					Object.defineProperty(value, '_foreachElements', {
						value: {},
						enumerable: false
					});
				}

				if(!value._foreachElements[scope.id])
					value._foreachElements[scope.id] = [];

				value._foreachElements[scope.id].push(elem);
			}

			return elem;
		}
	},

	bindData: function(elem, elemProp, data, dataProp) {
		var me = this;

		var e = Renderer._eval(elemProp, elem);
		var d = Renderer._eval(dataProp, data);

		if (!e || !d)
			return;

		if (!d.obj._binds) {
			Object.defineProperty(d.obj, '_binds', {
				value: {},
				enumerable: false
			});
		}

		if (!d.obj._binds[d.prop]) {
			var binds = d.obj._binds[d.prop] = {
				initVal: d.val,
				items: []
			};

			Object.defineProperty(d.obj, d.prop, {
				enumerable: true,
				get: getVal,
				set: setVal
			});
		}

		var binds = d.obj._binds[d.prop];
		var items = binds.items;

		// if the element has already been bound, then return
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.obj == e.obj && item.prop == e.prop)
				return;
		}

		if (e.prop == 'value' && elem == e.obj) {
			var valType = elem.getAttribute('rn-value-type');
			if (elem.type == 'checkbox' && valType == 'boolean' && !elem.value) {
				elem.value = 1;
			} else if (elem.type == 'radio' && !elem.name) {
				if (items.length == 0) {
					elem.name = '_' + d.prop + '_' + Renderer.uid();
				} else {
					elem.name = items[0].elem.name;
				}
			}

			elem.addEventListener('input', function(e) {
				setVal(getVal());
			});

			elem.addEventListener('change', function(e) {
				setVal(getVal());
			});
		}

		items.push({elem: elem, obj: e.obj, prop: e.prop});

		if (binds.initVal != null)
			setVal(binds.initVal);

		function getVal() {
			// normal attribute
			if (elem != e.obj || e.prop != 'value')
				return e.obj[e.prop];

			// 'value' attribute
			var valType = elem.getAttribute('rn-value-type') || elem.type;
			if (valType == 'checkbox' && elem.getAttribute('value') == null)
				valType = 'boolean';

			if (elem.type == 'radio') {
				for (var i = 0; i < items.length; i++) {
					var el = items[i].elem;
					if (el.checked)
						return Renderer.val(el.value, valType);
				}
				return null;
			} else if (elem.type == 'checkbox') {
				if (items.length == 1) {
					return Renderer.val(elem.checked ? elem.value : null, valType);
				} else {
					var values = [];
					for (var i = 0; i < items.length; i++) {
						var el = items[i].elem;
						if (el.checked)
							values.push(Renderer.val(el.value, valType));
					}
					return values;
				}
			} else if (elem.nodeName == 'SELECT' && elem.multiple) {
				var values = [];
				for (var i = 0; i < elem.selectOptions.length; i++) {
					values.push(Renderer.val(elem.selectOptions[i].value, valType));
				}
				return values;
			} else {
				return Renderer.val(elem.value, valType);
			}
		}

		function setVal(val) {
			// normal attribute
			if (elem != e.obj || e.prop != 'value') {
				items.forEach(function(elem) {
					elem.obj[elem.prop] = val;
				});
			} else { // 'value' attribute
				var valType = elem.getAttribute('rn-value-type') || elem.type;
				if (valType == 'checkbox' && elem.getAttribute('value') == null)
					valType = 'boolean';

				if (elem.type == 'radio') {
					items.forEach(function(item) {
						item.elem.checked = Renderer.val(item.elem.value, valType) == val;
					});
				} else if (elem.type == 'checkbox') {
					if (val instanceof Array) {
						items.forEach(function(item) {
							item.elem.checked = val.indexOf(Renderer.val(item.elem.value, valType)) != -1;
						});
					} else {
						elem.checked = Renderer.val(elem.value, valType) == val;
					}
				} else if (elem.nodeName == 'SELECT' && elem.multiple) {
					for (var i = 0; i < elem.options.length; i++) {
						var opt = elem.options[i];
						opt.selected = val.indexOf(Renderer.val(opt.value, valType)) != -1;
					}
				} else {
					items.forEach(function(item) {
						item.elem.value = val;
					});
				}
			}

			me.resolve();
			return val;
		}
	},

	renderChildScopes: function() {
		var me = this;
		me.setting.childScopes.forEach(function(elem) {
			var scope = new Renderer(elem);
			scope.renderChildScopes();
		});
	}
};

function render(elem, data, renderChildScopes) {
	var r = new Renderer(elem, data);
	if (renderChildScopes)
		r.renderChildScopes();
}

if (typeof jQuery != 'undefined') {
	jQuery.fn.render = function(data, renderChildScopes) {
		return this.each(function() {
			render(this, data, renderChildScopes);
		});
	};
}
