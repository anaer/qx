var url = $request.url;
var obj = JSON.parse($response.body);

if (url.indexOf("/reader-copy-paragraph-all.json") != -1) {
  obj = { data: { vip_list: [], list: [] } };
} else if (url.indexOf("/extra/init") != -1) {
  if (obj?.data?.reader_floats?.length > 0) {
    obj.data.reader_floats = [];
    console.log("设置reader_floats为空");
  }

  if (obj?.data?.reader_top_banner?.length > 0) {
    obj.data.reader_top_banner = [];
    console.log("设置reader_top_banner为空");
  }
} else if (url.indexOf("/splash/index") != -1) {
  if (obj?.data?.init?.is_show_ad) {
    obj.data.init.is_show_ad = "0";
  }

  if (obj?.data?.adv?.config) {
    obj.data.adv.config.auto_download_material = "0";
    obj.data.adv.config.popuplimit = 1;
  }

  if (obj?.params) {
    obj.params.vip_status = 1;
  }
} else if (url.indexOf("/init/other-data") != -1) {
  if (obj?.data?.main_activities) {
    obj.data.main_activities = null;
  }
} else if (url.indexOf("/api/v2/init") != -1) {
  if (obj?.data?.reward_video_fail_num) {
    obj.data.reward_video_fail_num = "0";
  }
} else if (url.indexOf("/vip/index") != -1) {
  if (obj?.data?.users) {
    obj.data.users.isLifetimeVip = "1";
    obj.data.users.year_vip_show = "1";
    obj.data.users.isvip = "1";
  }
  obj.data.content = [];
} else if (url.indexOf("/user/my-center")) {
  if (obj?.data?.user_area?.base_info) {
    obj.data.user_area.base_info.year_vip_show = "1";
    obj.data.user_area.base_info.vip_show_type = "40";
    obj.data.user_area.base_info.is_vip = "1";
  }

  // 我的页面
  if (obj?.data?.user_area?.vip_info) {
    // 开通会员卡片
    obj.data.user_area.vip_info = {};
  }
  if (obj?.data?.func_area?.length > 0) {
    let newFuncs = [];
    for (let func of obj.data.func_area) {
      if (["ads", "banner", "topic"]?.includes(func?.type)) {
        continue;
      } else {
        newFuncs.push(func);
      }
    }
    obj.data.func_area = newFuncs;
  }
} else if (url.indexOf("/user/get-user-info")) {
  if (obj?.data?.is_vip) {
    obj.data.is_vip = "1";
  }
  
  obj.data.reader_background = [{"id" : "3", "name" : "大漠孤烟","expire_time" : "1808007993"}]
}

body = JSON.stringify(obj);
$done({ body });
