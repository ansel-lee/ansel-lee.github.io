// dropdown

'use strict'

function dropdownInit() {
    function showopts(e) {
        console.log("fired")
        var targetitem = e.currentTarget.parentNode;
        if (targetitem.classList.contains("dropdown-closed")) {
            targetitem.classList.remove("dropdown-closed");
            targetitem.children[1].children[0].addEventListener("click", handleuserdropdownselection);

            var options = targetitem.children[1].children[0].children;
            var count = options.length;
            while (count--) {
                options[count].addEventListener("keydown", handlekeypress)
            }
        } else {
            targetitem.classList.add("dropdown-closed");
            removeevtforclosing(targetitem);
        }
    }


    function handleuserdropdownselection(e) {
        var qn = e.currentTarget.parentNode.parentNode;
        if (!e.target.classList.contains("dropdown-list")) {
            var selection = e.target;
            qn.setAttribute("value", selection.getAttribute("value"));
            qn.children[0].innerHTML = selection.innerHTML;
            qn.classList.add("dropdown-closed");
        }

        removeevtforclosing(qn);
    }

    function closedropdown(e) {
        if (!e.target.classList.contains("dropdown")) {
            var opendropdowns = document.querySelectorAll('.dropdown-container:not(.dropdown-closed)');
            if (opendropdowns[0]) {
                opendropdowns[0].classList.add("dropdown-closed");
                removeevtforclosing(opendropdowns[0]);
            }
        }
    }

    function removeevtforclosing(opendropdowns) {
        opendropdowns.children[0].removeEventListener("click", handleuserdropdownselection)
        var options = opendropdowns.children[1].children[0].children;
        var count = options.length;
        while (count--) {
            options[count].removeEventListener("keydown", handlekeypress)
        }
    }

    function handlekeypress(e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);

        function handleEnter() {
            if (keycode == '13' || keycode == '32') {
                document.activeElement.click();
            }
        }

        function handleupdown() {
            if (keycode == '38') { // up arrow
                if (document.activeElement.previousElementSibling) {
                    document.activeElement.previousElementSibling.focus();
                }
            }

            if (keycode == '40') { // down arrow
                if (document.activeElement.nextElementSibling) {
                    document.activeElement.nextElementSibling.focus();
                }
            }
        }

        function dropdownTextDown() {
            if (keycode == '40') {
                if (document.activeElement.parentNode.children[1].children[0].children[0]) {
                    if (document.activeElement.parentNode.classList.contains("dropdown-closed")) {
                        showopts({
                            currentTarget: document.activeElement
                        })
                    }
                    document.activeElement.parentNode.children[1].children[0].children[0].focus();
                }
            }
        }

        handleEnter();

        if (document.activeElement.parentNode.classList.contains("dropdown-list")) {
            handleupdown(e)
        }

        if (document.activeElement.classList.contains("dropdown-text")) {
            dropdownTextDown();
        }
    }

    function init() {
        var elms = document.getElementsByClassName("dropdown-text")
        var i = elms.length
        while (i--) {
            elms[i].addEventListener("click", showopts)
            elms[i].addEventListener("keydown", handlekeypress)

            var options = elms[i].parentNode.children[1].children[0].children;
            var count = options.length;
            while (count--) {
                options[count].tabIndex = 0;
            }
        }
        document.body.addEventListener("click", closedropdown)
    }

    init();
}