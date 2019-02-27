
const fs = require("fs");
const $ = require("jquery"); // try and remove jquery in a refactor soon

const insertLoginHtml = function() {
    // this will be inlined by parcel
    let html = fs.readFileSync("./src/login/login.html");

    var template = document.createElement('template');
    template.id = "login-template";
    template.innerHTML = html;
    document.body.appendChild(template);

    // this is the node of the object you wanted
    var documentFragment = template.content;
    var templateClone = documentFragment.cloneNode(true);

    document.body.appendChild(templateClone); // this empty root now has your template
}

const showLoginDialog = function() {
    const modal = document.querySelector('.holo-dialog');
    modal.show();
}

const registerLoginCallbacks = function () {

    const dialogPolyfill = require("dialog-polyfill");

    const modal = document.querySelector('.holo-dialog');
    dialogPolyfill.registerDialog(modal);

    /*==================================================================
    [ Validate ]*/
    var input = $('.holo-login-form .input100');

    $('.holo-login-form').on('submit', function(e) {
        e.preventDefault()

        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }

        console.log("success?: ", check);

        if(check) {
            const email = $(input[0]).val();
            const password = $(input[1]).val();
            console.log("starting keygen process with: ", email, password);
            hClient.generateNewReadwriteKeypair(email, password);
        }

        return check
    });


    $('.holo-login-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }

};

module.exports = {
    insertLoginHtml,
    registerLoginCallbacks,
    showLoginDialog,
};