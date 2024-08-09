let CACHES = {
    "_": { defaultLanguage: "cn", defaultVOLanguage: "cn" },
    "cn": {
        texts: {
            "page-title": "卡芙卡转圈圈",
            "doc-title": "嘣~",
            "page-descriptions": "给卡芙卡写的小网站，对，就是《崩坏：星穹铁道》星核猎手中<del>听取妈声一片</del>的坏女人！",
            "counter-descriptions": ["卡麻麻已经嘣~了", "卡芙卡已经转了"],
            "counter-unit": ["次", "次圈圈"],
            "counter-button": ["加载中...", "请稍候..."],
            "repository-desc": "GitHub 仓库"
        },
        audioList: [
            "audio/cn/beng_cn.mp3",
            "audio/cn/beng_jp.mp3",
            "audio/cn/beng_kr.mp3",
            "audio/cn/beng_en.mp3"
        ],
        cardImage: "img/card_cn.png"
    },
    gifs: [
        "img/kafkaa1.gif",
        "img/kafkaa2.gif",
        "img/kafkaa3.gif"
    ]
};

(() => {
    const $ = mdui.$;
    let progress = [0, 1];
    let firstSquish = true;
    // This code tries to retrieve the saved language "lang" from localStorage.
    const current_language = "cn";
    const current_vo_language = "cn";
    // get global counter element and initialize its respective counts
    let localCounter = document.getElementById("local-counter");
    let localCount = localStorage.getItem("count-v2") || 0;
    // initialize timer variable and add event listener to the counter button element
    let counterButton = document.getElementById("counter-button");
    // This function retrieves localized dynamic text based on a given language code, 
    // and randomly replaces an element with one of the translations. 
    function refreshDynamicTexts() {
        if (progress[0] !== progress[1]) return;
        let curLang = CACHES[current_language];
        let localTexts = curLang.texts;
        Object.entries(localTexts).forEach(([textId, value]) => {
            if (value instanceof Array && document.getElementById(textId) != undefined) {
                document.getElementById(textId).innerHTML = randomChoice(value);
            }
        });
    };

    // function that updates all the relevant text elements with the translations in the chosen language.
    function multiLangMutation() {
        let curLang = CACHES[current_language];
        let localTexts = curLang.texts;
        Object.entries(localTexts).forEach(([textId, value]) => {
            if (!(value instanceof Array))
                if (document.getElementById(textId) != undefined) {
                    // replaces the innerHTML of the element with the given textId with its translated version.
                    document.getElementById(textId).innerHTML = value;
                }
        });
        refreshDynamicTexts();
        // sets the image of element with id "herta-card" to the translated version in the selected language.
        document.getElementById("herta-card").src = curLang.cardImage;
    };

    // function that returns the list of audio files for the selected language
    function getLocalAudioList() {
        return CACHES[current_vo_language].audioList;
    }

    async function cacheFilesToBase64(dict) {
        const promises = [];
        let lang = "cn";
        if (dict.hasOwnProperty(lang)) {
            const audioList = dict[lang].audioList
            if (Array.isArray(audioList)) {
                for (let i = 0; i < audioList.length; i++) {
                    const url = audioList[i];
                    if (typeof url === "string" && url.endsWith(".mp3")) {
                        promises.push(loadAndEncode(url).then(result => dict[lang].audioList[i] = result));
                    }
                }
            }
            const gifList = dict["gifs"];
            if (Array.isArray(gifList)) {
                for (let i = 0; i < gifList.length; i++) {
                    const url = gifList[i];
                    if (typeof url === "string" && url.endsWith(".gif")) {
                        promises.push(loadAndEncode(url, "image/gif").then(result => dict["gifs"][i] = result));
                    }
                }
            }
            dict[lang].texts["counter-button"] = ["转圈圈~", "嘣！"];
        }
        progress[1] = promises.length;
        await Promise.all(promises);
        return dict;
    }

    function addBtnEvent() {
        counterButton.addEventListener("click", (e) => {
            localCount++;
            localCounter.textContent = localCount.toLocaleString("en-US");
            localStorage.setItem("count-v2", localCount);
            triggerRipple(e);
            playKuru();
            animateKafka();
            refreshDynamicTexts();
        });
    };

    // Define a function that takes an array as an argument and returns a random item from the array
    function randomChoice(myArr) {
        const randomIndex = Math.floor(Math.random() * myArr.length);
        const randomItem = myArr[randomIndex];
        return randomItem;
    }

    function getRandomAudioUrl() {
        let localAudioList = getLocalAudioList();
        const randomIndex = Math.floor(Math.random() * localAudioList.length);
        return localAudioList[randomIndex];
    }

    function playKuru() {
        let audioUrl;
        if (firstSquish) {
            firstSquish = false;
            audioUrl = getLocalAudioList()[0];
        } else {
            audioUrl = getRandomAudioUrl();
        }
        let audio = new Audio();
        audio.src = audioUrl;
        audio.play();
        audio.addEventListener("ended", function () {
            this.remove();
        });
    }

    function animateKafka() {
        let id = null;
        const elem = document.createElement("img");
        elem.src = CACHES["gifs"][Math.floor(Math.random() * 3)];
        elem.style.position = "absolute";
        elem.style.right = "-500px";
        elem.style.top = counterButton.getClientRects()[0].bottom + scrollY - 430 + "px"
        elem.style.zIndex = "-10";
        document.body.appendChild(elem);
        let pos = -500;
        const limit = window.innerWidth + 500;
        clearInterval(id);
        id = setInterval(() => {
            if (pos >= limit) {
                clearInterval(id);
                elem.remove()
            } else {
                pos += 20;
                elem.style.right = pos + "px";
            }
        }, 12);
    };

    // This function creates ripples on a button click and removes it after 300ms.
    function triggerRipple(e) {
        let ripple = document.createElement("span");
        ripple.classList.add("ripple");
        counterButton.appendChild(ripple);
        let x = e.clientX - e.target.offsetLeft;
        let y = e.clientY - e.target.offsetTop;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        setTimeout(() => {
            ripple.remove();
        }, 300);
    };

    function upadteProgress() {
        progress[0] += 1
        counterButton.innerText = `${((progress[0] / progress[1]) * 100) | 0}%`
    }

    function loadAndEncode(url, datype = "audio/mpeg") {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function () {
                upadteProgress();
                if (xhr.status === 200) {
                    const buffer = xhr.response;
                    const blob = new Blob([buffer], { type: datype });
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = function () { resolve(reader.result); }
                } else {
                    reject(xhr.statusText);
                }
            };
            xhr.onerror = function () {
                upadteProgress();
                reject(xhr.statusText);
            };
            xhr.send();
        });
    }

    window.onload = function () {
        // display counter
        localCounter.textContent = localCount.toLocaleString("en-US");
        // the function multiLangMutation is called initially when the page loads.
        multiLangMutation();
        // Calling method
        cacheFilesToBase64(CACHES).catch(error => {
            console.error(error);
        }).finally(() => {
            refreshDynamicTexts();
            addBtnEvent();
            counterButton.removeAttribute("disabled");
            counterButton.innerText = "嘣！";
        });
        $("#show-options-opt").on("click", function () {
            window.open("https://github.com/duiqt/herta_kuru", "_blank");
        });
        $("#show-gif-src").on("click", function () {
            window.open("https://www.bilibili.com/video/BV1Fh4y197cX", "_blank");
        });
        $("#show-audio-src").on("click", function () {
            window.open("https://www.bilibili.com/video/BV1PP411977N", "_blank");
        });
    }

})();