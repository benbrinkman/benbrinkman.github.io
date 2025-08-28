
const links = [
    { title: "drive", link: "https://drive.google.com/drive/u/0/my-drive" },
    { title: "gmail", link: "https://mail.google.com/mail/u/0/#inbox", size: "small" },
    { title: "messenger", link: "https://www.messenger.com/t/" },
    { title: "heroforge", link: "https://www.heroforge.com/" },
    { title: "youtube", link: "https://youtube.com", size: "small" },
    { title: "miro", link: "https://miro.com"},
    { title: "blossom", link: "https://blossomcounselling.janeapp.com/account" },
    { title: "roundcube", link: "https://email.fatcow.com/roundcube/?_task=mail&_mbox=INBOX", size: "small" },
    { title: "amazon", link: "https://www.amazon.ca/" },
    { title: "instagram", link: "https://www.instagram.com/direct/inbox/" },
    { title: "photopea", link: "https://www.photopea.com/" },
    { title: "inkarnate", link: "https://inkarnate.com/maps" },
    { title: "minisgallery", link: "https://www.minisgallery.com/index.php" },
    { title: "aldareth", link: "https://aldareth.fandom.com/wiki/Main_Page" },
    { title: "5etools", link: "https://5e.tools/", size: "small" },
    { title: "5etools2014", link: "https://2014.5e.tools/index.html", size: "small" },
    { title: "patreon", link: "https://www.patreon.com/home", size: "small" },
    { title: "github", link: "https://github.com/benbrinkman", size: "small" },
    { title: "firebase", link: "https://console.firebase.google.com/u/0/" },
    { title: "reddit", link: "https://www.reddit.com/" },
    { title: "flickr", link: "https://www.flickr.com/photos/114802638@N08/albums" },
];

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('content');
    AddLinks(container);
});


window.addEventListener("resize", log);
var numBubs = links.length;
var defaultSize = 150;


// var size = GetVar("bubbleWidth");
// size = size + (mar * 2);

function log() {
    console.log(GetVar("contentWidth")/100);
    var w = window.innerWidth * GetVar("contentWidth")/100;
    var h = window.innerHeight * GetVar("contentHeight")/100;
    var s = GetTileSize(numBubs, w, h).s;
    // console.log(s);
    setTileSize(s);
}

function setTileSize(size) {
    var mar = GetVar("margin");
    size -= 2*mar;
    SetVar("bubbleWidth", size);
}

// console.log(size);
function GetTileSize(N, W, H) {



    const A = W / H;                 // target aspect ratio
    const C0 = Math.sqrt(N * A);     // continuous guess for column count

    // Gather nearby integer candidates
    const candidates = new Set([
        Math.max(1, Math.floor(C0) - 1),
        Math.max(1, Math.floor(C0)),
        Math.min(N, Math.ceil(C0)),
        Math.min(N, Math.ceil(C0) + 1)
    ]);

    let best = null;

    for (const C of candidates) {
        const R = Math.ceil(N / C);
        const s = Math.min(W / C, H / R);
        const Agrid = C / R;
        const err = Math.abs(A - Agrid);

        // Pick the layout with smallest aspect ratio error,
        // then largest tile size, then largest fill.
        const score = {
            err,
            s,
            fill: (C * s * R * s) / (W * H) // coverage fraction
        };

        if (
            !best ||
            score.err < best.err ||
            (score.err === best.err && score.s > best.s) ||
            (score.err === best.err && score.s === best.s && score.fill > best.fill)
        ) {
            best = { C, R, s, Agrid, ...score };
        }
    }

    return best; // contains C, R, s, Agrid, err, fill
}

log();

function Change(val) {
    SetVar("bubbleWidth", val);
    console.log(val);
}

function GetVar(str) {
    return parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue('--' + str));
}

function SetVar(str, val) {
    return document.documentElement.style.setProperty('--' + str, val + "px");
}

function AddLinks(cont) {
    for (let link of links) {

        CreateLink(cont, link.link, link.title + ".png", link.size);
    }
}



function CreateLink(cont, url, img, size) {
    const linkBoxHolder = document.createElement("div");
    linkBoxHolder.classList.add("linkBoxHolder");

    const linkBox = document.createElement("div");
    linkBox.classList.add("linkBox");
    

    const centerImgWrapper = document.createElement("div");
    centerImgWrapper.classList.add("centerImgWrapper");

    const link = document.createElement("a");
    link.href = url;

    // const effect = document.createElement("div");

    const linkImg = document.createElement("img");
    linkImg.classList.add("icon");
    linkImg.src = img;
    if (size) {
        linkImg.classList.add("smallIcon")
    }
    link.appendChild(linkImg);
    centerImgWrapper.appendChild(link);
    linkBox.appendChild(centerImgWrapper);
    linkBoxHolder.appendChild(linkBox);
    cont.appendChild(linkBoxHolder);
}




