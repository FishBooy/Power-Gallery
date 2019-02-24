## 关于Gallery:

Gallery是一款基于jQuery的，用于图片浏览的焦点图组件，只包含一个css样式文件和一个js文件。
关于Gallery的编写----它的结构采用的是原型继承的结构（构造函数是Gallery,所有动态属性都在构造函数内由this来指定，所有公共方法及属性都集合在原型对象内）。它的功能执行遵循了普通插件的执行方式（参数配置->主要程序的运行->返回$对象）。

## 如何使用？

Gallery的使用非常简单，首先下载并解压，然后:

### (1)引用源文件(一个css文件和一个js文件)到文档中，当然还要保证jQuery也引进来(而且要在gallery的js文件之前)：

```html
<head>
<link rel="stylesheet" type="text/css" href="css/jquery-gallery.css"/><!--此为要引用的样式文件-->
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script type="text/javascript" src="js/jquery-gallery.js"></script><!--此处为要引用的js文件-->
</head>
```

### (2)写好html结构：

```html
<div class="container"> <!--容器类名没有限制-->
  <ul> <!--图片列表的个数没有限制-->
    <li><a href=""><img src="img/slider01.jpg" alt="" /></a></li>
    <li><a href=""><img src="img/slider02.jpg" alt="" /></a></li>
    <li><a href=""><img src="img/slider03.jpg" alt="" /></a></li>
  </ul>
</div>
```

### (3)配置组件并初始化：

```javascript
//在DOM Ready之后：
 $('.container').gallery()
```

最后，还有非常重要的一点，即：指定`.container`的宽度和高度。宽高的指定也有两种方式：   
第一种（推荐）：在你的css文件中或gallery源文件的`gallery.css`中指定：

```css
/*宽高不限制*/
.container{width:360px;height:200px;}
```

第二种：在初始化的时候指定，如下：

```javascript
$('.container').gallery({
    //宽高不限制
    width:360,
    height:200
});
```

至此，一个焦点图小组件应该可以正常显示在你的页面中了。它包含了标题，方向按钮，水平滚动的动画效果等等，但是如果你想延迟滑动的等待时间，或者想在序号按钮中显示出数字等等，那么你可以参考本文下面的部分：配置参数。

## 配置参数

* **width**: _int_，指定gallery的宽度。
* **height**: _int_，指定gallery的高度。
* **hasTitle**: _boolean_，是否显示标题，true-显示，false-不显示。
* **shaHeight**: _int_，表示标题阴影背景的高度，默认高度为36即36px。
* **hasArrow**: _boolean_，true代表有方向按钮，false代表没有。默认为true。
* **arrType**: _string_，方向按钮的样式类型，分内（'inside'）、外('outside')两种样式，默认为内部样式。
* **arrAni**: _boolean_，方向按钮是否包含淡入淡出的动画。false-没有，true-有。
* **hasBtn**: _boolean_，是否显示按钮。true-有，false-没有。
* **btnType**：_string_，底部按钮的类型，默认为形状按钮（'btn'）,另外一种则是缩略图类型（'img'）。
* **btnShape**: _string_，序号按钮的形状。默认为圆形('circle')，'square'代表方形。
* **btnTxt**: _boolean_，true代表按钮含有序号，false代表没有。默认为false。
* **duration**: _int_，滑动步长，数值越大滑动越慢，反之则越快。默认为50。
* **auto**: _boolean_，gallery是否在初始化后自动滑动。
* **pause**: _int_，滑动之前的等待时间。默认为2000（2000ms）即2秒。
* **onStart**: _func_，每次滑动前需要执行的函数。默认`function(){}`。
* **onFinish**: _func_，每次滑动结束后的回调函数。默认`function(){}`。

**配置示例（一个没有方向按钮且等待时间为5秒的gallery）:**

```javascript
$('.container').gallery({
  hasArrow: false,
  pause: 5000
})
```

<a href="demo/" >查看DEMO</a>
