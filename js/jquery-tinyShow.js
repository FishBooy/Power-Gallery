;
(function($) {

	//插件中用到的样式取值函数和动画算法
	$.fn.getCss = function(key) {
		if (typeof key == 'string') {
			var cssData = parseInt($(this).css(key))
			return (typeof cssData == 'number') ? cssData : false;
		}
	}
	$.fn.tinySlide = function(opt) {

		var Tween = {
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

		return this.each(function() {

			//设置默认参数，插入所需DOM
			var genSets = {
				container: $(this).addClass('slideWrapper'),
				width: $(this).getCss('width'),
				height: $(this).getCss('height'),
				mounts: $('img', this).length,
				animation: 'slide',
				txtDir: 'X',
				shaHeight: 36,
				btnShape: 'circle',
				btnTxt: true,
				dirArrow: true,
				auto: true,
				timeId: null,
				onStart: function() {},
				onFinish: function() {}
			},
				extPar = $.extend({}, genSets, insDom, opt ? opt : {}),
				insDom = {
					slideGallery: $('ul', $(this))
						.addClass('slideGallery')
						.css('width', extPar.mounts * extPar.width),
					slideImages: $('img', $(this)).css({
						width: extPar.width,
						height: extPar.height
					}),
					shadow: $('div', $(this))
						.eq(0)
						.addClass(extPar.txtDir === 'X' ? 'xShadow' : 'yShadow')
						.css({
							width: (extPar.txtDir === 'X' ? extPar.width : extPar.width / 4),
							height: (extPar.txtDir === 'X' ? extPar.shaHeight : extPar.height)
						}),
					txt: extPar.txtDir === 'X' ? $('p', $(this))
						.addClass('xTitle') : $('div', $(this))
						.eq(1)
						.addClass('yTitle')
						.css({
							width: extPar.width / 4,
							height: 200
						}),
					buttons: $('ol', $(this))
						.addClass('btn' + (extPar.btnShape === 'circle' ? 'Circle' : 'Rectangle'))
						.addClass(extPar.btnTxt ? 'hasTxt' : '')
						.css({
							width: (
								extPar.btnShape === 'circle' ? 'auto' : ($('div', $(this)).eq(1).hasClass('yTitle') ? extPar.width / 4 : 'auto')
							)
						}),
					arrows: extPar.dirArrow ? $('<a href="" class="prevBtn"><</a><a href="" class="nextBtn">></a>')
						.appendTo($(this)) : false
				};

			//动画所需参数
			var Data = {
				target: null,
				begin: insDom.slideGallery.getCss('marginLeft'),
				change: extPar.width * (-1),
				cFixed: extPar.width * (-1),
				duration: 40,
				timer: 0,
				pause: 2000,
				interval: 10
			},
				// 动画过程中所需要函数：init===>初始化DOM(事件绑定) & set==>设置运动参数 & run===>滑动函数 & classNam===>按钮类名交替函数
				Move = {
					init: function() {

						for (var i = 1; i <= extPar.mounts; i++) {
							insDom.buttons.append('<li><a href="">' + i + '</a></li>');
							extPar.txtDir === 'X' && insDom.txt.append('<a href="">' + insDom.slideImages.eq(i - 1).attr('alt') + '</a>')
						};
						$('a', insDom.txt).eq(0).addClass('curInfo');
						$('p', insDom.txt).eq(0).addClass('curInfo');

						$('a', insDom.buttons).eq(0).addClass('on');
						$('a', insDom.buttons).each(function() {
							var index = $('a', insDom.buttons).index($(this));
							$(this).bind('mouseover', {
								index: index
							}, Move.set)
								.bind('mouseleave', function() {
									extPar.auto = true;
									if (Data.timer == 0) {
										Move.set()
									}
								})

						});

						if(extPar.dirArrow){
							$('a.nextBtn', extPar.container).bind('click', {
								Event: 'next'
							}, Move.set);
							$('a.prevBtn', extPar.container).bind('click', {
								Event: 'prev'
							}, Move.set);
							extPar.container
								.bind({
									mouseover: function() {
										insDom.arrows.fadeIn(300)
									},
									mouseleave: function() {
										insDom.arrows.fadeOut(100)
									}
								})
								.contents()
								.not('ul,a.prevBtn,a.nextBtn')
								.not($('ul', extPar.container).contents())
								.bind('mouseover', function(e) {
									insDom.arrows.fadeOut(100)
									e.stopPropagation()
								})							
						}

						if (extPar.auto) Move.set();
					},
					set: function(e) {

						clearTimeout(extPar.timeId);

						Data.begin = insDom.slideGallery.getCss('marginLeft');
						if (e == undefined) {
							Data.change = (Data.begin == (extPar.mounts - 1) * Data.cFixed) ? -Data.begin : Data.cFixed;
							Move.classNam();
							extPar.timeId = setTimeout(Move.run, Data.pause)
						} else {
							if (e.data.Event) {
								var destination;
								e.preventDefault()
								if (e.data.Event == 'next') {
									var num = Data.begin / Data.cFixed ;
									if (parseInt(num)==(extPar.mounts - 1)||num==extPar.mounts) {
										return false;
									} else {
										/*next平滑的方式是判断（Data.begin / Data.cFixed）为浮点还是整型
										**整型则+1，浮点型+2(num=...表达式中)
										**/
										
										if(num==parseInt(num)){
											inte=parseInt(num)+1;
										}else{
											inte=parseInt(num)+2
										};
										destination = inte * Data.cFixed;
										console.log(destination)
										Move.classNam(inte);
									}
								} else {
									if (Data.begin == 0) {
										return false
									} else {
										destination = parseInt(Data.begin / Data.cFixed - 1) * Data.cFixed;
										Move.classNam();
									}

								};
								Data.change = destination - Data.begin;
								Data.timer = 0;

								Move.run()
							} else {
								var index = e.data.index;
								if (extPar.auto) {
									extPar.auto = false
								} else {
									extPar.auto = true
								};
								Data.target = index * Data.cFixed;
								Data.change = Data.target - Data.begin;
								Data.timer = 0;
								Move.classNam(index);
								Move.run();
							}
							e.preventDefault()
						}

					},
					run: function() {
						if (Data.timer <= Data.duration) {
							var position = Math.round(Tween.Quart.easeOut(Data.timer, Data.begin, Data.change, Data.duration))
							insDom.slideGallery.css('marginLeft', position + 'px');
							Data.timer++;
							extPar.timeId = setTimeout(Move.run, Data.interval)
						} else {
							Data.timer = 0;
							if (extPar.auto) Move.set();
						}
					},

					classNam: function(index) {
						insDom.buttons.find('a.on').removeClass('on');
						insDom.txt.find('.curInfo').removeClass('curInfo');
						if (typeof index == 'number') {
							$('a', insDom.buttons).eq(index).addClass('on')
							if (extPar.txtDir == 'X') {
								$('a', insDom.txt).eq(index).addClass('curInfo');
							} else {
								$('p', insDom.txt).eq(index).addClass('curInfo');
							}

						} else {
							var next = Data.begin / Data.cFixed
							$('a', insDom.buttons).eq(next).addClass('on')
							if (extPar.txtDir == 'X') {
								$('a', insDom.txt).eq(next).addClass('curInfo');
							} else {
								$('p', insDom.txt).eq(next).addClass('curInfo');
							}
						}

					}
				};

			Move.init();

		})
	}
})(jQuery)
