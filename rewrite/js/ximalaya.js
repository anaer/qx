let body = $response.body;

if (!body) {
    $done({});
    return;
}

try {
    let data = JSON.parse(body);

    switch (true) {
        case /discovery-category\/customCategories/.test($request.url):
            const filterCategories = (list) =>
                list?.filter(item =>
                    ["recommend", "template_category", "single_category"].includes(item.itemType) &&
                    item.categoryId !== 1005
                ) ?? [];

            data.customCategoryList = filterCategories(data.customCategoryList);
            data.defaultTabList = filterCategories(data.defaultTabList);
            break;

        case /discovery-category\/v\d\/category/.test($request.url):
            if (data.focusImages?.data) {
                data.focusImages.data = data.focusImages.data.filter(item =>
                    item.realLink?.includes("open") && !item.isAd
                );
            }
            break;

        case /focus-mobile\/focusPic/.test($request.url):
            if (data.header?.length <= 1) {
                data.header[0].item.list[0].data = data.header[0].item.list[0].data.filter(item =>
                    item.realLink?.includes("open") && !item.isAd
                );
            }
            break;

        case /discovery-feed\/v\d\/mix/.test($request.url):
            if (data.header?.length === 2) {
                delete data.header[0];
            }

            data.body = data.body.filter(item =>
                !(item.item?.adInfo || item.item?.moduleType === "mix_ad" || item.displayClass === "bigCard")
            );
            break;

        case /mobile-user\/v\d\/homePage/.test($request.url):
            const allowedIds = new Set([210, 213, 215]);
            if (data.data?.serviceModule?.entrances) {
                data.data.serviceModule.entrances = data.data.serviceModule.entrances.filter(item =>
                    allowedIds.has(item.id)
                );
            }
            break;

        default:
            $done({});
            return;
    }

    body = JSON.stringify(data);
} catch (error) {
    console.log("Error processing request: " + error);
}

$done({ body });
