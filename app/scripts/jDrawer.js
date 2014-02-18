(function() {

    if (typeof jQuery === "undefined") {
        throw new Error("jDrawer requires jQuery")
    }

    var jDrawer = function(options) {

        this.defaults = {
            drawerOpenSpeed: 300,
            drawerCloseSpeed: 300,
            mobileBreakpoint: 500,
            labelClose: true,
            css3Animations: true
        }

        this.options = $.extend({}, this.defaults, options);

        //DOM handles
        this.$el = $(".j-drawer");
        this.$drawerContainer = $(".j-drawer-container");
        this.$bar = this.$el.find(".j-bar");
        this.$tabLinks = this.$el.find(".j-tablink");
        this.$contentContainer = this.$el.find(".j-content");
        this.$tabs = this.$el.find(".j-tab");

        //More convenient settings
        this.fixedHeight = this.options.fixedHeight;
        this.mobileBreakpoint = this.options.mobileBreakpoint;
        this.drawerOpenSpeed = this.options.drawerOpenSpeed;
        this.drawerCloseSpeed = this.options.drawerCloseSpeed;
        this.labelClose = this.options.labelClose;
        this.css3Animations = this.options.css3Animations;



        //Initializing behavior
        this.init();
        this.listen();
    }

    jDrawer.prototype = {

        init: function() {

            this.initTabLinks();

            //Set CSS3 animations or callbacks based upon settings or system abilites 
            if (!this.supportsTransitions()) {
                this.css3Animations = this.options.css3Animations = false;
            } else if (this.supportsTransitions() && this.css3Animations) {
                this.initCSS3Animations();
            } else {
                this.css3Animations = this.options.css3Animations = false;
            }

        },

        initCSS3Animations: function() {
            if (this.fixedHeight) {
                if (!this.isMobile()) {
                    this.$el.css("bottom", negate(this.fixedHeight))
                    this.$contentContainer.css("height", this.fixedHeight + "px")
                    this.$drawerContainer.css({
                        "-webkit-transform": "translate3d(0, 0, 0)"
                    })
                    this.$contentContainer.css("height", this.fixedHeight + "px")
                } else {
                    this.$el.css("bottom", negate(this.getMobileHeight()))
                    this.$contentContainer.css("height", this.getMobileHeight() + "px");
                    this.$drawerContainer.css({
                        "-webkit-transform": "translate3d(0 ,0, 0)"
                    })
                }

            }
        },

        initTabLinks: function() {

            var that = this;

            this.$tabLinks.each(function() {

                //TODO: convert to switch

                if ($(this).data("disabled") == "") $(this).addClass("disabled");

                if ($(this).data("mobile") == "") {
                    var $tabLink = $(this);
                    $(this).addClass("mobileOnly");
                    that.$tabs.each(function() {
                        if ($(this).attr("id") == $tabLink.data("open")) $(this).addClass("mobileOnly")
                    })
                }

                if ($(this).data("desktop") == "") {
                    var $tabLink = $(this);
                    $(this).addClass("desktopOnly");
                    that.$tabs.each(function() {
                        if ($(this).attr("id") == $tabLink.data("open")) $(this).addClass("desktopOnly")
                    })
                }

                if ($(this).data("toggle-on") == "") {
                    $(this).addClass("toggle-on")
                }

                if ($(this).data("toggle-off") == "") {
                    $(this).addClass("toggle-off")
                }

                if (typeof $(this).data("href") !== "undefined" && $(this).data("href") !== "" && $(this).data("lazy-load") !== "") {

                    var href = $(this).data("href");
                    var $tab = that.$el.find("#" + $(this).data("open"))

                    that.loadAjaxIntoTab($tab, href, function() { });
                }
            })
        },

        loadAjaxIntoTab: function($tab, href, cb) {
            $tab.load(href, cb)
        },

        listen: function() {

            //user $.proxy to call event functions with context set as our normal "this" (like .bind(this))
            $("body").on("click touchstart", $.proxy(this.close, this));
            $(window).resize(this.throttle($.proxy(this.onResize, this), 100)); //throttle resize events
            // window.addEventListener("orientationchange", function() {})

            this.$bar.on("click touchstart", $.proxy(this.toggle, this));
            this.$tabLinks.on("click touchstart", $.proxy(this.onTabLinkClick, this));

        },

        checkDefaultTab: function() {

            var $defaultTab = null;

            this.$tabLinks.each(function() {
                if ($(this).data("default") == "") $defaultTab = $(this);
            })

            return $defaultTab;

        },

        open: function() {
            $("html").addClass("jDrawer-open");

           

            if (this.isMobile()) {

                if (!this.css3Animations) {
                    this.$contentContainer.animate({
                        "height": this.getMobileHeight() + "px"
                    }, this.drawerOpenSpeed)
                } else {
                    this.$drawerContainer.addClass("CSS3")
                    
                    this.$el.css({"bottom" : negate(this.getMobileHeight())})
                    this.$contentContainer.css({
                        "height": this.getMobileHeight() + "px"
                    })
                    this.$drawerContainer.css({
                        "-webkit-transform": "translate3d(0, " + negate(this.getMobileHeight()) + "px, 0)"
                    })

                }

            } else {

                if (!this.css3Animations) {
                    if (this.fixedHeight) {
                        this.$contentContainer.animate({
                            "height": this.fixedHeight + "px"
                        }, this.drawerOpenSpeed)
                    } else {

                        this.$contentContainer.css({
                            "height": "auto",
                            "display": "none"
                        })
                        this.$contentContainer.slideDown(this.drawerOpenSpeed);
                    }
                } else {
                    this.$drawerContainer.addClass("CSS3")
                    if (this.fixedHeight) {

                        this.$el.css({"bottom" : negate(this.fixedHeight)})
                        this.$contentContainer.css({
                            "height": this.fixedHeight + "px"
                        })

                        this.$drawerContainer.css({
                            "-webkit-transform": "translate3d(0, " + negate(this.fixedHeight) + "px, 0)"
                        })
                    } else {
                        // this.$contentContainer.css("max-height");
                    }
                }
            }

        },

        close: function(e) {

            if (typeof e !== "undefined" && this.isInDrawer(e.target)) return;

            $("html").removeClass("jDrawer-open");
            this.$tabLinks.each(function() {
                $(this).removeClass("active")
            })

            var mobileHeight = this.getMobileHeight();

            if (this.isMobile()) {
                if (!this.css3Animations) {
                    this.$contentContainer.animate({
                        "height": "0px"
                    }, this.drawerCloseSpeed)
                } else {
                    //CSS3
                    this.$el.css({"bottom" : negate(this.getMobileHeight())})
                    this.$contentContainer.css("height", this.getMobileHeight() + "px");
                    this.$drawerContainer.css({
                        "-webkit-transform": "translate3d(0, 0, 0)"
                    })
                }
            } else {

                if (!this.css3Animations) {
                    this.$contentContainer.animate({
                        "height": "0px"
                    }, this.drawerCloseSpeed)
                } else {
                    //CSS3
                    this.$el.css({"bottom" : negate(this.fixedHeight)})
                    this.$drawerContainer.css({
                        "-webkit-transform": "translate3d(0, 0, 0)"
                    })
                }
            }


        },

        getMobileHeight: function() {
            return $(window).outerHeight() - this.$bar.height();
        },

        /* Sync the tabLabel and tab
         */
        sync: function(target) {

        },

        handleDataToggle: function(e) {
            this.toggle(e);
        },

        handleDataToggleOn: function(e) {
            if (!this.isOpen()) {
                this.open();
                this.sync();
            }
        },

        handleDataToggleOff: function(e) {
            if (this.isOpen()) {
                this.close();
                this.sync();
            }
        },

        onTabLinkClick: function(e) {

            e.stopPropagation();
            e.preventDefault();

            var $clickedTab = $(e.target);
            var isOpen = this.isOpen();

            if ($clickedTab.data("disabled") == "") {
                return;
            }

            if ($clickedTab.data("toggle") == "") {
                this.handleDataToggle(e);
                return;
            }

            if ($clickedTab.data("toggle-on") == "") {
                this.handleDataToggleOn(e);
                return;
            }

            if ($clickedTab.data("toggle-off") == "") {
                this.handleDataToggleOff(e);
                return;
            }

            if ($clickedTab.data("lazy-load") == "" && $clickedTab.data("href")) {
                var href = $clickedTab.data("href");
                var $tab = this.$el.find("#" + $clickedTab.data("open"))
                this.loadAjaxIntoTab($tab, href, function() { });
            }

            if (!isOpen) {

                this.open();
                this.hideTabs();
                this.openTab($clickedTab.data("open"));
                this.openTabLink($clickedTab);

            } else if (isOpen && $clickedTab.hasClass("active") && typeof this.labelClose !== "undefined" && this.labelClose) {

                $clickedTab.removeClass("active")
                this.close();

            } else {

                this.hideTabs();
                this.openTab($clickedTab.data("open"));
                this.openTabLink($clickedTab);

            }

        },

        openTabLink: function($link) {

            this.$tabLinks.each(function() {
                $(this).removeClass("active")
            })
            $link.addClass("active")

        },

        openTab: function(id) {

            this.$tabs.each(function() {
                if ($(this).attr("id") == id) $(this).addClass("active")
            })

        },


        hideTabs: function() {

            this.$tabs.each(function() {
                $(this).removeClass("active")
            })

        },

        //Triggered when drawer is open and user resizes from desktop to mobile
        //Displays mobile tabs and tablinks & Hides desktop ones
        handleMobileTabs: function() {

            var that = this;

            this.$tabs.each(function() {
                if ($(this).hasClass("desktopOnly") && $(this).hasClass("active")) {
                    $(this).removeClass("active");
                }
            })

            this.$tabLinks.each(function() {
                if ($(this).hasClass("desktopOnly") && $(this).hasClass("active")) {
                    $(this).removeClass("active");
                }
            })

        },

        //Triggered when drawer is open and user resizes from mobile to desktop
        //Displays desktop tabs and tablinks & Hides mobile ones
        handleDesktopTabs: function() {

            var that = this;

            this.$tabs.each(function() {
                if ($(this).hasClass("mobileOnly") && $(this).hasClass("active")) {
                    $(this).removeClass("active");
                }
            })
            this.$tabLinks.each(function() {
                if ($(this).hasClass("mobileOnly") && $(this).hasClass("active")) {
                    $(this).removeClass("active");
                }
            })

        },

        onResize: function() {

            if (!this.css3Animations) {
                if (this.isOpen()) {
                    if (this.isMobile()) {
                        var mobileHeight = $(window).outerHeight() - this.$bar.height();

                        this.$contentContainer.css({
                            "height": mobileHeight + "px"
                        })

                        // this.handleMobileTabs();
                    } else {
                        if (this.fixedHeight) {
                            this.$contentContainer.css({
                                "height": this.fixedHeight + "px"
                            })
                        } else {
                            this.$contentContainer.css({
                                "height": "auto"
                            });
                        }
                        // this.handleDesktopTabs();
                    }
                }
            } else {
                this.$drawerContainer.addClass("notransition");
                if (this.isOpen()) {
                    if (this.isMobile()) {
                        this.$el.css({"bottom" : negate(this.getMobileHeight())})
                        this.$contentContainer.css("height", this.getMobileHeight() + "px");

                        if (this.isOpen()) {
                            this.open();
                        }
                    } else {
                        this.$el.css({"bottom" : negate(this.fixedHeight)})
                        this.$contentContainer.css("height", this.fixedHeight + "px");
                        if (this.isOpen()) {
                            this.open();
                        }
                    }
                } else {

                    if (this.isMobile()) {
                        this.$contentContainer.css("height", this.getMobileHeight() + "px");
                        
                        this.$el.css({"bottom" : negate(this.getMobileHeight())})

                        this.$drawerContainer.css({
                            "-webkit-transform": "translate3d(0, 0, 0)"
                        })


                    } else {
                        this.$el.css({"bottom" : negate(this.fixedHeight)})
                        this.$contentContainer.css("height", this.fixedHeight + "px");
                        this.$drawerContainer.css({
                            "-webkit-transform": "translate3d(0, 0, 0)"
                        })
                    }


                }
                this.$drawerContainer.removeClass("notransition");
            }
        },

        toggle: function(e) {
            if (e) e.stopPropagation();

            if (this.isOpen()) {
                this.close()
            } else {
                var $defaultTab = this.checkDefaultTab();
                this.hideTabs();
                this.openTab($defaultTab.data("open"))
                $defaultTab.addClass("active")

                this.open()
            }
        },

        isOpen: function() {
            return $("html").hasClass("jDrawer-open");
        },

        isMobile: function() {
            return $(window).width() <= this.mobileBreakpoint;
        },

        isInDrawer: function(target) {
            return (this.$el.find(target).length > 0 ? true : false);
        },



        supportsTransitions: function() {
            var b = document.body || document.documentElement;
            var s = b.style;
            var p = 'transition';
            if (typeof s[p] == 'string') {
                return true;
            }

            // Tests for vendor specific prop
            v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'],
            p = p.charAt(0).toUpperCase() + p.substr(1);
            for (var i = 0; i < v.length; i++) {
                if (typeof s[v[i] + p] == 'string') {
                    return true;
                }
            }
            return false;
        },

        throttle: function(func, wait, options) {
            var that = this;
            var context, args, result;
            var timeout = null;
            var previous = 0;
            options || (options = {});
            var later = function() {
                previous = options.leading === false ? 0 : that.now();
                timeout = null;
                result = func.apply(context, args);
                context = args = null;
            };
            return function() {
                var now = that.now();
                if (!previous && options.leading === false) previous = now;
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                    context = args = null;
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            }
        },

        now: function() {
            return new Date().getTime();
        }

    }

    function negate(value) {
        return (value * -1);
    }

    window.jDrawer = jDrawer;

})()
