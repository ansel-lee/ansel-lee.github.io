"use strict"
var document, window, console, setTimeout, XMLHttpRequest, navigator


function defGlobals() {
	window.currReq = { abort: () => { console.log("no XHR to abort") } }
	window.verNum = 1.3;
	window.scriptLink = "https://script.google.com/macros/s/AKfycbwxX2BG-CBt0EgkDXyELz4wG3VQ66Fu5UejiF56vQbXpIdI0u7RcssEgRuPsr5C-Me1vQ/exec";
	makeSubjectTree();

	window.allMiscItems = [];
	window.exampleReceived = [["Literature (G3/G2)", [["Literature ", "Wonder (By R. J. Palacio) (Random House Children's)", "PM Associa", ""]]], ["Science (G3/G2)", [["Science ", "Science For Lower Secondary G3/G2 Textbook 1A (Revised Edn) NEW!", "Marshall C", ""], ["Science ", "Science For Lower Secondary G3/G2 Textbook 1B (Revised Edn) NEW!", "Marshall C", ""],
	["Science ", "Science For Lower Secondary G3/G2 Activity Book 1A (Revised Edn) NEW!", "Marshall C", ""], ["Science ", "Science For Lower Secondary G3/G2 Activity Book 1B (Revised Edn) NEW!", "Marshall C", ""]]]];
	
	window.itemListResetText = "<div>Select</div><div>Subject</div><div>Resource</div><div>Publisher</div>";
	window.miscListResetText = "<div>Item Name</div><div>Linked Subject</div><div>Quantity</div>";
	window.usrSave = {
		courses: [], // secLevel, currstream, list in group/subject
		books: [],
		miscList: [] // ["name", "ID", "name2", "ID2"]
	};
	window.miscList = [];
	window.initialLoad = true;
	window.fromCookie = false;
}

function addSubStreamSelect() {
	var subkeys = [];
	var subkeysdefault = [];
	var subselections = [];

	var subBox = document.getElementById("subjectbox");
	var currstream = document.getElementById("studentstream").value;
	var secLevel = document.getElementById("studentlevel").value;
	document.getElementById("subjectbox").appendChild(document.createElement("p")).innerText = "Group";
	document.getElementById("subjectbox").appendChild(document.createElement("p")).innerText = "Subject";
	subBox.innerHTML = "<p>Group</p><p>Subject</p>";
	var subkeyindex = 0;
	console.log(currstream)
	if ((!currstream) || currstream == "select") {
		return;
	} else {
		window.usrSave.courses = [secLevel, currstream];
		document.getElementById("gridcontainbooks").innerHTML = window.itemListResetText;
		window.initialLoad = true;
		scrollCheck();
		console.log("currstream: " + currstream);
		console.log("Here's the object for year");
		console.log(window.subjectTree[secLevel - 1]);
		for (var i = 0; i < window.subjectTree[secLevel - 1].length; i++) {
			subkeys = subkeys.concat(window.subjectTree[secLevel - 1][i][0]);
			subselections = subselections.concat([window.subjectTree[secLevel - 1][i].slice(1)])
			subkeysdefault.push(window.subjectTree[secLevel - 1][i][1])
			for (var j = 0; j < window.subjectTree[secLevel - 1][i].length; j++) {
				if (window.subjectTree[secLevel - 1][i][j].includes(currstream)) { // does not work if a book has EXPerience or "a G2 Pen" inside it
					subkeysdefault[subkeysdefault.length - 1] = window.subjectTree[secLevel - 1][i][j];
					j = 999
				}
			}
		}
	}
	console.log(subselections)


	for (var i = 0; i < subkeys.length; i++) {
		subBox.appendChild(document.createElement("div")).innerText = subkeys[i]
		var crElm2 = subBox.appendChild(document.createElement("div"));
		var crElm3 = crElm2.appendChild(document.createElement("select"));
		crElm3.id = "subselect" + String(i)
		crElm3.classList.add("subjectStreamSelection")

		var optionlist = []
		for (var j = 0; j < subselections[i].length; j++) {
			optionlist = optionlist.concat(crElm3.appendChild(document.createElement("option")))
			//console.log(subselections)
			optionlist[j].innerText = subselections[i][j]
		}
		optionlist = optionlist.concat(crElm3.appendChild(document.createElement("option")))
		optionlist[optionlist.length - 1].innerText = "none"
		crElm3.value = subkeysdefault[i]
		crElm3.addEventListener("change", disableLevelSelect)
		crElm3.addEventListener("change", handlenewsubstream)
		crElm3.setAttribute("prevvalue", subkeysdefault[i])
	}

	console.log("contacting server")
	reqServer(subkeysdefault)
}

