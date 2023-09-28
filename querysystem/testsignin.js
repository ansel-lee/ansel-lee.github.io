'use strict'




function globalVars() {
    window.scriptlink = "https://script.google.com/macros/s/AKfycbw_7znCWq6wvusF-wUiSljt0xPvl1CQuVWlhpZciRjq-dB8ubsdNDH8VSIaZu3vqB0/exec";
    window.verNum = 3.4;
    window.googleAuthID = "1058554454512-daeil9rg9nahtovai8mji510fq2fi8qg.apps.googleusercontent.com";
    window.formType = ["Google", "userID", "userPass"]
    // what fields are shown.
    // if both userID and userPass are chosen, the identifier field will be shown first
}


function changeDarkLight() {
    if (document.body.classList.contains("lightmode")) {
        document.body.classList.remove("lightmode");
        document.getElementById("toggleLightButton").innerText = "Light mode";
    } else {
        document.body.classList.add("lightmode");
        document.getElementById("toggleLightButton").innerText = "Dark mode";
    }
}


// uses google federated sign-in. However, there is no CSRF double cookie check on server side
// as google apps script does not allow cookies 
function googleSignIn(callbackInfo) {
    if (callbackInfo.clientId === callbackInfo.client_id && callbackInfo.clientId === googleAuthID) {
        callAppsScript("Google/JWT", callbackInfo.credential);
    } else {
        console.log("Wrong client ID");
    }

    /* example object {"clientId": "1058554454512-daeil9rg9nahtovai8mji510fq2fi8qg.apps.googleusercontent.com",
        "client_id": "1058554454512-daeil9rg9nahtovai8mji510fq2fi8qg.apps.googleusercontent.com",
        "credential": "", "select_by": "btn"}*/
}

function checkIdentity(e) {
    console.log("identity listener called");
    var userText = document.getElementById("userinfo").value;
    callAppsScript("userID", userText);
}

function checkIdentiPass(e) {
    var username = document.getElementById("userinfo").value;
    var password = document.getElementById("userPass").value;
    callAppsScript("userPass", [username, password]);
    // server side hashing is implemented 
    // reference: https://security.stackexchange.com/questions/8596/https-security-should-password-be-hashed-server-side-or-client-side
}





function callAppsScript(authType, cred) {
    function transferFailed() {
        // transfer failed
        document.getElementById("loadingscreen").classList.add("hidden");
        document.getElementById("google-signinbox").classList.remove("hidden");
        document.getElementById("serverErr").classList.remove("hidden")

        document.getElementById("errors").classList.remove("hidden")
        document.getElementById("serverErr").classList.remove("hidden")
        console.log("An error occurred. XHR errored out.")
    }

    console.log("sending to apps script");
    hideAllErrors()
    console.log(cred);
    document.getElementById("google-signinbox").classList.add("hidden");
    document.getElementById("loadingscreen").classList.remove("hidden");

    function reqListener() {
        console.log(this.responseText);
    }

    var req = new XMLHttpRequest();
    req.addEventListener("load", reqListener);
    req.open("POST", scriptlink);

    req.onreadystatechange = () => {
        // Call a function when the state changes.
        if (req.readyState === XMLHttpRequest.DONE && req.status === 200) {
            document.getElementById("loadingscreen")
            console.log(req.responseText)
            var thisresponse = JSON.parse(req.responseText)

            if (thisresponse[0] == "error") {
                handleServerErrs(thisresponse)
            } else {
                // Request finished. Do processing here.\
                populatelist(thisresponse[2], thisresponse[3]);
                document.getElementById("loadingscreen").classList.add("hidden");
                document.getElementById("successMsg").classList.remove("hidden");

                // reinstate enter event listener upon successful listing
                document.getElementById("userinfo").addEventListener("keypress", usercheckenter)
            }
        }
    };

    req.addEventListener("error", transferFailed);
    var toSend = [(authType), (cred), verNum]
    console.log("sending... " + JSON.stringify(toSend))
    req.send(JSON.stringify(toSend));


    function handleServerErrs(resp) {
        hideAllErrors()
        document.getElementById("errors").classList.remove("hidden")
        console.log("An error occurred.")
        console.log(resp)
        switch (resp[2][0]) {
            case "Unauthorised":
                document.getElementById("unauthorized").classList.remove("hidden");
                break;
            case "user-not-found-1":
                document.getElementById("unauthorized").classList.remove("hidden");
                break;
            case "user-not-found-2":
                console.log("this is supposed to be activated")
                document.getElementById("noUser").classList.remove("hidden");
                break;
            case "user-not-found-3":
                document.getElementById("noUser").classList.remove("hidden");
                break;
            case "user-not-found-5":
                document.getElementById("passdiv").classList.remove("hidden");
                document.getElementById("userPass").focus();
                document.getElementById("submitBtn").removeEventListener("click", checkIdentity);
                document.getElementById("submitBtn").addEventListener("click", checkIdentiPass);
                document.getElementById("errors").classList.add("hidden");
                document.getElementById("loadingscreen").classList.add("hidden");

                document.getElementById("userinfo").removeEventListener("keypress", usercheckenter);
                break;
            case "missing-sheet":
                document.getElementById("wrongVersion").classList.remove("hidden");
                break;
            case "unclean-1":
            case "unclean-2":
                document.getElementById("uncleanIdentity").classList.remove("hidden");
                break;
            default:
                document.getElementById("specialExpected").classList.remove("hidden");
                document.getElementById("errcode").innerText = resp[2]
                break;
        }
    }
}

