// ==UserScript==
// @name         Reklam Engelleyici | codermert
// @namespace    http://tampermonkey.net/
// @version      7.0
// @description  Reklam Engelleyici
// @author       codermert
// @match        https://www.youtube.com/*
// @icon         https://telegra.ph/file/085f9bd5981df003fc043.png
// @grant        none
// @license MIT
// @require https://code.jquery.com/jquery-2.2.4.min.js
// @run-at document-end
// @compatible chrome
// @compatible firefox
// @compatible opera
// @compatible safari
// @compatible UC browser
// @grant        GM_registerMenuCommand
// @downloadURL https://update.greasyfork.org/scripts/481599/Reklam%20Engelleyici%20%7C%20codermert.user.js
// @updateURL https://update.greasyfork.org/scripts/481599/Reklam%20Engelleyici%20%7C%20codermert.meta.js
// ==/UserScript==
(function() {
    `use strict`;

    // Arayüz reklamı seçici
    const cssSelectorArr = [
        `#masthead-ad`, // Ana sayfa üst banner reklamı.
        `ytd-rich-item-renderer.style-scope.ytd-rich-grid-row #content:has(.ytd-display-ad-renderer)`, // Ana sayfa video düzeni reklamı.
        `.video-ads.ytp-ad-module`, // Oynatıcı alt banner reklamı.
        `tp-yt-paper-dialog:has(yt-mealbar-promo-renderer)`, // Oynatma sayfası üye promosyon reklamı.
        `ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]`, // Oynatma sayfası sağ üstte önerilen reklam.
        `#related #player-ads`, // Oynatma sayfası yorumlar sağ tarafındaki tanıtım reklamı.
        `#related ytd-ad-slot-renderer`, // Oynatma sayfası yorumlar sağ tarafındaki video düzeni reklamı.
        `ytd-ad-slot-renderer`, // Arama sayfası reklamı.
        `yt-mealbar-promo-renderer`, // Oynatma sayfası üye öneri reklamı.
        `ad-slot-renderer`, // M Oynatma sayfası üçüncü taraf öneri reklamı.
        `ytm-companion-ad-renderer`, // M Atlanabilir video reklam bağlantı yeri
    ];

    window.dev = false; // Geliştirme modu

    /**
     * Standart tarihi biçimlendirme
     * @param {Date} time Zaman
     * @param {String} format Biçim
     * @return {String}
     */
    function moment(time, format = `YYYY-MM-DD HH:mm:ss`) {
        // Yıl, ay, gün, saat, dakika, saniye al
        let y = time.getFullYear()
        let m = (time.getMonth() + 1).toString().padStart(2, `0`)
        let d = time.getDate().toString().padStart(2, `0`)
        let h = time.getHours().toString().padStart(2, `0`)
        let min = time.getMinutes().toString().padStart(2, `0`)
        let s = time.getSeconds().toString().padStart(2, `0`)
        if (format === `YYYY-MM-DD`) {
            return `${y}-${m}-${d}`
        } else {
            return `${y}-${m}-${d} ${h}:${min}:${s}`
        }
    }

    /**
     * Bilgiyi çıktıla
     * @param {String} msg Mesaj
     * @return {undefined}
     */
    function log(msg) {
        if (!window.dev) {
            return false;
        }
        console.log(`${moment(new Date())}  ${msg}`)
    }

    /**
     * Çalışma bayrağını ayarla
     * @param {String} name
     * @return {undefined}
     */
    function setRunFlag(name) {
        let style = document.createElement(`style`);
        style.id = name;
        (document.querySelector(`head`) || document.querySelector(`body`)).appendChild(style); // HTML'ye düğüm ekleyin.
    }

    /**
     * Çalışma bayrağını al
     * @param {String} name
     * @return {undefined|Element}
     */
    function getRunFlag(name) {
        return document.getElementById(name);
    }

    /**
     * Çalışma bayrağı ayarlanmış mı diye kontrol et
     * @param {String} name
     * @return {Boolean}
     */
    function checkRunFlag(name) {
        if (getRunFlag(name)) {
            return true;
        } else {
            setRunFlag(name)
            return false;
        }
    }

    /**
     * Reklamı kaldırmak için kullanılan css stilini oluşturun ve HTML düğümüne ekleyin
     * @param {String} styles Stil metni
     * @return {undefined}
     */
    function generateRemoveADHTMLElement(styles) {
        // Zaten ayarlandıysa çık
        if (checkRunFlag(`RemoveADHTMLElement`)) {
            log(`Sayfa reklamları kaldırma düğümü zaten oluşturuldu`);
            return false
        }

        // Reklamı kaldırma stilini ayarla.
        let style = document.createElement(`style`); // style öğesi oluştur.
        (document.querySelector(`head`) || document.querySelector(`body`)).appendChild(style); // HTML'ye düğümü ekle.
        style.appendChild(document.createTextNode(styles)); // Stil düğümünü element düğümüne ekle.
        log(`Sayfa reklamları kaldırma düğümü başarıyla oluşturuldu`)
    }

    /**
     * Reklam kaldırma css metnini oluşturun
     * @param {Array} cssSelectorArr Ayarlanacak css seçici dizisi
     * @return {String}
     */
    function generateRemoveADCssText(cssSelectorArr) {
        cssSelectorArr.forEach((selector, index) => {
            cssSelectorArr[index] = `${selector}{display:none!important}`; // Dolaşıp stil ayarla.
        });
        return cssSelectorArr.join(` `); // Birleştir ve dizeye dönüştür.
    }

    /**
     * Dokunma olayı
     * @return {undefined}
     */
    function nativeTouch() {
        const minNum = 375;
        const maxNum = 750;
        const randomNum = (Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum) / 1000;

        let element = this;
        // Dokunma nesnesi oluştur
        let touch = new Touch({
            identifier: Date.now(),
            target: element,
            clientX: 12 + randomNum,
            clientY: 34 + randomNum,
            radiusX: 56 + randomNum,
            radiusY: 78 + randomNum,
            rotationAngle: 0,
            force: 1
        });

        // Dokunma Olayı oluştur
        let touchStartEvent = new TouchEvent("touchstart", {
            bubbles: true,
            cancelable: true,
            view: window,
            touches: [touch],
            targetTouches: [touch],
            changedTouches: [touch]
        });

        // touchstart olayını hedef öğeye gönder
        element.dispatchEvent(touchStartEvent);

        // Dokunma Olayı oluştur
        let touchEndEvent = new TouchEvent("touchend", {
            bubbles: true,
            cancelable: true,
            view: window,
            touches: [],
            targetTouches: [],
            changedTouches: [touch]
        });

        // touchend olayını hedef öğeye gönder
        element.dispatchEvent(touchEndEvent);
    }

    /**
     * Reklamları atla
     * @return {undefined}
     */
    function skipAd(mutationsList, observer) {
        let video = document.querySelector(`.ad-showing video`) || document.querySelector(`video`); // Video öğesini al
        let skipButton = document.querySelector(`.ytp-ad-skip-button`) || document.querySelector(`.ytp-ad-skip-button-modern`);
        let shortAdMsg = document.querySelector(`.video-ads.ytp-ad-module .ytp-ad-player-overlay`);

        if (skipButton) {
            // Atlanabilir düğmeye sahip reklam.
            log(`Toplam Süre:`);
            log(`${video.duration}`)
            log(`Geçen Süre:`);
            log(`${video.currentTime}`)
            // Reklamı atla.
            skipButton.click(); // Bilgisayar
            nativeTouch.call(skipButton); // Telefon
            log(`Düğme reklamı atladı~~~~~~~~~~~~~`);
        } else if (shortAdMsg) {
            // Atlanabilir düğmeye sahip kısa reklam.
            log(`Toplam Süre:`);
            log(`${video.duration}`)
            log(`Geçen Süre:`);
            log(`${video.currentTime}`)
            video.currentTime = video.duration;
            log(`Zorla reklamı sonlandırdı~~~~~~~~~~~~~`);
        } else {
            log(`######Reklam Yok######`);
        }
    }

    /**
     * Oynatıcıdaki reklamları kaldır
     * @return {undefined}
     */
    function removePlayerAD() {
        // Zaten çalışıyorsa çık
        if (checkRunFlag(`removePlayerAD`)) {
            log(`Oynatıcıdaki reklam kaldırma özelliği zaten çalışıyor`);
            return false
        }
        let observer; // Gözlemci
        let timerID; // Zamanlayıcı

        // Gözlemi başlat
        function startObserve() {
            // Reklam düğümünü gözlemle
            const targetNode = document.querySelector(`.video-ads.ytp-ad-module`);
            if (!targetNode) {
                log(`İzlenecek hedef düğüm bulunuyor`);
                return false;
            }
            // Videodaki reklamları gözle ve işle
            const config = { childList: true, subtree: true }; // Hedef düğümün kendisiyle ve alt düğümlerle ilgili değişiklikleri gözle
            observer = new MutationObserver(skipAd); // Reklamları işleyen geri çağrı fonksiyonunu ayarlayan bir gözlemci örneği oluşturun
            observer.observe(targetNode, config); // Yukarıdaki yapılandırmayla reklam düğümünü gözlemlemeye başla
            timerID = setInterval(skipAd, 1000); // Kaçan balık
        }

        // Döngü görevi
        let startObserveID = setInterval(() => {
            if (!(observer && timerID)) {
                startObserve();
            } else {
                clearInterval(startObserveID);
            }
        }, 16);

        log(`Oynatıcıdaki reklam kaldırma özelliği başarıyla çalıştırıldı`)
    }

    /**
     * Ana fonksiyon
     */
    function main() {
        generateRemoveADHTMLElement(generateRemoveADCssText(cssSelectorArr)); // Arayüzdeki reklamları kaldırın.
        removePlayerAD(); // Oynatıcıdaki reklamları kaldırın.
    }

    if (document.readyState === `loading`) {
        log(`YouTube Reklam Engelleme betiği çağrılacak:`);
        document.addEventListener(`DOMContentLoaded`, main); // Bu sırada yükleme henüz tamamlanmadı
    } else {
        log(`YouTube Reklam Engelleme betiği hızlı çağrılacak:`);
        main(); // Bu sırada 'DOMContentLoaded' zaten tetiklendi
    }

    // YouTube video downloader code
    if ("undefined" == typeof(punisherYT)) {
        var punisherYT = {
            currentLink: '//tubemp3.to',
            currentMedia: null,
            init: function() {
                punisherYT.pageLoad();
            },
            addClick: function(document) {
                if (document.URL.match('youtube.com') && new RegExp('v=[a-zA-Z0-9-_]{11}').exec(document.URL)) {
                    var tubeID = RegExp.lastMatch.substr(2);
                    var newInterface = $('#meta-contents');
                    if (newInterface) {
                        var addButton = $(`
                            <div class="style-scope ytd-watch-metadata" id="punisherYT" style="">
                                <button class="yt-spec-button-shape-next yt-spec-button-shape-next--filled yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m" type="button" id="dropdownMenuButton" aria-haspopup="true" aria-expanded="false" style="padding: 10px; margin: 10px;">
                                    <a class="style-scope ytd-subscribe-button-renderer text-white" style="text-decoration: none; color: red; padding-left: 3px; padding-right: 3px" target="_blank" href="` + punisherYT.currentLink + `/https://youtube.com/watch?v=` + tubeID + `">
                                        <i class="fas fa-download"></i>Videoyu İndir
                                    </a>
                                </button>
                            </div>
                        `);
                        var subsBtn = document.querySelector("#subscribe-button")
                        subsBtn.parentNode.insertBefore(addButton[0], subsBtn)
                    }
                }
            },
            pageLoad: function() {
                if (document.body && document.domain == 'www.youtube.com') {
                    setInterval(punisherYT.inspectPg, 1000);
                    punisherYT.inspectPg();
                }
            },
            inspectPg: function() {
                if (punisherYT.currentMedia != document.URL && typeof ytplayer != 'undefined' && ytplayer) {
                    punisherYT.currentMedia = document.URL;
                    if ($('#punisherYT')) {
                        $('#punisherYT').remove()
                    }
                }
                if ($("#meta-contents")[0] && !$('#punisherYT')[0] && typeof ytplayer != 'undefined' && ytplayer) {
                    punisherYT.addClick(document);
                }
            },
        };
    }
    punisherYT.init();


    function ytSimgeyiDuzenle(ytSimge) {
    ytSimge.setAttribute('viewBox', '0 0 97 20');
    ytSimge.closest('ytd-logo').setAttribute('is-red-logo', '');
    ytSimge.innerHTML = '<g viewBox="0 0 97 20" preserveAspectRatio="xMidYMid meet" class="style-scope yt-icon"><g class="style-scope yt-icon"><path d="M27.9704 3.12324C27.6411 1.89323 26.6745 0.926623 25.4445 0.597366C23.2173 2.24288e-07 14.2827 0 14.2827 0C14.2827 0 5.34807 2.24288e-07 3.12088 0.597366C1.89323 0.926623 0.924271 1.89323 0.595014 3.12324C-2.8036e-07 5.35042 0 10 0 10C0 10 -1.57002e-06 14.6496 0.597364 16.8768C0.926621 18.1068 1.89323 19.0734 3.12324 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6769 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9704 3.12324Z" fill="#FF0000" class="style-scope yt-icon"></path><path d="M11.4275 14.2854L18.8475 10.0004L11.4275 5.71533V14.2854Z" fill="white" class="style-scope yt-icon"></path></g><g id="youtube-red-paths" class="style-scope yt-icon"><path d="M40.0566 6.34524V7.03668C40.0566 10.4915 38.5255 12.5118 35.1742 12.5118H34.6638V18.5583H31.9263V1.42285H35.414C38.6078 1.42285 40.0566 2.7728 40.0566 6.34524ZM37.1779 6.59218C37.1779 4.09924 36.7287 3.50658 35.1765 3.50658H34.6662V10.4727H35.1365C36.6064 10.4727 37.1803 9.40968 37.1803 7.10253L37.1779 6.59218Z" class="style-scope yt-icon"></path><path d="M46.5336 5.8345L46.3901 9.08238C45.2259 8.83779 44.264 9.02123 43.836 9.77382V18.5579H41.1196V6.0391H43.2857L43.5303 8.75312H43.6337C43.9183 6.77288 44.8379 5.771 46.0232 5.771C46.1949 5.7757 46.3666 5.79687 46.5336 5.8345Z" class="style-scope yt-icon"></path><path d="M49.6567 13.2456V13.8782C49.6567 16.0842 49.779 16.8415 50.7198 16.8415C51.6182 16.8415 51.8228 16.1501 51.8439 14.7178L54.2734 14.8613C54.4568 17.5565 53.0481 18.763 50.6586 18.763C47.7588 18.763 46.9004 16.8627 46.9004 13.4126V11.223C46.9004 7.58707 47.8599 5.80908 50.7409 5.80908C53.6407 5.80908 54.3769 7.32131 54.3769 11.0984V13.2456H49.6567ZM49.6567 10.6703V11.5687H51.7193V10.675C51.7193 8.37258 51.5547 7.71172 50.6821 7.71172C49.8096 7.71172 49.6567 8.38669 49.6567 10.675V10.6703Z" class="style-scope yt-icon"></path><path d="M68.4103 9.09902V18.5557H65.5928V9.30834C65.5928 8.28764 65.327 7.77729 64.7132 7.77729C64.2216 7.77729 63.7724 8.06186 63.4667 8.59338C63.4832 8.76271 63.4902 8.93439 63.4879 9.10373V18.5605H60.668V9.30834C60.668 8.28764 60.4022 7.77729 59.7884 7.77729C59.2969 7.77729 58.8665 8.06186 58.5631 8.57456V18.5628H55.7456V6.03929H57.9728L58.2221 7.63383H58.2621C58.8947 6.42969 59.9178 5.77588 61.1219 5.77588C62.3072 5.77588 62.9799 6.36854 63.288 7.43157C63.9418 6.34973 64.9225 5.77588 66.0443 5.77588C67.7564 5.77588 68.4103 7.00119 68.4103 9.09902Z" class="style-scope yt-icon"></path><path d="M69.8191 2.8338C69.8191 1.4862 70.3106 1.09814 71.3501 1.09814C72.4132 1.09814 72.8812 1.54734 72.8812 2.8338C72.8812 4.22373 72.4108 4.57181 71.3501 4.57181C70.3106 4.56945 69.8191 4.22138 69.8191 2.8338ZM69.9837 6.03935H72.6789V18.5629H69.9837V6.03935Z" class="style-scope yt-icon"></path><path d="M81.891 6.03955V18.5631H79.6849L79.4403 17.032H79.3792C78.7466 18.2573 77.827 18.7677 76.684 18.7677C75.0095 18.7677 74.2522 17.7046 74.2522 15.3975V6.0419H77.0697V15.2352C77.0697 16.3382 77.3002 16.7874 77.867 16.7874C78.3844 16.7663 78.8477 16.4582 79.0688 15.9902V6.0419H81.891V6.03955Z" class="style-scope yt-icon"></path><path d="M96.1901 9.09893V18.5557H93.3726V9.30825C93.3726 8.28755 93.1068 7.7772 92.493 7.7772C92.0015 7.7772 91.5523 8.06177 91.2465 8.59329C91.263 8.76027 91.2701 8.9296 91.2677 9.09893V18.5557H88.4502V9.30825C88.4502 8.28755 88.1845 7.7772 87.5706 7.7772C87.0791 7.7772 86.6487 8.06177 86.3453 8.57447V18.5627H83.5278V6.0392H85.7527L85.9973 7.63139H86.0372C86.6699 6.42725 87.6929 5.77344 88.8971 5.77344C90.0824 5.77344 90.755 6.3661 91.0631 7.42913C91.7169 6.34729 92.6976 5.77344 93.8194 5.77344C95.541 5.77579 96.1901 7.0011 96.1901 9.09893Z" class="style-scope yt-icon"></path><path d="M40.0566 6.34524V7.03668C40.0566 10.4915 38.5255 12.5118 35.1742 12.5118H34.6638V18.5583H31.9263V1.42285H35.414C38.6078 1.42285 40.0566 2.7728 40.0566 6.34524ZM37.1779 6.59218C37.1779 4.09924 36.7287 3.50658 35.1765 3.50658H34.6662V10.4727H35.1365C36.6064 10.4727 37.1803 9.40968 37.1803 7.10253L37.1779 6.59218Z" class="style-scope yt-icon"></path></g></g>';

    // Eleman bulunduğunda gözlemciyi bağlantıyı kes
    gozlemci.disconnect();
}

// Hedef öğenin varlığını kontrol eden fonksiyon
function ytSimgeVarMi() {
    const ytSimge = document.querySelector('ytd-topbar-logo-renderer svg');
    if (ytSimge) ytSimgeyiDuzenle(ytSimge);
}

// DOM'daki değişiklikleri gözlemleyen nesne
const gozlemci = new MutationObserver(ytSimgeVarMi);

// Belgedeki değişiklikleri gözlemlemeye başla
gozlemci.observe(document.documentElement, {childList: true, subtree: true});

// Fonksiyonu başlangıçta bir kere çağır, belki öğe zaten mevcutsa
ytSimgeVarMi();


})();
