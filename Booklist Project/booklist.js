"use strict"
var document, window, console, setTimeout


function studentlevelcheck() {
    var e = document.getElementById("studentlevel").value
    if (e == "4" || e == "5") {
        document.getElementById("hidingstream").classList.remove("hidden")
        console.log("hello")
    } else {
        document.getElementById("hidingstream").classList.add("hidden")
    }
}

function replaceDropdown(e) {
    function remChild(e) {
        if (!(e.target.parentNode.id === "replacebox" || e.target.parentNode.classList.contains("dropdown-container"))) {
            document.getElementById("replacebox").outerHTML = ""
            document.body.removeEventListener("click", remChild, true)
        }
    }

    if (e.target.classList.contains("subjectCard")) {
        e.target.appendChild(document.getElementById("replacebox1").cloneNode(true))
        e.target.style.position = "relative"
        e.target.children[0].id = "replacebox"
        e.target.children[0].classList.remove("nodisp")
        e.target.children[0].style.position = "absolute";
        e.target.children[0].style.padding = "0";

        e.target.children[0].children[0].addEventListener("click", delSub)
        document.body.addEventListener("click", remChild, true) 
        // useCapture will make deletion fire before new is added
    }

    function delSub(e) {
        var wherebox = document.getElementById("replacebox").parentNode;
        document.body.removeEventListener("click", remChild, true);
        wherebox.outerHTML = "";
        console.log(wherebox.className)
    }

    function repSub(e) { }

}

function openDropdown(e) {
    e.currentTarget.classList.remove("dropdown-closed")
}

function closeDropdown(e) {
    e.currentTarget.classList.add("dropdown-closed")
}



function main() {
    studentlevelcheck()
    document.getElementById("studentlevel").addEventListener("change", studentlevelcheck)
    document.getElementById("subjectbox").addEventListener("click", replaceDropdown)

    var elms = document.getElementsByClassName("dropdown-container")
    var i = elms.length
    while (i--) {
        console.log("element found")
        elms[i].addEventListener("focusin", openDropdown)
        elms[i].addEventListener("focusout", closeDropdown)
    }

    var subCards = document.getElementsByClassName("subjectCard");
    i = subCards.length;
    while (i--) {
        subCards[i].tabIndex = 0;
    }
}