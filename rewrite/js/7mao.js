var url = $request.url;
var body = $response.body;
var obj = JSON.parse($response.body);

if (url.indexOf("/reader-copy-paragraph-all.json") != -1) {
  obj = { data: { vip_list: [], list: [] } };
  body = JSON.stringify(obj);
} else if (url.indexOf("/api/v1/extra/init") != -1) {
  if (obj?.data?.reader_floats?.length > 0) {
    obj.data.reader_floats = [];
    console.log("设置reader_floats为空");
  }

  if (obj?.data?.reader_top_banner?.length > 0) {
    obj.data.reader_top_banner = [];
    console.log("设置reader_top_banner为空");
  }
  body = JSON.stringify(obj);
} else if (url.indexOf("/v1/splash/index") != -1) {
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
  body = JSON.stringify(obj);
} else if (url.indexOf("/api/v2/init/other-data")) {
  if (obj?.data?.main_activities) {
	obj.data.main_activities = null
  }	
  body = JSON.stringify(obj);
} else if (url.indexOf("/user/my-center") != -1) {
  body = body
    .replace(/\"deadline_date\"\:\".*?\"/g, '"deadline_date":"2099-12-31"')
    .replace(
      /\"vip_privilege_desc\"\:\".*?\"/g,
      '"vip_privilege_desc":"VVIP"'
    )
    .replace(/\"year_vip_show\"\:\".*?\"/g, '"year_vip_show":"1"')
    .replace(/\"vip_show_type\"\:\".*?\"/g, '"vip_show_type":"40"')
    .replace(/\"is_vip\"\:\".*?\"/g, '"is_vip":"1"');
} else if (url.indexOf("/login/tourist") != -1) {
  body = body.replace(/\"is_vip\"\:\".*?\"/g, '"is_vip":"1"');
} else if (url.indexOf("/user/get-role-adv-vip-info") != -1) {
  body = body
    .replace(/\"year_vip_show\"\:\".*?\"/g, '"year_vip_show":"1"')
    .replace(/\"isvip\"\:\".*?\"/g, '"isvip":"1"')
    .replace(/\"isLifetimeVip\"\:\".*?\"/g, '"isLifetimeVip":"1"')
    .replace(/\"type\"\:\".*?\"/g, '"type":"40"');
} else if (url.indexOf("/bookshelf-adv/index") != -1) {
  body = body.replace(/\"list\"\:\[.*?\]/g, '"list":[]');
} else if (url.indexOf("/user/page") != -1) {
  body = body
    .replace(/\"year_vip_show\"\:\".*?\"/g, '"year_vip_show":"1"')
    .replace(/\"is_vip\"\:\".*?\"/g, '"is_vip":"1"');
} else if (url.indexOf("/book/download") != -1) {
  body = body.replace(/\"list\"\:\[.*?\]/g, '"list":[]');
} else if (url.indexOf("/reader-adv/index") != -1) {
  body = body
    .replace(/\"reader_chapter_list\"\:\[.*?\]/g, '"reader_chapter_list":[]')
    .replace(/\"reader_getcoin\"\:\[.*?\]/g, '"reader_getcoin":[]')
    .replace(/\"reader_bottom_list\"\:\[.*?\]/g, '"reader_bottom_list":[]')
    .replace(
      /\"reader_page_turn_list\"\:\[.*?\]/g,
      '"reader_page_turn_list":[]'
    )
    .replace(/\"reader_noad\"\:\[.*?\]/g, '"reader_noad":[]')
    .replace(/\"reader_inchapter\"\:\[.*?\]/g, '"reader_inchapter":[]')
    .replace(/\"feedback\"\:\[.*?\]/g, '"feedback":[]');
} else if (url.indexOf("/voice-adv/index") != -1) {
  body = body
    .replace(/\"voice_top\"\:\[.*?\]/g, '"voice_top":[]')
    .replace(/\"voice_bottom\"\:\[.*?\]/g, '"voice_bottom":[]');
} else if (url.indexOf("/get-player-info") != -1) {
  body = body.replace(/\"voice_list\"\:\[.*?\]/g, '"voice_list":[]');
} else if (url.indexOf("/init-adv/index") != -1) {
  body = body.replace(/\"coopenHighList\"\:\[.*?\]/g, '"coopenHighList":[]');
} else if (url.indexOf("/bookshelf-adv/index") != -1) {
  body = body.replace(/\"bookshelf\"\:\[.*?\]/g, '"bookshelf":[]');
}
$done({ body });
