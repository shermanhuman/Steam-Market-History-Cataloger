'use strict';

import {App} from '../../app/app.js';
import {Layout} from '../../app/layout/layout.js';
import {Listing} from '../../app/classes/listing.js';
import {applist} from '../../app/data/applist.js';
import {getUrlParam} from '../../app/helpers/utils.js';
import {buildThirdPartyLinks} from '../../app/layout/listings/external/buildThirdPartyLinks.js';
import {buildLink} from '../../app/layout/listings/external/buildLink.js';
import {Steam} from '../../app/steam/steam.js';

const page = {
    chart: document.getElementById('chart-transactions'),
    results: document.getElementById('results'),
    title: document.getElementById('item-name'),
    startingAt: document.getElementById('starting-at'),
    externalLinks: document.getElementById('item-external-links')
};
// item url query parameters for loading stored listings
let item = {
    appid: getUrlParam('appid'),
    market_name: getUrlParam('market_name'),
    market_hash_name: getUrlParam('market_hash_name')
};

function onReady() {
    App.ready()
        .then(onApp)
        .catch(Layout.error);
}

function onApp(app) {
    function onRecords(records) {
        // newest to oldest
        records = records.reverse();
        getThirdPartyLinks(records[0]);
        buildChart(records);
        buildTable(records);
    }
    
    // gets the item data from the URL parameters
    function getItem() {
        // database table
        const table = app.ListingDB.listings;
        
        return table.where('market_hash_name').equals(item.market_hash_name).sortBy('index')
            .then((records) => {
                // filter to appid
                records = records.filter((record) => record.appid == item.appid);
                onRecords(records);
            });
    }
    
    function removePlaceHolders() {
        let placeHoldersList = page.externalLinks.getElementsByClassName('placeholder');
        
        Array.from(placeHoldersList).forEach((el) => {
            el.remove();
        });
    }
    
    // gets links for 3rd party resources based on data from record
    function getThirdPartyLinks(record) {
        if (record) {
            buildThirdPartyLinks.withAsset(record).then((linksList) => {
                removePlaceHolders();
                linksList.forEach((el) => {
                    page.externalLinks.appendChild(el);
                });
            }).catch(removePlaceHolders);
        } else {
            removePlaceHolders();
        }
    }
    
    function buildChart(records) {
        const options = Object.assign({}, Layout.getLayoutOptions(app), {});
        
        Layout.listings.buildChart(records, page.chart, options);
    }
    
    function buildTable(records) {
        const options = Object.assign({}, Layout.getLayoutOptions(app), {});
        const tableEl = Layout.buildTable(records || [], Listing, options);
        
        Layout.render(page.results, tableEl);
    }
    
    // gets the lowest price from Steam and displays it on page
    // currently not using but may add later
    function getLowestPrice() {
        function addLowestPrice(details) {
            page.startingAt.textContent = 'Starting at ' + details.lowest_price;
        }
        
        Steam.requests.get.lowestPrice({
            country: app.account.info.settings.country,
            currency: app.account.wallet.currency.wallet_code,
            appid: item.appid,
            market_hash_name: item.market_hash_name
        }).then((response) => {
            if (response.ok) {
                response.json().then(addLowestPrice);
            }
        }).catch(() => {
            page.startingAt.textContent = 'No listings';
        });
    }

    // sets the title of the page
    function setTitle() {
        const appname = applist[item.appid] || 'Unknown app';
        const titleHTML = (
            `<span class="market-name">${item.market_name || item.market_hash_name}</span>` +
            '<span class="divider">/</span>' +
            `<span class="appname">${appname}</span>`
        );
        
        page.title.innerHTML = titleHTML;
    }
    
    // adds a link to the market page
    function addMarketListingLink() {
        const marketListingLinkEl = buildLink({
            title: 'Steam',
            url: `https://steamcommunity.com/market/listings/${item.appid}/${item.market_hash_name}`
        });
        const placeHoldersList = buildThirdPartyLinks.placeholder(item);
        
        page.externalLinks.appendChild(marketListingLinkEl);
        placeHoldersList.forEach((el) => {
            page.externalLinks.appendChild(el);
        });
    }
    
    function render() {
        setTitle();
        addMarketListingLink();
        
        return getItem();
    }
    
    render().then(Layout.ready);
}

onReady();