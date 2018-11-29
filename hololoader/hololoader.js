console.log('hololoader.js');
setTimeout(function(){
    console.log("sending WWW address to DNA hash resolver");
    setTimeout(function(){
        console.log("received DNA hash from resolver");
        let fileref = document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", "hololoader/hololoader.js");
        document.getElementsByTagName("head")[0].appendChild(fileref);
        console.log("loading hololoader");
    }, 1000);
}, 1000);
