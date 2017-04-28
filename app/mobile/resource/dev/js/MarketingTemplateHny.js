function MarketingTemplateHny(opts) {
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
        progress: true,
        onProgressChange: function(swiper) {
            for (var i = 0; i < swiper.slides.length; i++) {
                var slide = swiper.slides[i];
                var progress = slide.progress;
                var translate = progress * swiper.width;
                var opacity = 1 - Math.min(Math.abs(progress), 1);
                slide.style.opacity = opacity;
                swiper.setTransform(slide, "translate3d(" + translate + "px,0,0)");
            }
        },
        onTouchStart: function(swiper) {
            for (var i = 0; i < swiper.slides.length; i++) {
                swiper.setTransition(swiper.slides[i], 0);
            }
        },
        onSetWrapperTransition: function(swiper) {
            for (var i = 0; i < swiper.slides.length; i++) {
                swiper.setTransition(swiper.slides[i], swiper.params.speed);
            }
        }
    });
    api.get("marketingTemplate/getMarketingTemplate", {
        id: query.id
    }).done(function(err, result) {
        me.content = JSON.parse(result.content);
        document.title = result.title;
        me.render();
        wxOnMenuShare({
            imgUrl: res("img/marketing-template/hny/spring.jpg"),
            desc: me.content.storeName + "给您的新春祝福，打开手机声音，一起迎接新年吧!"
        });
    });
}

Module.extend(MarketingTemplateHny);
//# sourceMappingURL=MarketingTemplateHny.js.map