var TopMargin = 20;
var tracker = 0;


function AddScript(head, src){
    var link = document.createElement("script"); 
    link.src = src;
    link.type = "text/javascript";
    head.appendChild(link); 
}

function LinkBox(link){
    var linkBox = document.createElement("div");
    linkBox.className = "LinkBox";
    linkBox.innerHTML = link;
    return linkBox;
}

function CreateHeader(){
    var body = document.getElementsByTagName("BODY")[0];
    var header = document.createElement("div");
    var textHolder = document.createElement("div");
    var linkHolder = document.createElement("div");
    var arrowHolder = document.createElement("div");
    var arrow = document.createElement("div");
    var arrowTop = document.createElement("div");
    var h1 = document.createElement("h1");
    var h2 = document.createElement("h2");
    header.id = "header";
    textHolder.id="textHolder";
    linkHolder.id="linkHolder";

    arrowHolder.id="arrowHolder";
    arrow.className="arrow";
    arrowTop.className="arrow";
    arrowTop.id="arrowTop";

    h1.innerHTML = "Welcome to the Bengeon";
    h2.innerHTML = "Ben's Dungeons &amp; Dragons lists and things";
    h1.id = "headerH1";
    textHolder.append(h1);
    textHolder.append(h2);
    header.append(textHolder);

    header.append(LinkBox("box 1"));
    header.append(LinkBox("box 2"));
    header.append(LinkBox("box 3"));
    header.append(LinkBox("box 3"));
    arrowHolder.append(arrow);
    arrowHolder.append(arrowTop);
    header.append(arrowHolder);
    body.prepend(header, body.children[0]);
}

function AddFont(head, font){
    var link = document.createElement("link"); 
    link.href =font;
    link.rel="stylesheet";
    head.append(link); 
}

function AddCSS(head, css){
    var link = document.createElement("link"); 
    link.rel = 'stylesheet';  
    link.type = 'text/css'; 
    link.href = css;  
    head.append(link); 
}

function HeadBuilder(){
    var head = document.getElementsByTagName("HEAD")[0];

    AddCSS(head, 'BengeonHeader.css');
    AddFont(head, "https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap");
    AddFont(head, "https://fonts.googleapis.com/css2?family=Noto+Sans+JP&display=swap");
    AddFont(head, "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;1,100&display=swap");
}

HeadBuilder();
CreateHeader();
SetCSSValues();

function TrimEnd(str, num){
    return parseInt(str.slice(0, str.length-num));
}

function SetCSSValues(){
    tracker++;
    $('#header').height($('#textHolder').height());
    console.log($('#textHolder').height());
    var heightInt = $('#textHolder').height();
    var heightPx = heightInt +"px";
    var halfInt = heightInt/4;
    var halfPX = halfInt +"px";
    var margin = $('#header').height()+TopMargin;
    $('body').css("margin-top", margin+"px");

    $('.LinkBox').css("height", heightPx);
    $('.LinkBox').css("line-height", heightPx);
    $('#arrowHolder').css("height", heightPx);
    $('.arrow').css("border-width", halfPX+" 0 "+halfPX+" 10px");
    $('.arrow').css("top", halfPX);
    //    $('.arrow').css("top", (halfInt*-1)+"px");

    var totalW = $('#header').outerWidth();
    var textW = $('#textHolder').outerWidth();
    var arrowW = $('#arrowHolder').outerWidth();
    console.log($("#textHolder")[0].getBoundingClientRect().width);
    var numLinks = document.getElementsByClassName("LinkBox").length;
    var newLinkWidth = (totalW - (textW + arrowW))/numLinks;
    console.log(newLinkWidth + " = " + "("+totalW+" - "+textW+" + "+totalW+") / "+numLinks);
    $('#header').hover(function(){
        $('.LinkBox').css("--w", newLinkWidth+"px");
    })

    
    //margin = header height + variable
    //get text holder height
    //set linkbox height
    //set linkbox lineheight
    //set header height
    
    
//    $('#content').css("display", "none");
    if(tracker<3){
        SetCSSValues();
    }
}


$( window ).resize(function() {
    SetCSSValues();
});