// when a group's subject is changed (e.g. English Language G3 > G2)
function handlenewsubstream(e) {
	function callBackUpdate() {
		cellGridRowAreas(0);
	}

	// note: above is a different function

	// e is the event handler
	console.log("ugh why must they change it")
	var prevVal = e.currentTarget.getAttribute("prevValue")
	e.currentTarget.setAttribute("prevValue", e.currentTarget.value)
	var elms = document.getElementsByClassName(prevVal.replaceAll(" ", "-"))
	// selects the checkboxes only 
	var container = document.getElementById("gridcontainbooks")
	window.usrSave.courses = window.usrSave.courses.filter(e => e !== prevVal);
	saveCookie();
	console.log(elms.length);

	var i = elms.length;
	var delcount = i.length;
	while (i--) {
		let childs = container.children
		let index = [...Array.from(childs)].indexOf(elms[i].parentElement) // elms[i].parentElement is the label where the checkbox is held


		let listPos = window.usrSave.books.indexOf(+elms[i].id.replace("itemgen", ""));
		if (listPos !== -1) {
			// removed deselected subject items from saved list
			window.usrSave.books.splice(listPos, 1);
		} else {
			console.log("Couldn't delete ID in usrSave.books from itemgen key. ID: " + elms[i].id)
		}

		//container.removeChild(childs[index + 3])
		container.removeChild(childs[index + 2])
		container.removeChild(childs[index + 1])
		container.removeChild(childs[index])
		if (i == 0) {
			container.removeChild(childs[index])
		}
	}

	reqServer([e.currentTarget.value], callBackUpdate)
}


// whether a book was selected/deselected
function bookCheckChange(e) {
	console.log(e.currentTarget.id.replace("itemgen", ""))
	if (e.currentTarget.parentNode.classList.contains("bookselected")) {
		// remove item
		e.currentTarget.parentNode.classList.remove("bookselected")
		var index = window.usrSave.books.indexOf(+e.currentTarget.id.replace("itemgen", ""));
		if (index !== -1) {
			window.usrSave.books.splice(index, 1);
			console.log("removing at index " + index)
		} else {
			console.log("cannot find in list")
		}
	} else {
		// add item
		e.currentTarget.parentNode.classList.add("bookselected")
		if (!window.usrSave.books.includes(+e.currentTarget.id.replace("itemgen", ""))) {
			window.usrSave.books.push(+e.currentTarget.id.replace("itemgen", ""))
		}
	}

	saveCookie();
}



