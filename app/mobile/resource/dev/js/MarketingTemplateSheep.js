function MarketingTemplateSheep(opts) {
    var me = this;
    me.init(opts);
    var music = document.getElementById("music");
    var player = document.getElementById("player");
    $("html").one("touchstart", function() {
        player.play();
    });
    music.addEventListener("click", function() {
        if (this.className.match(/(?:^|\s)stop(?!\S)/)) {
            player.play();
            this.className = "music";
        } else {
            this.className = this.className + " stop";
            player.pause();
        }
    }, false);
    var mySwiper = new Swiper(".swiper-container", {
        mode: "vertical"
    });
    api.get("marketingTemplate/getMarketingTemplate", {
        id: query.id
    }).done(function(err, result) {
        me.content = JSON.parse(result.content);
        document.title = result.title;
        me.render();
        wxOnMenuShare({
            imgUrl: res("img/marketing-template/sheep/hy.png"),
            desc: me.content.storeName + "给您的新春祝福，打开手机声音，一起迎接新年吧!"
        });
    });
}

Module.extend(MarketingTemplateSheep);
//# sourceMappingURL=MarketingTemplateSheep.js.map