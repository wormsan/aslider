/*
 * @Author: jalbaa
 * @Date:   2015-07-20 17:03:01
 * @Last Modified by:   jalbaa
 * @Last Modified time: 2016-04-08 13:16:36
 * 侧滑slider插件
 */
(function($, window) {
    Array.prototype.find = function(item){
        for(var i=0; i<this.length; i++){
            if(this[i] === item){
                return this[i]
            }
        }
        return null
    }
    var uc = false;
    if(window.navigator.userAgent.match(/(UCBrowser|UCWeb)/i))
        uc = true;
    var AsideSlider = function() {
        this.visibleStack = [];
        this.bindArray = [];
        this.lastY = 0;
        this.y = 0;

        this.bind();
    }
    AsideSlider.prototype._findEntry = function(item){
        for(var i=0; i<this.bindArray.length; i++){
            if(this.bindArray[i].initialator === item && $(this.bindArray[i].slider).length > 0){
                return true
            }
        }
        return false
    }
    AsideSlider.prototype.bind = AsideSlider.prototype.rebind = function(){
        var asliderEntries = $('[data-aslider-in]')
        var _scope = this
        var historyList = [];
        $(asliderEntries).each(function(idx,el) {
            if(_scope._findEntry(el)){
                return
            }
            var array = String($(this).data("aslider-in")).split("|");
            var targetSlider = array[0];
            _scope.bindArray.push({
                initialator: this,
                slider: '[data-aslider="' + targetSlider + '"]',
                options:{
                    isFade: (function(){
                        var isFade = false;
                        array.forEach(function(value,idx){
                            if(value == "fade"){
                                isFade = true;
                                return false;
                            }
                        });
                        return isFade;
                    })(),
                    direction: (function(){
                        var direction = 'right';
                        array.forEach(function(value,idx){
                            if(value == "right" || value == "left" || value == "top" || value == "bottom"){
                                direction = value;
                                return false;
                            }
                        });
                        return direction;
                    })(),
                    size:(function(){
                        var size = "100%";
                        var direction = 'right';
                        array.forEach(function(value,idx){
                            if(value == "right" || value == "left" || value == "top" || value == "bottom"){
                                direction = value;
                                return false;
                            }
                        });
                    })()
                }
            });
            for(var i in historyList){
              if (historyList[i].entry == $(el).data("aslider-in")){
                return;
              }
            }
            historyList.push(
                {
                    'entry':$(el).data("aslider-in"),
                    'slider': '[data-aslider="' + targetSlider + '"]',
                }
            );
            var $bg = $("<div class='bg close'></div>");
            $(_scope.bindArray[_scope.bindArray.length-1].slider).prepend($bg);
        });
        //sliders to be inited
        var sliders = historyList.map(function(item){
            return item.slider
        }).join(',')
        this.init($(sliders))
    }
    AsideSlider.prototype.onTransitionEnd = function (e) {
        var $el = $(e.currentTarget);
        this.y = 0;
        this.lastY = 0;
        $el.find(".slider").css({
            "-moz-transform":"translate(0,0)",
            "-ms-transform":"translate(0,0)",
            "transform":"translate(0,0)",
            "-webkit-transform":"translate(0,0)",
        });
        if($el.find(".slide_out")[0])
            $el.css("display","none");
    }
    /**
     * 侦听侧边栏的关闭点击事件，调用滑出侧边栏方法
     * @param  {event}
     * @return {null}
     */
    AsideSlider.prototype.onClose = function(e){
        if ($(e.target).hasClass('close')) {
            var $el = this._findAslider(e.currentTarget);
            this.asideSlideOut($el);
        }
    }
    AsideSlider.prototype.init = function () {
        var asliders = $('[data-aslider]')
        var _scope = this;
        var y = this.y;
        var lastY = this.lastY;
        $(asliders).bind("webkitTransitionEnd",$.proxy(this.onTransitionEnd,this));
        $(asliders).bind("transitionEnd",$.proxy(this.onTransitionEnd,this));

        $(asliders).on("click",".close",$.proxy(this.onClose,this));
        $(document).on("click",'[data-aslider="'+$(asliders).data("aslider")+'"]',$.proxy(this.onClose,this));
        /**
         * 侦听触摸事件的div
         */
        $(asliders).each(function(idx, aslider) {
            if(uc)
                $(aslider).find(".asilder_wrapper").addClass("for_uc");
            var lastScrollTop = 0;
            //找不到slider，就创建slider
            var children = $(aslider).find(".asilder_wrapper").children();
            if($(aslider).find(".slider").length==0){
                var $slider = $("<div class='slider'></div>");
                $slider.append(children);
                $(aslider).find(".asilder_wrapper").append($slider);
            }else
                var $slider = $(aslider).find(".slider");
            if($(aslider).find(".scroll").length==0){
                var $scroll = $("<div class='scroll'></>");
                //创建scroll
                $slider.before($scroll);
                //将slider添加到scroll
                $scroll.append($slider);
            }
            /**
             * 每次点击开始时，先重置lastY
             */
            $slider.on('touchstart', function(e) {
                lastY = e.touches[0].pageY;
            });
            /**
             * 触摸移动事件
             * 通过当前的触摸Y值 - 上一次事件的y值
             * 得到两次触摸事件的差
             * y = y +deltaY使div移动
             * 如果y > 0，则div的顶部低于窗口了，所以y>0时，y=0
             * 同理y < limit是为了防止div的底部高于窗口
             * 最后让当前的触摸y值 = lastY,即对下一次触摸来说，这次的y就是lastY
             */
            $slider.on('touchmove', function(e) {
                var curY = e.touches[0].pageY;
                var deltaY = curY - lastY;
                var height = $(this)[0].scrollHeight;
                var limit = height - $(this).parent().height();
                y = y + deltaY;
                 if(y<limit*-1) y = limit*-1;
                if(y>0) y = 0;
                var translate = "translate3d(0,"+y+"px,0)";
                $(this).css({
                    "-moz-transform": translate,
                    "-ms-transform": translate,
                    "transform": translate,
                    "-webkit-transform": translate,
                });
                lastY = curY;
            });
            $slider.on('touchend', function(e) {
            });
        });

        this.bindArray.forEach(function(item) {
            _scope._bindAsideSlider($(item.initialator), $(item.slider));
            if(item.options.isFade)
                $(item.slider).data("aslider-fade", item.options.isFade);
            else
                $(item.slider).find('.bg').css("opacity","0");
            $(item.slider).data("aslider-direction", item.options.direction);
            $(item.slider).find(".asilder_wrapper").addClass(item.options.direction)
        });
    };
    /**
     * @private
     * 绑定页面的侧边栏和侧边栏滑出的发起者的click事件，当点击发起者时，滑出侧边栏
     * @param  {zepto object} $initialator 发起者
     * @param  {zepto object} $slider      侧边栏
     * @return {null}
     */
    AsideSlider.prototype._bindAsideSlider = function($initialator, $slider) {
        if (typeof($initialator) == "undefined") return;
        $initialator.click($.proxy(function(e) {
            this.asideSlideIn($slider);
        },this));
    }
    /**
     * @private
     * 给定一个侧边栏的子节点，找到这个侧边栏
     * @param {Type} 一个html dom node
     */
    AsideSlider.prototype._findAslider = function(el) {
        var theSlider;
        $("[data-aslider]").each(function(idx, aslider) {
          if(aslider == el){
            theSlider = aslider;
            return false;
          }
          $(aslider).find(".close").each(function(idx,_el){
            if(el==_el){
                theSlider = aslider;
                return false;
            } else {
                return true;
            }
          });
        });
        return $(theSlider);
    }
    /**
     * @public
     * 遍历所有侧边栏，滑出隐藏当前显示的那个
     * @return {null}
     */
    AsideSlider.prototype.asideSlideOut =
    AsideSlider.prototype.slideOut = function($el){
        $el = typeof $el === 'string' ? $($el) : $el
        if ($el.css("display")!="none") {
            var isFade = $el.data("aslider-fade");
            if (isFade === "" || isFade || $el.isFade) {
                $el.find(".bg").removeClass("fade_in");
                $el.find(".bg").addClass("fade_out");
            }
            $el.find(".asilder_wrapper").removeClass("slide_in");
            $el.find(".asilder_wrapper").addClass("slide_out");
        }
        this.visibleStack.pop();
        if(this.visibleStack.length === 0)
            $('body').unbind('touchmove');
    }
    /**
     * @public
     * 滑入显示一个侧边栏
     * @param  {zepto object} $el 侧边栏dom对象
     * @return {null}
     */
    AsideSlider.prototype.asideSlideIn =
    AsideSlider.prototype.slideIn = function($el){
        $el = typeof $el === 'string' ? $($el) : $el
        $el.show();
        var isFade = $el.data("aslider-fade");
        if (isFade === "" || isFade || $el.isFade) {
            $el.find(".bg").removeClass("fade_out");
            $el.find(".bg").addClass("fade_in");
        }
        $el.find(".asilder_wrapper").removeClass("slide_out");
        $el.find(".asilder_wrapper").addClass("slide_in");
        this.visibleStack.push($el);

        $('body').bind('touchmove',function(e){
            e.preventDefault();
        });
    }
    $(function() {
        $.asideSlider = $.aslider = new AsideSlider();
    });
})(Zepto, window);
