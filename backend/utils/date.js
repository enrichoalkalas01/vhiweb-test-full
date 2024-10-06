const moment = require("moment")

function isDatePassed(targetDate) {
    // Mendapatkan tanggal saat ini
    const currentDate = new Date();
  
    // Mengubah tanggal target dan tanggal saat ini menjadi timestamp
    const targetTimestamp = targetDate.getTime();
    const currentTimestamp = currentDate.getTime();
  
    // Membandingkan timestamp untuk menentukan apakah tanggal sudah lewat atau tidak
    return targetTimestamp < currentTimestamp;
}

const DateFormatter = (date) => {
    return moment(date).format("YYYY-MM-DD HH:mm:ss")
}

module.exports = {
  isDatePassed,
  DateFormatter,
};