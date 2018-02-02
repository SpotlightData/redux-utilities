(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.SRU = factory());
}(this, (function () { 'use strict';

var index = {
  test: 'test'
};

return index;

})));
