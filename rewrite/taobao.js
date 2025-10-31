// 2024-01-12 09:10
// https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/myBlockAds.js

const url = $request.url;
const isResp = typeof $response !== "undefined";
let body = $response.body;

switch (isResp) {
  // 淘宝-开屏视频广告
  case /^https:\/\/guide-acs\.m\.taobao\.com\/gw\/mtop\.taobao\.cloudvideo\.video\.query/.test(url):
    try {
      let obj = JSON.parse(body);
      if (obj?.data?.duration) {
        obj.data.duration = "0";
      }
      if (obj?.data?.resources?.length > 0) {
        obj.data.resources = [];
      }
      if (obj?.data?.caches?.length > 0) {
        obj.data.caches = [];
      }
      if (obj?.data?.respTimeInMs) {
        obj.data.respTimeInMs = "3818332800000";
      }
      body = JSON.stringify(obj);
    } catch (err) {
      console.log(`淘宝-开屏视频广告, 出现异常: ` + err);
    }
    break;
  // 淘宝-开屏图片广告
  case /^https:\/\/guide-acs\.m\.taobao\.com\/gw\/mtop\.taobao\.wireless\.home\.splash\.awesome\.get/.test(url):
    try {
      let obj = JSON.parse(body);
      if (obj?.data?.containers?.splash_home_base) {
        let splash = obj.data.containers.splash_home_base;
        if (splash?.base?.sections?.length > 0) {
          for (let items of splash.base.sections) {
            if ("taobao-splash" in items.bizData) {
              if (items?.bizData?.["taobao-splash"]?.data?.length > 0) {
                for (let item of items.bizData["taobao-splash"].data) {
                  item.waitTime = "0";
                  item.times = "0";
                  item.hotStart = "false";
                  item.haveVoice = "false";
                  item.hideTBLogo = "false";
                  item.enable4G = "false";
                  item.coldStart = "false";
                  item.waitTime = "0";
                  item.startTime = "3818332800000";
                  item.endTime = "3818419199000";
                  item.gmtStart = "2090-12-31 00:00:00";
                  item.gmtEnd = "2090-12-31 23:59:59";
                  item.gmtStartMs = "3818332800000";
                  item.gmtEndMs = "3818419199000";
                  if (item?.imgUrl) {
                    item.imgUrl = "";
                  }
                  if (item?.videoUrl) {
                    item.videoUrl = "";
                  }
                }
              }
            }
          }
        }
      }
      body = JSON.stringify(obj);
    } catch (err) {
      console.log(`淘宝-开屏图片广告, 出现异常: ` + err);
    }
    break;
  // 淘宝-开屏活动
  case /^https:\/\/poplayer\.template\.alibaba\.com\/\w+\.json/.test(url):
    try {
      let obj = JSON.parse(body);
      if (obj?.res?.images?.length > 0) {
        obj.res.images = [];
      }
      if (obj?.res?.videos?.length > 0) {
        obj.res.videos = [];
      }
      if (obj?.enable) {
        obj.enable = false;
      }
      if (obj?.mainRes?.images?.length > 0) {
        obj.mainRes.images = [];
      }
      body = JSON.stringify(obj);
    } catch (err) {
      console.log(`淘宝-开屏活动, 出现异常: ` + err);
    }
    break;

  case /^https:\/\/guide-acs\.m\.taobao\.com\/gw\/mtop\.cainiao\.guoguo\.nbnetflow\.ads\.mshow/.test(url):
      // 首页
    try {
      if (obj?.data) {
        const items = [
          "10", // 物流详情页 底部横图
          "498", // 物流详情页 左上角
          "328", // 3位数为家乡版本
          "366",
          "369",
          "615",
          "616",
          "727",
          "793", // 支付宝 小程序 搜索框
          "954", // 支付宝 小程序 置顶图标
          "1275", // 果酱即将到期
          "1308", // 支付宝 小程序 横图
          "1316", // 头部 banner
          "1332", // 我的页面 横图
          "1340", // 查快递 小妙招
          "1391", // 支付宝 小程序 寄包裹
          "1410", // 导入拼多多、抖音快递
          "1428", // 幸运号
          "1524", // 抽现金
          "1525", // 幸运包裹
          "1638", // 为你精选了一些商品
          "1910" // 618促销红包
        ];
        for (let i of items) {
          if (obj.data?.[i]) {
            delete obj.data[i];
          }
        }
      }
      body = JSON.stringify(obj);
    } catch (err) {
      console.log(`淘宝-开屏活动, 出现异常: ` + err);
    }
    break;
  default:
    $done({});
}

$done({ body });