function extendClass(SubClass, SuperClass) {
	var proto = SubClass.prototype;
	SubClass.prototype = Object.create(SuperClass.prototype);
	SubClass.prototype.constructor = SubClass;
	for (var prop in proto)
		SubClass.prototype[prop] = proto[prop];
	return SubClass;
};
