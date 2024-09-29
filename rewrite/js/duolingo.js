const url = $request.url
const isCheckUrl = (url) => (url.includes('ios-api-2.duolingo.com/2017-06-30/batch') || url.includes('ios-api-2.duolingo.com/2023-05-23/batch') )

if (isCheckUrl(url)) {
  var rBody = $response.body;
  rBody = rBody.replace(/has_item_gold_subscription\\":\s*\w+/g, 'has_item_gold_subscription\\":true')
                .replace(/premium_free_trial_period\\":\s*\w+/g, 'premium_free_trial_period\\":false')
                .replace(/has_item_premium_subscription\\":\s*\w+/g, 'has_item_premium_subscription\\":true')
                .replace(/has_item_live_subscription\\":\s*\w+/g, 'has_item_live_subscription\\":true,\\"premium_receipt_source\\":\\"apple\\"')
                .replace(/has_item_streak_wager\\":\s*\w+/g, 'has_item_streak_wager\\":true,\\"premium_product_id\\":\\"com.duolingo.DuolingoMobile.subscription.Premium.TwelveMonth.24Q2WB14D.Trial14.120\\",\\"premium_expected_expiration\\":4103004800000')
                .replace(/gems\\":\s*(\d+)/g, 'gems\\":9999')
                .replace(/\\"id\\":\\"timed_practice\\"\}/g, '\\"id\\":\\"timed_practice\\"},{\\"purchaseDate\\":1689033083,\\"purchasePrice\\":8399,\\"id\\":\\"premium_subscription\\",\\"subscriptionInfo\\":{\\"expectedExpiration\\":4103004800,\\"isFreeTrialPeriod\\":false,\\"isInBillingRetryPeriod\\":false,\\"productId\\":\\"com.duolingo.DuolingoMobile.subscription.Premium.TwelveMonth.24Q2WB14D.Trial14.120\\",\\"renewer\\":\\"APPLE\\",\\"renewing\\":false,\\"tier\\":\\"twelve_month\\",\\"type\\":\\"premium\\"}}')
                .replace(/premium_expected_expiration\\":\s*(\d+)/g, 'premium_expected_expiration\\":4103004800000')
                .replace(/expectedExpiration\\":\s*(\d+)/g, 'expectedExpiration\\":4103004800')
                .replace(/isFreeTrialPeriod\\":\s*\w+/g, 'isFreeTrialPeriod\\":false')
                .replace(/plusStatus\\":\s*\\"\w+/g, 'plusStatus\\":\\"PLUS')
                .replace(/subscriberLevel\\":\s*\\"\w+/g, 'subscriberLevel\\":\\"PREMIUM')
                .replace(/\\"timerBoosts\\":\s*(\d+)/g, '\\"timerBoosts\\":99')
                .replace(/\\"timezone\\":\s*\\"[^\\"]+/g, '\\"timezone\\":\\"Asia/Taipei')
                .replace(/\\"utc_offset\\":\s*[^,]+/g, '\\"utc_offset\\":8.0');

  $done( { 'body': rBody } );
}
if ((url.indexOf('ios-api-2.duolingo.com/2017-06-30/users/') !== -1 || url.indexOf('ios-api-2.duolingo.com/2023-05-23/users/') !== -1 ) && url.indexOf('available-features') !== -1 ) {
    const unlock = {
        "purchasableFeatures": ["CAN_PURCHASE_IAP", "CAN_PURCHASE_SUBSCRIPTION"],
        "subscriptionFeatures": ["NO_NETWORK_ADS", "UNLIMITED_HEARTS", "LEGENDARY_LEVEL", "MISTAKES_INBOX", "MASTERY_QUIZ", "NO_SUPER_PROMOS", "CAN_ADD_SECONDARY_MEMBERS"]
    };
    $done( { 'body': JSON.stringify(unlock) } );
}
