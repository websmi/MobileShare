#MobileShare
移动端原生分享，支持调用UC，QQ原生，微信端提示右上角分享
1、仅需调用share.js，无其他库依赖
2、支持微信,QQ,微博的原生应用分享(借用UC浏览器或者QQ浏览器或者URL scheme进行)
3、图标及样式打包在js里，无需额外请求

#使用方法

为调用标签设定id 写入配置即可

```javascript
mobileShare('share',{
    title:'分享标题',
    desc:'分享内容简介',
    img:''//分享图片地址为空自动获取页面内第一张图片
});
```