// received XHR - adding to item list and misc items
function receivedXHR(e, f) {
	// e is bookitems and f is misclist
	function populateItemList() {
		var itrcount = 0;
		for (var i = 0; i < e.length; i++) {
			var bookclass = e[i][0].replaceAll(" ", "-");
			for (var j = 0; j < (e[i][1].length); j++) {
				var crElm1, thelabel, crElm3
				if (window.initialLoad) {
					window.miscList = [];
					crElm1 = container.appendChild(document.createElement("label"))
					if (j == 0) {
						crElm3 = container.appendChild(document.createElement("div"))
						crElm3.innerText = e[i][0]
						console.log(e[i][0])
						crElm3.classList.add("subjectName")
					}
					thelabel = container.appendChild(document.createElement("label"));
					container.appendChild(document.createElement("div")).innerText = e[i][1][j][2]
					//container.appendChild(document.createElement("div")).innerText = e[i][1][j][3]
				} else {
					//container.insertBefore(document.createElement("div"), container.children[5]).innerText = e[i][1][j][3];
					container.insertBefore(document.createElement("div"), container.children[4]).innerText = e[i][1][j][2];
					thelabel = container.insertBefore(document.createElement("label"), container.children[4]);
					if (j == e[i][1].length - 1) {
						crElm3 = container.insertBefore(document.createElement("div"), container.children[4])
						crElm3.innerText = e[i][0];
						crElm3.classList.add("subjectName")
					}
					crElm1 = container.insertBefore(document.createElement("label"), container.children[4])
				}

				var crElm2 = crElm1.appendChild(document.createElement("input"));
				crElm2.type = "checkbox";
				crElm2.id = "itemgen" + e[i][1][j][3];
				crElm2.addEventListener("input", bookCheckChange);
				if (window.fromCookie) {
					if (window.usrSave.books.includes(e[i][1][j][3])) {
						crElm2.checked = true;
						crElm1.classList.add("bookselected");
					}
				} else {
					if (!(window.fromCookie || window.usrSave.books.includes(e[i][1][j][3]) || e[i][1][j][1].includes("NOT NECESSARY IF BOUGHT"))) {
						crElm2.checked = true;
						crElm1.classList.add("bookselected")
						window.usrSave.books.push(e[i][1][j][3])
					}
				}

				crElm2.classList.add(bookclass)
				thelabel.innerText = e[i][1][j][1];
				thelabel.setAttribute("for", ("itemgen" + e[i][1][j][3]))
				itrcount++;
			}
		}
		cellGridRowAreas();
	}

	console.log(e)
	console.log("received")
	var container = document.getElementById("gridcontainbooks");

	populateItemList()
	if (window.initialLoad) {
		// miscellaneous items
		var container2 = document.getElementById("gridcontainmisc")
		for (let i = 0; i < f.length; i++) {
			while (f[i] && f[i][2] === false) {
				window.miscList.push(f[i][0], f[i][1]);
				i++;
			}
			if (!f[i]) { break; }

			// f = [name of item, ID, checked by default?]
			console.log(f[i])
			let crElm4 = container2.appendChild(document.createElement("div"))
			crElm4.innerText = f[i][0]
			crElm4.classList.add("miscitem")
			crElm4.id = "miscitem" + f[i][1]
			container2.appendChild(document.createElement("div")).innerText = f[i][2] ? f[i][2] : "nil"
			let crElm5 = container2.appendChild(document.createElement("div"))
			crElm5.appendChild(document.createElement("button")).innerText = "-";
			window.miscList.push(f[i][0], f[i][1]);
			var miscIndex = window.usrSave.miscList.findIndex((h) => { return h[0] == f[i][1] });
			if (miscIndex === -1) {
				// miscList does not contain ID
				window.usrSave.miscList.push([f[i][1], 1]);
				crElm5.appendChild(document.createElement("div")).innerText = 1
			} else {
				crElm5.appendChild(document.createElement("div")).innerText = window.usrSave.miscList[miscIndex][1];
			}

			crElm5.appendChild(document.createElement("button")).innerText = "+";
		}

		console.log();
		saveCookie();
	}
	window.initialLoad = false;
}


function reqServer(subjectsList, callback) {
	function releaseLoadingLock() {
		document.getElementById("toPrint").disabled = false;
		document.getElementById("loadicon").classList.add("hidden");
		var elms = document.getElementsByClassName("subjectStreamSelection")
		for (let k = 0; k < elms.length; k++) {
			elms[k].disabled = false;
		}
	}

	function handleServerErrs(e) {
		console.log("An Error Occurred!")
		console.log(e)
	}

	// display loading message and lock most inputs
	document.getElementById("toPrint").disabled = true;
	document.getElementById("loadicon").classList.remove("hidden")
	var elms = document.getElementsByClassName("subjectStreamSelection")
	for (let k = 0; k < elms.length; k++) {
		elms[k].disabled = true;
	}
	while (window.usrSave.courses.length > 2 && window.initialLoad) {
		window.usrSave.courses.pop();
	} // reset to only secLevel and currStream
	for (var i = 0; i < subjectsList.length; i++) { window.usrSave.courses.push(subjectsList[i]); }


	// create XMUHttpRequest and add event listeners
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", (e) => {
		releaseLoadingLock()
		console.log(e.responseText)
	})
	xhr.onreadystatechange = () => {
		if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
			releaseLoadingLock()
			console.log(xhr.responseText)
			if (xhr.responseText.startsWith("error")) {
				handleServerErrs(xhr.responseText)
			} else {
				var thisresponse = JSON.parse(xhr.responseText)
				// Request finished. Do processing here.
				// bookitems, misclist, callback
				receivedXHR(thisresponse[0], thisresponse[1], callback) // only get item 0 if miscList is implemented
			}
		} else { console.log("xhr status: " + xhr.status) }
	}
	xhr.open("POST", window.scriptLink);

	xhr.addEventListener("error", releaseLoadingLock) // no harm letting the user try again
	var toSend = [document.getElementById("studentlevel").value, subjectsList, window.initialLoad, window.verNum]; // initial load is sent instead so we can get the booklist
	// window initialLoad replaced miscellaneous list
	console.log("Sending... " + JSON.stringify(toSend));
	window.currReq = xhr
	xhr.send(JSON.stringify(toSend))
}

