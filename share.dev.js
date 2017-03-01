/*
* @File         share.dev.js
* @Author       Mr.Cai
* @Date         2016-11-15
* @Contact      Email:297372788@qq.com  QQ:297372788
* @Modify Date  2017-02-28
*/
var mobileShare = function (id,config) {
    var shareBtn = document.getElementById(id);
    var Base64 = {
        encode : function(str){
            return window.btoa(unescape(encodeURIComponent(str)));
        },
        decode : function(str){
            return decodeURIComponent(escape(window.atob(str)));
        }
    };
    var UA = navigator.userAgent;
    this.deviceDetect = function(dev){
        return UA.indexOf(dev) !== -1;
    };
    this.getVersion = function (ver) {
        var a = ver.split("."), b = parseFloat(a[0] + "." + a[1]);
        return b;
    };
    var isQQBrowser = deviceDetect("MQQBrowser"),
        isUCBrowser = deviceDetect("UCBrowser"),
        isWeixin = deviceDetect("MicroMessenger"),
        isIOS = deviceDetect("iPhone") || deviceDetect("iPad") || deviceDetect("iPod"),
        isAndroid = deviceDetect("Android"),
        QQversion = isQQBrowser ? getVersion(UA.split("MQQBrowser/")[1]) : 0,
        UCversion = isUCBrowser ? getVersion(UA.split("UCBrowser/")[1]) : 0,
        iOSVersion = isIOS ? UA.split("OS")[1].split("_")[0] : 0;
    var supportNativeShare = false;
    if ((isIOS && UCversion >= 10.2) 
        || (isAndroid && UCversion >= 9.7)
        || QQversion >= 5.4 && !isWeixin) {
        supportNativeShare = true;
    }
    config = config || {};
    var url = config.url || document.location.href,
        title = config.title || document.title,
        desc = config.desc,
        img = config.img || document.getElementsByTagName('img').length > 0 && document.getElementsByTagName('img')[0].src;
    var apiList = {
        Weibo: ['http://service.weibo.com/share/share.php?url={url}&title={title}&pic={img}',''],
        QQ: ['http://connect.qq.com/widget/shareqq/index.html?url={url}&title={title}&pics={img}','mqqapi://share/to_fri?src_type=web&version=1&file_type=news'],
        QZone: ['http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={url}&title={title}&pics={img}','mqqapi://share/to_qzone?src_type=web&version=1&file_type=news&req_type=1']
    };
    /*载入样式*/
    this.loadCss = function(){
        var js = document.scripts, script = js[js.length - 1], jsPath = script.src;
        var path = jsPath.substring(0, jsPath.lastIndexOf("/") + 1);
        if(script.getAttribute('merge')) return;
        /*如果合并方式加载js，则需要单独引入样式*/
        document.head.appendChild(function(){
            var link = document.createElement('link');
            link.href = path + 'icon/style.css';
            link.rel = 'styleSheet';
            return link;
        }());
    };
    this.loadHtml = function() {
        var div = document.createElement('div');
            div.id = "mobileShare";
            div.style.display = "none";
            div.innerHTML = '<div id="mask" onclick="closeShare()"></div>'
            +(isWeixin ? '<div class="tips"><i></i><p>点击右上角<br>分享到朋友圈或指定的朋友</p></div>' : '<div class="share"><ul><li data-app="Weibo" class="weibo"><i></i>新浪微博</li><li data-app="QQ" class="qq"><i></i>QQ好友</li><li data-app="QZone" class="qzone"><i></i>QQ空间</li></ul><a href="javascript:closeShare();">取消</a></div>');
        document.body.appendChild(div);
    };
    this.loadQQJs = function () {
        if (isQQBrowser) {
            var src = QQversion < 5.4 ? "http://3gimg.qq.com/html5/js/qb.js" : "http://jsapi.qq.com/get?api=app.share";
            var script = document.createElement("script");
            script.src = src;
            document.body.appendChild(script);
        }
    };
    this.share = function (to_app) {
        /*在普通浏览器里，使用URL Scheme唤起QQ客户端进行分享*/
        var scheme = appendToQuerysting(apiList[to_app][1], {
            share_id: '1101685683',
            url: Base64.encode(url),
            title: Base64.encode(title),
            description: Base64.encode(desc),
            previewimageUrl: Base64.encode(img),
            image_url: Base64.encode(img)
        });
        if(to_app=='Weibo'){
            openAppByApi(apiList[to_app][0]);
        }else{
            openAppByScheme(scheme);
        }
    };
    
    this.openAppByApi = function(api){
        var shareInfo = {
            url: url,
            title: title,
            img: img
        };
        for (k in shareInfo) {
            api = api.replace('{'+k+'}', encodeURIComponent(shareInfo[k]));
        }
        window.open(api);
    };
    this.appendToQuerysting = function(url, obj) {
        var arr = [];
        for(var k in obj) {
            arr.push(k + '=' + encodeURIComponent(obj[k]));
        }
        return url + (url.indexOf('?') !== -1 ? '&' : '?') + arr.join('&');
    };
    this.openAppByScheme = function(scheme) {
        if (iOSVersion > 8) {
            window.location.href = scheme;
        } else {
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = scheme;
            document.body.appendChild(iframe);
            setTimeout(function() {
              iframe && iframe.parentNode && iframe.parentNode.removeChild(iframe);
            }, 1000);
        }
    };
    loadCss();
    loadQQJs();
    if(!supportNativeShare){
        loadHtml();
        var custom = document.getElementById("mobileShare");
        this.closeShare = function(){
            custom.className="";
            document.getElementById("mask").style.display="none";
        };
        var items = custom.getElementsByTagName("li");
        for (var i=0;i<items.length;i++) {
            items[i].onclick = function(){
                share(this.getAttribute('data-app'));
            }
        }
    }
    shareBtn.onclick = function(){
        /*对支持原生分享的UC,QQ浏览器直接调用原生*/
        if(supportNativeShare){
            if (isUCBrowser) {
                /*android*/
                if (window.ucweb) {
                    ucweb.startRequest('shell.page_share', ['','','','','','','']);
                }
                /*ios*/
                if (window.ucbrowser) {
                    ucbrowser.web_share(['','','','','','','']);
                }
            }
            if (isQQBrowser){
                if (window.browser) {
                    browser.app.share({to_app:''});
                }
                if (window.qb) {
                    window.qb.share({to_app:''});
                }
            }
        }else{
            /*普通浏览器调用自定义分享*/
            custom.style.display="block";
            setTimeout(function(){custom.className="show"},0);
            document.getElementById("mask").style.display="block";
        }
    };
};