function hideAllErrors() {
    document.getElementById("errors").classList.add("hidden")
    document.getElementById("infoErr").classList.add("hidden")
    document.getElementById("noUser").classList.add("hidden")
    document.getElementById("serverErr").classList.add("hidden")
    document.getElementById("wrongVersion").classList.add("hidden")
    document.getElementById("noEmail").classList.add("hidden")
}



function populatelist(names, val) {
    document.getElementById("receivedInfo").innerHTML = "<p>Field</p><p>Details</p><hr />";
    var i = 0;
    while (i < names.length) {
        if (val[i] != "") {
            if (val[i] == "-") {
                var el = document.createElement("hr");
                document.getElementById("receivedInfo").appendChild(el);
            } else {
                var el = document.createElement('p');
                el.appendChild(document.createTextNode(names[i]));
                document.getElementById("receivedInfo").appendChild(el);

                el = document.createElement("p");
                var j = 0;
                var withNewLines = String(val[i]).split(/\r?\n|\r|\n/g);
                while (j < withNewLines.length) {
                    if (j !== 0) { el.innerHTML += "<br /><br />" }
                    el.appendChild(document.createTextNode(withNewLines[j]));
                    j++;
                }
                document.getElementById("receivedInfo").appendChild(el);
            }
        }

        i++
    }
}

function usercheckenter(e) {
    if (e.key == "Enter") {
        if (e.currentTarget == document.getElementById("userinfo")) {
            checkIdentity();
            console.log("checking username via enter press")
        } else {
            checkIdentiPass()
            console.log("checking password by enter press")
        }
    }
}

function printSettings() {
    document.body.classList.add("lightmode");
    window.print()
    document.body.classList.remove("lightmode");
}

function passRevealEvt() {
    var e = document.getElementById("passReveal")
    if (e.matches(":hover") || e.matches(":focus")) {
        document.getElementById("userPass").type = "text"
    } else {
        document.getElementById("userPass").type = "password"
    }
}





function init() {
    console.log("page fired up!")
    globalVars()
    document.getElementById("toggleLightButton").addEventListener("click", changeDarkLight)
    //document.getElementById("identifier").value = "";
    window.addEventListener("offline", () => { document.getElementById("noInternet").classList.add("hidden"); })
    window.addEventListener("online", () => { document.getElementById("noInternet").classList.remove("hidden"); })
    document.getElementById("verid").innerText = "Version " + verNum;


    if (!formType.includes("Google")) {
        document.getElementById("google-signinbox").classList.add("hidden")
    }

    document.getElementById("userPass").addEventListener("keypress", usercheckenter);
    if (formType.includes("userID")) {
        document.getElementById("identifierPassword").classList.remove("hidden");
        document.getElementById("submitBtn").addEventListener("click", checkIdentity);
        console.log("identity listener fired");
        document.getElementById("userinfo").addEventListener("keypress", usercheckenter);
    } else if (formType.includes("userPass")) {
        document.getElementById("identifierPassword").classList.remove("hidden");
        document.getElementById("passdiv").classList.remove("hidden");
        document.getElementById("submitBtn").addEventListener("click", checkIdentiPass);
        console.log("sending userID and Password in the same packet")
    }

    document.getElementById("passReveal").addEventListener("mouseover", passRevealEvt)
    document.getElementById("passReveal").addEventListener("mouseout", passRevealEvt)
    document.getElementById("passReveal").addEventListener("focus", passRevealEvt)
    document.getElementById("passReveal").addEventListener("focusout", passRevealEvt)

    document.getElementById("print").addEventListener("click", printSettings)
}
