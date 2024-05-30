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
  
  if (obj?.data?.quit_pop_config?.quit_pop_switch) {
    obj.data.quit_pop_config.quit_pop_switch = "0";
  }
  
} else if (url.indexOf("/splash/index") != -1) {
  if (obj?.data?.init) {
    obj.data.init.is_show_ad = "0";
    obj.data.reward_upper_limit = "10";
    obj.data.init.voice_free_chapter_count = "999";
  }

  if (obj?.data?.adv) {
    obj.data.adv = [];
  }

  if (obj?.params) {
    obj.params.ad_unit_id = "";
    obj.params.ad_program_switch  = 0;
    obj.params.ad_personal_switch = 0;
    obj.params.vip_status = 1;
  }
} else if (url.indexOf("/init/other-data") != -1) {
  if (obj?.data) {
    obj.data.main_activities = null;
    obj.data.default_paragraph_comment_switch = "0";
  }
} else if (url.indexOf("/api/v2/init") != -1) {
  if (obj?.data) {
    obj.data.comment_switch = "0";
    obj.data.chapter_comment_switch = "0";
    obj.data.onekey_login_switch = "0";
    obj.data.reward_video_fail_num = "-1";
    obj.data.open_teeny_mode_alert = "0";
  }
} else if (url.indexOf("/vip/index") != -1) {
  if (obj?.data?.activity) {
    obj.data.activity = { "status" : "0", "pop_status" : "0", "id" : "0", "subtitle" : "", "title" : "", "pop_pic" : "", "button_pic" : "", "coupon_status" : "0" };
  }

  if (obj?.data?.users) {
    obj.data.users.isLifetimeVip = "1";
    obj.data.users.time = "1800000000";
    obj.data.users.year_vip_show = "1";
    obj.data.users.isvip = "1";
    obj.data.users.cycle_status = "1";
    obj.data.users.avatar_box = "https://cdn.wtzw.com/bookimg/free/png/17085791857966659.png";
  }
  obj.data.content = [];
} else if (url.indexOf("/user/my-center") != -1) { // 我的页面
  // 开通会员卡片
  if (obj?.data?.user_area?.vip_info) {
    obj.data.user_area.vip_info = {};
  }

  if (obj?.data?.user_area?.base_info) {
    obj.data.user_area.base_info.year_vip_show = "1";
    obj.data.user_area.base_info.avatar_box = "https://cdn.wtzw.com/bookimg/free/png/17085791857966659.png";
    obj.data.user_area.base_info.vip_show_type = "40";
    obj.data.user_area.base_info.is_vip = "1";
    obj.data.user_area.base_info.level_text = "50";
  }

  if (obj?.data?.func_area?.length > 0) {
    let newFuncs = [];
    for (let func of obj.data.func_area) {
      if (["ads", "banner", "topic"]?.includes(func?.type)) {
        continue;
      } else {
        if (func?.type == 'other') {
          func.list = func.list.filter(item => ["person_comment", "download_manage", "setting"].includes(item.type));
        } 
        newFuncs.push(func);
      }
    }
    obj.data.func_area = newFuncs;
  }
} else if (url.indexOf("/user/get-user-info") != -1) {
  if (obj?.data?.is_vip) {
    obj.data.is_vip = "1";
    obj.data.avatar_box = "https://cdn.wtzw.com/bookimg/free/png/17085791857966659.png";
  }
} else if (url.indexOf("/user/page") != -1) {
  if (obj?.data) {
    obj.data.year_vip_show = "1";
    obj.data.avatar_box = "https://cdn.wtzw.com/bookimg/free/png/17085791857966659.png";
    obj.data.is_vip = "1";
    obj.data.level = "50";
    obj.data.level_icon = "https://cdn.wtzw.com/bookimg/free/images/app/1_0_0/level/level_icon_50.png"
  }
} else if (url.indexOf("/chapter/chapter-list") != -1) {
  if (obj?.data?.auto_download) {
    obj.data.auto_download = "1";
  }
} else if (url.indexOf("/download/reader-background") != -1) {
  let newBackgournds = [];
  for (let background of obj.data.backgrounds) {
    background.v = "0";
    newBackgournds.push(background);
  }
  obj.data.backgrounds = newBackgournds;
} else if (url.indexOf("/vip/app/v1/index") != -1) {
  if (obj?.data) {
    obj.data.content = [];
    obj.data.current_index = "";
  }

  if (obj?.data?.users) {
    obj.data.users.isLifetimeVip = "1";
    obj.data.users.time = "1800000000";
    obj.data.users.year_vip_show = "1";
    obj.data.users.isvip = "1";
    obj.data.users.cycle_status = "1";
    obj.data.users.avatar_box = "https://cdn.wtzw.com/bookimg/free/png/17085791857966659.png";
  }
} else if (url.indexOf("/book/change") != -1) {
  if (obj?.data) {
    obj.data.recommend_books = [];
    obj.data.recommend_book_id_list = [];
    obj.data.book = {};
    obj.data.is_recommend = "0";
  }
} else if (url.indexOf("/book-store/reader-recommend") != -1) {
  if (obj?.data) {
    obj.data.books = [];
  }
}

body = JSON.stringify(obj);
$done({ body });
