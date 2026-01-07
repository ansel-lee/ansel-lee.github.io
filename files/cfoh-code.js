// carousel next
function carouselNavEvt(e) {
    var addby = scrollby
    if (e.currentTarget.classList.contains("prev")) {
        addby = -scrollby;
    }
    var targetbox = e.currentTarget.parentNode.children[3];
    //console.log(e.currentTarget.parentNode);
    targetbox.scrollTo({
        top: 0,
        left: targetbox.scrollLeft - scrollby,
        behaviour: "smooth",
    });
}

// copy ig handle
function copyHandle() {
    copyTextToClipboard("christian.fellowship");
    document.getElementById("copiedCFHandle").classList.remove("nodisp");
    setTimeout(revertText, 1000);
}

function revertText() {
    document.getElementById("copiedCFHandle").classList.add("nodisp");
}

// libraries
// Source - https://stackoverflow.com/a/30810322
// Posted by Dean Taylor, modified by community. See post 'Timeline' for change history
// Retrieved 2026-01-05, License - CC BY-SA 4.0

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

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}



// carousel dots and event listener, instagram copy link
// initialisation
// prayer text load
function init() {
    const messageList = [
        "Dear God, I thank you that you love my friend very much! I pray that you will protect him/her from harm and challenges, and that you will help him/her to know that you are guiding her on the right path! Thank you for blessing my friend! In Jesus’ name, Amen\n\nPsalms 27:1 “The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?",
        "Dear God, thank you for my friend today! You know them so well and you love them! Lord,  I pray that you will help my friend know that you  care for them very much. As you fill them with your love, help them to experience the joy, peace and comfort that you’ve given to me too!  May they also spread this love to others. \nIn Jesus' name, Amen!\n\n1 John 4:10  “This is real love--not that we loved God, but that he loved us and sent his Son as a sacrifice to take away our sins.”",
        "Dear Heavenly Father, I thank You for watching over and sustaining my friend through their exams! I pray that You grant them wisdom as they choose which school to go to. May they trust in You regardless of what happens. In Jesus' mighty name, Amen\n\nProverbs 3:5-6 “Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.”",
        "Dear Heavenly Father, I thank You for seeing my friend through their exams! I pray that even as they make the decision of choosing which school to go to, may You fill their hearts with peace, and fully trust in You regarding the decision, knowing that You are sovereign over everything. In Jesus' mighty name, Amen\n\nPhilippians 4:6-7 “Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.”"
    ]

    // write prayer, by faith!
    // to bless our prospective j1s
    console.log("cookie: " + document.cookie);
    var cookieValue = document.cookie.split("; ")
        .find((row) => row.startsWith("message="))
        ?.split("=")[1];
    console.log("cookie value is " + cookieValue);
    if (/^\d$/.test(cookieValue)) {
        document.getElementById("writeprayer").innerText = messageList[cookieValue];
    } else {
        // assign new verse
        verseNum = Math.floor(Math.random() * (4 - 0) + 0); // includes min, excludes max
        console.log("assigning new verse " + verseNum);
        console.log("next random number: " + Math.floor(Math.random() * (4 - 0) + 0));
        document.cookie = "message=" + verseNum + "; SameSite=None; max-age=31536000; secure";
        document.getElementById("writeprayer").innerText = messageList[verseNum];
    }

    // add dots to carousel

    // add event listener to carousel; generalise later
    const scrollby = Math.min(900, Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0));
    console.log("scroll by " + scrollby);
    document.getElementsByClassName("next")[0].addEventListener("click", carouselNavEvt);
    document.getElementsByClassName("prev")[0].addEventListener("click", carouselNavEvt);

    // enable copy and pasting for instagram 
    document.getElementsByClassName("copyicon")[0].addEventListener("click", copyHandle);
}
init();
