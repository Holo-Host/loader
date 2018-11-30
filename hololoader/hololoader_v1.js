console.log('hololoader.js');
setTimeout(function(){
    console.log("sending WWW address to DNA hash resolver");
    setTimeout(function(){
        console.log("received DNA hash from resolver");
        // load next script
        console.log("loading holo.js");
        let fileref = document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", "/holo/holo.js");
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }, 1000);
}, 1000);
