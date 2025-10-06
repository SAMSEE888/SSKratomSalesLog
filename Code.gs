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
        'Date', 'Sold (bottles)', 'Pending (bottles)', 'Cleared (bottles)', 'Revenue',
        'Pipe Fee', 'Share Fee', 'Other Fee', 'Save Fee',
        'Expense', 'Balance', 'Timestamp'
      ];
      sheet.appendRow(headers);
    }
    
    // แปลงข้อมูลที่ส่งมา (JSON)
    const requestData = JSON.parse(e.postData.contents);
    
    // ตรวจสอบว่ามี action พิเศษหรือไม่
    if (requestData.action === 'checkDuplicate') {
      return checkDuplicateData(sheet, requestData);
    }
    
    // ตรวจสอบว่าข้อมูลที่ส่งมาเป็น array (สำหรับ offline sync) หรือ object เดียว
    const records = Array.isArray(requestData) ? requestData : [requestData];
    
    let successCount = 0;
    let duplicateCount = 0;
    
    // วนลูปเพื่อบันทึกทุกรายการข้อมูล
    records.forEach(record => {
      // ตรวจสอบข้อมูลซ้ำก่อนบันทึก
      if (isDuplicateRecord(sheet, record)) {
        console.log(`พบข้อมูลซ้ำสำหรับวันที่: ${record.date}`);
        duplicateCount++;
        return; // ข้ามการบันทึกข้อมูลซ้ำ
      }
      
      // ✨ แก้ไข: จัดรูปแบบวันที่และเวลาสำหรับโซนเวลาประเทศไทย
      const timestamp = Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss");
      
      const newRow = [
        record.date,
        record.sold || 0,
        record.pending || 0,
        record.cleared || 0,
        record.revenue || 0,
        record.pipeFee || 0,
        record.shareFee || 0,
        record.otherFee || 0,
        record.saveFee || 0,
        record.expense || 0,
        record.balance || 0,
        timestamp
      ];
      
      sheet.appendRow(newRow);
      successCount++;
    });

    // ส่งคำตอบกลับไปว่าสำเร็จ
    return ContentService
      .createTextOutput(JSON.stringify({ 
        'status': 'success', 
        'message': `บันทึกข้อมูลสำเร็จ ${successCount} รายการ${duplicateCount > 0 ? `, พบข้อมูลซ้ำ ${duplicateCount} รายการ` : ''}`,
        'records_count': successCount,
        'duplicates_count': duplicateCount
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // กรณีเกิดข้อผิดพลาด ให้ส่ง error กลับไป
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        'status': 'error', 
        'message': error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ฟังก์ชันตรวจสอบข้อมูลซ้ำ
 */
function isDuplicateRecord(sheet, record) {
  try {
    const data = sheet.getDataRange().getValues();
    
    // ข้ามหัวข้อคอลัมน์ (แถวแรก)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // ตรวจสอบวันที่
      if (row[0] && record.date) {
        const existingDate = new Date(row[0]);
        const newDate = new Date(record.date);
        
        // เปรียบเทียบวันที่ (ไม่รวมเวลา)
        if (existingDate.toDateString() === newDate.toDateString()) {
          // ตรวจสอบข้อมูลการขาย
          const existingSold = Number(row[1]) || 0;
          const newSold = Number(record.sold) || 0;
          
          const existingPending = Number(row[2]) || 0;
          const newPending = Number(record.pending) || 0;
          
          const existingCleared = Number(row[3]) || 0;
          const newCleared = Number(record.cleared) || 0;
          
          // ถ้าข้อมูลการขายเหมือนกันทั้งหมด ถือว่าซ้ำ
          if (existingSold === newSold && 
              existingPending === newPending && 
              existingCleared === newCleared) {
            return true;
          }
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return false;
  }
}

/**
 * ฟังก์ชันตรวจสอบข้อมูลซ้ำแบบเฉพาะ
 */
function checkDuplicateData(sheet, requestData) {
  try {
    const isDuplicate = isDuplicateRecord(sheet, requestData);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        isDuplicate: isDuplicate,
        message: isDuplicate ? 'พบข้อมูลซ้ำ' : 'ไม่พบข้อมูลซ้ำ'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in checkDuplicateData:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        isDuplicate: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ฟังก์ชันสำหรับลบข้อมูลซ้ำ (optional)
 */
function removeDuplicateRecords() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const uniqueRecords = [];
    const seen = new Set();
    let duplicateCount = 0;
    
    // เพิ่มหัวข้อคอลัมน์
    uniqueRecords.push(data[0]);
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const key = `${row[0]}-${row[1]}-${row[2]}-${row[3]}`; // วันที่-ขาย-ค้าง-เคลียร์
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRecords.push(row);
      } else {
        duplicateCount++;
      }
    }
    
    // ลบข้อมูลทั้งหมดและเขียนข้อมูลที่ไม่ซ้ำกลับไป
    sheet.clear();
    if (uniqueRecords.length > 0) {
      sheet.getRange(1, 1, uniqueRecords.length, uniqueRecords[0].length).setValues(uniqueRecords);
    }
    
    console.log(`ลบข้อมูลซ้ำ ${duplicateCount} รายการสำเร็จ`);
    return `ลบข้อมูลซ้ำ ${duplicateCount} รายการสำเร็จ`;
    
  } catch (error) {
    console.error('Error removing duplicates:', error);
    return 'Error: ' + error.toString();
  }
}

/**
 * ฟังก์ชันสำหรับทดสอบ
 */
function testDuplicateCheck() {
  const testRecord = {
    date: '2024-01-01',
    sold: 10,
    pending: 2,
    cleared: 1
  };
  
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const isDuplicate = isDuplicateRecord(sheet, testRecord);
  
  console.log('Test result:', isDuplicate ? 'Duplicate found' : 'No duplicate');
  return isDuplicate;
}