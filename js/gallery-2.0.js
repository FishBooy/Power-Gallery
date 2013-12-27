/*==================gallery-2.0 面向对象式构造插件===================*/ ;
(function($) {

	/*=============构造器============*/
	var Gallery = function(opts, gallery) {
		this.opts = $.extend({}, this.defaultOpts, opts ? opts : {});
		this.gallery = gallery.addClass('Gallery');

		this.setData();
		this.eventsBind();
	}

	/*=============对象属性以及方法============*/
	/*setTimeout(func,time)中,func中的this指向问题如下:
	 **无论func是变量赋值还是对象属性,this都是指向全局window对象！--
	 **具体参见：https://developer.mozilla.org/zh-CN/docs/DOM/window.setTimeout
	 **
	 **针对该this问题,现用'匿名函数自行执行返回'进行修正如slideRun和setBeforeSlide中:
	 **setTimeout((function(){return function(){self.slideRun()}})(),time)
	 */
	//滑动算法
	Gallery.prototype.Tween = {
		Quart: {
			easeOut: function(t, b, c, d) {
				return -c * ((t = t / d - 1) * t * t * t - 1) + b;
			}
		},
		Back: {
			easeOut: function(t, b, c, d, s) {
				if (s == undefined) s = 1.70158;
				return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
			}
		},
		Bounce: {
			easeOut: function(t, b, c, d) {
				if ((t /= d) < (1 / 2.75)) {
					return c * (7.5625 * t * t) + b;
				} else if (t < (2 / 2.75)) {
					return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
				} else if (t < (2.5 / 2.75)) {
					return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
				} else {
					return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
				}
			}
		}
	};

	//默认参数
	Gallery.prototype.defaultOpts = {
		animation: 'slide',
		shaHeight: 36,
		hasArrow: true,
		duration: 40,
		pause: 2000,
		interval: 10,
		onStart: function() {},
		onFinish: function() {}
	};

	//样式取数字值
	Gallery.prototype.getCss = function(Jobj, key) {
		if (typeof key == 'string') {
			var cssData = parseInt(Jobj.css(key))
			return (typeof cssData == 'number') ? cssData : false;
		}
	};

	//完善当前dom并将各主要元素的jquery对象与对象属性相对应
	Gallery.prototype.setData = function() {

		var bHtml = '',
			tHtml = '';

		this.width = this.gallery.width();
		this.height = this.gallery.height();
		this.mounts = $('img', this.gallery).length;

		this.imgsContainer = $('ul', this.gallery).addClass('imgs-container').css('width', this.mounts * this.width);
		this.images = $('img', this.gallery).css({
			width: this.width,
			height: this.height
		});
		this.shadow = $('div', this.gallery).addClass('shadow').css({
			width: this.width,
			height: this.opts.shaHeight
		});

		for (var i = 1; i <= this.mounts; i++) {
			bHtml += '<li><a href="">' + i + '</a></li>';
			tHtml += '<a href="">' + this.images.eq(i - 1).attr('alt') + '</a>';
		};
		this.buttons = $('ol', this.gallery).addClass('buttons').append(bHtml);
		this.titles = $('p', this.gallery).addClass('titles').append(tHtml);
		this.arrows = $('<a href="" class="prev-btn"><</a><a href="" class="next-btn">></a>').appendTo(this.gallery);

		this.target = null;
		this.begin = this.getCss(this.imgsContainer, 'marginLeft');
		this.change = this.width * (-1);
		this.cFixed = this.width * (-1);
		this.timer = 0;
		this.timeId = null;
		this.auto = true;
	};

	//事件绑定
	Gallery.prototype.eventsBind = function() {

		var self = this;

		$('a', self.buttons).eq(0).addClass('on');
		$('a', self.titles).eq(0).addClass('curInfo');

		$.each($('a', self.buttons), function(k, v) {
			$(v).bind('mouseover', {
				index: k,
				self: self
			}, self.setBeforeSlide)
				.bind('mouseleave', function() {
					self.auto = true;
					self.timer == 0 && self.setBeforeSlide()
				}).click(function(e) {
					e.preventDefault()
				})
		});

		if (self.opts.hasArrow) {
			$('a.next-btn', this.gallery).bind('click', {
				Event: 'next',
				self: self
			}, this.setBeforeSlide);
			$('a.prev-btn', this.gallery).bind('click', {
				Event: 'prev',
				self: self
			}, this.setBeforeSlide);
			self.gallery
				.bind({
					mouseover: function(e) {
						self.arrows.fadeIn(300)
					},
					mouseleave: function() {
						self.arrows.fadeOut(100)
					}
				})
				.contents()
				.not('ul,a.prev-btn,a.next-btn')
				.not($('ul', self.container).contents())
				.bind('mouseover', function(e) {
					e.stopPropagation()
					self.arrows.fadeOut(100)
				})
		};
		self.auto && self.setBeforeSlide()
	};

	//开始滑动之前的预设
	Gallery.prototype.setBeforeSlide = function(e) {
		if (e == undefined) {
			clearTimeout(this.timeId);
			var self = this;
			this.begin = this.getCss(this.imgsContainer, 'marginLeft');
			this.change = (this.begin == (this.mounts - 1) * this.cFixed) ? -this.begin : this.cFixed;
			this.alterClassName();
			this.timeId = setTimeout(function() {self.slideRun()}, this.opts.pause)
		} else {
			e.preventDefault();
			var self = e.data.self;
			clearTimeout(self.timeId);
			self.begin = self.getCss(self.imgsContainer, 'marginLeft');

			if (e.data.Event) {
				var destination;
				e.preventDefault()
				if (e.data.Event == 'next') {
					var num = self.begin / self.cFixed;
					if (self.begin != (self.mounts - 1) * self.cFixed) {
						/*next平滑的方式是判断（Data.begin / Data.cFixed）为浮点还是整型
						 **整型则+1，浮点型+2(num=...表达式中)
						 **/
						if (num == parseInt(num)) {
							inte = parseInt(num) + 1;
						} else {
							if (parseInt(num) == (self.mounts - 2)) {
								inte = parseInt(num) + 1
							} else {
								inte = parseInt(num) + 2
							}
						};
						destination = inte * self.cFixed;
						self.alterClassName(inte);
					}
				} else {
					if (self.begin != 0) {
						var index = parseInt(self.begin / self.cFixed - 1);
						destination = index * self.cFixed;
						self.alterClassName(index);
					}
				};
				self.change = destination - self.begin;
				self.timer = 0;
				self.slideRun()
			} else {
				var index = e.data.index;
				self.auto = false;
				self.target = index * self.cFixed;
				self.change = self.target - self.begin;
				self.timer = 0;
				self.alterClassName(index);
				self.slideRun();
			}
		};
	};

	//开始滑动之前按钮和标题的更换 
	Gallery.prototype.alterClassName = function(index) {
		this.buttons.find('a.on').removeClass('on');
		this.titles.find('.curInfo').removeClass('curInfo');
		if (typeof index == 'number') {
			$('a', this.buttons).eq(index).addClass('on')
			$('a', this.titles).eq(index).addClass('curInfo');
		} else {
			var next = parseInt(this.begin / this.cFixed);
			$('a', this.buttons).eq(next).addClass('on')
			$('a', this.titles).eq(next).addClass('curInfo');
		}
	};

	//滑动主体
	Gallery.prototype.slideRun = function() {
		var self = this;
		if (this.timer <= this.opts.duration) {
			var position = Math.round(this.Tween.Quart.easeOut(this.timer, this.begin, this.change, this.opts.duration))
			this.imgsContainer.css('marginLeft', position + 'px');
			this.timer++;
			this.timeId = setTimeout(function() {self.slideRun()}, this.opts.interval)
		} else {
			this.timer = 0;
			this.auto && this.setBeforeSlide()
		}
	};

	/*================转化===============*/
	//转化为jquery插件
	$.fn.gallery = function(opts) {
		return this.each(function() {
			$(this).data('gallery') || $(this).data('gallery', new Gallery(opts ? opts : {}, $(this)))
		});
	}
})(jQuery);