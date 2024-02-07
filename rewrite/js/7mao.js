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
  if (obj?.init?.is_show_ad) {
    obj.init.is_show_ad = "0";
  }

  if (obj?.init?.voice_free_chapter_count) {
    obj.init.voice_free_chapter_count = "999";
  }

  if (obj?.adv?.config) {
    obj.adv.config.ad_format = "0";
    obj.adv.config.auto_download_material = "0";
    obj.adv.config.material_cache_time = 1;
    obj.adv.config.popuplimit = 0;
  }

  if (obj?.params) {
    obj.params.ad_program_switch = 0;
    obj.params.ad_personal_switch = 0;
    obj.params.vip_status = 1;
  }
} else if (url.indexOf("/init/other-data") != -1) {
  if (obj?.data?.main_activities) {
    obj.data.main_activities = null;
  }
} else if (url.indexOf("/vip/index") != -1) {
  if (obj?.data?.users) {
    obj.data.users.isLifetimeVip = "1";
    obj.data.users.year_vip_show = "1";
    obj.data.users.isVip = "1";
  }
}

body = JSON.stringify(obj);
$done({ body });
