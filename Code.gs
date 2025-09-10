// ID ของ Google Sheet ที่ต้องการบันทึกข้อมูล
const SHEET_ID = '11vhg37MbHRm53SSEHLsCI3EBXx5_meXVvlRuqhFteaY';
// ชื่อของชีต (แท็บ) ที่ต้องการบันทึกข้อมูล
const SHEET_NAME = 'SaleForm';

/**
 * ฟังก์ชันหลักที่ทำงานเมื่อมีการส่งข้อมูลแบบ POST เข้ามา
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    // ตรวจสอบและสร้างหัวตารางหากยังไม่มี
    if (sheet.getLastRow() < 1) {
      const headers = [
        'date',
        'sold',
        'pending', 
        'cleared',
        'revenue',
        'pipeFee',
        'shareFee',
        'otherFee',
        'saveFee',
        'expense',
        'balance',
        'timestamp'
      ];
      sheet.appendRow(headers);
    }
    
    // แปลงข้อมูลที่ส่งมา (JSON)
    const requestData = JSON.parse(e.postData.contents);
    
    // ตรวจสอบว่าข้อมูลที่ส่งมาเป็น array (สำหรับ offline sync) หรือ object เดียว
    const records = Array.isArray(requestData) ? requestData : [requestData];

    // วนลูปเพื่อบันทึกทุกรายการข้อมูล
    records.forEach(record => {
      const newRow = [
        record.date,         // date
        record.sold,         // sold
        record.pending,      // pending
        record.cleared,      // cleared
        record.revenue,      // revenue
        record.pipeFee,      // pipeFee
        record.shareFee,     // shareFee  
        record.otherFee,     // otherFee
        record.saveFee,      // saveFee
        record.expense,      // expense
        record.balance,      // balance
        new Date()           // timestamp
      ];
      sheet.appendRow(newRow);
    });
    
    // ส่งคำตอบกลับไปว่าสำเร็จ
    return ContentService
      .createTextOutput(JSON.stringify({ 'status': 'success', 'message': 'Data saved successfully', 'records_count': records.length }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // กรณีเกิดข้อผิดพลาด ให้ส่ง error กลับไป
    return ContentService
      .createTextOutput(JSON.stringify({ 'status': 'error', 'message': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}