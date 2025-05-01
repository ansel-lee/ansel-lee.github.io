// Kevin Contributed the top part
class Toggle {
    constructor(state, toggleOn = () => { }, toggleOff = toggleOn) {
        this.state = state;
        this.toggleOn = toggleOn;
        this.toggleOff = toggleOff;
    }
    update(state = !this.state) {
        if (state != this.state) {
            if (state) {
                this.toggleOn();
                this.state = !this.state;
            } else {
                this.toggleOff();
                this.state = !this.state;
            }
        }
    }
}

// Easing Function
function easeInOutQuad(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

// Smooth Scrolling using javascript
class SmoothScroller {
    constructor(start, dist, duration, easingFunction, scrollContainer) {
        this.start = start;
        this.dist = dist;
        this.duration = duration;
        this.easingFunction = easingFunction;
        this.scrollContainer = scrollContainer;
        this.animateScrollTo = this.animateScrollTo.bind(this);
    }
    animateScrollTo(timeStamp) {
        if (this.progress === undefined) {
            this.scrollContainer.style.scrollSnapType = "none";
            this.startTime = timeStamp
        }
        if (this.progress >= 1) {
            window.cancelAnimationFrame(this.animateScrollTo)
            this.scrollContainer.style.scrollSnapType = "";
            if (window.target !== undefined) {
                window.location.hash = window.target;
            }
            return;
        };
        const elapsed = timeStamp - this.startTime;
        this.progress = elapsed / this.duration;
        const moveProgress = this.easingFunction(this.progress);
        const moveDist = this.dist * moveProgress;
        this.scrollContainer.scrollTo(0, this.start + moveDist);
        window.requestAnimationFrame(this.animateScrollTo)
    };
}

function smoothTo(cssQuery, time = 800) {
    let location = document.querySelector(cssQuery).getBoundingClientRect().y;
    let scrollContainer = document.querySelector('.scroll-container')
    const start = scrollContainer.scrollTop;
    const scroller = new SmoothScroller(
        start,
        location,
        time,
        easeInOutQuad,
        scrollContainer
    )
    window.requestAnimationFrame(scroller.animateScrollTo)
}

function checkInView(elem, margin = 0) {
    // let scrollContainer = document.querySelector('.scroll-container')
    let elemDim = elem.getBoundingClientRect()
    let elemTop = elemDim.top;
    let elemBot = elemDim.bottom;
    // let viewTop = scrollContainer.scrollTop;
    // let viewBot = scrollContainer.scrollTop + window.innerHeight;

    // Top of element below bottom of screen
    if (elemTop - margin > window.innerHeight) { return false };

    // Bottom of element above top of screen
    if (elemBot + margin < 0) { return false };

    return true;
}

// fisher yates shuffle
function shuffle(array) {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
}

// Shuffle css colors
function shuffle_colors() {
    let colors = [
        "#EFB5E8", "#EF9CEE", "#B28BFF", "#D5AAFF",
        "#FFBB44", "#FFE56A", "#FFABAB", "#D35FA0",
        "#6EB5FF", "#3E90FF", "#85D3AF", "#90EE90"
    ]
    // https://www.color-hex.com/color-palette/109958
    let darkercolors = ["#997d84", "#927d99", "#7d8499", "#84997d", "#99927d"];
    shuffle(colors);
    shuffle(darkercolors);
    let stylesheet = document.getElementById("colours");
    let l = stylesheet.sheet.cssRules.length;
    for (let i=0; i < l; i++) {
        stylesheet.sheet.cssRules[i].style.backgroundColor = colors[i];
    }

    let darkerStyleSheet = document.getElementById("aboutme-tilecolor");
    let l2 = darkerStyleSheet.sheet.cssRules.length;
    for (let i2 = 0; i2 < l2; i2++) {
        darkerStyleSheet.sheet.cssRules[i2].style.backgroundColor = darkercolors[i2];
    }
}

// Slider animation
let wasInView = {}
wasInView.cov_head = true;
document.addEventListener('DOMContentLoaded', () => {
    let cov_head = document.getElementById("cover-headings");
    let cov_head_watcher = new Toggle(
        // checkInView(cov_head, -0.25 * window.innerHeight),
        true,
        () => {
            let children = cov_head.children;
            for (let i = 0; i < children.length; i++) {
                children[i].className = "";
                children[i].offsetWidth;
                children[i].className = "slider";
            }
            console.log("Cover")
        },
        () => { }
    );

    let nav = document.getElementsByClassName("nav-list")[0];
    let nav_watcher = new Toggle(
        checkInView(nav),
        () => {
            let children = nav.children;
            for (let i = 0; i < children.length; i++) {
                children[i].className = "";
                children[i].offsetWidth;
                children[i].className = "slider";
            }
        },
        () => { }
    );

    let cooldown = [-1];
    let scrollContainer = document.querySelector('.scroll-container')
    scrollContainer.addEventListener('scroll', (event) => {
        if (cooldown[0] == -1) {
            shuffle_colors();
            cooldown[0] = setInterval(() => {
                clearInterval(cooldown[0]);
                cooldown[0] = -1
            }, 1000)
        }
        // console.log(event);
        let cov_head = document.getElementById("cover-headings")
        //console.log(checkInView(cov_head, -0.25 * window.innerHeight))
        cov_head_watcher.update(checkInView(cov_head, -0.25 * window.innerHeight));
        nav_watcher.update(checkInView(nav));
    });
})


// Ansel's code starts here

function shownavbar() {
    document.getElementsByTagName('header')[0].classList.toggle('hidenav')
}

function showmore(e) {
    e.currentTarget.classList.add("nodisp");
    e.currentTarget.nextElementSibling.classList.remove("nodisp");
}


function init() {
    document.getElementsByTagName('header')[0].classList.add('hidenav')
    document.getElementById("navhintfloat").children[0].addEventListener("click", shownavbar)

    // bind nav list to function instead of link
    let linksparent = document.getElementsByClassName("nav-list")[0]
    let i = linksparent.children.length
    console.log(linksparent)
    while (i--) {
        let currElm = linksparent.children[i].children[0];
        if (currElm.tagName != "A") { continue; }

        console.log(currElm.href.split('#')[1]);
        // add event listener does not cancel function, so onclick better
        currElm.onclick = () => {
            smoothTo(currElm.href.split('#')[1])
            window.target = currElm.href.split("#")[1]
            return false;
        };
    }

    // show more with more button (and hide text using js so noscript works)
    let morebuttons = document.getElementsByClassName("morebutton");
    let j = morebuttons.length
    while (j--) {
        let currElm = morebuttons[j];
        currElm.classList.remove("nodisp")
        currElm.tabIndex = 0; // its weird, dont ask me why not tabindex
        currElm.addEventListener("click", showmore);
        currElm.addEventListener("keyup", (e) => {
            e && e.keyCode == 13 ? showmore(e) : 0;
        })
        currElm.nextElementSibling.classList.add("nodisp");
    }

    // create style sheet for colours
    let head = document.head || document.getElementsByTagName("head")[0];
    let colors = [
        "#EFB5E8", "#EF9CEE", "#B28BFF", "#D5AAFF",
        "#FFBB44", "#FFE56A", "#FFABAB", "#D35FA0",
        "#6EB5FF", "#3E90FF", "#85D3AF", "#90EE90"
    ]
    let colorStyle = "";
    for (let i = 0; i < colors.length; i++) {
        colorStyle += ` .colors:nth-child(${i + 1}) { background-color: ${colors[i]}; } `;
    }
    let style = document.createElement("style");
    style.id = "colours";
    style.appendChild(document.createTextNode(colorStyle));
    head.appendChild(style);
    
    // https://www.color-hex.com/color-palette/109958
    let darkercolors = ["#997d84", "#927d99", "#7d8499", "#84997d", "#99927d"]
    let colorStyle2 = "";
    for (let i=0; i < document.getElementsByClassName("onerow").length; i++) {
        colorStyle2 += ` .onerow:nth-child(${i + 1}) { background-color: ${darkercolors[i%darkercolors.length]}; }`;
    }
    let style2 = document.createElement("style");
    style2.id = "aboutme-tilecolor";
    style2.appendChild(document.createTextNode(colorStyle2));
    head.appendChild(style2);

    var vidDefer = document.getElementsByTagName("iframe");
    for (var k=0; i < vidDefer.length; ++i) {
        if (vidDefer[k].getAttribute("data-src")) {
            vidDefer[k].setAttribute("src", vidDefer[k].getAttribute("data-src"))
        }
    }
}
