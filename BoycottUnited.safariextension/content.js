function run(settings) {

	// Set this to true to set the background of elements
	//  to red instead of hiding them.
	var DEBUG = (!!settings.debug) && (settings.debug != "false");

	// Observes the first element that matches the given selector
	//  and executes action(mutations) for every change.
	function observe(sel, action) {
		var el = document.querySelector(sel);
		if (el) {
			var mo = new MutationObserver(action);
			mo.observe(el, { "childList": true, "subtree": true });
		}
	}

	// Hides the given element
	function hideEl(el) {
		if (DEBUG)
			el.style.backgroundColor = "red";
		else
			el.style.display = "none";
	}

	// Hides all elements that match the given CSS selector
	//  and optionally the given predicate.
	function hideSel(sel, pred) {
		var els = document.querySelectorAll(sel);
		for (var i = 0; i < els.length; i++) {
			var el = els[i];
			if (!pred || pred(el))
				hideEl(el, pred);
		}
	}

	// Hides a column in a table at 0-based index.
	// (Assumes colSpan for all columns is 1)
	function hideCol(table, index) {
		// nth-child is 1-based
		var i = index + 1;
		var rows = table.getElementsByTagName("tr");
		for (var r = 0; r < rows.length; r++) {
			var col = rows[r].querySelector("th:nth-child(" + i + "), td:nth-child(" + i + ")");
			hideEl(col);
		}
	}

	// Maps host names to a function for removing the desired content.
	//  Keep list sorted alphabetically if possible.
	var hostScripts = {

		"www.cheapoair.com": function() {
			// find sidebar checkbox, uncheck and hide it
			hideSel("#alliancememberName-UA", function(el) {
				var chk = el.querySelector("input[type=checkbox]");
				if (chk)
					chk.checked = "";
				return true;
			});

			// column in the matrix at the top
			var matrix = document.getElementById("mtrx_table");
			if (matrix) {
				var headers = matrix.getElementsByTagName("th");
				for (var i = 0; i < headers.length; i++) {
					var hd = headers[i];
					if (hd.innerHTML.indexOf("United Airlines") != -1)
						hideCol(matrix, i);
				}
			}
		},

		"www.priceline.com": function() {
			observe(".main-content", function() {
				// sidebar selector
				hideSel("fly-mobile-checkbox[checkbox-name=UA]");
				// search results
				hideSel(".fly-itinerary", function(el) {
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
}

// We need to asynchronously get our settings..

function handleMessage(msg) {
    if (msg.name === "settings")
        run(msg.message);
}

if (safari) {
	safari.self.addEventListener("message", handleMessage, false);
	safari.self.tab.dispatchMessage("getSettings", null);
} else {
	run({});
}