/**
 * Created by ZhangJikai on 2016/12/25.
 */

(function () {
    var fileSelect = document.getElementById('select-file');
    var imgSelect = document.getElementById('img-select');
    var cacheImages = {};
    var targetFile;
    var mdName = "";
    var mdContent = "";
    var maxSize = 1024 * 1024 * 4;

    var echartData = [];
    var echartIndex = 0;
    var echartThemeText = "darki infographic macarons roma shine vintage";

    var toc = [];
    var tocDumpIndex = 0;
    var tocStr = "";
    var tocStartIndex = 0;
    var tocTagPos = -1;
    var hasTocTag = false;
    var minLevel = 5;

    var handleHeading = false;

    var ghPageConfig = {};

    /*var footerMsg = {};*/

    var themeContentTag = "";

    var commentConfig = {
        "key": "test",
        "title": "test",
        "url": "test.html",
        "short_name": "zhangjkblog"
    };
    var hasDsConfig = false;


    var Constants = {
        highlight: "highlight",
        prism: "prism",
        syntaxhigh: "syntaxhigh",
        mdName: "mdName",
        mdContent: "mdContent",
        tocTag: "<!-- toc -->",
        setting: "setting",
        DHShort: "duoshuoShort",
        duoshuo: "duoshuo",
        disqus: "disqus",
        none: "none"

    };

    var Theme = {
        cayman: "cayman",
        minimal: "minimal",
        modernist: "modernist",
        slate: "slate",
        time: "time",
        architect: "architect"
    };

    var Setting = {
        compressImg: true,
        genToc: true,
        tocLevel: 5,
        highlight: Constants.prism,
        cache: true,
        mathjax: true,
        sd: true,
        emoji: true,
        backtop: true,
        comment: Constants.duoshuo,
        echarts: true,
        format: true,
        theme: Theme.cayman
    };

    console.log("Setting.theme", Setting.theme)


    var exportSetting = {
        mathjax: false,
        echarts: false
    };


    var renderer = new marked.Renderer();

    /* Todo列表 */
    renderer.listitem = function (text) {
        if (/^\s*\[[x ]\]\s*/.test(text)) {
            text = text
                .replace(/^\s*\[ \]\s*/, '<input type="checkbox" class="task-list-item-checkbox" disabled> ')
                .replace(/^\s*\[x\]\s*/, '<input type="checkbox" class="task-list-item-checkbox" disabled checked> ');
            return '<li style="list-style: none">' + text + '</li>';
        } else {
            return '<li>' + text + '</li>';
        }
    };


    var originalHeading = renderer.heading;

    renderer.heading = function (text, level) {
        if (handleHeading) {
            var slug = text.toLowerCase().replace(/[\s]+/g, '-');
            if (tocStr.indexOf(slug) != -1) {
                slug += "-" + tocDumpIndex;
                tocDumpIndex++;
            }

            tocStr += slug;
            toc.push({
                level: level,
                slug: slug,
                title: text
            });

            return "<h" + level + " id=\"" + slug + "\"><a href=\"#" + slug + "\" class=\"anchor\">" + '' +
                '<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>' +
                '' + "</a>" + text + "</h" + level + ">";
        } else {
            var slug = text.toLowerCase().replace(/[\s]+/g, '-');
            if (tocStr.indexOf(slug) != -1) {
                slug += "-" + tocDumpIndex;
                tocDumpIndex++;
            }

            tocStr += slug;
            toc.push({
                level: level,
                slug: slug,
                title: text
            });

            return "<h" + level + " id=\"" + slug + "\"><a href=\"#" + slug + "\">" + "</a>" + text + "</h" + level + ">";
        }
    };

    //var originalCodeFun = renderer.code;

    var customCode = function (code, lang) {


        if (Setting.highlight == Constants.highlight) {
            return "<pre><code class='" + lang +
                "'>" + code + "</code></pre>";
        }

        if (Setting.highlight == Constants.syntaxhigh) {
            return "<pre  class=' brush: " + lang +
                "; toolbar: false;'>" + code + "</pre>";
        }

        return "<pre><code class='language-" + lang +
            "'>" + code + "</code></pre>";

    };
    renderer.code = function (code, language) {

        switch (language) {
            case "seq":
                if (Setting.sd) {
                    return "<div class='diagram' id='diagram'>" + code + "</div>"
                }
                return customCode(code, language);
            case "mathjax":
                if (Setting.mathjax || exportSetting.mathjax) {
                    return "<p>" + code + "</p>\n";
                }
                return customCode(code, language);
            case "comment":
                if (Setting.comment != Constants.none) {
                    loadCommentConfig(code);
                }
                return "";
            case "echarts":
                if (Setting.echarts || exportSetting.echarts) {
                    return loadEcharts(code);
                }
                return customCode(code, language);

            case "ghpages":
                loadGhPageConfig(code);
                return "";
            //case "footer":
            //    loadFooter(code);
            //    return "";
            default :
                return customCode(code, language);
        }
    };

    function loadGhPageConfig(text) {
        try {
            ghPageConfig = eval("(" + text + ")");

        } catch (e) {

            sweetAlert("出错了", "解析 header 配置出现错误，请检查语法", "error");

        }
    }

    //function loadFooter(text) {
    //    try {
    //        footerMsg = eval("(" + text + ")");
    //    } catch (e) {
    //        console.log(e);
    //        sweetAlert("出错了", "解析 footer 配置出现错误，请检查语法", "error");
    //
    //    }
    //}

    function loadCommentConfig(text) {
        try {
            var config = JSON.parse(text);
            for (var key in config) {
                var newValue = config[key];
                if (newValue === undefined) {
                    console.warn('\'' + key + '\' parameter is undefined.');
                    continue;
                }
                if (key in commentConfig) {
                    commentConfig[key] = newValue;
                }
            }
            localStorage.setItem(Constants.DHShort, commentConfig.short_name);
        } catch (e) {
            sweetAlert("出错了", "解析 评论 配置出现错误，请检查语法", "error");
            console.log(e);
        }
    }

    function loadEcharts(text) {
        var width = "100%";
        var height = "400px";

        try {
            var options = eval("(" + text + ")");

            if (options.hasOwnProperty("width")) {
                width = options["width"];
            }

            if (options.hasOwnProperty("height")) {
                height = options["height"];
            }

            echartIndex++;
            echartData.push({
                id: echartIndex,
                option: options,
                previousOption: text
            });

            return '<div class="custom-echarts" id="echarts-' + echartIndex + '" style="width: ' + width + ';height:' + height + ';"></div>'
        } catch (e) {

            sweetAlert("出错了", "解析 ECharts 配置出现错误，请检查语法", "error");
            console.log(e);
            return "";
        }
    }

    marked.setOptions({
        renderer: renderer,
        highlight: null

    });

    function refreshAuto() {
        setInterval(load, 3000);
    }


    function load() {
        if (targetFile == null) {
            return;
        }
        var reader = new FileReader();
        reader.readAsText(targetFile);
        mdName = delExtension(targetFile.name);

        reader.onload = function (e) {
            document.getElementById(themeContentTag).innerHTML = marked(e.target.result);
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, themeContentTag]);
        }
    }

    function dragMdEnter(e) {
        e.stopPropagation();
        e.preventDefault();
        $("#upload").css("border-color", "#3bafda");
    }

    function dragMdLeave(e) {
        e.stopPropagation();
        e.preventDefault();
        $("#upload").css("border-color", "#ddd");
    }

    function dropMdFile(e) {
        e.stopPropagation();
        e.preventDefault();
        $("#upload").css("border-color", "#ddd");

        if (e.dataTransfer.files == null || e.dataTransfer.files[0] == null) {
            return;
        }
        processMdFile(e.dataTransfer.files[0]);
    }


    function selectMdFile(e) {
        e.stopPropagation();
        e.preventDefault();
        if (this.files == null || this.files[0] == null) {
            return;
        }
        processMdFile(this.files[0]);
    }

    function processMdFile(mdFile) {
        targetFile = mdFile;
        if (!checkMdExt(targetFile.name)) {
            var modal = $('[data-remodal-id=md-tip]').remodal();
            modal.open();
            return;
        }
        $("#loader").css("display", "block");
        var reader = new FileReader();
        reader.readAsText(targetFile);
        mdName = delExtension(targetFile.name);

        reader.onload = function (e) {
            mdContent = e.target.result;

            if (Setting.cache) {
                saveMdFile(mdName, mdContent);
            } else {
                removeCacheFile();
            }

            processMdContent(mdContent);
        };

    }


    function resetBeforeProcess() {
        toc.length = 0;
        tocStr = "";
        echartIndex = 0;
        echartData.length = 0;
    }


    function handleGHpage() {
        console.log(Setting.theme)
        switch (Setting.theme) {
            case Theme.cayman:
                headerCayman();

                break;
            case Theme.minimal:
                headerMinimal();
                break;
            case Theme.modernist:
                headerModernist();
                break;
            case Theme.slate:
                headerSlate();
                break;
            case Theme.time:
                headerTime();
                break;
            case Theme.architect:
                headerArchitect();
                break;
        }
        processFooter();
    }

    function headerCayman() {

        var headerId = "#cayman-page-header";
        var tmpText = "";
        var tmpHtml = "";
        $(headerId).html("");
        if (ghPageConfig.hasOwnProperty("title")) {
            tmpText = ghPageConfig["title"];
            tmpHtml = "<h1 class='project-name'>" + tmpText + "</h1>";
            $(headerId).append(tmpHtml);
        }

        if (ghPageConfig.hasOwnProperty("desc")) {
            tmpText = ghPageConfig["desc"];
            tmpHtml = "<h2 class='project-tagline'>" + tmpText + "</h2>";
            $(headerId).append(tmpHtml);
        }
        var linkArray = [];
        if (ghPageConfig.hasOwnProperty("github")) {
            linkArray.push({
                order: 10,
                "text": "View on Github",
                "url": ghPageConfig["github"]
            });
        }

        if (ghPageConfig.hasOwnProperty("zip")) {
            linkArray.push({
                order: 11,
                "text": "Download .zip",
                "url": ghPageConfig["zip"]
            });
        }

        if (ghPageConfig.hasOwnProperty("tar")) {
            linkArray.push({
                order: 12,
                "text": "Download .tar.gz",
                "url": ghPageConfig["tar"]
            });
        }

        var i, index;

        if (ghPageConfig.hasOwnProperty("link") && ghPageConfig["link"] instanceof Array) {
            var links = ghPageConfig["link"];

            links.forEach(function (link) {
                if (!link.hasOwnProperty("order")) {
                    link.order = 10000;
                }

                index = 0;
                for (i = 0; i < linkArray.length; i++) {
                    if (link.order < linkArray[i].order) {
                        break;
                    }
                    index++;
                }

                for (i = linkArray.length - 1; i >= index; i--) {
                    linkArray[i + 1] = linkArray[i];
                }
                linkArray[index] = link;

            });
        }

        var aContent;
        $(headerId).children('a').remove();

        linkArray.forEach(function (link) {
            aContent = '<a class="btn" href="' + link.url + '">' + link.text + '</a>'
            $(headerId).append(aContent);
        });
    }


    function headerMinimal() {

        var headerId = "#minimal-page-header";
        $(headerId).html("");
        var tmpText = "";
        var tmpHtml = "";
        var tmpObj;


        if (ghPageConfig.hasOwnProperty("title")) {
            //$("#page-title").append(ghPageConfig["title"]);
            tmpText = ghPageConfig["title"];
            tmpHtml = "<h1>" + tmpText + "</h1>";
            $(headerId).append(tmpHtml);
        }

        if (ghPageConfig.hasOwnProperty("desc")) {
            tmpText = ghPageConfig["desc"];
            tmpHtml = "<p>" + tmpText + "</p>";
            $(headerId).append(tmpHtml);
        }

        if (ghPageConfig.hasOwnProperty("project")) {
            tmpObj = ghPageConfig["project"];
            tmpHtml = '<p> <a href="' + tmpObj.url + '">View the Project on GitHub<small>' + tmpObj.name + '</small></a></p>';
            $(headerId).append(tmpHtml);
        }

        var linkArray = [];

        if (ghPageConfig.hasOwnProperty("zip")) {
            linkArray.push({
                "text": "Download <strong>ZIP File</strong>",
                "url": ghPageConfig["zip"]
            });
        }

        if (ghPageConfig.hasOwnProperty("tar")) {
            linkArray.push({
                "text": "Download <strong>TAR Ball</strong>",
                "url": ghPageConfig["tar"]
            });
        }

        if (ghPageConfig.hasOwnProperty("github")) {
            linkArray.push({
                "text": "Fork On <strong>GitHub</strong>",
                "url": ghPageConfig["github"]
            });
        }

        if (linkArray.length > 1) {
            var ul = $("<ul />").appendTo($(headerId));
            linkArray.forEach(function (link) {
                tmpHtml = '<li><a href="' + link.url + '">' + link.text + '</a></li>';
                ul.append(tmpHtml);
            });
        }
    }

    function headerModernist() {
        var headerId = "#modernist-page-header";
        $(headerId).html("");
        var tmpText = "";
        var tmpHtml = "";
        var tmpObj;


        if (ghPageConfig.hasOwnProperty("title")) {
            //$("#page-title").append(ghPageConfig["title"]);
            tmpText = ghPageConfig["title"];
            tmpHtml = "<h1>" + tmpText + "</h1>";
            $(headerId).append(tmpHtml);
        }

        if (ghPageConfig.hasOwnProperty("desc")) {
            tmpText = ghPageConfig["desc"];
            tmpHtml = "<p>" + tmpText + "</p>";
            $(headerId).append(tmpHtml);
        }

        if (ghPageConfig.hasOwnProperty("project")) {
            tmpObj = ghPageConfig["project"];
            tmpHtml = '<p class="view"> <a href="' + tmpObj.url + '">View the Project on GitHub<small>' + tmpObj.name + '</small></a></p>';
            $(headerId).append(tmpHtml);
        }

        var linkArray = [];

        if (ghPageConfig.hasOwnProperty("zip")) {
            linkArray.push({
                "text": "Download <strong>ZIP File</strong>",
                "url": ghPageConfig["zip"]
            });
        }

        if (ghPageConfig.hasOwnProperty("tar")) {
            linkArray.push({
                "text": "Download <strong>TAR Ball</strong>",
                "url": ghPageConfig["tar"]
            });
        }

        if (ghPageConfig.hasOwnProperty("github")) {
            linkArray.push({
                "text": "Fork On <strong>GitHub</strong>",
                "url": ghPageConfig["github"]
            });
        }

        if (linkArray.length > 1) {
            var ul = $("<ul />").appendTo($(headerId));
            linkArray.forEach(function (link) {
                tmpHtml = '<li><a href="' + link.url + '">' + link.text + '</a></li>';
                ul.append(tmpHtml);
            });
        }
    }


    function headerSlate() {
        var headerId = "#slate-page-header";
        $(headerId).html("");
        var tmpText = "";
        var tmpHtml = "";
        var tmpObj;


        if (ghPageConfig.hasOwnProperty("github")) {
            tmpText = ghPageConfig["gtihub"];
            tmpHtml = "<a id='forkme_banner' href='" + tmpText + "'> View on Github</a>";
            $(headerId).append(tmpHtml);
        }

        if (ghPageConfig.hasOwnProperty("title")) {
            //$("#page-title").append(ghPageConfig["title"]);
            tmpText = ghPageConfig["title"];
            tmpHtml = "<h1 id='project_title'>" + tmpText + "</h1>";
            $(headerId).append(tmpHtml);
        }

        if (ghPageConfig.hasOwnProperty("desc")) {
            tmpText = ghPageConfig["desc"];
            tmpHtml = "<h2 id='project_tagline'>" + tmpText + "</h2>";
            $(headerId).append(tmpHtml);
        }

        var linkArray = [];

        if (ghPageConfig.hasOwnProperty("zip")) {
            linkArray.push({
                "text": "Download .zip",
                "url": ghPageConfig["zip"]
            });
        }

        if (ghPageConfig.hasOwnProperty("tar")) {
            linkArray.push({
                "text": "Download .tar.gz",
                "url": ghPageConfig["tar"]
            });
        }


        $("#slate-download").html("");
        if (linkArray.length > 1) {
            linkArray.forEach(function (link) {
                tmpHtml = '<a href="' + link.url + '">' + link.text + '</a>';
                $("#slate-download").append(tmpHtml);
            });
        }
    }


    function headerTime() {
        var headerId = "#time-page-header";
        $(headerId).html("");
        var tmpText = "";
        var tmpHtml = "";

        if (ghPageConfig.hasOwnProperty("title")) {

            tmpText = ghPageConfig["title"];
            tmpHtml = "<h1 class='title'>" + tmpText + "</h1>";
            $(headerId).append(tmpHtml);
        }

        $("#time-tagline").html("");
        if (ghPageConfig.hasOwnProperty("desc")) {
            tmpText = ghPageConfig["desc"];
            //tmpHtml = "<h2 id='project_tagline'>" + tmpText + "</h2>";
            $("#time-tagline").append(tmpText);
        }

        //var linkArray = [];
        var obj;

        $("#time-bar").html("");
        $("#time-bottom").html('<a href="#top">Scroll to top</a>');


        if (ghPageConfig.hasOwnProperty("tar")) {
            obj = {
                "text": "Download",
                "text-top": "tar",
                "class": 'tar',
                "url": ghPageConfig["tar"]
            };

            tmpHtml = '<a href="' + obj.url + '" class="download-button ' + obj.class + '"><span>' + obj.text + '</span></a>';
            $("#time-bar").append(tmpHtml);
            tmpHtml = '<a href="' + obj.url + '" class="' + obj.class + '">' + obj.text + '</a>';
            $("#time-bottom").append(tmpHtml);


        }

        if (ghPageConfig.hasOwnProperty("zip")) {
            obj = {
                "text": "Download",
                "text-top": "zip",
                "class": 'zip',
                "url": ghPageConfig["zip"]
            };

            tmpHtml = '<a href="' + obj.url + '" class="download-button ' + obj.class + '"><span>' + obj.text + '</span></a>';
            $("#time-bar").append(tmpHtml);
            tmpHtml = '<a href="' + obj.url + '" class="' + obj.class + '">' + obj.text + '</a>';
            $("#time-bottom").append(tmpHtml);
        }

        if (ghPageConfig.hasOwnProperty("github")) {
            obj = {
                "text": "View Source on GitHub",
                "text-top": "source code",
                "class": 'code',
                "url": ghPageConfig["github"]
            };

            tmpHtml = '<a href="' + obj.url + '" class="' + obj.class + '"><span>' + obj.text + '</span></a>';
            $("#time-bar").append(tmpHtml);
            tmpHtml = '<a href="' + obj.url + '" class="' + obj.class + '">' + obj.text + '</a>';
            $("#time-bottom").append(tmpHtml);
        }

        $("#time-bottom").append('<p class="name"></p>');

    }


    function headerArchitect() {

        var headerId = "#architect-page-header";
        var tmpText = "";
        var tmpHtml = "";
        $(headerId).html("");
        if (ghPageConfig.hasOwnProperty("title")) {
            tmpText = ghPageConfig["title"];
            tmpHtml = "<h1>" + tmpText + "</h1>";
            $(headerId).append(tmpHtml);
        }

        if (ghPageConfig.hasOwnProperty("desc")) {
            tmpText = ghPageConfig["desc"];
            tmpHtml = "<h2 >" + tmpText + "</h2>";
            $(headerId).append(tmpHtml);
        }

        if (ghPageConfig.hasOwnProperty("github")) {

            tmpText = ghPageConfig["gtihub"];
            tmpHtml = "<a href='" + tmpText + "' class='button'><small> View project on</small> GitHub</a>";
            $(headerId).append(tmpHtml);
        }


        $("#sidebar").html("");
        if (ghPageConfig.hasOwnProperty("zip")) {
            tmpText = ghPageConfig["zip"];
            tmpHtml = "<a href='" + tmpText + "' class='button'><small> Download</small> .zip file</a>";
            $("#sidebar").append(tmpHtml);
        }

        if (ghPageConfig.hasOwnProperty("tar")) {
            tmpText = ghPageConfig["tar"];
            tmpHtml = "<a href='" + tmpText + "' class='button'><small> Download</small> .tar file</a>";
            $("#sidebar").append(tmpHtml);
        }


        if (ghPageConfig.hasOwnProperty("footer") && ghPageConfig["footer"].hasOwnProperty("owner")) {
            tmpText = ghPageConfig.footer.owner;
            tmpHtml = "<p class='repo-owner'>" + tmpText + "</p>";
            $("#sidebar").append(tmpHtml);
        }

        if (ghPageConfig.hasOwnProperty("footer") && ghPageConfig["footer"].hasOwnProperty("credits")) {
            tmpText = ghPageConfig.footer.credits;
            tmpHtml = "<p >" + tmpText + "</p>";
            $("#sidebar").append(tmpHtml);
        }

    }


    function addDisqus() {
        //themeContentTag = Setting.theme + "-content";
        //
        //var disqus = '<div id="disqus_thread"></div>' +
        //    '<script>' +
        //    "var disqus_shortname = '" + commentConfig.short_name + "';" +
        //    'var disqus_config = function () {' +
        //    'this.page.url = "' + commentConfig.url + '";' +
        //    'this.page.identifier = "' + commentConfig.key + '"' +
        //    '};' +
        //    '(function() { ' +
        //    ' var d = document,' +
        //    "s = d.createElement('script');" +
        //    "s.src = '//' + disqus_shortname + '.disqus.com/embed.js';" +
        //    "s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s);" +
        //    " })();</script>";
        //$("#" + themeContentTag).append(disqus);
    }


    function addDuoshuo() {
        /*themeContentTag = Setting.theme + "-content";
         var duoshuo = '<div class="ds-thread" data-thread-key="' + commentConfig.key +
         '" data-title="' + commentConfig.title +
         '" data-url="' + commentConfig.url +
         '"></div><script type="text/javascript">var duoshuoQuery = {short_name:"' + commentConfig.short_name +
         '"};(function() {var ds = document.createElement("script");ds.type = "text/javascript";ds.async = true;ds.src = (document.location.protocol == "https:" ? "https:" : "http:") + "//static.duoshuo.com/embed.js";ds.charset = "UTF-8";(document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0]).appendChild(ds);})();</script>';

         $("#" + themeContentTag).append(duoshuo);*/
    }

    function processFooter() {
        if (ghPageConfig.hasOwnProperty("footer") && ghPageConfig["footer"].hasOwnProperty("owner")) {
            $("#" + Setting.theme + "-owner").html(ghPageConfig.footer.owner);
        }

        if (ghPageConfig.hasOwnProperty("footer") && ghPageConfig["footer"].hasOwnProperty("credits")) {
            $("#" + Setting.theme + "-credits").html(ghPageConfig.footer.credits);
        }
    }

    function processMdContent(content) {

        try {
            resetBeforeProcess();
            calTocStart(content);
            setDsConfig(mdName);

            themeContentTag = Setting.theme + "-content";
            $("#" + themeContentTag).html(marked(content));

            handleGHpage();

            replaceImage();

            if (Setting.genToc) {
                genToc();
            }

            if (Setting.highlight == Constants.highlight) {

                $('pre code').each(function (i, block) {
                    hljs.highlightBlock(block);
                });

            } else {
                $("pre").addClass("line-numbers");
                Prism.highlightAll();
            }


            if (Setting.mathjax) {

                if (MathJax.Extension["TeX/AMSmath"] != null) {
                    MathJax.Extension["TeX/AMSmath"].startNumber = 0;
                    MathJax.Extension["TeX/AMSmath"].labels = {};
                }

                MathJax.Hub.Queue(["Typeset", MathJax.Hub, themeContentTag]);
            }

            if (Setting.emoji) {
                emojify.run(document.getElementById(themeContentTag))
            }

            if (Setting.sd) {
                $(".diagram").sequenceDiagram({theme: 'simple'});
            }

            if (Setting.echarts) {
                var chart;
                echartData.forEach(function (data) {

                    if (data.option.theme) {
                        chart = echarts.init(document.getElementById('echarts-' + data.id), data.option.theme);

                    } else {
                        chart = echarts.init(document.getElementById('echarts-' + data.id));

                    }
                    chart.setOption(data.option);
                });
            }

            if (Setting.comment == Constants.disqus) {
                console.log(1111);
                addDisqus();
            }

            if (Setting.comment == Constants.duoshuo) {
                addDuoshuo();
            }

        } catch (e) {
            console.log(e);
            sweetAlert("出错了", "处理文件出现错误，请检查语法", "error");
        }


        $("#loader").css("display", "none");
        $("#gh-container").css("visibility", "visible");


        collapseUpload();
    }

    function refresh() {
        if (targetFile == null) {
            processMdContent(mdContent);
        } else {
            processMdFile(targetFile);
        }
    }

    function clear() {
        localStorage.removeItem(Constants.mdName);
        localStorage.removeItem(Constants.mdContent);
        var url = window.location.href.replace("#theme", "#");
        window.location.href = url;
        window.location.reload();
    }

    function saveMdFile(name, content) {
        if (content.length > maxSize) {
            var sizeTip = $('[data-remodal-id=size-tip]').remodal();
            sizeTip.open();
            removeCacheFile();
            return;
        }
        localStorage.setItem(Constants.mdName, name);
        localStorage.setItem(Constants.mdContent, content);
    }

    function setDsConfig(name) {
        commentConfig.key = name;
        commentConfig.title = name;
        commentConfig.url = name + ".html";
    }

    function removeCacheFile() {
        localStorage.removeItem(Constants.mdName);
        localStorage.removeItem(Constants.mdContent);
    }

    function dragImgEnter(e) {
        e.stopPropagation();
        e.preventDefault();
        $("#img-upload").css("border-color", "#3bafda");
    }

    function dragImgLeave(e) {
        e.stopPropagation();
        e.preventDefault();
        $("#img-upload").css("border-color", "#ddd");
    }

    function dropImgFile(e) {

        e.stopPropagation();
        e.preventDefault();
        var imgModal = $('[data-remodal-id=modal]').remodal();
        imgModal.close();
        $("#img-upload").css("border-color", "#ddd");
        processImages(e.dataTransfer.files)

    }

    function selectImages(e) {

        e.stopPropagation();
        e.preventDefault();
        var imgModal = $('[data-remodal-id=modal]').remodal();
        imgModal.close();
        $("#img-upload").css("border-color", "#ddd");
        processImages(this.files)

    }

    function processImages(imgFiles) {

        var length = imgFiles.length;
        var i, index = 0;

        for (i = 0; i < imgFiles.length; i++) {
            if (!checkImgExt(imgFiles[i].name)) {
                var imgTip = $('[data-remodal-id=img-tip]').remodal();
                imgTip.open();
                return;
            }
        }

        $("#loader").css("display", "block");
        for (i = 0; i < imgFiles.length; i++) {
            var file = imgFiles[i];
            var reader = new FileReader();
            reader.readAsDataURL(file);
            (function (reader, file) {
                reader.onload = function (e) {
                    if (Setting.compressImg) {
                        var image = new Image();
                        image.src = e.target.result;
                        var ext = getImgExtension(file.name);
                        var format = "image/png";
                        if (ext.toLowerCase() == "jpg" || ext.toLowerCase() == "jpeg") {
                            format = "image/jpeg";
                        }
                        cacheImages[file.name] = compressImage(image, format);
                    } else {
                        cacheImages[file.name] = e.target.result;
                    }
                    index++;
                    if (index == length) {
                        replaceImage();
                    }
                }
            })(reader, file);
        }
    }

    function replaceImage() {
        var images = $("img");

        var i;
        for (i = 0; i < images.length; i++) {
            var imgSrc;
            if ($(images[i]).attr("pname") == null) {
                imgSrc = images[i].src;
                $(images[i]).attr("pName", imgSrc);
            } else {
                imgSrc = $(images[i]).attr("pname");
            }

            var imgName = getImgName(imgSrc);
            if (cacheImages.hasOwnProperty(imgName)) {
                images[i].src = cacheImages[imgName];
            }
        }
        $("#loader").css("display", "none");
    }

    function compressImage(img, format) {

        var max_width = 862;
        var canvas = document.createElement('canvas');

        var width = img.width;
        var height = img.height;
        if (format == null || format == "") {
            format = "image/png";
        }

        if (width > max_width) {
            height = Math.round(height *= max_width / width);
            width = max_width;
        }

        // resize the canvas and draw the image data into it
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL(format);
    }


    function calTocStart(mdContent) {
        var heading = /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/igm;
        var match;
        tocTagPos = mdContent.indexOf(Constants.tocTag);
        tocStartIndex = 0;
        if (tocTagPos == -1) {
            hasTocTag = false;
            return;
        }

        hasTocTag = true;
        while ((match = heading.exec(mdContent)) != null) {
            //console.log(match.index);
            if (match.index > tocTagPos) {
                break;
            }
            tocStartIndex++;
        }
    }

    function genToc() {

        var lastLevel = 0;

        var tocLevel = Setting.tocLevel;
        var i, j, singleToc;
        var tocHtml = "";
        var ulCount = 0;
        minLevel = 5;

        for (i = tocStartIndex; i < toc.length; i++) {
            singleToc = toc[i];
            if (singleToc.level < minLevel) {
                minLevel = singleToc.level;
            }
        }
        lastLevel = minLevel - 1;

        for (i = tocStartIndex; i < toc.length; i++) {
            singleToc = toc[i];

            if (singleToc.level > tocLevel) {
                continue;
            }
            if (lastLevel > singleToc.level) {
                for (j = lastLevel - singleToc.level; j >= 0; j--) {
                    tocHtml += "</ul>";
                    ulCount--;
                }
                tocHtml += "<ul>"
                ulCount++;
            }

            if (lastLevel < singleToc.level) {
                for (j = singleToc.level - lastLevel; j > 0; j--) {
                    tocHtml += "<ul>";
                    ulCount++;
                }

            }
            tocHtml += "<li><a href='#" + singleToc.slug + "'>" + singleToc.title + "</a></li>"
            lastLevel = singleToc.level;
        }

        for (i = 0; i < ulCount; i++) {
            tocHtml += "</ul>"
        }

        if (hasTocTag) {
            var content = $("#" + themeContentTag).html();
            content = content.replace(Constants.tocTag, tocHtml);
            $("#" + themeContentTag).html(content);
        } else {
            $("#" + themeContentTag).prepend(tocHtml);
        }
    }

    function loadCacheFile() {
        var file = localStorage.getItem(Constants.mdContent);
        if (file == null || file == "") {
            $("#loader").css("display", "none");
            return;
        }

        mdName = localStorage.getItem(Constants.mdName);
        //console.log(mdName);
        mdContent = file;
        processMdContent(mdContent);
        $("#loader").css("display", "none");
    }

    function addThemeJs() {
        console.log(Setting.theme);
        switch (Setting.theme) {
            case Theme.minimal:
                console.log(222);
                var filename = "/assets/theme/minimal/js/scale.fix.js"
                var fileRef = document.createElement('script');
                fileRef.setAttribute("type", "text/javascript");
                fileRef.setAttribute("src", filename);
                fileRef.onload = function () {

                };
                document.body.appendChild(fileRef);

                break;

            case Theme.time:

                var filename = "/assets/theme/time/js/script.js"
                var fileRef = document.createElement('script');
                fileRef.setAttribute("type", "text/javascript");
                fileRef.setAttribute("src", filename);
                fileRef.onload = function () {

                };
                document.body.appendChild(fileRef);

                break;
        }


    }

    function loadSetting() {
        var tmpSetting = localStorage.getItem(Constants.setting);
        if (tmpSetting != null) {


            tmpSetting = JSON.parse(tmpSetting);
            for (var key in tmpSetting) {
                var newValue = tmpSetting[key];
                if (newValue === undefined) {
                    console.warn('\'' + key + '\' parameter is undefined.');
                    continue;
                }
                if (key in Setting) {
                    Setting[key] = newValue;
                }
            }

            var sname = localStorage.getItem(Constants.DHShort);
            if (sname != null) {
                commentConfig.short_name = sname;
            }
        }

        //Setting.theme = Theme.time;

        console.log(Setting.theme);
        $("#" + Setting.theme).css("display", "block");

        //document.getElementById('test-mod').disabled = true;


        $("[prefix*='" + Setting.theme + "']").prop("rel", "stylesheet");
        $("[prefix*='" + Setting.theme + "']").prop("disabled", false);
        addThemeJs();
    }

    function saveSetting() {
        processMdContent(mdContent);
        localStorage.setItem(Constants.setting, JSON.stringify(Setting));
    }

    function addSetting() {

        $("[name='set']").each(function (index, ele) {

            $(ele).prop("checked", Setting[$(ele).attr("ref")]);
            $(ele).change(function (e) {
                //console.log($(ele).is(":checked"))
                Setting[$(ele).attr("ref")] = $(ele).is(":checked");
                saveSetting();
            })
        });

        $("#s_toc").prop("checked", Setting['genToc']);
        $("#toc-level").val(Setting['tocLevel']);

        $("#s_toc").change(function (e) {
            Setting["genToc"] = $("#s_toc").is(":checked");

            if (Setting["genToc"]) {
                $("#toc-level").prop("disabled", false);
            } else {
                $("#toc-level").prop("disabled", true);
            }
            saveSetting();
        });

        $("#toc-level").change(function (e) {
            var val = parseInt($("#toc-level").val());
            if (val < 1) {
                val = 1;
            }
            if (val > 5) {
                val = 5;
            }
            Setting["tocLevel"] = val;
            $("#toc-level").val(val);
            saveSetting();
        });


        $("#s_" + Setting["highlight"]).prop("checked", true);
        $("[name='high']").each(function (index, ele) {
            $(ele).change(function (e) {
                var text = $(ele).prop("id");
                if (text == "s_highlight") {
                    Setting["highlight"] = Constants.highlight;
                } else {
                    Setting["highlight"] = Constants.prism;
                }
                saveSetting();
            })
        });

        /*$("#s_" + Setting["theme"]).prop("checked", true);*/


        $("#s_" + Setting["theme"]).prop("checked", true);
        $("[name='theme']").each(function (index, ele) {
            $(ele).change(function (e) {
                //$("#" + Setting["theme"]).css("display", "none");
                var text = $(ele).prop("id").substring(2);
                Setting["theme"] = text;
                //console.log(text);
                //if (text == "s_highlight") {
                //    Setting["highlight"] = Constants.highlight;
                //} else {
                //    Setting["highlight"] = Constants.prism;
                //}
                //saveSetting();
                //
                //localStorage.removeItem(Constants.mdName);
                //localStorage.removeItem(Constants.mdContent);

                localStorage.setItem(Constants.setting, JSON.stringify(Setting));
                var url = window.location.href.replace("#theme", "#");
                window.location.href = url;
                window.location.reload();
                //clear();


            })
        });


        $("#s_" + Setting["comment"]).prop("checked", true);
        $("[name='comment']").each(function (index, ele) {
            $(ele).change(function (e) {
                //$("#" + Setting["theme"]).css("display", "none");
                var text = $(ele).prop("id").substring(2);
                Setting["comment"] = text;
                saveSetting();


            })
        });
        //switch (Setting.theme) {
        //    case Theme.cayman:
        //        $("#s_" + Theme.cayman).prop("checked", true);
        //        break;
        //    case Theme.minimal:
        //        $("#s_" + Theme)
        //}


    }

    function getLinkStr(cssFile) {
        return '<link href="' + cssFile + '" rel="stylesheet" type="text/css">';
    }

    function getScriptStr(jsFile) {
        return '<script type="text/javascript" src="' + jsFile + '"></script>'
    }

    function exportHtml() {

        var urlPrefix = "http://localhost:81/";
        var themeCssFiles = {
            cayman: [
                "http://cdn.bootcss.com/highlight.js/9.9.0/styles/github.min.css",
                "http://cdn.bootcss.com/prism/9000.0.1/themes/prism.min.css",
                "https://fonts.css.network/css?family=Open+Sans:400,700",
                urlPrefix + "dist/theme/cayman/css/normalize.min.css",
                urlPrefix + "dist/theme/cayman/css/cayman.min.css",
                urlPrefix + "dist/css/custom-theme/common.min.css"
            ],

            minimal: [
                "http://cdn.bootcss.com/highlight.js/9.9.0/styles/github.min.css",
                "http://cdn.bootcss.com/prism/9000.0.1/themes/prism.min.css",
                urlPrefix + "dist/theme/minimal/css/minimal.min.css",
                urlPrefix + "dist/css/custom-theme/common.min.css",
                urlPrefix + "dist/css/custom-theme/custom-minimal.min.css"
            ],

            modernist: [
                "http://cdn.bootcss.com/highlight.js/9.9.0/styles/agate.min.css",
                "http://cdn.bootcss.com/prism/9000.0.1/themes/prism-twilight.min.css",
                "https://fonts.css.network/css?family=Lato:300italic,700italic,300,700",
                urlPrefix + "dist/theme/modernist/css/modernist.min.css",
                urlPrefix + "dist/css/custom-theme/common.min.css",
                urlPrefix + "dist/css/custom-theme/custom-modernist.min.css"
            ],

            slate: [
                "http://cdn.bootcss.com/highlight.js/9.9.0/styles/agate.min.css",
                "http://cdn.bootcss.com/prism/9000.0.1/themes/prism-twilight.min.css",
                "https://fonts.css.network/css?family=Roboto:400,400italic,700italic,700",
                "https://fonts.css.network/css?family=Roboto+Condensed:300,300italic,700,700italic",
                urlPrefix + "dist/theme/slate/css/normalize.min.css",
                urlPrefix + "dist/theme/slate/css/slate.min.css",
                urlPrefix + "dist/css/custom-theme/common.min.css",
                urlPrefix + "dist/css/custom-theme/custom-slate.min.css"
            ],
            time: [
                "http://cdn.bootcss.com/highlight.js/9.9.0/styles/agate.min.css",
                "http://cdn.bootcss.com/prism/9000.0.1/themes/prism-twilight.min.css",
                urlPrefix + "dist/theme/time/css/time.min.css",
                urlPrefix + "dist/css/custom-theme/common.min.css",
                urlPrefix + "dist/css/custom-theme/custom-time.min.css"
            ],

            architect: [
                "http://cdn.bootcss.com/highlight.js/9.9.0/styles/github.min.css",
                "http://cdn.bootcss.com/prism/9000.0.1/themes/prism.min.css",
                "https://fonts.css.network/css?family=Architects+Daughter",
                urlPrefix + "dist/theme/architect/css/architect.min.css",
                urlPrefix + "dist/css/custom-theme/common.min.css",
                urlPrefix + "dist/css/custom-theme/custom-architect.min.css"
            ]
        };

        var themeJsFiles = {
            minimal: [
                urlPrefix + "dist/theme/minimal/js/scale.fix.min.js"
            ],
            modernist: [
                urlPrefix + "dist/theme/modernist/js/scale.fix.min.js"
            ],
            time: [
                urlPrefix + "dist/theme/time/js/script.min.js"
            ]
        };

        var htmlContent = "";
        var styleFiles = "";
        var jsFiles = "";
        var styleContent = "";
        var jsContent = "";
        var hasAddJquery = false;

        var tmpCssFiles = themeCssFiles[Setting.theme];
        if (Setting.highlight == Constants.highlight) {
            styleFiles += getLinkStr(tmpCssFiles[0]);
        } else {
            styleFiles += getLinkStr(tmpCssFiles[1]);
        }
        console.log(tmpCssFiles)
        var i;
        for (i = 2; i < tmpCssFiles.length; i++) {
            styleFiles += getLinkStr(tmpCssFiles[i]);
        }

        if (Setting.highlight == Constants.prism) {
            styleFiles += getLinkStr("http://cdn.bootcss.com/prism/9000.0.1/plugins/line-numbers/prism-line-numbers.min.css");
        }


        //if (Setting.highlight == Constants.highlight) {
        //    styleContent += '<link href="http://cdn.bootcss.com/highlight.js/9.8.0/styles/atom-one-light.min.css" rel="stylesheet">';
        //} else {
        //    styleContent += '<link href="http://cdn.bootcss.com/prism/9000.0.1/themes/prism.min.css" rel="stylesheet">'
        //    styleContent += '<link href="http://cdn.bootcss.com/prism/9000.0.1/plugins/line-numbers/prism-line-numbers.min.css" rel="stylesheet">';
        //}

        //if (Setting.emoji) {
        //    styleContent += '<link href="http://cdn.bootcss.com/emojify.js/1.1.0/css/basic/emojify.min.css" rel="stylesheet">';
        //}

        if (Setting.emoji) {
            styleFiles += getLinkStr("http://cdn.bootcss.com/emojify.js/1.1.0/css/basic/emojify.min.css");
        }

        var preMajax = Setting.mathjax;
        var preEcharts = Setting.echarts;

        if (preMajax) {
            Setting.mathjax = false;
            exportSetting.mathjax = true;
        }

        if (preEcharts) {
            Setting.echarts = false;
            exportSetting.echarts = true;
        }

        processMdContent(mdContent);


        if(Setting.comment == Constants.duoshuo) {
            var div = '<div class="ds-thread" data-thread-key="' + commentConfig.key +
                '" data-title="' + commentConfig.title +
                '" data-url="' + commentConfig.url + '"></div>';
            $("#" + themeContentTag).append(div);

        }

        if(Setting.comment == Constants.disqus) {
            var div = '<div id="disqus_thread"></div>';
            $("#" + themeContentTag).append(div);
        }

        htmlContent = $("#" + Setting.theme).html();

        Setting.mathjax = preMajax;
        Setting.echarts = preEcharts;
        exportSetting.mathjax = false;
        exportSetting.echarts = false;

        processMdContent(mdContent);


        if (Setting.mathjax) {
            jsContent += '<script type="text/x-mathjax-config">' +
                "MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\\\(','\\\\)']]}, " +
                'TeX: {equationNumbers: {autoNumber: ["AMS"],useLabelIds: true}},' +
                '"HTML-CSS": {linebreaks: {automatic: true}},' +
                'SVG: {linebreaks: {automatic: true}}' +
                "});" +
                "</script>" +
                '<script type="text/javascript" src="http://cdn.bootcss.com/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>';
        }

        if (Setting.backtop) {

            hasAddJquery = true;
            styleFiles += getLinkStr("http://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css");
            styleFiles += getLinkStr(urlPrefix + "dist/css/backtotop.min.css");
            jsContent += getScriptStr("http://cdn.bootcss.com/jquery/3.1.1/jquery.min.js");
            jsContent += getScriptStr(urlPrefix + "dist/js/backtotop.min.js");
            jsContent += '<script type="text/javascript">backToTop.init()</script> '

            //styleContent += '<link href="http://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">';
            //styleContent += ' <link rel="stylesheet" href="http://markdown.zhangjikai.com/dist/css/backtotop.min.css">';
            //jsContent += '<script src="http://cdn.bootcss.com/jquery/3.1.1/jquery.min.js"></script>';
            //jsContent += '<script type="text/javascript" src="http://markdown.zhangjikai.com/dist/js/backtotop.min.js"></script>';
            //jsContent += '<script type="text/javascript">backToTop.init()</script> '
        }

        if (Setting.comment == Constants.duoshuo) {


            jsContent += '<script type="text/javascript">var duoshuoQuery = {short_name:"' + commentConfig.short_name +
                '"};(function() {var ds = document.createElement("script");ds.type = "text/javascript";ds.async = true;ds.src = (document.location.protocol == "https:" ? "https:" : "http:") + "//static.duoshuo.com/embed.js";ds.charset = "UTF-8";(document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0]).appendChild(ds);})();</script>';
        }

        if (Setting.comment == Constants.disqus) {



            jsContent += '<script type="text/javascript">' +
                "var disqus_shortname = '" + commentConfig.short_name + "';" +
                'var prefix = document.location.protocol == "https:" ? "https:" : "http:"' +
                'var disqus_config = function () {' +
                'this.page.url = "' + commentConfig.url + '";' +
                'this.page.identifier = "' + commentConfig.key + '"' +
                '};' +
                '(function() { ' +
                ' var d = document,' +
                "s = d.createElement('script');" +
                "s.src = prefix + '//' + disqus_shortname + '.disqus.com/embed.js';" +
                "s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s);" +
                " })();</script>";
        }

        if (Setting.echarts) {

            jsContent += getScriptStr("http://cdn.bootcss.com/echarts/3.3.2/echarts.min.js");
            echartData.forEach(function (data) {
                var themeObj = {};
                if (data.option.theme) {
                    if (!themeObj.hasOwnProperty(data.option.theme)) {
                        if (echartThemeText.indexOf(data.option.theme) != -1) {
                            jsContent += getScriptStr(urlPrefix + 'dist/js/echarts-theme/' + data.option.theme + '.min.js');
                        }
                        themeObj[data.option.theme] = "theme";
                    }
                }
            });
            jsContent += '<br />';

            jsContent += '<script type="text/javascript"> ';
            echartData.forEach(function (data, index) {
                var theme = "";

                if (data.option.theme) {
                    theme = data.option.theme;
                }
                jsContent += 'var chart' + index + ' = echarts.init(document.getElementById("echarts-' + data.id + '"),"' + theme + '");\n' +
                    'var option' + index + ' = ' + data.previousOption + ';\n' +
                    'chart' + index + '.setOption(option' + index + ');\n';
            });
            jsContent += "</script>";
        }

        if (Setting.theme == Theme.time && !hasAddJquery) {
            jsContent += getScriptStr("http://cdn.bootcss.com/jquery/3.1.1/jquery.min.js");
        }

        var tmpJsFiles = themeJsFiles[Setting.theme];
        if (tmpJsFiles != null ) {
            for (i = 0; i < tmpJsFiles.length; i++) {
                jsContent += getScriptStr(tmpJsFiles[i]);
            }
        }

        var htmlContent = '<!DOCTYPE html>' +
            '<html>' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1">' +
            '<title>' +
            mdName +
            '</title>' +
            styleFiles +
            '</head>' +
            '<body>' +
            htmlContent +
            jsContent +
            '</body>' +
            '</html>';

        var name = mdName + ".html";
        if (Setting.format) {
            htmlContent = html_beautify(htmlContent, {indent_size: 4});
        }
        //var blob = new Blob([html_beautify(htmlContent, {indent_size: 4})], {type: "text/html;charset=utf-8"});
        var blob = new Blob([htmlContent], {type: "text/html;charset=utf-8"});
        saveAs(blob, name);
    }

    function collapseUpload() {
        $("#fold").removeClass("fa-minus-square");
        $("#fold").addClass("fa-plus-square");
        $("#upload-area").addClass("upload-area-close");
        $("#fold").attr("expand", false);
    }


    function delExtension(str) {
        return str.substr(0, str.lastIndexOf('.')) || str;
    }

    function getImgName(path) {
        return path.substr(path.lastIndexOf('/') + 1);
    }

    function getImgExtension(str) {
        return str.substr(str.lastIndexOf(".") + 1) || str;
    }

    function checkMdExt(name) {
        var re = /(\.md|\.markdown|\.txt|\.mkd|\.text)$/i;
        if (re.test(name)) {
            return true;
        } else {
            return false;
        }
    }

    function checkImgExt(name) {
        var re = /(\.png|\.jpg|\.gif|\.bmp)$/i;
        if (re.test(name)) {
            return true;
        } else {
            return false;
        }
    }

    fileSelect.addEventListener("dragenter", dragMdEnter, false);
    fileSelect.addEventListener("dragleave", dragMdLeave, false);
    fileSelect.addEventListener('drop', dropMdFile, false);
    fileSelect.addEventListener("change", selectMdFile, false);

    imgSelect.addEventListener("dragenter", dragImgEnter, false);
    imgSelect.addEventListener("dragleave", dragImgLeave, false);
    imgSelect.addEventListener('drop', dropImgFile, false);
    imgSelect.addEventListener('change', selectImages, false);


    $("#fold").click(function () {
        if ($("#fold").attr("expand") == "true") {
            $("#fold").removeClass("fa-minus-square");
            $("#fold").addClass("fa-plus-square");
            $("#upload-area").addClass("upload-area-close");
            $("#fold").attr("expand", false);
        } else {
            $("#fold").removeClass("fa-plus-square");
            $("#fold").addClass("fa-minus-square");
            $("#upload-area").removeClass("upload-area-close");
            $("#fold").attr("expand", true);
        }
    });

    $("#export").click(exportHtml);


    $("#refresh").click(function () {
        refresh();
    });

    $("#clear").click(clear);

    emojify.setConfig({
        emojify_tag_type: 'div',           // Only run emojify.js on this element
        only_crawl_id: null,            // Use to restrict where emojify.js applies
        img_dir: 'http://cdn.bootcss.com/emojify.js/1.0/images/basic',  // Directory for emoji images
        ignored_tags: {                // Ignore the following tags
            'SCRIPT': 1,
            'TEXTAREA': 1,
            'A': 1,
            'PRE': 1,
            'CODE': 1
        }
    });

    backToTop.init({
        theme: 'classic', // Available themes: 'classic', 'sky', 'slate'
        animation: 'fade' // Available animations: 'fade', 'slide'
    });


    $('[custom-type="custom"]').prop("disabled", true);
    loadSetting();
    addSetting();
    loadCacheFile();

}());

