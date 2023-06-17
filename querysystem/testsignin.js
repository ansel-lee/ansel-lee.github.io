'use strict'




function globalVars() {
    window.scriptlink = "https://script.google.com/macros/s/AKfycbz9K7mpM2cO97S0x6zjTreHKLDwvL6-MeK3ckzCgY81gMgjqh8UfFIef9Szzmd7JDOG/exec";
    window.verNum = 3.1;
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



function googleSignIn(callbackInfo) {
    if (callbackInfo.clientId === callbackInfo.client_id && callbackInfo.clientId === googleAuthID) {
        callAppsScript("Google/JWT", callbackInfo.credential);
    } else {
        console.log("Wrong client ID");
    }

    /* example object {
        "clientId": "1058554454512-daeil9rg9nahtovai8mji510fq2fi8qg.apps.googleusercontent.com",
        "client_id": "1058554454512-daeil9rg9nahtovai8mji510fq2fi8qg.apps.googleusercontent.com",
        "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwODNkZDU5ODE2NzNmNjYxZmRlOWRhZTY0NmI2ZjAzODBhMDE0NWMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2ODYwMjc5NDIsImF1ZCI6IjEwNTg1NTQ0NTQ1MTItZGFlaWw5cmc5bmFodG92YWk4bWppNTEwZnEyZmk4cWcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDc4NjU1NzYwMTk1MTY1MTI2MDUiLCJlbWFpbCI6ImFuc2VsbGVlMjNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6IjEwNTg1NTQ0NTQ1MTItZGFlaWw5cmc5bmFodG92YWk4bWppNTEwZnEyZmk4cWcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJuYW1lIjoiQW5zZWwgTGVlIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FBY0hUdGRuc3VoOVNIMzFCRmZVVXVmUThGaVM2OFprZ3hzVGtmVzFscmRPPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkFuc2VsIiwiZmFtaWx5X25hbWUiOiJMZWUiLCJpYXQiOjE2ODYwMjgyNDIsImV4cCI6MTY4NjAzMTg0MiwianRpIjoiNTEzYTQ0YzFhYjcxZmRmNmZkNTE0NDFjZDA2M2RlNjVhMzJiYTg0NCJ9.pPRoOBElAv9wiuOeow948JD0V_GFd5PTOrallCg7h-aKCleL-6d41vrXuAaOKj-nAOCK1l-iew1YjREL8QA4zZiSlWJsTGwgtn_IzGYQt0jtLzGcX0tP2z-vBLnsbZwG4X8j5zrq1HBINKb0A0GfCzvVCE67ZlYpK0SzbH2MS-CAGOPp6inRwDwjLLzh5DNJttdNv9CQA8zbDYPHY7P3tt0MIzoFTrMWI9HesVQanNKrpgEbhcteXrlxpY1mYw3YST0KPMuy-YtDVfDfKJhqQss-llRCqYUwp3QxhQ1VbIHS6jKwn16ZaEFrI8DaJT1jytHUJiXOi8PPvvlZ13bQ7Q",
        "select_by": "btn"
    }*/
}

function checkIdentity(e) {
    console.log("identity listener called")
    var userText = document.getElementById("userinfo").value
    callAppsScript("userID", userText)
}

function checkIdentiPass(e) {
    var username = document.getElementById("userinfo").value
    var password = document.getElementById("userPass").value
    callAppsScript("userPass", [username, password])
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
                // Request finished. Do processing here.
                populatelist(thisresponse[2], thisresponse[3])
                document.getElementById("loadingscreen").classList.add("hidden")
                document.getElementById("successMsg").classList.remove("hidden")
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
                document.getElementById("submitBtn").removeEventListener("click", checkIdentity);
                document.getElementById("submitBtn").addEventListener("click", checkIdentiPass);
                document.getElementById("errors").classList.add("hidden");
                document.getElementById("loadingscreen").classList.add("hidden")
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
                var withNewLines = val[i].split(/\r?\n|\r|\n/g);
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

    if (formType.includes("userID")) {
        document.getElementById("identifierPassword").classList.remove("hidden");
        document.getElementById("submitBtn").addEventListener("click", checkIdentity);
        console.log("identity listener fired")
    } else if (formType.includes("userPass")) {
        document.getElementById("identifierPassword").classList.remove("hidden")
        document.getElementById("passdiv").classList.remove("hidden")
        document.getElementById("submitBtn").addEventListener("click", checkIdentiPass)
    }

}