function studentlevelcheck() {
	function hideshow(hide, show) {
		Array.from(document.getElementsByClassName(hide)).forEach((f) => f.setAttribute("hidden", true));
		Array.from(document.getElementsByClassName(show)).forEach((f) => f.removeAttribute("hidden"));
	}

	var e = document.getElementById("studentlevel").value
	window.initialLoad = true;

	document.getElementById("hidingstream").classList.remove("hidden") // if its not 1-5 will rehide this
	if (e == "1") {
		hideshow("oldstream", "newstream");
		document.getElementById("hidingstream").children[0].innerText = "Posting Group: ";
	} else if (e == "2" || e == "3" || e == "4") {
		hideshow("newstream", "oldstream");
		document.getElementById("hidingstream").children[0].innerText = "Stream: ";
	} else if (e == "5") {
		var elms = (Array.from(document.getElementsByClassName("oldstream"))).concat(Array.from(document.getElementsByClassName("newstream")));
		for (let i = 0; i < elms.length; i++) { elms[i].setAttribute("hidden", true) }
		elms[1].removeAttribute("hidden"); // "NA"
		document.getElementById("hidingstream").children[0].innerText = "Stream: ";
	} else {
		document.getElementById("hidingstream").classList.add("hidden");
	}
}

function bubbleMisc(e) {
	var mainGrid = document.getElementById("gridcontainmisc")
	if (e.target.nodeName === "BUTTON") {
		var miscNumDisplay = e.target.parentElement.children[1]
		var theMiscNumEl = e.target.parentElement
		if (e.target.innerText === "+") {
			miscNumDisplay.innerText = +miscNumDisplay.innerText + 1;
			let theIndex = Array.from(theMiscNumEl.parentElement.children).indexOf(theMiscNumEl);
			let miscName = theMiscNumEl.parentElement.children[theIndex - 2];
			let miscID = miscName.id.replace("miscitem", "")
			console.log(miscID)
			let searchThis = window.usrSave.miscList.findIndex((e) => { return e[0] === +miscID })

			if (miscName.classList.contains("miscResult")) {
				// a search result was added
				console.log("adding result of misc's 'add more' search")
				var boundaryIndex = Array.from(mainGrid.children).indexOf(document.getElementById("miscSearchLine"))
				// when the misc search is launched, and user presses plus to search results
				// add to main list
				if (searchThis === -1) {
					window.usrSave.miscList.push([miscName.id.replace("miscitem", ""), 1])
					console.log(miscName.className);
					console.log(miscName.id);
					mainGrid.insertBefore(document.createElement("div"), mainGrid.children[boundaryIndex]).innerHTML = "<button>-</button><div>0</div><button>+</button>";
					mainGrid.insertBefore(document.createElement("div"), mainGrid.children[boundaryIndex]).innerText = "nil";
					var newItemDiv = mainGrid.insertBefore(document.createElement("div"), mainGrid.children[boundaryIndex])
					newItemDiv.id = miscName.id;
					newItemDiv.classList.add("miscitem");
					newItemDiv.innerText = miscName.innerText;
				}
				searchMisc()
			}

			console.log(searchThis)
			if (searchThis > -1) { window.usrSave.miscList[searchThis][1] = +miscNumDisplay.innerText }
			saveCookie();
		} else if (e.target.innerText === "-") {
			if (+miscNumDisplay.innerText) { miscNumDisplay.innerText -= 1 }
			let theIndex = Array.from(theMiscNumEl.parentElement.children).indexOf(theMiscNumEl);
			let miscName = theMiscNumEl.parentElement.children[theIndex - 2];
			let miscID = miscName.id.replace("miscitem", "")
			console.log(miscID)
			let searchThis = window.usrSave.miscList.findIndex((e) => { return e[0] === +miscID })

			console.log("removing button")
			if (+theMiscNumEl.innerText) {
				theMiscNumEl.innerText -= 1;
			}

			console.log(searchThis)
			if (searchThis > -1) { window.usrSave.miscList[searchThis][1] = +miscNumDisplay.innerText }
			saveCookie();
		} else {
			console.log("unknown button. InnerText: " + e.target.innerText)
		}
	}
}



