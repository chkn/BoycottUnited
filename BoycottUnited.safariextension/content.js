(function() {

	// Set this to true to set the background of elements
	//  to red instead of hiding them.
	var DEBUG = false;

	// Observes the first element that matches the given selector
	//  and executes action(mutations) for every change.
	function observe(sel, action) {
		var el = document.querySelector(sel);
		if (el) {
			var mo = new MutationObserver(action);
			mo.observe(el, { "childList": true, "subtree": true });
		}
	}

	// Hides all elements that match the given CSS selector
	//  and optionally the given predicate.
	function hide(sel, pred) {
		var els = document.querySelectorAll(sel);
		for (var i = 0; i < els.length; i++) {
			var el = els[i];
			if (!pred || pred(el)) {
				if (DEBUG)
					el.style.backgroundColor = "red";
				else
					el.style.display = "none";
			}
		}
	}

	// Maps host names to a function for removing the desired content.
	var hostScripts = {

		"www.priceline.com": function() {
			observe(".main-content", function() {
				// sidebar selector
				hide("fly-mobile-checkbox[checkbox-name=UA]");
				// search results
				hide(".fly-itinerary", function(el) {
					var el2 = el.querySelector(".fly-airline-title");
					return el2 && (el2.innerHTML.indexOf("United Airlines") != -1);
				});
			});
		}
	};

	// Run the appropriate script for the site we're currently on.
	var script = hostScripts[location.hostname];
	if (script)
		script();
})();