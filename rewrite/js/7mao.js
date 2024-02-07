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
} else if (url.indexOf("/splash/index0") != -1) {
  if (obj?.data?.init?.is_show_ad) {
    obj.data.init.is_show_ad = "0";
  }

  if (obj?.data?.adv?.config) {
    obj.data.adv.config.auto_download_material = "0";
    obj.data.adv.config.material_cache_time = 1;
    obj.data.adv.config.popuplimit = 1;
  }

  if (obj?.params) {
    obj.params.ad_program_switch = 0;
    obj.params.ad_personal_switch = 0;
    obj.params.vip_status = 1;
  }
} else if (url.indexOf("/init/other-data0") != -1) {
  if (obj?.data?.main_activities) {
    obj.data.main_activities = null;
  }
} else if (url.indexOf("/vip/index0") != -1) {
  if (obj?.data?.content.length > 0) {
    obj.data.content = []
  }

  if (obj?.data?.users) {
    obj.data.users.isLifetimeVip = "1";
    obj.data.users.year_vip_show = "1";
    obj.data.users.isvip = "1";
  }
}

body = JSON.stringify(obj);
$done({ body });