function searchMisc(e) {
	var theinput = document.getElementById("searchmisc")
	var mainGrid = document.getElementById("gridcontainmisc");
	if (e.target.getAttribute("prevVal") === "") {
		// add the seperator line
		mainGrid.appendChild(document.createElement("div")).id = "miscSearchLine";
	} else {
		// remove all children
		var boundaryIndex = Array.from(mainGrid.children).indexOf(document.getElementById("miscSearchLine"))
		if (boundaryIndex !== -1) {
			while (mainGrid.children.length > boundaryIndex + 1) {
				mainGrid.removeChild(mainGrid.children[boundaryIndex + 1]);
			}
		}
	}

	if (theinput.value === "") {
		mainGrid.removeChild(mainGrid.children[mainGrid.children.length - 1])
	} else {
		// add children - search results
		var miscSearchResults = window.miscList.filter((r) => {
			return (typeof (r) === "number" || 
				(r.toLowerCase().includes(document.getElementById("searchmisc").value.toLowerCase()))
			)
		});
		console.log(miscSearchResults)
		let i = 0
		while (typeof(miscSearchResults[i]) === "number") {i++}
		while (i < miscSearchResults.length) {
			if (!(JSON.stringify(window.usrSave.miscList).includes(miscSearchResults[i+1]))) {
				let miscName = mainGrid.appendChild(document.createElement("div")); // itemName
				console.log([miscSearchResults[i], miscSearchResults[i+1]])
				miscName.innerText = miscSearchResults[i];
				miscName.classList.add("miscResult");
				miscName.id = "miscitem" + miscSearchResults[i + 1]
				console.log("miscitem" + miscSearchResults[i+1])

				mainGrid.appendChild(document.createElement("div")).innerText = "nil"; // Linked subject
				mainGrid.appendChild(document.createElement("div")).innerHTML = "<div>0</div><button>+</button>";
			}
			i++
			while (typeof(miscSearchResults[i]) === "number") {i++}
		}
	}
	theinput.setAttribute("prevVal", theinput.value);
}




function saveCookie() {
	document.getElementById("exportSelected").value = JSON.stringify(window.usrSave);
	if (document.getElementById("cookiecheck").checked) {
		document.cookie = "booklistPref=" + JSON.stringify(window.usrSave);
	} else {
		document.cookie = "";
	}
	var count = window.usrSave.books.length;
	let i = window.usrSave.miscList.length-1;
	while (--i) {
		count += window.usrSave.miscList[i][1]
	}
	document.getElementById("numItems").innerText = count;
}

function reqPrint() {
	var headitem = document.getElementById("gridcontainbooks").insertBefore(document.createElement("div"), document.getElementById("gridcontainbooks").children[0])
	headitem.style.gridArea = "1 / 1 / 1 / 5";
	cellGridRowAreas(3);
	//headitem. add header text e.g. name and class

	var wasDark = document.body.classList.contains("darkmode")
	document.body.classList.remove("darkmode");
	window.print();
	if (wasDark) { document.body.classList.add("darkmode") }
}

function copyOut() {
	console.log("attempting to copy")
	document.getElementById("exportSelected").select();
	copyTextToClipboard(document.getElementById("exportSelected").value);
	document.getElementById("copiedIndicator").classList.remove("nodisp");
	setTimeout(() => { document.getElementById("copiedIndicator").classList.add("nodisp") }, 1000)
}

