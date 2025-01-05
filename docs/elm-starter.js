;
(function () {
    "use strict";

    var script = document.createElement("script");
    script.src = location.href.indexOf("without-debugger") > 0 || window.innerWidth < 800 ? "/elm-japan/elm-without-debugger.js" : "/elm-japan/elm-with-debugger.js";
    script.onload = function () {
        startElm();
    };
    document.head.appendChild(script);


    var color = {
        default: "background: #eee; color: gray; font-family: monospace",
        love: "background: red; color: #eee",
        elm: "background: #77d7ef; color: #00479a",
    }
    var emptyLine = '                                             ';
    var message = [
        '',
        '%c',
        emptyLine,
        '         e l m   j a p a n   2 0 2 0         ',
        emptyLine,
        '  m a d e   w i t h   %c ❤ %c   a n d   %c e l m %c  ',
        emptyLine,
        '',
        '',
    ].join('\n');

    console.info(message, color.default, color.love, color.default, color.elm, color.default);

    function startElm() {
        var node = document.createElement('div');
        document.body.appendChild(node);
        document.getElementById("loading").style.display = "none";
        var app = Elm.Main.init({
            node: node,
            flags: {
                width: window.innerWidth,
                height: window.innerHeight,
                language: window.navigator.userLanguage || window.navigator.language || "",
                href: location.href
            },
        })
        if (app.ports) {

            if (app.ports.scrollTo) {
                app.ports.scrollTo.subscribe(function (destination) {
                    // console.log(destination);
                    var el = document.querySelector(destination);
                    if (el && el.scrollIntoView) {
                        // Add waiting time for animation frame
                        requestAnimationFrame(function () {
                            el.scrollIntoView({
                                behavior: 'smooth'
                            });


                        });
                    };
                });
            }

            if (app.ports.onblur) {
                window.onblur = function () {
                    app.ports.onblur.send(null);
                }
            }

            if (app.ports.onfocus) {
                window.onfocus = function () {
                    app.ports.onfocus.send(null);
                }
            }
        }
    }
})()
