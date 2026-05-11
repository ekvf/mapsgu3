/**
 * Главная: сразу после разбора страницы начинаем грузить API карт (без requestIdleCallback — на мобильных idle часто сильно откладывается).
 * Дополнительно — ранний старт при первом касании к форме маршрута или карте.
 */
(function () {
    var mapsStarted = false;

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement("script");
            s.src = src;
            s.async = false;
            s.onload = function () {
                resolve();
            };
            s.onerror = function () {
                reject(new Error("Failed to load: " + src));
            };
            document.head.appendChild(s);
        });
    }

    var open = document.getElementById("openBuildingsPage");
    if (open) {
        open.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.assign("buildings.html");
        });
    }

    function beginMapsAndApp() {
        if (mapsStarted) {
            return;
        }
        mapsStarted = true;
        var ymapsUrl = document.documentElement.getAttribute("data-ymaps");
        if (!ymapsUrl) {
            loadScript("script.js").catch(function () {});
            return;
        }
        loadScript(ymapsUrl)
            .then(function () {
                return loadScript("script.js");
            })
            .catch(function () {
                return loadScript("script.js");
            });
    }

    setTimeout(beginMapsAndApp, 0);

    function onEarlyIntent(e) {
        var t = e.target;
        if (!t || typeof t.closest !== "function") {
            return;
        }
        if (
            t.closest("#startPoint") ||
            t.closest("#map") ||
            t.closest("#buildRoute") ||
            t.closest("#useGeolocation") ||
            t.closest("#endPoint")
        ) {
            document.removeEventListener("touchstart", onEarlyIntent, true);
            document.removeEventListener("click", onEarlyIntent, true);
            document.removeEventListener("focusin", onEarlyIntent, true);
            beginMapsAndApp();
        }
    }

    document.addEventListener("touchstart", onEarlyIntent, true);
    document.addEventListener("click", onEarlyIntent, true);
    document.addEventListener("focusin", onEarlyIntent, true);
})();
