var ddgksf2013 = JSON.parse($response.body),
    productidmap = {
        default: ["ddgksf2013", "https://t.me/ddgksf2021", 0],
        "com.sugarmo.ScrollClip": ["picsewV3.9.4", "com.sugarmo.ScrollClip.pro", 1],
        "com.zijayrate.analogcam": ["oldroll", "com.zijayrate.analogcam.vipforever10", 0],
        "com.loveyouchenapps.knockout": ["proknockout", "com.knockout.7daysplus", 0],
        "net.shinyfrog.bear-iOS": ["bear", "net.shinyfrog.bear_iOS.pro_yearly_subscription_bis", 0],
        "com.yengshine.proccd": ["proccd", "com.yengshine.proccd.year", 0],
        "com.yumiteam.Kuki.ID": ["PicsLeap", "com.yumiteam.Kuki.ID.4", 1],
        "com.calc.iphone": ["Calculator", "calc_Unlock_1", 0],
        "me.imgbase.intolive": ["intolive", "me.imgbase.intolive.proSubYearly", 0],
        "MVH6DNU2ZP.input": ["logcg", "com.logcg.loginput", 1],
        "com.waterminder.waterminder": ["waterminder", "waterminder.premiumYearly", 0],
        "wtf.riedel.one-sec": ["onesec", "wtf.riedel.one_sec.pro.annual.individual", 0],
        "com.aaaalab.nepacket": ["http", "com.li.blur.pro.month", 0],
        "com.inturnex.Sticker-Maker": ["Sticker", "com.inturnex.Sticker_Maker.full_access", 1],
        "FuYuan.inkDiary": ["Secai", "FuYuan.inkDiary.YearB.Pro", 0],
        "me.imgbase.imgplay": ["imgplay", "me.imgbase.imgplay.subscriptionYearly", 0],
        "com.mediaeditor.video": ["PrettyUp", "yearautorenew", 0],
        "com.anycasesolutions.SexTracker": ["SexTracker", "com.anycasesolutions.SexTracker.3mon", 0],
        "com.jianili.pawff": ["pawff", "com.jianili.pawff.pro.monthly", 0],
        "icar.ren.smk": ["smk", "smoke19870727", 0],
        "com.meditation.heartratehrv": ["meditation", "lifetimeusa", 1],
        "livintis.com.wallpapermonster": ["wallpaper", "wallpaperworld.subscription.yearly.12.notrial", 0],
        "me.imgbase.videoday": ["videoday", "me.imgbase.videoday.profeaturesYearly", 0],
        "com.icandiapps.nightsky": ["nightsky", "com.icandiapps.ns4.annual", 0]
    };
ddgksf2013.Attention = "恭喜你抓到元数据！由墨鱼分享，请勿售卖或分享他人！";
var mapid = ddgksf2013.receipt.bundle_id,
    mapping = productidmap[mapid] || productidmap.default,
    inapp = {
        product_id: mapping[1],
        quantity: "1",
        expires_date: "2099-12-18 23:59:59 Etc/GMT",
        expires_date_pst: "2099-12-18 23:59:59 America/Los_Angeles",
        expires_date_ms: "4101292799000",
        is_in_intro_offer_period: "false",
        transaction_id: "100000000000000",
        is_trial_period: "false",
        original_transaction_id: "100000000000000",
        purchase_date_ms: "1701705599000",
        purchase_date: "2023-12-04 23:59:59 Etc/GMT",
        purchase_date_pst: "2023-12-04 23:59:59 America/Los_Angeles",
        original_purchase_date: "2023-12-04 23:59:59 Etc/GMT",
        original_purchase_date_pst: "2023-12-04 23:59:59 America/Los_Angeles",
        original_purchase_date_ms: "1701705599000",
        in_app_ownership_type: "PURCHASED",
        web_order_line_item_id: "100000000000000"
    },
    renew = {
        product_id: mapping[1],
        original_transaction_id: "100000000000000",
        auto_renew_product_id: mapping[1],
        auto_renew_status: "1"
    };
mapping[2]
  ? (delete inapp.expires_date,
    delete inapp.expires_date_ms,
    delete inapp.expires_date_pst)
  : ((ddgksf2013.latest_receipt_info = [inapp]),
    (ddgksf2013.latest_receipt = "https://t.me/ddgksf2021"),
    (ddgksf2013.pending_renewal_info = [renew])),
  (ddgksf2013.receipt.in_app = [inapp]),
  $done({
    body: JSON.stringify(ddgksf2013),
  });