;(function () {
    // only load hive SDK code once
    if (window._HIVE_SDK_HAS_LOADED_JS) {
        return console.warn(
            "Hive SDK: Trying to load the Hive SDK javascript snippet more than once. Make sure you've only included it once in your webpage."
        )
    }
    window._HIVE_SDK_HAS_LOADED_JS = true

    // START FUNKY LOADING OF JQUERY STUFF HERE
    var jQuery // Localize jQuery variable
    // try to see if the correct version of jQuery is loaded already
    if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.10.2') {
        var script_tag = document.createElement('script')
        script_tag.setAttribute('type', 'text/javascript')
        script_tag.setAttribute(
            'src',
            'https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'
        )
        if (script_tag.readyState) {
            script_tag.onreadystatechange = function () {
                // For old versions of IE
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    scriptLoadHandler()
                }
            }
        } else {
            script_tag.onload = scriptLoadHandler
        }
        // Try to find the head, otherwise default to the documentElement
        ;(document.getElementsByTagName('head')[0] || document.documentElement).appendChild(
            script_tag
        )
    } else {
        // The jQuery version on the window is the one we want to use
        jQuery = window.jQuery
        main()
    }

    /******** Called once jQuery has loaded ******/
    function scriptLoadHandler() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        jQuery = window.jQuery.noConflict(true)
        // Call our main function
        main()
    }
    // END FUNKY LOADING OF JQUERY STUFF HERE

    function main() {
        jQuery(document).ready(function ($) {
            // resolve what domain we are loading script on, will determine what domain we should
            // load iframe from, make api requests to, etc
            var hiveAbsUrl
            var scriptAnchorTag = $('<a>').attr('href', $('#HIVE_SDK').attr('src'))[0]
            var scriptSrcHostname = scriptAnchorTag.hostname
            if (scriptSrcHostname == 'cdn-prod.hive.co') {
                hiveAbsUrl = 'https://app.hive.co'
            } else if (scriptSrcHostname == 'cdn-staging.hive.co') {
                hiveAbsUrl = 'https://staging.hive.co'
            } else {
                hiveAbsUrl = 'https://local.hive.co'
            }

            // set up messaging transport used to communicate between iframe and parent page
            if (window.addEventListener) {
                window.addEventListener('message', handleMessageFromIFrameHelper, false)
            } else if (window.attachEvent) {
                // legacy postMessage support
                window.attachEvent('onmessage', handleMessageFromIFrameHelper, false)
            }

            // save events that were fired (and queued up on HIVE_SDK.q) before sdk-loader.js was loaded
            var queuedInitEvent
            var queuedEventsAfterInit = []
            for (var i = 0; i < HIVE_SDK.q.length; i++) {
                var eventData = HIVE_SDK.q[i]
                var eventArgs = []
                for (var j = 0; j < eventData.length; j++) {
                    eventArgs.push(eventData[j])
                }

                var eventName = eventData[0]
                if (eventName == 'init' && !queuedInitEvent) {
                    // find an init event, if one's been queued
                    queuedInitEvent = eventArgs
                } else if (queuedInitEvent) {
                    // we'll fire these events after the init fires
                    queuedEventsAfterInit.push(eventArgs)
                } else {
                    // any events that come through before the init will be ignored
                    console.error(
                        'Hive SDK: A command was made before a call to "init" command was made - "' +
                            eventName +
                            '" command will be ignored.'
                    )
                }
            }

            // we'll use this to store and event's args so that we can retrieve them at a later point in time
            // ie to call and event's callbacks, handle async responses from attempting auth, etc
            var eventIdtoEventArgsMapping = {}

            var initResponseMessageData // cached data from the response of the init call incase we try to init SDK again

            // note that after HIVE_SDK has been declared, any event calls to HIVE_SDK(...) will happen handled syncronously
            // ie further events won't go through the HIVE_SDK.q system
            HIVE_SDK = function (eventName) {
                // capture extra args being passed like HIVE_SDK('eventName', 'arg1', arg2...)
                var _arguments = Array.prototype.slice.call(arguments).slice(1)

                if (!HIVE_SDK.isInited && eventName != 'init') {
                    if (HIVE_SDK.isIniting) {
                        // we're still in the middle of initializing the SDK
                        // so keep track of these incoming events to handle after init is complete
                        var event = _arguments
                        event.unshift(eventName)
                        queuedEventsAfterInit.push(event)
                    } else {
                        console.error(
                            'Hive SDK: The Hive SDK has not been initialized yet. Please make a call to "HIVE_SDK(\'init\', ...);" before making any other commands.'
                        )
                    }
                } else {
                    handleSDKEvent(eventName, _arguments)
                }
            }

            // if there's a queued init event, fire it!
            if (queuedInitEvent) {
                // pass along the other queued events to be fired once inited
                queuedInitEvent.push(queuedEventsAfterInit)
                HIVE_SDK.apply(null, queuedInitEvent)
            } else {
                // there's no queued init, so just fire the other events! (FYI they'll prolly fail...)
                for (var i = 0; i < queuedEventsAfterInit.length; i++) {
                    HIVE_SDK.apply(null, queuedEventsAfterInit[i])
                }
            }

            function handleSDKEvent(eventName, _arguments) {
                var eventId = getEventId()
                eventIdtoEventArgsMapping[eventId] = _arguments

                switch (eventName) {
                    case 'init':
                        if (HIVE_SDK.isInited || HIVE_SDK.isIniting) {
                            console.warn(
                                "Hive SDK: Trying to init Hive SDK more than once. Make sure you're only making one call to \"HIVE_SDK('init', ...);\"."
                            )
                            return handleMessageFromIFrameHelper({
                                origin: hiveAbsUrl,
                                data: {
                                    data: initResponseMessageData,
                                    eventId: eventId,
                                    isHiveMessage: true,
                                    messageType: 'initDuplicateSuccess',
                                    signedLoginToken: getSignedLoginToken(),
                                },
                            })
                        }

                        HIVE_SDK.isIniting = true

                        var identifier = _arguments[0] // always passed as first arg
                        var identifierType = 'hiveTourId'
                        if (typeof _arguments[1] == 'string') {
                            // for seetickets SDK, people pass in identifer type as the 2nd arg,
                            // and optionally a callback as 3rd arg
                            identifierType = _arguments[1]
                        }

                        // set up the helper iframe
                        // when the frame is loaded, it will send an initSuccess message back to the SDK (below)
                        // we'll call init event's callbacks etc after that happens
                        var helperIFrame = $('<iframe>').attr({
                            id: 'hiveSDKHelperIFrame',
                            src:
                                hiveAbsUrl +
                                '/jssdk/iframe-helper/?' +
                                $.param({
                                    identifier: identifier,
                                    identifierType: identifierType,

                                    sdkHostPageUrl: window.location.href,
                                    initEventId: eventId,
                                    scriptSrc: scriptAnchorTag.href,
                                    signedLoginToken: getSignedLoginToken(),
                                }),
                            style: 'position: fixed; top: -9999px; left: -9999px;',
                            sandbox:
                                'allow-top-navigation allow-scripts allow-same-origin allow-modals allow-popups',
                        })
                        $('body').append(helperIFrame)
                        break

                    case 'fbSignup':
                        sendMessageToIFrameHelper('fbSignup', eventId)
                        break

                    case 'emailSignup':
                        var userData = _arguments[0]
                        // userData should look like:
                        // {
                        //   email: 'patrick@hive.co',
                        //   didOptIn: true,  // optional
                        //   firstName: 'Patrick',  // optional
                        //   lastName: 'Hannigan',  // optional
                        //
                        //   phoneNumber: 2266003166,  // optional
                        //   didSmsOptIn: true,  // optional
                        //
                        //   birthday: '01/25/1985',  // optional, MM/DD/YYYY formatted
                        //   location: 'Kitchener, Ontario, Canada',  // optional
                        //   zipCode: 'N2H 3X7',  // optional
                        //   country: 'Canada',  // optional
                        //   city: 'Kitchener',  // optional
                        //   state: 'Ontario',  // optional
                        //   mailingAddress: '283 Duke St West, Unit 304',  // optional
                        // }
                        sendMessageToIFrameHelper('emailSignup', eventId, userData)
                        break

                    case 'phoneNumberSignup':
                        var userData = _arguments[0]
                        // userData should look like:
                        // {
                        //   phoneNumber: 2266003166,  // optional
                        //   didSmsOptIn: true,  // optional
                        //
                        //   firstName: 'Patrick',  // optional
                        //   lastName: 'Hannigan',  // optional
                        //
                        //   birthday: '01/25/1985',  // optional, MM/DD/YYYY formatted
                        //   location: 'Kitchener, Ontario, Canada',  // optional
                        //   zipCode: 'N2H 3X7',  // optional
                        //   country: 'Canada',  // optional
                        //   city: 'Kitchener',  // optional
                        //   state: 'Ontario',  // optional
                        //   mailingAddress: '283 Duke St West, Unit 304',  // optional
                        // }
                        sendMessageToIFrameHelper('phoneNumberSignup', eventId, userData)
                        break

                    case 'trackPageView':
                        var data = {
                            timeViewed: Math.round(Date.now() / 1000), // unix timestamp
                            pageUrl: window.location.href,
                            referrerUrl: document.referrer,
                        }

                        sendMessageToIFrameHelper('trackPageView', eventId, data)
                        break

                    case 'trackDefaultPageView':
                        // we only want this to fire at most once per user per pageload
                        if (
                            !HIVE_SDK.defaultPageViewTrackedUserSLTs ||
                            HIVE_SDK.defaultPageViewTrackedUserSLTs.indexOf(
                                HIVE_SDK.loggedInUserSLT
                            ) == -1
                        ) {
                            if (!HIVE_SDK.defaultPageViewTrackedUserSLTs) {
                                HIVE_SDK.defaultPageViewTrackedUserSLTs = [HIVE_SDK.loggedInUserSLT]
                            } else {
                                HIVE_SDK.defaultPageViewTrackedUserSLTs.push(
                                    HIVE_SDK.loggedInUserSLT
                                )
                            }
                            handleSDKEvent('trackPageView')
                        }
                        break

                    case 'trackEvent':
                        var data = {
                            eventType: _arguments[0],
                            eventData: JSON.stringify({
                                pageUrl: window.location.href,
                                referrerUrl: document.referrer,
                                data: _arguments[1] || {},
                            }),
                            timestamp: Math.round(Date.now() / 1000), // unix timestamp
                        }
                        sendMessageToIFrameHelper('trackEvent', eventId, data)
                        break

                    case 'addToSegment':
                        var data = {
                            segmentName: _arguments[0],
                        }

                        sendMessageToIFrameHelper('addToSegment', eventId, data)
                        break

                    case 'submitSignupForm':
                        var $hiveForm = $(_arguments[0])

                        if ($hiveForm.find('[data-HIVE-FORM-FIELD="areUReal"]')[0].value != '') {
                            // if this value is filled in, its a bot submitting our form :(
                            return
                        }

                        var $submitButton = $('[data-HIVE-FORM-FIELD="submitButton"]')
                        if ($submitButton.length) {
                            $submitButton.data('originalText', $submitButton.text())
                            $submitButton.text('Joining mailing list...')
                            $submitButton.attr('disabled', 'disabled')
                        }

                        var $hiveFormInputs = $hiveForm.find('input[data-HIVE-FORM-FIELD]')
                        var successCallback = _arguments[1]
                        var errorCallback = _arguments[2]

                        var userData = {}
                        var segmentNames = []

                        $.each($hiveFormInputs, function (k, v) {
                            var inputField = v
                            var $inputField = $(inputField)
                            var inputFieldName = $inputField.data('hiveFormField')
                            var inputValue = inputField.value

                            if (
                                inputFieldName == 'addToSegment' &&
                                (inputField.type == 'hidden' ||
                                    (inputField.type == 'checkbox' && $inputField.is(':checked')))
                            ) {
                                segmentNames.push(inputValue)
                            } else if (inputField.type == 'checkbox') {
                                userData[inputFieldName] = $inputField.is(':checked')
                            } else if (inputValue && inputValue != '') {
                                userData[inputFieldName] = inputValue
                            }
                        })

                        var birthdayMonth = $hiveForm
                            .find('[data-HIVE-FORM-FIELD="birthdayMonth"]')
                            .val()
                        var birthdayDay = $hiveForm
                            .find('[data-HIVE-FORM-FIELD="birthdayDay"]')
                            .val()
                        if (!('birthday' in userData) && birthdayMonth && birthdayDay) {
                            userData['birthdayNoYear'] = birthdayMonth + '/' + birthdayDay
                        }

                        handleSDKEvent('emailSignup', [
                            userData,
                            function (emailSignupSuccessData) {
                                $.each(segmentNames, function (k, v) {
                                    handleSDKEvent('addToSegment', [v])
                                })
                                $submitButton.text($submitButton.data('originalText'))
                                $submitButton.removeAttr('disabled')
                                var $successMessage = $hiveForm.find(
                                    '[data-HIVE-FORM-FIELD="successMessage"]'
                                )
                                if ($successMessage.length) {
                                    $hiveForm.children().hide()
                                    $successMessage.show()
                                }
                                if (successCallback) {
                                    successCallback(emailSignupSuccessData)
                                }
                            },
                            function (emailSignupErrorData) {
                                $submitButton.text($submitButton.data('originalText'))
                                $submitButton.removeAttr('disabled')
                                if (errorCallback) {
                                    errorCallback(emailSignupErrorData)
                                }
                            },
                        ])

                        break

                    case 'ticketingOrder':
                        var action = _arguments[0]
                        var orderData = _arguments[1]
                        var successCallback = _arguments[2]
                        var errorCallback = _arguments[3]

                        if (action == 'create') {
                            handleSDKEvent('trackEvent', [
                                'ticketingOrder.create',
                                orderData,
                                successCallback,
                                errorCallback,
                            ])
                        } else if (action == 'update') {
                            handleSDKEvent('trackEvent', [
                                'ticketingOrder.update',
                                orderData,
                                successCallback,
                                errorCallback,
                            ])
                        } else {
                            console.error(
                                'Hive SDK: Unknown action "' +
                                    action +
                                    '" passed to command "ticketingOrder".\n\nSupported actions: "create", "update".\n\nPlease check your spelling or contact support@hive.co.'
                            )
                        }
                        break

                    case 'ecommerceOrder':
                        var action = _arguments[0]
                        var orderData = _arguments[1]
                        var successCallback = _arguments[2]
                        var errorCallback = _arguments[3]

                        if (action == 'create') {
                            handleSDKEvent('trackEvent', [
                                'ecommerceOrder.create',
                                orderData,
                                successCallback,
                                errorCallback,
                            ])
                        } else if (action == 'update') {
                            handleSDKEvent('trackEvent', [
                                'ecommerceOrder.update',
                                orderData,
                                successCallback,
                                errorCallback,
                            ])
                        } else {
                            console.error(
                                'Hive SDK: Unknown action "' +
                                    action +
                                    '" passed to command "ecommerceOrder".\n\nSupported actions: "create", "update".\n\nPlease check your spelling or contact support@hive.co.'
                            )
                        }
                        break

                    default:
                        console.error(
                            'Hive SDK: Unknown SDK command: "' +
                                eventName +
                                '".\n\nSupported commands: , "init", "fbSignup", "emailSignup", "addToSegment", "ticketingOrder".\n\nPlease check your spelling or contact support@hive.co.'
                        )
                }
            }

            function sendMessageToIFrameHelper(messageType, eventId, data) {
                $('#hiveSDKHelperIFrame')[0].contentWindow.postMessage(
                    {
                        isHiveMessage: true,
                        messageType: messageType,
                        eventId: eventId,
                        tourId: HIVE_SDK.tourId,
                        data: data,
                    },
                    hiveAbsUrl
                ) // broadcast window messages to windows on hive.co domain only
            }

            function handleMessageFromIFrameHelper(message) {
                var messageData = message.data
                if (message.origin != hiveAbsUrl || !messageData || !messageData.isHiveMessage) {
                    return
                }

                var eventId = messageData.eventId
                var eventArgs = eventId ? eventIdtoEventArgsMapping[eventId] : null

                switch (messageData.messageType) {
                    case 'initDuplicateSuccess':
                        // call the optional callback fn passed to the init call
                        var _callback = function () {}
                        if (
                            eventArgs.length >= 3 &&
                            typeof eventArgs[1] == 'string' &&
                            typeof eventArgs[2] == 'function'
                        ) {
                            // identifierType is passed as 2nd arg and callback as 3rd
                            _callback = eventArgs[2]
                        } else if (eventArgs.length >= 2 && typeof eventArgs[1] == 'function') {
                            // not identifierType is passed, and callback is 3rd arg
                            _callback = eventArgs[1]
                        }
                        _callback(messageData.data)
                        break

                    case 'initSuccess':
                        HIVE_SDK.isInited = true
                        HIVE_SDK.isIniting = false

                        var userData = messageData.data.user

                        // save this data into a var incase we try to init SDK again
                        initResponseMessageData = {
                            user: userData,
                        }

                        HIVE_SDK.tourId = messageData.data.tourId

                        if (userData) {
                            var userData = userData

                            // autofill any hive forms with that may exist with this user's data
                            $('[data-HIVE-FORM-FIELD="submitButton"]').each(function (k, v) {
                                var $hiveForm = $(v).closest('form')
                                $hiveForm.find('[data-HIVE-FORM-FIELD="email"]').val(userData.email)
                                $hiveForm
                                    .find('[data-HIVE-FORM-FIELD="firstName"]')
                                    .val(userData.firstName)
                                $hiveForm
                                    .find('[data-HIVE-FORM-FIELD="lastName"]')
                                    .val(userData.lastName)
                            })
                        }

                        // pull out (optional) callback and any queued events to fire after the init is complete
                        var _callback = function () {}
                        var _queuedEventsAfterInit = []

                        if (eventArgs.length == 4) {
                            // ie: HIVE_SDK('init', 150699, 'seeTicketsClientId', function(){}) + queued events
                            _callback = eventArgs[2]
                            _queuedEventsAfterInit = eventArgs[3]
                        } else if (eventArgs.length == 3) {
                            if (typeof eventArgs[1] == 'string') {
                                if (typeof eventArgs[2] == 'function') {
                                    // ie: HIVE_SDK('init', 150699, 'seeTicketsClientId', function(){})
                                    _callback = eventArgs[2]
                                } else if (typeof eventArgs[2] == 'object') {
                                    // ie: HIVE_SDK('init', 150699, 'seeTicketsClientId') + queued events
                                    _queuedEventsAfterInit = eventArgs[2]
                                }
                            } else if (typeof eventArgs[1] == 'function') {
                                // ie: HIVE_SDK('init', 150699, function(){}) + queued events
                                _callback = eventArgs[1]
                                _queuedEventsAfterInit = eventArgs[2]
                            }
                        } else if (eventArgs.length == 2) {
                            if (typeof eventArgs[1] == 'function') {
                                // ie: HIVE_SDK('init', 150699, function(){})
                                _callback = eventArgs[1]
                            } else if (typeof eventArgs[1] == 'object') {
                                // ie: HIVE_SDK('init', 150699) + queued events
                                _queuedEventsAfterInit = eventArgs[1]
                            }
                        } else if (eventArgs.length == 1) {
                            // ie: HIVE_SDK('init', 150699)
                        }

                        // call optional callback
                        _callback(initResponseMessageData)

                        // call events that may have been queued up before library loaded
                        for (var i = 0; i < _queuedEventsAfterInit.length; i++) {
                            HIVE_SDK.apply(null, _queuedEventsAfterInit[i])
                        }

                        break

                    case 'userLoggedInSuccess':
                        var userData = Object.assign({}, messageData.data.userData)

                        HIVE_SDK.loggedInUserSLT = userData.signedLoginToken
                        setSignedLoginToken(HIVE_SDK.loggedInUserSLT)
                        delete userData['signedLoginToken']

                        HIVE_SDK.loggedInUser = userData

                        handleSDKEvent('trackDefaultPageView')
                        break

                    case 'fbSignupSuccess':
                        if (eventArgs.length >= 1 && eventArgs[0]) {
                            eventArgs[0](messageData.data)
                        }
                        break

                    case 'fbSignupError':
                        if (eventArgs.length >= 2 && eventArgs[1]) {
                            eventArgs[1](messageData.data)
                        }
                        break

                    case 'emailSignupSuccess':
                        if (eventArgs.length >= 2 && eventArgs[1]) {
                            eventArgs[1](messageData.data)
                        }
                        break

                    case 'emailSignupError':
                        if (eventArgs.length >= 3 && eventArgs[2]) {
                            eventArgs[2](messageData.data)
                        }
                        break

                    case 'phoneNumberSignupSuccess':
                        if (eventArgs.length >= 2 && eventArgs[1]) {
                            eventArgs[1](messageData.data)
                        }
                        break

                    case 'phoneNumberSignupError':
                        if (eventArgs.length >= 3 && eventArgs[2]) {
                            eventArgs[2](messageData.data)
                        }
                        break

                    case 'addToSegmentSuccess':
                        if (eventArgs.length >= 2 && eventArgs[1]) {
                            eventArgs[1](messageData.data)
                        }
                        break

                    case 'addToSegmentError':
                        if (eventArgs.length >= 3 && eventArgs[2]) {
                            eventArgs[2](messageData.data)
                        }
                        break

                    case 'trackEventSuccess':
                        if (eventArgs.length >= 3 && eventArgs[2]) {
                            eventArgs[2](messageData.data)
                        }
                        break

                    case 'trackEventError':
                        if (eventArgs.length >= 4 && eventArgs[3]) {
                            eventArgs[3](messageData.data)
                        }
                        break

                    case 'invalidSafariCookiesExist':
                        HIVE_SDK.invalidSafariCookiesExist = true
                        $(document).on('click', 'a[href]', function (e) {
                            if (
                                !HIVE_SDK.safariCookieValidationInFlight &&
                                $(this).attr('href') != '#'
                            ) {
                                // don't validate cookies if an existing request is in flight
                                // don't validate cookies if link is a placeholder
                                // avoids opening multiple popup windows (esp since we don't pass a callback here)
                                // validateCookiesAndCallCallback();
                            }
                        })
                        break

                    case 'fixInvalidSafariCookiesSuccess':
                        HIVE_SDK.invalidSafariCookiesExist = false
                        HIVE_SDK.safariCookieValidationInFlight = false

                        if (eventArgs && eventArgs.length >= 1 && eventArgs[0]) {
                            eventArgs[0]()
                        }
                        break

                    default:
                        console.error(
                            'Hive SDK: An error occured (unknown message type from iframe). Please contact support@hive.co.'
                        )
                }

                if (eventId) {
                    delete eventIdtoEventArgsMapping[eventId]
                }
            }

            // using this to generate random event ids
            function getEventId() {
                return 'HIVE_SDK-' + Math.random().toString(36).substr(2, 10)
            }

            function getSignedLoginToken() {
                if (HIVE_SDK.loggedInUserSLT) {
                    return HIVE_SDK.loggedInUserSLT
                } else if (getLocalStorageKey('signedLoginToken')) {
                    return getLocalStorageKey('signedLoginToken')
                } else {
                    return null
                }
            }

            function setSignedLoginToken(signedLoginToken) {
                setLocalStorageKey('signedLoginToken', signedLoginToken)
            }

            function setLocalStorageKey(key, value) {
                localStorage.setItem('__hivesdk-v2-' + key, JSON.stringify(value))
            }

            function getLocalStorageKey(key) {
                var value = localStorage.getItem('__hivesdk-v2-' + key)

                if (value) {
                    value = JSON.parse(value)
                }
                return value
            }

            function validateCookiesAndCallCallback(callback) {
                if (false) {
                    // if (HIVE_SDK.invalidSafariCookiesExist) {
                    var eventId

                    if (callback) {
                        eventId = getEventId()
                        eventIdtoEventArgsMapping[eventId] = [callback]

                        // manually run the callback in 10s in case cookie validation fails for some reason
                        setTimeout(
                            (function (_eventId) {
                                return function () {
                                    var eventArgs = eventIdtoEventArgsMapping[_eventId]
                                    if (eventArgs && eventArgs.length >= 1 && eventArgs[0]) {
                                        eventArgs[0]()
                                    }
                                    delete eventIdtoEventArgsMapping[eventId]
                                }
                            })(eventId),
                            10000
                        )
                    }

                    HIVE_SDK.safariCookieValidationInFlight = true
                    window.open(
                        hiveAbsUrl +
                            '/jssdk/safari-helper/?' +
                            $.param({
                                eventId: eventId,
                                sdkHostPageUrl: window.location.href,
                                timestamp: Math.round(Date.now() / 1000), // unix timestamp
                            })
                    )
                } else {
                    callback ? callback() : {}
                }
            }

            // if we're in a frontgate page, we'll load the frontgate ticketing SDK handler
            if (/^.*\.frontgatetickets\.com.*$/.test(window.location.href) && window.FG) {
                $.ajax({
                    url:
                        'https://' +
                        scriptSrcHostname +
                        '/static/js/frontgate-ticketing.js' +
                        '?r=' +
                        parseInt(new Date() / 60000),
                    dataType: 'script',
                    // settings this to true prevents jQuery from appending a timestamp at the end of the url for `script` dataTypes
                    cache: true,
                })
            } else if (
                /^.*\.seetickets\.us.*$/.test(window.location.href) ||
                /^.*\.ticketon\.com.*$/.test(window.location.href)
            ) {
                $.ajax({
                    url:
                        'https://' +
                        scriptSrcHostname +
                        '/static/js/seetickets-ticketing.js' +
                        '?r=' +
                        parseInt(new Date() / 60000),
                    dataType: 'script',
                    // settings this to true prevents jQuery from appending a timestamp at the end of the url for `script` dataTypes
                    cache: true,
                })
            }
            // END HELPER FUNCTIONS
        })
    }
})() // We call our anonymous function immediately