function enterSaved() {
	clearInfo()
	var saveVals = document.getElementById("saveID").value;
	try {
		window.usrSave = JSON.parse(saveVals);
		window.fromCookie = true;
		document.getElementById("studentlevel").value = window.usrSave.courses[0];
		document.getElementById("studentstream").value = window.usrSave.courses[1];
	} catch(e) { }
	window.currReq.abort();
	
	addSubStreamSelect();
}


function cellGridRowAreas(padding) {
	// refresh grid areas
	var elms = document.getElementById("gridcontainbooks").children
	var prevItem = "";
	var cycle = 0;
	var buffer = 2 + (padding || 0);
	var logBufferList = [];

	for (var i = 0; i < elms.length; i++) {
		if (elms[i].classList.contains("subjectName")) {
			logBufferList.push((i + buffer) / 4);
			elms[i].style.gridColumn = 2;
			elms[i].style.gridRowStart = (i + buffer) / 4
			if (prevItem) {
				prevItem.style.gridRowEnd = (i + buffer) / 4
			}
			prevItem = elms[i]
			cycle = 0;
		} else if (cycle >= 3) {
			if (!elms[i + 1].classList.contains("subjectName")) {
				cycle = 0; // to give you numbers divisible by 4
				buffer++;
			}
		}
		cycle++
	}
	prevItem.style.gridRowEnd = (i + buffer + 1) / 4;
	console.log(logBufferList);
}

function disableLevelSelect() {
	document.getElementById("clearinfo").classList.add("nodisp");
	document.getElementById("clearinfo").removeEventListener("click", clearInfo);
	document.getElementById("studentlevel").setAttribute("disabled", "disabled");
	document.getElementById("studentstream").setAttribute("disabled", "disabled");
	document.getElementById("nolvlselect").classList.remove("nodisp")

	var elms = document.getElementsByClassName("subjectStreamSelection")
	for (var i = 0; i < elms.length; i++) {
		elms[i].removeEventListener("change", disableLevelSelect)
	}
}

function scrollCheck() {
	if (window.scrollY > 600) {
		disableLevelSelect()
	} else {
		setTimeout(scrollCheck, 500)
	}
}

