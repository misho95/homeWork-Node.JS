const moment = require("moment");

const dateNow = moment().format("MMMM Do YYYY, h:mm:ss a");
const secondDate = moment().format("MMMM 10 YYYY, h:mm:ss a");

console.log(moment().subtract(dateNow, secondDate).calendar());
