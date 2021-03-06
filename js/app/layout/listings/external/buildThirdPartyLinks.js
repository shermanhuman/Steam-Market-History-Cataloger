'use strict';

import { Steam } from '../../../steam/steam.js';
import { buildLink } from './buildLink.js';

const buildThirdPartyLinks = {
    // fetch an asset from steam to display links
    withAsset: function(record) {
        return Steam.getClassinfo(record.appid, record.classid, record.instanceid)
            .then((asset) => {
                let links = [];
                
                switch (record.appid) {
                    case '440': {
                        const appData = asset.app_data;
                        const defindex = appData.def_index;
                        const quality = appData.quality;
                        
                        links = [
                            buildLink({
                                url: `http://wiki.teamfortress.com/scripts/itemredirect.php?id=${defindex}`,
                                title: 'Wiki'
                            }),
                            buildLink({
                                url: `https://backpack.tf/stats/${quality}/${defindex}/1/1`,
                                title: 'backpack.tf'
                            }),
                            buildLink({
                                url: `https://marketplace.tf/items/${defindex};${quality}`,
                                title: 'Marketplace.tf'
                            })
                        ];
                    } break;
                }
                
                return links;
            });
    },
    // generate placeholders for the above links that can be instantly displayed
    placeholder: function(item) {
        switch (item.appid) {
            case '440':
                return [
                    buildLink({
                        url: '#',
                        title: 'Wiki',
                        placeholder: true
                    }),
                    buildLink({
                        url: '#',
                        title: 'backpack.tf',
                        placeholder: true
                    }),
                    buildLink({
                        url: '#',
                        title: 'marketplace.tf',
                        placeholder: true
                    })
                ];
            default:
                return [];
        }
    }
};

export { buildThirdPartyLinks };