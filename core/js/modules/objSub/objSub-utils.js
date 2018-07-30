define([
    'underscore',
    'jquery',
    'utils'
], function(_, $, Utils) {
	'use strict';
	
	var ObjSubUtils = {
		/*
		 * this method searches through the flatlist to find a page and returns the object.
		 * @param {array} aFind: a position array of object tofind
		 * @return the sub if found, else false.
		 */
		findSub: function(aFind) {
			//cycle through the subs in a level (found by length of the array (depth=level)
			var lvl = aFind.length;
			var flagFound = false;
			var subs = masterStructure.levels[lvl - 1].subs;
			//loop through the subs in the appropriate level
			for (var loopSubs = 0; loopSubs < subs.length; loopSubs++) {
				if (Utils.arrays_equal(subs[loopSubs].aPosition, aFind)) {
					return subs[loopSubs];
				}
			}
			return flagFound;
		}
	};

	//CSPS-KR: add to global namespace since it is used in html pages
	window.findSub = ObjSubUtils.findSub;

	return ObjSubUtils;
});