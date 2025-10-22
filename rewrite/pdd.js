var url = $request.url;
var obj = JSON.parse($response.body);
if (url.indexOf("/api/alexa/homepage/hub") != -1) {
  // 首页
  const bottomTabs = ["首页", "分类", "聊天", "个人中心"];
  if (obj?.result?.icon_set?.length > 0) {
    obj.result.icon_set = [];
  }
  if (obj?.result?.buffer_bottom_tabs?.length > 0) {
    let newBufferBottomTabs = [];
    for (let tab of obj.result.buffer_bottom_tabs) {
      if (bottomTabs.includes(tab?.title)) {
        newBufferBottomTabs.push(tab);
      }
    }
    obj.result.buffer_bottom_tabs = newBufferBottomTabs;
  }
  if (obj?.result?.bottom_tabs?.length > 0) {
    let newBottomTabs = [];
    for (let tab of obj.result.bottom_tabs) {
      if (bottomTabs?.includes(tab?.title)) {
        newBottomTabs.push(tab);
      }
    }
    obj.result.bottom_tabs = newBottomTabs;
  }

  // 搜索热词
  if (obj?.result?.search_bar_hot_query) {
    obj.result.search_bar_hot_query.hotqs = [];
    obj.result.search_bar_hot_query.items = [];
    obj.result.search_bar_hot_query.shade = {};
  }
} else if (url.indexOf("/api/caterham/v3/query/new_chat_group") != -1) {
  // 聊天页
  if (obj?.data) {
    obj.data.goods_list = [];
    obj.data.has_more = false;
  }
} else if (url.indexOf("/shipping") != -1) {
  if (obj?.data) {
    obj.data.shipping.banner_above_recommend = [];
  }
}

body = JSON.stringify(obj);
$done({ body });
