# Online gh-pages generator
将 Markdown 文件转换为不同主题的 GitHub Page 网页
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [功能](#%E5%8A%9F%E8%83%BD)
- [示例](#%E7%A4%BA%E4%BE%8B)
- [主题](#%E4%B8%BB%E9%A2%98)
  - [通用配置](#%E9%80%9A%E7%94%A8%E9%85%8D%E7%BD%AE)
  - [主题相关配置](#%E4%B8%BB%E9%A2%98%E7%9B%B8%E5%85%B3%E9%85%8D%E7%BD%AE)
    - [Cayman](#cayman)
    - [Minimal 和 Modernist](#minimal-%E5%92%8C-modernist)
- [评论](#%E8%AF%84%E8%AE%BA)
  - [多说](#%E5%A4%9A%E8%AF%B4)
  - [Disqus](#disqus)
- [扩展语法](#%E6%89%A9%E5%B1%95%E8%AF%AD%E6%B3%95)
  - [Todo列表](#todo%E5%88%97%E8%A1%A8)
  - [Mathjax](#mathjax)
  - [时序图](#%E6%97%B6%E5%BA%8F%E5%9B%BE)
  - [Emoji](#emoji)
  - [ECharts](#echarts)
    - [配置](#%E9%85%8D%E7%BD%AE)
  - [自定义扩展](#%E8%87%AA%E5%AE%9A%E4%B9%89%E6%89%A9%E5%B1%95)
- [其他说明](#%E5%85%B6%E4%BB%96%E8%AF%B4%E6%98%8E)
  - [Markdown 文件解析](#markdown-%E6%96%87%E4%BB%B6%E8%A7%A3%E6%9E%90)
  - [本地图片](#%E6%9C%AC%E5%9C%B0%E5%9B%BE%E7%89%87)
  - [目录](#%E7%9B%AE%E5%BD%95)
  - [缓存](#%E7%BC%93%E5%AD%98)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## 功能

+ 支持多种页面主题
+ `Prism.js` / `Highlight.js` 代码高亮
+ 自动生成目录
+ 本地图片显示
+ 导出 Html （包含样式）
+ 评论
    - [多说](http://duoshuo.com/)
    - [Disqus](https://disqus.com/)
+ 扩展功能
    - Toto 列表
    - [MathJax](https://github.com/mathjax/MathJax) 
    - [时序图 (Js sequence diagrams)](https://github.com/bramp/js-sequence-diagrams)
    - [Emoji (Emojify.js)](https://github.com/Ranks/emojify.js)
    - [图表 (ECharts)](http://echarts.baidu.com/)

## 示例
[示例文件](demo/sample.md)    
[效果预览](http://zhangjikai.com/page/index.html)

## 主题
现在支持下面 6 种主题，以后会增加更多的主题。
* [Architect](https://github.com/jasonlong/architect-theme)
* [Cayman](https://github.com/jasonlong/cayman-theme)
* [Minimal](https://github.com/orderedlist/minimal)
* [Modernist](https://github.com/orderedlist/modernist)
* [Slate](https://github.com/jasoncostello/slate)
* [Time machine](https://github.com/jonrohan/time-machine-theme)

### 通用配置
主题通用的配置如下所示，在 Markdown 文件中插入下面的代码块即可。

<pre><code>```ghpages
{
    title: "名称",
    desc: "描述",
    github: "github 地址",
    zip: "zip 文件下载地址",
    tar: "tar.gz 文件下载地址",
    footer: {
        owner: '作者信息', 
        credits: '相关声明'
    }
}
```
</code></pre>

### 主题相关配置
#### Cayman
在 Cayman 主题中，可以添加新的链接。如下所示:

<pre><code>```ghpages
{
    link: [
    	{
    		order: 1,
    		text: "Other Link",
    		url: "#"
    	}
    ],
}
```
</code></pre>


* `order` - 链接显示的顺序。 `github`, `zip`, `tar` 对应的值分别为10, 11, 12。数值较小的链接在前面显示。数值相同的链接按出现的先后顺序显示。
* `text` - 链接显示的文字
* `url` - 链接的 url 地址

#### Minimal 和 Modernist
在这两个主题中，需要配置项目的名称信息，如下所示：

<pre><code>```ghpages
{
    project: {
    	url: "#",
    	name: "zhangjikai/online-ghpages-generator"
    },
}
```
</code></pre>

## 评论
### 多说
通过在 Markdown 文件中添加下面代码来配置多说

<pre lang="no-highlight"><code>```comment
{
    "key": "filename",
    "title": "filename",
    "url": "filename.html",
    "short_name": "shortname"
}
```
</code></pre>

### Disqus
通过在 Markdown 文件中添加下面代码来配置Dsiqus，这里的 `url` 要使用完整的地址

<pre lang="no-highlight"><code>```comment
{
    "key": "filename",
    "url": "http://xxx.xxx/filename.html",
    "short_name": "shortname"
}
```
</code></pre>

## 扩展语法
### Todo列表
```
- [x] 完成
- [ ] 未完成
- [ ] 未完成
```

### Mathjax
支持原生的 Mathjax 语法。示例代码：
```
$$
        \begin{matrix}
        1 & x & x^2 \\
        1 & y & y^2 \\
        1 & z & z^2 \\
        \end{matrix}
$$
```
关于Mathjax 语法，请参考[MathJax basic tutorial and quick reference](http://meta.math.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference/5044)

不过直接使用原生的 Mathjax 语法，marked 会将公式中的 `\\` 转为 `\`，导致换行失效，为了解决这个问题，这里做了一下扩展，将 Mathjax 代码放入代码块中，代码块语言设为 `mathjax` 即可。如下面的示例

<pre lang="no-highlight"><code>```mathjax
$$
        \begin{matrix}
        1 & x & x^2 \\
        1 & y & y^2 \\
        1 & z & z^2 \\
        \end{matrix}
$$
```
</code></pre>


### 时序图
在 Markdown 文档中添加下面的代码块，会将代码块中的代码解析为时序图

<pre lang="no-highlight"><code>```seq
A->B: Normal line
B-->C: Dashed line
C->>D: Open arrow
D-->>A: Dashed open arrow
```
</code></pre>

### Emoji
Emoji表情参见 [EMOJI CHEAT SHEET](http://www.webpagefx.com/tools/emoji-cheat-sheet/)

### ECharts
在文档中加入下面的代码块，会将代码块中代码解析为 [ECharts](http://echarts.baidu.com/) 图表。只支持默认的数据显示，无法添加自定义的事件处理。

<pre lang="no-highlight"><code>```echarts
{
    title: {
        text: 'ECharts 入门示例'
    },
    tooltip: {},
    legend: {
        data:['销量']
    },
    xAxis: {
        data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
    },
    yAxis: {},
    series: [{
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
    }]
}
```
</code></pre>

#### 配置
目前自定义了三个配置项：
* **`width`**： 图表宽度，可选，默认值是 `100%` 
* **`height`**: 图表高度，可选，默认值是 `400px`
* **`theme`**: 图标主题，可选，有效的主题是： `dark`, `infographic`, `macarons`, `roma`, `shine`, `vintage`

其余的参数都是 ECharts 中定义的参数，具体的参考 [ECharts 配置](http://echarts.baidu.com/option.html#title)。下面是一个完整示例
```
{
    width: "600px",
    height: "400px",
    theme: "macarons",
    title: {
        text: 'ECharts 入门示例'
    },
    tooltip: {},
    legend: {
        data:['销量']
    },
    xAxis: {
        data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
    },
    yAxis: {},
    series: [{
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
    }]
}
```
### 自定义扩展
在现有程序的基础上，我们可以很方便的添加扩展功能。基本流程大概就是引入扩展的库文件，在渲染 Markdown 文件时 调用库文件相应的方法。以添加时序图为例：  

* 确定时序图的代码标记

<pre lang="no-highlight"><code>```seq
时序图代码
```
</code></pre>

* 修改 `marked` 中对于代码块的解析函数，添加对于时序图标记的支持
```js
var renderer = new marked.Renderer();
var originalCodeFun = renderer.code;
renderer.code = function (code, language) {
    if (language == "seq") {
        return "<div class='diagram' id='diagram'>" + code + "</div>"
    } else {
        return originalCodeFun.call(this, code, language);
    }
};
marked.setOptions({
    renderer: renderer
});
```
* 引入 `js-sequence-diagrams` 相关文件
```js
<link href="{{ bower directory }}/js-sequence-diagrams/dist/sequence-diagram-min.css" rel="stylesheet" />
<script src="{{ bower directory }}/bower-webfontloader/webfont.js" />
<script src="{{ bower directory }}/snap.svg/dist/snap.svg-min.js" />
<script src="{{ bower directory }}/underscore/underscore-min.js" />
<script src="{{ bower directory }}/js-sequence-diagrams/dist/sequence-diagram-min.js" />
```
* 渲染 Markdown 文件时，调用相关函数
```js
$(".diagram").sequenceDiagram({theme: 'simple'});
```

如果不需要某个扩展功能，可以停用该功能，以加快文件渲染的速度。


## 其他说明

### Markdown 文件解析
程序使用 [marked](https://github.com/chjj/marked) 解析文件。

### 本地图片
如果需要显示本地图片，需要手动的将图片上传一下（支持批量上传），程序使用 `FileReader` 读取上传的图片，然后将图片的本地路径替换为图片的内容。图片压缩对 `jpg` 文件效果较好，对于 `png` 文件效果较差。

### 目录
在需要生成目录的地方加上下面的代码
```
<!-- toc -->
```
如果不加会自动在开头生成。

### 缓存
上次打开的文件和配置信息都保存在 `localStorage` 里，如果清理了缓存，就可能丢失这些信息。另外浏览器对于 `localStorage` 的容量有限制，所以不要保存太大的文件。
