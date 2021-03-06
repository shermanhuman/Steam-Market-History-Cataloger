'use strict';

import { createTotalClass } from './helpers/createTotalClass.js';

const identifier = 'monthlytotals';
const tableColumns = [
    'year',
    'month',
    'sale',
    'sale_count',
    'purchase',
    'purchase_count'
];
const MonthlyTotal = createTotalClass(identifier, tableColumns);

export { MonthlyTotal };