function makeSubjectTree() {
	window.subjectTree = [[["English", "English Language (G3)", "English Language (G2)", "English Language (G1)",], ["Mathematics", "Mathematics (G3)", "Mathematics (G2)", "Mathematics (G1)",], ["Lower Secondary Science", "Science (G3/G2)", "Science (G1)",], ["Humanities 1", "Geography (G3/G2)", "Social Studies (G1)",], ["Humanities 2", "History (G3/G2)", "None (G1)",], ["Humanities 3", "Literature (G3/G2)", "None (G1)",], ["Mother Tongue", "Chinese Language (G3)", "Higher Chinese Language (G3)", "Chinese Language (G2)", "Chinese (G1)", "Malay Language (G3)", "Malay Language (G2)", "Malay Language (G1)", "Tamil Language (G3)", "Tamil Language (G2)", "Tamil (G1)",], ["Design and Technology", "Design & Technology (G3/G2/G1)",], ["Food and Consumer Ed", "Food & Consumer Education (G3/G2/G1)",], ["Art", "Art (G3/G2/G1)",], ["Music", "Music (G3/G2/G1)",]],
	[["English", "English Language (EXP)", "English Language (NA)", "English Language (NT)",], ["Mathematics", "Mathematics (EXP)", "Mathematics (NA)", "Mathematics (NT)",], ["Science", "Science (EXP/NA)", "Science (NT - no books)",], ["Humanities 1", "Geography (EXP/NA)", "Social Studies (NT)",], ["Humanities 2", "History (EXP/NA)", "Computer Applications (NT)",], ["Humanities 3", "Literature (EXP/NA)", "None (NT)",], ["Mother Tongue", "Chinese Language (EXP)", "Malay Language (EXP)", "Tamil Language (EXP)", "Chinese Language (NA)", "Malay Language (NA)", "Tamil Language (NA)", "Chinese Language B (EXP/NA)", "Tamil Language B (EXP/NA)", "Basic Chinese (NT)", "Basic Malay (NT)", "Basic Tamil (NT)",], ["Food and Consumer Ed", "Food & Consumer Education (EXP/NA/NT)",], ["Design and Technology", "Design & Technology (EXP/NA/NT)",]],
	[["English", "English Language (EXP)", "English Language (NA)", "English Language (NT)",], ["Mathematics", "Mathematics (EXP)", "Mathematics (NA)", "Mathematics (NT)",], ["Chemistry", "Pure Chemistry (EXP)", "Science (Chemistry) (EXP)", "Science (Chemistry) (NA)", "Science (NT)",], ["Science 2", "Pure Physics (EXP)", "Pure Biology (EXP)", "Science (Physics) (EXP)", "Science (Physics) (NA)", "None (NT)",], ["Science 3 (only triple science)", "None (EXP/NA/NT)", "Pure Biology (EXP)",], ["Social Studies", "Social Studies (EXP/NA)", "Social Studies (NT)",], ["Elective Humanities", "Literature (Elective) (EXP/NA)", "History (Elective) (EXP/NA)", "Geography (Elective) (EXP)", "Geography (Elective) (NA)",], ["Mother Tongue", "Chinese Language (EXP)", "Malay Language (EXP)", "Tamil Language (EXP)", "Chinese Language (NA)", "Malay Language (NA)", "Tamil Language (NA)", "Chinese Language B (EXP/NA)", "Tamil Language B (EXP/NA)", "Basic Chinese (NT)", "Basic Malay (NT)", "Basic Tamil (NT)",], ["Additional Subject 1", "Additional Maths (EXP)", "Additional Maths (NA)", "Design & Technology (EXP/NA)", "Nutrition and Food Science (EXP/NA)", "Mobile Robotics (NT)", "Art ( (EXP/NA)", "Elements Of Business Skills (NT)",], ["Additional Subject 2", "History (Full) (EXP)", "Geography (Full) (EXP)", "Literature (Pure) (EXP)", "Computing (EXP) (no books)", "Principles of Accounts (EXP/NA)", "Computer Applications (NT)", "None (NT)",]],
	[["English", "English Language (EXP)", "English Language (NA)", "English Language (NT)",], ["Mathematics", "Mathematics (EXP)", "Mathematics (NA)", "Mathematics (NT)",], ["Chemistry", "Pure Chemistry (EXP)", "Science (Chemistry) (EXP)", "Science (Chemistry) (NA)", "Science (NT)",], ["Science 2", "Pure Physics (EXP)", "Pure Biology (EXP)", "Science (Physics) (EXP)", "Science (Biology) (EXP)", "Science (Physics) (NA)", "None (NT)",], ["Science 3 (Triple Science)", "None (EXP/NA/NT)", "Pure Biology (EXP)",], ["Social Studies", "Social Studies (EXP)", "Social Studies (NA)", "Social Studies (NT)",], ["Elective Humanities", "History (Elective) (EXP)", "Literature (Elective) (EXP)", "Geography (Elective) (EXP) (no books)", "History (Elective) (NA)", "Literature (Elective) (NA) (no books)", "Geography (Elective) (NA) (no books)", "None (NT)",], ["Mother Tongue", "Chinese Language (EXP)", "Malay Language (EXP)", "Tamil Language (EXP)", "Chinese Language (NA)", "Malay Language (NA)", "Tamil Language (NA)", "Chinese Language B (EXP/NA)", "Malay Language B (EXP/NA)", "Tamil Language B (EXP/NA)", "Basic Chinese (NT)", "Basic Malay (NT)", "Basic Tamil (NT)",], ["Additional Subject 1", "Additional Maths (EXP)", "Additional Mathematics (NA)", "Design & Technology (EXP/NA)", "Nutrition and Food Science (EXP)", "Nutrition and Food Science (NA)", "Elements Of Business Skills (NT)",], ["Additional Subject 2", "Computing (EXP) (no books)", "Literature (Pure) (EXP)", "History (Full) (EXP)", "Geography (Full) (EXP)", "Principles of Accounts (EXP)", "Principles of Accounts (NA)", "Computer Applications (NT) (no books)",]],
	[["English", "English Language (NA)",], ["Mathematics", "Mathematics (NA)",], ["Science", "Science (Chemistry) (NA)", "Science (Physics) (NA)",], ["Social Studies", "Social Studies (NA)",], ["Elective Humanities", "History (Elective) (NA)", "Geography (Elective) (NA)",], ["Mother Tongue", "Chinese Language (NA)", "Malay Language (NA)", "Tamil Language (NA)",], ["Coursework/AS1", "Additional Maths (NA)", "Nutrition and Food Science (NA)",]]]
}

