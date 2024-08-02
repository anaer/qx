var url = $request.url;
var obj = JSON.parse(
  (typeof $response != "undefined" && $response.body) || null
);

if (url.indexOf("/user") != -1) {
  // 我的页面
  if (obj.result) {
    obj.result.svip_given = 730;
    obj.result.is_phone_verified = true;
    obj.result.is_xy_vip = true;
    obj.result.vip_expired_at = 4030000000.16;
    obj.result.is_vip = true;
    obj.result.xy_svip_expire = 4030000000.16;
    if (obj.result.wt) {
      if (obj.result.wt.vip) {
        obj.result.wt.vip.enabled = true;
        obj.result.wt.vip.expired_at = 4030000000.16;
        obj.result.wt.vip.svip_expired_at = 4030000000.16;
      }
      obj.result.wt.svip_given = 730;
    }
    obj.result.is_primary = true;
    obj.result.xy_vip_expire = 4030000000.16;
    obj.result.svip_expired_at = 4030000000.16;
    obj.result.vip_type = "s";
  }
}

if (url.indexOf("/vip_info") != -1) {
  // 我的页面
  if (obj.vip) {
    obj.vip.expires_time = "4030000000";
  }
  if (obj.svip) {
    obj.svip.expires_time = "4030000000";
  }
}

if (url.indexOf("v1/activity") != -1) {
  // 隐藏彩云AI
  if (url.indexOf("&type_id=A03&") != -1) {
    if (obj?.interval) {
      obj.interval = 2592000; // 30天===2592000秒
    }
    if (obj?.activities?.length > 0) {
      let newActs = [];
      for (let item of obj.activities) {
        if (item?.feature) {
          item.feature = false;
        }
        newActs.push(item);
      }
      obj.activities = newActs;
    }
  } else {
    if (obj?.activities?.length > 0){
      obj.activities = [];
    }
  }
}

if (url.indexOf("/operation/homefeatures") != -1) {
    obj.data = [];
}

if (url.indexOf("/operation/feeds") != -1) {
    obj.data = obj.data.filter(
      (e) => -1!= e.category_times_text.indexOf("人查看")
    );
}

if (url.indexOf("/operation/features") != -1) {
    obj.data = obj.data.filter((e) => -1 != e.url.indexOf("cy://"));
}

if (url.indexOf("/operation/banners") != -1) {
    obj.data = [
      {
        avatar:
          "https://cdn-w.caiyunapp.com/p/app/operation/prod/banner/668502d5c3a2362582a2a5da/d9f198473e7f387d13ea892719959ddb.jpg",
        url: "https://cdn-w.caiyunapp.com/p/app/operation/prod/article/66850143c3a2362582a2a5d9/index.html",
        title: "暴雨来袭，这些避险“秘籍”你学会了吗？",
        banner_type: "article",
      },
    ]
}

if (url.indexOf("/campaigns") != -1) {
  obj.campaigns = []
}

body = JSON.stringify(obj);
$done({ body });
