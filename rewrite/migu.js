
if ($request?.url?.includes("/strategy/listen-url/")) {
  let headers = $request.headers;
  headers.uid = "91414537623";
  headers.Cookie = "";
  headers.ce = "";
  headers.bversionid = "";
  $done({ headers });
}

else if ($request?.url?.includes("/music/batchQueryMusicPolicy.do")) {
  let headers = $request.headers;
  headers.uid = "91414537623";
  headers.Cookie = "";
  headers.ce = "";
  headers.bversionid = "";
  $done({ headers });
}

else if ($request?.url?.includes("user/api/my-page-header/")) {
  try {
    let obj = JSON.parse($response.body);

    if (obj?.data?.userIdentityIconItems?.[0]) {
      obj.data.userIdentityIconItems[0].iconUrl = "https://d.musicapp.migu.cn/prod/file-service/file-down/bcb5ddaf77828caee4eddc172edaa105/7cd657454195aaeaea9e3c425491a0d0/74f77a7b9a47582a559762111ac8ba9b";
      obj.data.userIdentityIconItems[0].name = "白金会员畅听版";
      obj.data.userIdentityIconItems[0].type = "baijinhuiyuanchangtingban";
    }

    if (obj?.data?.userOpNums?.[5]) {
      obj.data.userOpNums[5].desc = "999999";
      obj.data.userOpNums[5].number = 999999;
    }

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
}

else if ($request?.url?.includes("/column/startup-pic-with-ad")) {
  try {
    let obj = JSON.parse($response.body);
    delete obj.data;
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
}

else if ($request?.url?.includes("resource/skin/list")) {
  try {
    let obj = JSON.parse($response.body);
    if (Array.isArray(obj?.data)) {
      obj.data.forEach(item => item.isVip = "0");
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
}

else {
  $done({});
}