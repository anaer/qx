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

if (url.includes("v1/activity") != -1) {
  obj.a = 1
  // 隐藏彩云AI
  if (url.includes("&type_id=A03&") != -1) {
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
    obj.b=1
    if (obj?.activities?.length > 0){
      obj.c=1
      obj.activities = [];
    }
  }
}

body = JSON.stringify(obj);
$done({ body });