// https://stackoverflow.com/a/30810322/13904265
function fallbackCopyTextToClipboard(text) {
	var textArea = document.createElement("textarea");
	textArea.value = text;

	// Avoid scrolling to bottom
	textArea.style.top = "0";
	textArea.style.left = "0";
	textArea.style.position = "fixed";

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Fallback: Copying text command was ' + msg);
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	document.body.removeChild(textArea);
}

function clearInfo() {
	console.log("clearing info")
	window.currReq.abort();
	window.initialLoad = true;
	document.getElementById("gridcontainbooks").innerHTML = window.itemListResetText;
	document.getElementById("studentlevel").value = "Choose";
	studentlevelcheck();
	window.usrSave = {
		courses: [], // secLevel, currstream, list in group/subject
		books: [],
		miscList: [] //
	}
	clearCookies();
	document.getElementById("numItems").innerText = 0;
	document.cookie = "";
}

function copyTextToClipboard(text) {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text);
		return;
	}
	navigator.clipboard.writeText(text).then(function () {
		console.log('Async: Copying to clipboard was successful!');
	}, function (err) {
		console.error('Async: Could not copy text: ', err);
	});
}

// https://stackoverflow.com/a/33366171/13904265
function clearCookies() {
	var cookies = document.cookie.split("; ");
	for (var c = 0; c < cookies.length; c++) {
		var d = window.location.hostname.split(".");
		while (d.length > 0) {
			var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
			var p = window.location.pathname.split('/');
			document.cookie = cookieBase + '/';
			while (p.length > 0) {
				document.cookie = cookieBase + p.join('/');
				p.pop();
			}
			d.shift();
		}
	}
}

function main() {
	defGlobals(true);
	if (document.cookie) {
		try {
			var copyOver = JSON.parse(('; ' + document.cookie).split(`; booklistPref=`).pop().split(';')[0])
			//https://stackoverflow.com/questions/10730362/get-cookie-by-name
			console.log(copyOver)
			window.usrSave.courses = copyOver.courses;
			if (copyOver.books) {
				window.initialLoad = false;
				window.usrSave.books = copyOver.books;
				window.usrSave.miscList = copyOver.miscList;
			}

			document.getElementById("studentlevel").value = window.usrSave.courses[0];
			document.getElementById("studentstream").value = window.usrSave.courses[1];
			window.fromCookie = true;
		} catch (Err) { }
	} else {
		window.usrSave.books = [];
		window.usrSave.miscList = [];
	}

	if (document.getElementById("studentlevel").value == "Choose") {
		document.getElementById("studentstream").value = "select"
	}
	studentlevelcheck()
	addSubStreamSelect()
	document.getElementById("toPrint").addEventListener("click", reqPrint);
	document.getElementById("catchCopyClick").addEventListener("click", copyOut, true);
	document.getElementById("pickup").addEventListener("click", enterSaved);
	document.getElementById("miscItems").addEventListener("click", bubbleMisc);
	document.getElementById("clearinfo").addEventListener("click", clearInfo);
	document.getElementById("searchmisc").addEventListener("input", searchMisc);
	document.getElementById("searchmisc").setAttribute("prevVal", "");

	document.getElementById("studentlevel").addEventListener("change", () => {
		document.getElementById("studentstream").value = "choose";
		studentlevelcheck();
	});
	document.getElementById("studentstream").addEventListener("change", () => {
		window.currReq.abort()
		addSubStreamSelect()
	});
	document.getElementById("floatpanel").children[0].addEventListener("click", () => {
		document.getElementById("floatpanel").classList.toggle("closed")
	});
	document.getElementById("toggleLightButton").addEventListener("click", (e) => {
		document.body.classList.toggle("darkmode");
		e.target.innerText = (e.target.innerText == "Light mode") ? "Dark mode" : "Light mode"
	});

}

