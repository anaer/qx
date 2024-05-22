let body = $response.body;
const isResponse = typeof $response !== "undefined";

if(isResponse){
  let obj = JSON.parse(body);
  const bottomTabs = [
    "首页",
    "分类",
    "聊天",
    "个人中心",
  ];
  if(obj?.result?.icon_set?.length > 0) {
	  obj.result.icon_set = [];
	}
  if(obj?.result?.buffer_bottom_tabs?.length > 0) {
    let newBufferBottomTabs = [];
    for (let tab of obj.result.buffer_bottom_tabs) {
      if (bottomTabs.includes(tab?.title)) {
        newBufferBottomTabs.push(tab);
      }
    }
    obj.result.buffer_bottom_tabs = newBufferBottomTabs;
  }
  if(obj?.result?.bottom_tabs?.length > 0) {
    let newBottomTabs = [];
    for (let tab of obj.result.bottom_tabs) {
      if (bottomTabs?.includes(tab?.title)) {
        newBottomTabs.push(tab);
      }
    }
    obj.result.bottom_tabs = newBottomTabs;
  }
  body = JSON.stringify(obj);
  $done({ body });
}else{
  $done();
}