// ⭐ --- การตั้งค่า --- ⭐
// ID ของ Google Sheet ที่ต้องการบันทึกข้อมูล
const SHEET_ID = '11vhg37MbHRm53SSEHLsCI3EBXx5_meXVvlRuqhFteaY'; 
// ชื่อของชีต (แท็บ) ที่ต้องการบันทึกข้อมูล
const SHEET_NAME = 'SaleForm';
// --------------------

/**
 * ฟังก์ชันนี้จะทำงานเมื่อมีการเปิดหน้าเว็บแอป
 * @param {Object} e - The event parameter.
 * @returns {HtmlOutput} The HTML page to be served.
 */
function doGet(e) {
  // สร้างหน้าเว็บจากไฟล์ 'index.html' และตั้งชื่อหัวข้อของหน้าเว็บ
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('SSKratomYMT - บันทึกยอดขาย');
}

/**
 * ฟังก์ชันนี้ทำงานเมื่อมีการส่งข้อมูลแบบ POST เข้ามา (จากการกดบันทึกในฟอร์ม)
 * @param {Object} e - The event parameter containing the POST data.
 * @returns {ContentOutput} A JSON response indicating success or failure.
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    // ตรวจสอบและสร้างหัวตารางหากยังไม่มี
    if (sheet.getLastRow() < 1) {
      const headers = [
        'date', 'sold', 'pending', 'cleared', 'revenue', 'pipeFee',
        'shareFee', 'otherFee', 'saveFee', 'expense', 'balance', 'timestamp'
      ];
      sheet.appendRow(headers);
    }

    // แปลงข้อมูลที่ส่งมา (JSON string) ให้เป็น JavaScript object
    const requestData = JSON.parse(e.postData.contents);
    
    // ⭐ [IMPROVED] ตรวจสอบว่าข้อมูลที่ส่งมาเป็น array (สำหรับ offline sync) หรือ object เดียว
    // ถ้าเป็น object เดียว ให้แปลงเป็น array ที่มีสมาชิก 1 ตัว เพื่อให้จัดการเหมือนกันได้
    const records = Array.isArray(requestData) ? requestData : [requestData];

    // ดึงโซนเวลาจากตัว Spreadsheet และสร้าง timestamp ที่ถูกต้อง
    const timeZone = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
    const timestamp = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd HH:mm:ss");

    // ⭐ [IMPROVED] เตรียมข้อมูลทั้งหมดก่อนบันทึกลงชีตในครั้งเดียว (Batch Update)
    const newRows = [];
    records.forEach(record => {
      const newRow = [
        record.date,
        record.sold,
        record.pending,
        record.cleared,
        record.revenue,
        record.pipeFee,
        record.shareFee,
        record.otherFee,
        record.saveFee,
        record.expense,
        record.balance,
        timestamp // ใช้ timestamp เดียวกันสำหรับข้อมูลชุดเดียวกันที่ส่งมา
      ];
      newRows.push(newRow);
    });

    // ถ้ามีข้อมูลใหม่ ให้บันทึกลงชีตทั้งหมดในคำสั่งเดียว ซึ่งเร็วกว่าการบันทึกทีละแถวมาก
    if (newRows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length)
           .setValues(newRows);
    }
    
    // ส่งคำตอบกลับไปให้ฝั่ง HTML ว่าสำเร็จ
    return ContentService
      .createTextOutput(JSON.stringify({ 
          'status': 'success', 
          'message': 'Data saved successfully', 
          'records_count': records.length 
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // กรณีเกิดข้อผิดพลาด ให้บันทึก Log ไว้ดู และส่ง error กลับไป
    Logger.log(error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ 
          'status': 'error', 
          'message': error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
