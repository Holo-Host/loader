
const fs = require('fs')
const $ = require('jquery') // try and remove jquery in a refactor soon

/**
 * Inserts the login page in to the current document HTML.
 * It will be invisible and should not alter current page until
 * triggered to display
 */
const insertLoginHtml = function () {
  // this will be inlined by parcel
  let html = fs.readFileSync(__dirname + '/login/login.html')
  let cssMain = fs.readFileSync(__dirname + '/login/css/main.css')
  let cssUtil = fs.readFileSync(__dirname + '/login/css/main.css')

  var template = document.createElement('template')
  template.id = 'login-template'
  template.innerHTML = html

  document.body.appendChild(template)

  // this is the node of the object you wanted
  var documentFragment = template.content
  var templateClone = documentFragment.cloneNode(true)

  document.body.appendChild(templateClone) // this empty root now has your template

  let style = document.createElement('style')
  style.innerHTML = cssMain
  style.innerHTML += cssUtil
  template.appendChild(style)

  const modal = document.querySelector('.holo-dialog')
  modal.appendChild(style)
}

/**
 * Shows the login dialog.
 *
 * @param      {(string, string) => void}  onSuccess callback. Takes email and password
 * @param      {(string, string) => void}  onFailure callback. Takes email and password
 */
const showLoginDialog = function (onSuccess, onFailure) {
  const modal = document.querySelector('.holo-dialog')
  modal.onSuccess = onSuccess
  modal.onFailure = onFailure
  modal.showModal()
}

/**
 * Registers all the functionality of the login dialog.
 * This must be on page load called for it to work
 */
const registerLoginCallbacks = function () {
  const dialogPolyfill = require('dialog-polyfill')

  const modal = document.querySelector('.holo-dialog')
  dialogPolyfill.registerDialog(modal)

  /* ==================================================================
    [ Validate ] */
  var input = $('.holo-login-form .input100')

  $('.holo-login-form').on('submit', function (e) {
    e.preventDefault()

    var check = true

    for (var i = 0; i < input.length; i++) {
      if (validate(input[i]) === false) {
        showValidate(input[i])
        check = false
      }
    }

    console.log('success?: ', check)

    const email = $(input[0]).val()
    const password = $(input[1]).val()

    if (check) {
      console.log('starting keygen process with: ', email, password)
      modal.onSuccess(email, password)
      modal.close()
    } else {
      modal.onFailure(email, password)
    }

    return check
  })

  $('.holo-login-form .input100').each(function () {
    $(this).focus(function () {
      hideValidate(this)
    })
  })

  function validate (input) {
    if ($(input).attr('type') === 'email' || $(input).attr('name') === 'email') {
      if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
        return false
      }
    } else {
      if ($(input).val().trim() === '') {
        return false
      }
    }
  }

  function showValidate (input) {
    var thisAlert = $(input).parent()

    $(thisAlert).addClass('alert-validate')
  }

  function hideValidate (input) {
    var thisAlert = $(input).parent()

    $(thisAlert).removeClass('alert-validate')
  }
}

module.exports = {
  insertLoginHtml,
  registerLoginCallbacks,
  showLoginDialog
}
