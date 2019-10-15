'use strict';

import {App} from '../app/app.js';
import {formatLocaleNumber} from '../app/money.js';
import {Layout} from '../app/layout/layout.js';
import {createListingManager} from '../app/manager/listingsmanager.js';
import {isNumber} from '../app/helpers/utils.js';

const page = {
    inputs: document.querySelectorAll('input, select'),
    bgPollBoolean: document.getElementById('background_poll_boolean'),
    bgPollInterval: document.getElementById('background_poll_interval_minutes'),
    listingCount: document.getElementById('listing-count'),
    listingDescribe: document.getElementById('listing-describe'),
    deleteData: document.getElementById('delete-data'),
    deleteAfterIndex: document.getElementById('delete-after-index'),
    deleteAfterIndexButton: document.getElementById('delete-after-index-button'),
    listingsLanguage: document.getElementById('listings-language'),
    listingsDescription: document.getElementById('listings-description')
};

function onReady() {
    App.ready()
        .then(onApp)
        .catch((e) => {
            console.log(e);
        });
}

function onApp(app) {
    function addListeners() {
        page.inputs.forEach((inputEl) => {
            inputEl.addEventListener('change', (e) => {
                updateField(e.target);
            });
        });
        
        page.deleteData.addEventListener('click', () => {
            const yes = confirm('Do you really want to do this?');
            
            if (yes) {
                deleteData()
                    .then(() => {
                        window.location.reload();
                    });
            }
        });
        
        page.deleteAfterIndexButton.addEventListener('click', () => {
            const indexValue = page.deleteAfterIndex.value;
            const indexIsNumber = isNumber(indexValue);
            
            if (indexIsNumber) {
                const index = parseInt(indexValue);
                const yes = confirm(`Delete listings appearing after index ${index}?`);
                
                if (yes) {
                    deleteAfter(index);
                    page.deleteAfterIndexButton.remove();
                }
            }
        });
    }
    
    // autofills from saved preferences
    function autofill() {
        for (let k in preferences.settings) {
            const element = document.getElementById(k);
            const value = preferences.settings[k];
            
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        }
        
        // then update the state
        updateState();
    }
    
    // updates state of form based on current values
    function updateState() {
        if (page.bgPollBoolean.checked) {
            page.bgPollInterval.removeAttribute('disabled');
        } else {
            page.bgPollInterval.setAttribute('disabled', true);
        }
    }
    
    // updates the value for a field
    function updateField(target) {
        const {type, id} = target;
        let value = target.value;
        
        if (type === 'checkbox') {
            value = target.checked;
        }
        
        if (isNumber(value)) {
            value = parseFloat(value);
        }
        
        updateState();
        preferences.settings[id] = value;
        preferences.saveSettings();
    }
    
    // deletes listing data and settings
    function deleteData() {
        const deleteDBPromise = new Promise((resolve) => {
            app.ListingDB.delete().finally(resolve);
        });
        const deleteSettingsPromise = listingManager.deleteSettings();
        
        return Promise.all([
            deleteSettingsPromise,
            deleteDBPromise
        ]);
    }
    
    function deleteAfter(index) {
        // select the listings above the index and delete them
        app.ListingDB.listings.where('index').above(index).delete()
            .then(() => {
                // then reset the settings
                return listingManager.reset();
            });
    }
    
    function getData() {
        return updateCount();
    }
    
    // updates the displayed count on page
    function updateCount() {
        return listingManager.getSettings(true)
            .then((settings) => {
                const count = settings.recorded_count || 0;
                const language = settings.language;
                
                if (language) {
                    let formatted = formatLocaleNumber(count, app.account.wallet.currency);
                    let describeText;
                    
                    // pick description text based on number of listings
                    if (count >= 100000) {
                        describeText = 'That\'s a lot of listings. It would be a shame if anything were to happen to them. ';
                    } else if (count >= 10000) {
                        describeText = 'That\'s a good number of listings. ';
                    } else if (count >= 1000) {
                        describeText = 'That\'s a few listings. ';
                    } else if (count === 0) {
                        describeText = 'No listings? No problem. ';
                    } else {
                        describeText = 'That\'s not too many listings. ';
                    }
                    
                    page.listingsLanguage.textContent = language;
                    page.listingCount.textContent = formatted + ' recorded listings';
                    page.listingDescribe.textContent = describeText;
                } else {
                    page.listingsDescription.textContent = 'You don\'t have any listings loaded.';
                }
                
                return;
            });
    }
    
    const {preferences} = app;
    const listingManager = createListingManager(app);

    autofill();
    addListeners();
    getData().then(Layout.ready);
}

onReady();