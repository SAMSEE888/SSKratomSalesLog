// ID ของ Google Sheet ที่ต้องการบันทึกข้อมูล
const SHEET_ID = '11vhg37MbHRm53SSEHLsCI3EBXx5_meXVvlRuqhFteaY';
// ชื่อของชีต (แท็บ) ที่ต้องการบันทึกข้อมูล
const SHEET_NAME = 'SaleForm';


// ⭐⭐ เพิ่มฟังก์ชัน doGet สำหรับเปิดหน้าเว็บ ⭐⭐

/**
 * ฟังก์ชันสำหรับเปิดหน้าเว็บ HTML
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getData' || action === 'history') {
      return handleDataRequest(e);
    }
    
    if (action === 'health') {
      return handleHealthCheck();
    }
    
    return serveHTML();
    
  } catch (error) {
    console.error('Error in doGet:', error);
    return createErrorResponse('เกิดข้อผิดพลาดในการโหลดหน้าเว็บ: ' + error.toString());
  }
}

/**
 * ส่งคืนไฟล์ HTML หลัก
 */
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="แอปพลิเคชันบันทึกยอดขายและคำนวณวัตถุดิบน้ำกระท่อม">
  <meta name="theme-color" content="#2E7D32"/>
  <title>SSKratomYMT - บันทึกยอดขาย</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary-color: #2E7D32; --primary-light: #4CAF50; --primary-lighter: #81C784; --primary-dark: #1B5E20; --accent-color: #8BC34A; --background: #F1F8E9; --card-bg: rgba(255, 255, 255, 0.9); --text-dark: #263238; --text-medium: #455A64; --text-light: #607D8B; --success-color: #388E3C; --warning-color: #F57C00; --error-color: #D32F2F; --shadow-sm: 0 1px 3px rgba(0,0,0,0.12); --shadow-md: 0 4px 6px rgba(0,0,0,0.1); --shadow-lg: 0 10px 20px rgba(0,0,0,0.1); --border-radius: 12px; --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Kanit', sans-serif; background-color: var(--background); color: var(--text-dark); line-height: 1.6; padding: 20px; min-height: 100vh; display: flex; flex-direction: column; }
    .app-container { max-width: 900px; margin: 0 auto; animation: fadeIn 0.5s ease-out; flex: 1; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .app-header { text-align: center; margin-bottom: 20px; color: var(--primary-dark); }
    .app-header h1 { font-size: 2rem; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 12px; font-weight: 600; }
    .current-date { color: var(--text-light); font-size: 0.95rem; font-weight: 300; }
    .tab-menu { display: flex; margin-bottom: 25px; border-bottom: 2px solid #e0e0e0; }
    .tab-btn { padding: 12px 20px; background: none; border: none; cursor: pointer; font-size: 1rem; font-weight: 500; color: var(--text-medium); transition: var(--transition); position: relative; margin-right: 5px; border-radius: 8px 8px 0 0; }
    .tab-btn:hover { background-color: rgba(76, 175, 80, 0.1); }
    .tab-btn.active { color: var(--primary-dark); background-color: rgba(76, 175, 80, 0.2); }
    .tab-btn.active::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background-color: var(--primary-color); }
    .tab-content { display: none; }
    .tab-content.active { display: block; animation: fadeIn 0.5s ease; }
    .form-card { background: var(--card-bg); border-radius: var(--border-radius); box-shadow: var(--shadow-sm); padding: 25px; margin-bottom: 25px; transition: var(--transition); border-top: 4px solid var(--primary-light); }
    .form-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
    .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; color: var(--primary-dark); }
    .card-header h2 { font-size: 1.4rem; font-weight: 500; }
    .card-header i { font-size: 1.2rem; color: var(--primary-light); }
    .form-group { margin-bottom: 18px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 400; color: var(--text-medium); display: flex; align-items: center; gap: 10px; font-size: 0.95rem; }
    .form-group i { color: var(--primary-light); width: 20px; text-align: center; }
    .form-group input { width: 100%; padding: 14px 16px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: var(--transition); background-color: white; font-family: 'Kanit', sans-serif; }
    .form-group input:focus { border-color: var(--primary-light); outline: none; box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2); }
    .output-box { padding: 16px; border-radius: 8px; margin-top: 20px; font-size: 1.1rem; display: flex; justify-content: space-between; align-items: center; background-color: rgba(255, 255, 255, 0.7); box-shadow: var(--shadow-sm); transition: var(--transition); }
    .output-box:hover { box-shadow: var(--shadow-md); }
    .output-box.revenue { border-left: 4px solid var(--success-color); color: var(--success-color); }
    .output-box.expense { border-left: 4px solid var(--warning-color); color: var(--warning-color); }
    .output-box.balance { border-left: 4px solid var(--primary-color); color: var(--primary-color); font-size: 1.3rem; font-weight: 500; background-color: rgba(139, 195, 74, 0.1); }
    .submit-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, var(--primary-light), var(--primary-dark)); color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 500; cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 10px; box-shadow: var(--shadow-sm); }
    .submit-btn:hover { background: linear-gradient(135deg, var(--primary-dark), var(--primary-light)); box-shadow: var(--shadow-md); transform: translateY(-2px); }
    .submit-btn:disabled { background: #9E9E9E; cursor: not-allowed; }
    .action-buttons { display: flex; gap: 15px; margin-top: 25px; }
    .action-btn { flex: 1; padding: 14px; border-radius: 8px; border: none; font-size: 0.95rem; font-weight: 500; cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: var(--shadow-sm); }
    .action-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .action-btn.sheet-btn { background-color: white; color: var(--text-medium); border: 1px solid #e0e0e0; }
    .action-btn.report-btn { background-color: var(--accent-color); color: white; }
    .msg-box { margin-top: 25px; padding: 16px; border-radius: 8px; text-align: center; font-weight: 500; background-color: rgba(255, 255, 255, 0.8); box-shadow: var(--shadow-sm); transition: var(--transition); }
    .msg-box.success { background-color: rgba(56, 142, 60, 0.1); color: var(--success-color); }
    .msg-box.error { background-color: rgba(211, 47, 47, 0.1); color: var(--error-color); }
    .msg-box.loading { background-color: rgba(251, 192, 45, 0.1); color: var(--warning-color); }
    .app-footer { text-align: center; margin-top: 18px; color: var(--text-light); font-size: 0.9rem; padding: 10px 0; }
    .status-indicator { display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 20px; padding: 8px; border-radius: 8px; font-size: 0.9rem; }
    .status-indicator.offline { background-color: #f5f5f5; color: var(--text-medium); }
    .status-indicator.online { background-color: rgba(76, 175, 80, 0.1); color: var(--primary-color); }
    .material-calculator { background: var(--card-bg); border-radius: var(--border-radius); box-shadow: var(--shadow-sm); padding: 25px; margin-bottom: 25px; transition: var(--transition); border-top: 4px solid var(--accent-color); }
    .input-group { margin-bottom: 20px; }
    .input-group label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-medium); }
    .input-group input { width: 100%; padding: 14px 16px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: var(--transition); background-color: white; }
    .input-group input:focus { border-color: var(--accent-color); outline: none; box-shadow: 0 0 0 3px rgba(139, 195, 74, 0.2); }
    .calc-buttons { display: flex; gap: 15px; margin-bottom: 20px; }
    .calc-btn { flex: 1; padding: 14px; background-color: var(--primary-light); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 500; cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 8px; }
    .calc-btn:hover { background-color: var(--primary-color); transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .calc-btn.reset { background-color: #f5f5f5; color: var(--text-medium); }
    .result-section { margin-top: 30px; }
    .result-table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: var(--shadow-sm); border-radius: var(--border-radius); overflow: hidden; }
    .result-table th, .result-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #e0e0e0; }
    .result-table th { background-color: var(--primary-light); color: white; font-weight: 500; }
    .result-table tr:nth-child(even) { background-color: rgba(139, 195, 74, 0.05); }
    .result-table tr:hover { background-color: rgba(139, 195, 74, 0.1); }
    .result-value { font-weight: 500; color: var(--primary-dark); }
    .toast-notification { position: fixed; bottom: 20px; right: 20px; padding: 16px 24px; border-radius: 8px; background-color: var(--primary-dark); color: white; box-shadow: var(--shadow-lg); z-index: 1000; transform: translateY(100px); opacity: 0; transition: all 0.3s ease; }
    .toast-notification.show { transform: translateY(0); opacity: 1; }
    .history-btn { margin-top: 15px; background-color: var(--primary-lighter); color: var(--text-dark); }
    .offline-list { margin-top: 20px; max-height: 200px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px; }
    .offline-item { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #eee; }
    .offline-item:last-child { border-bottom: none; }
    .duplicate-warning { background-color: rgba(255, 152, 0, 0.1); border-left: 4px solid var(--warning-color); color: var(--warning-color); padding: 12px; border-radius: 8px; margin-top: 15px; }
    .duplicate-warning.hidden { display: none; }
    .api-status { background: var(--card-bg); padding: 15px; border-radius: var(--border-radius); margin-bottom: 20px; text-align: center; }
    .api-status.connected { border-left: 4px solid var(--success-color); }
    .api-status.error { border-left: 4px solid var(--error-color); }
  </style>
</head>
<body>
  <div class="app-container">
    <header class="app-header">
      <h1><i class="fas fa-leaf"></i> SSKratomYMT</h1>
      <div class="current-date" id="currentDate"></div>
    </header>
    
    <div id="apiStatus" class="api-status connected">
      <i class="fas fa-check-circle"></i> เชื่อมต่อกับ Google Apps Script สำเร็จ
    </div>

    <div id="status" class="status-indicator">
      <i class="fas fa-wifi"></i> กำลังตรวจสอบสถานะอินเทอร์เน็ต...
    </div>

    <div class="tab-menu">
      <button class="tab-btn active" data-tab="sales-tab"><i class="fas fa-chart-line"></i> บันทึกยอดขาย</button>
      <button class="tab-btn" data-tab="material-tab"><i class="fas fa-calculator"></i> คำนวณวัตถุดิบ</button>
      <button class="tab-btn" data-tab="about-tab"><i class="fas fa-info-circle"></i> เกี่ยวกับ</button>
    </div>

    <div id="sales-tab" class="tab-content active">
      <form id="saleForm">
        <div class="form-card">
          <div class="card-header"><i class="fas fa-shopping-cart"></i><h2>ข้อมูลการขาย</h2></div>
          <div class="form-group"><label for="date"><i class="far fa-calendar-alt"></i> วันที่</label><input type="date" id="date" required /></div>
          <div class="form-group"><label for="sold"><i class="fas fa-wine-bottle"></i> จำนวนที่ขาย (ขวด)</label><input type="number" id="sold" min="0" value="0" /></div>
          <div class="form-group"><label for="pending"><i class="fas fa-clock"></i> ค้างน้ำดิบ (ขวด)</label><input type="number" id="pending" min="0" value="0" /></div>
          <div class="form-group"><label for="cleared"><i class="fas fa-check-circle"></i> เคลียร์ยอดค้างน้ำดิบ (ขวด)</label><input type="number" id="cleared" min="0" value="0" /></div>
          <div class="output-box revenue"><span>รายรับ:</span><strong id="revenue">0</strong> บาท</div>
        </div>

        <div class="form-card">
          <div class="card-header"><i class="fas fa-money-bill-wave"></i><h2>รายการค่าใช้จ่าย</h2></div>
          <div class="form-group"><label for="pipeFee"><i class="fas fa-tools"></i> ค่าท่อม</label><input type="number" id="pipeFee" min="0" value="0" /></div>
          <div class="form-group"><label for="shareFee"><i class="fas fa-handshake"></i> ค่าแชร์</label><input type="number" id="shareFee" min="0" value="0" /></div>
          <div class="form-group"><label for="otherFee"><i class="fas fa-receipt"></i> ค่าใช้จ่ายอื่น</label><input type="number" id="otherFee" min="0" value="0" /></div>
          <div class="form-group"><label for="saveFee"><i class="fas fa-piggy-bank"></i> เก็บออมเงิน</label><input type="number" id="saveFee" min="0" value="500" /></div>
          <div class="output-box expense"><span>รายจ่าย:</span><strong id="expense">0</strong> บาท</div>
        </div>

        <div class="form-card summary">
          <div class="card-header"><i class="fas fa-calculator"></i><h2>สรุปยอด</h2></div>
          <div class="output-box balance"><span>ยอดคงเหลือ:</span><strong id="balance">0</strong> บาท</div>
        </div>

        <button type="submit" class="submit-btn" id="submitBtn"><i class="fas fa-save"></i> บันทึกข้อมูล</button>
      </form>

      <div class="action-buttons">
        <button class="action-btn sheet-btn" id="viewHistoryBtn"><i class="fas fa-history"></i> ดูประวัติการบันทึก</button>
        <button class="action-btn report-btn" id="refreshDataBtn"><i class="fas fa-sync-alt"></i> รีเฟรชข้อมูล</button>
      </div>

      <div id="msg" class="msg-box" style="display: none;"></div>
    </div>

    <div id="material-tab" class="tab-content">
      <div class="material-calculator">
        <div class="card-header"><i class="fas fa-leaf"></i><h2>คำนวณวัตถุดิบผลิตน้ำกระท่อม</h2></div>
        <p style="margin-bottom: 20px; color: var(--text-medium);">กรอกข้อมูลอย่างน้อยหนึ่งช่องเพื่อคำนวณ</p>
        <div class="input-group"><label for="leafInput"><i class="fas fa-leaf"></i> จำนวนใบกระท่อม (กิโลกรัม)</label><input type="number" id="leafInput" min="0" placeholder="กรอกจำนวนใบกระท่อม"></div>
        <div class="input-group"><label for="waterInput"><i class="fas fa-tint"></i> จำนวนน้ำ (ลิตร)</label><input type="number" id="waterInput" min="0" placeholder="กรอกจำนวนน้ำ"></div>
        <div class="input-group"><label for="yieldInput"><i class="fas fa-wine-bottle"></i> จำนวนน้ำกระท่อมดิบที่ต้องการ (ลิตร)</label><input type="number" id="yieldInput" min="0" placeholder="กรอกจำนวนน้ำกระท่อมที่ต้องการ"></div>
        <div class="calc-buttons"><button id="calculateButton" class="calc-btn"><i class="fas fa-calculator"></i> คำนวณ</button><button id="resetButton" class="calc-btn reset"><i class="fas fa-redo"></i> รีเซ็ต</button></div>
        <div class="result-section" id="resultContainer" style="display: none;">
          <div class="card-header"><i class="fas fa-chart-bar"></i><h3>ผลลัพธ์การคำนวณ</h3></div>
          <table class="result-table">
            <thead><tr><th>วิธีการผลิต</th><th>ใบกระท่อม (กก.)</th><th>น้ำ (ลิตร)</th><th>น้ำกระท่อมดิบ (ลิตร)</th></tr></thead>
            <tbody>
              <tr><td><strong>วิธีบดใบกระท่อม</strong></td><td class="result-value" id="resultGroundLeaf">0.00</td><td class="result-value" id="resultGroundWater">0.00</td><td class="result-value" id="resultGroundYield">0.00</td></tr>
              <tr><td><strong>วิธีไม่บดใบ (0.65)</strong></td><td class="result-value" id="resultNotGroundLeaf1">0.00</td><td class="result-value" id="resultNotGroundWater1">0.00</td><td class="result-value" id="resultNotGroundYield1">0.00</td></tr>
              <tr><td><strong>วิธีไม่บดใบ (0.63)</strong></td><td class="result-value" id="resultNotGroundLeaf2">0.00</td><td class="result-value" id="resultNotGroundWater2">0.00</td><td class="result-value" id="resultNotGroundYield2">0.00</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="about-tab" class="tab-content">
      <div class="form-card">
        <div class="card-header"><i class="fas fa-info-circle"></i><h2>เกี่ยวกับ SSKratomYMT</h2></div>
        <div style="line-height: 1.8;">
          <p><strong>เวอร์ชัน:</strong> 2.0.1 (แก้ไข Duplicate Check)</p>
          <p><strong>พัฒนาโดย:</strong> ส.สามสี</p>
          <p><strong>คุณสมบัติ:</strong></p>
          <ul style="margin-left: 20px; margin-bottom: 15px;">
            <li>บันทึกยอดขายน้ำกระท่อม</li>
            <li>คำนวณวัตถุดิบการผลิต</li>
            <li>**ป้องกันการบันทึกข้อมูลซ้ำ (ตรวจเฉพาะวันที่)**</li>
            <li>ทำงานแบบออฟไลน์ได้</li>
            <li>รองรับ PWA</li>
          </ul>
          <p><strong>การสนับสนุน:</strong> # • SSKratom-YMT • ส.สามสี • #</p>
        </div>
      </div>
    </div>
  </div>

  <div id="toast" class="toast-notification"></div>

  <footer class="app-footer"># • SSKratom-YMT • ส.สามสี • #</footer>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // ตั้งค่าวันที่ปัจจุบัน
      document.getElementById('date').value = new Date().toISOString().substr(0, 10);
      document.getElementById('currentDate').textContent = new Date().toLocaleDateString('th-TH', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });

      // ตั้งค่าการคำนวณ
      const PRICE_PER_BOTTLE = 40;
      const inputs = ['sold', 'pending', 'cleared', 'pipeFee', 'shareFee', 'otherFee', 'saveFee'];
      
      function calculateAll() {
        const sold = parseInt(document.getElementById('sold').value) || 0;
        const pending = parseInt(document.getElementById('pending').value) || 0;
        const cleared = parseInt(document.getElementById('cleared').value) || 0;
        const pipeFee = parseInt(document.getElementById('pipeFee').value) || 0;
        const shareFee = parseInt(document.getElementById('shareFee').value) || 0;
        const otherFee = parseInt(document.getElementById('otherFee').value) || 0;
        const saveFee = parseInt(document.getElementById('saveFee').value) || 0;

        const revenue = (sold + cleared - pending) * PRICE_PER_BOTTLE;
        const expense = pipeFee + shareFee + otherFee + saveFee;
        const balance = revenue - expense;

        document.getElementById('revenue').textContent = revenue.toLocaleString();
        document.getElementById('expense').textContent = expense.toLocaleString();
        document.getElementById('balance').textContent = balance.toLocaleString();
      }

      // เพิ่ม event listener สำหรับ input ทั้งหมด
      inputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener('input', calculateAll);
      });

      // คำนวณครั้งแรก
      calculateAll();

      // การจัดการ tabs
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          // ลบ class active จากทั้งหมด
          document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
          
          // เพิ่ม class active ให้กับ tab ที่เลือก
          this.classList.add('active');
          document.getElementById(this.dataset.tab).classList.add('active');
        });
      });

      // ⭐⭐⭐ โค้ดที่แก้ไขเพื่อป้องกันการบันทึกซ้ำซ้อนจากฝั่งไคลเอนต์ & ยืนยันข้อมูล ⭐⭐⭐
      let isSubmitting = false; // สถานะการส่งฟอร์ม

      document.getElementById('saleForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const msgBox = document.getElementById('msg');
        
        // การป้องกันหลัก: ถ้ากำลังส่งอยู่ ให้หยุดทันที
        if (isSubmitting) {
            console.log("กำลังส่งข้อมูลอยู่, ข้ามการส่งซ้ำ");
            return;
        }
        
        const formData = {
            date: document.getElementById('date').value,
            sold: parseInt(document.getElementById('sold').value) || 0,
            pending: parseInt(document.getElementById('pending').value) || 0,
            cleared: parseInt(document.getElementById('cleared').value) || 0,
            pipeFee: parseInt(document.getElementById('pipeFee').value) || 0,
            shareFee: parseInt(document.getElementById('shareFee').value) || 0,
            otherFee: parseInt(document.getElementById('otherFee').value) || 0,
            saveFee: parseInt(document.getElementById('saveFee').value) || 0,
            revenue: parseInt(document.getElementById('revenue').textContent.replace(/,/g, '')) || 0,
            expense: parseInt(document.getElementById('expense').textContent.replace(/,/g, '')) || 0,
            balance: parseInt(document.getElementById('balance').textContent.replace(/,/g, '')) || 0
        };
        
        // ⭐⭐ ขั้นตอนที่ 1: การยืนยันข้อมูลก่อนบันทึก (ตามที่ร้องขอ) ⭐⭐
        const confirmMessage = `
            คุณยืนยันที่จะบันทึกข้อมูลนี้หรือไม่?
            
            วันที่: ${new Date(formData.date).toLocaleDateString('th-TH')}
            จำนวนที่ขาย: ${formData.sold} ขวด
            ค้างน้ำดิบ: ${formData.pending} ขวด
            เคลียร์ยอดค้างน้ำดิบ: ${formData.cleared} ขวด
            ยอดคงเหลือ: ${formData.balance.toLocaleString()} บาท
        `;

        if (!confirm(confirmMessage)) {
            // ถ้าผู้ใช้กด Cancel
            return;
        }

        // ⭐⭐ ขั้นตอนที่ 2: เริ่มต้นการส่งข้อมูล ⭐⭐
        isSubmitting = true; // ตั้งค่าสถานะเป็นกำลังส่ง
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังบันทึก...';
        msgBox.style.display = 'none';

        // ส่งข้อมูลไปยัง Google Apps Script
        fetch(window.location.href, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
          if (data.status === 'success') {
            msgBox.className = 'msg-box success';
            msgBox.innerHTML = '<i class="fas fa-check-circle"></i> ' + data.message;
            msgBox.style.display = 'block';
            
            // รีเซ็ตฟอร์ม
            document.getElementById('saleForm').reset();
            document.getElementById('date').value = new Date().toISOString().substr(0, 10);
            calculateAll();
            
            // แสดง toast
            showToast('บันทึกข้อมูลสำเร็จ!');
          } else {
            throw new Error(data.message || 'บันทึกข้อมูลไม่สำเร็จ');
          }
        })
        .catch(error => {
          console.error('Submission error:', error);
          msgBox.className = 'msg-box error';
          msgBox.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + (error.message.includes('HTTP Error') ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message : error.message);
          msgBox.style.display = 'block';
        })
        .finally(() => {
          // ยกเลิกสถานะกำลังส่งเมื่อกระบวนการเสร็จสิ้น
          isSubmitting = false; 
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-save"></i> บันทึกข้อมูล';
        });
      });
      // ⭐⭐⭐ สิ้นสุดโค้ดที่แก้ไขเพื่อป้องกันการบันทึกซ้ำซ้อนจากฝั่งไคลเอนต์ & ยืนยันข้อมูล ⭐⭐⭐


      // ฟังก์ชันแสดง toast
      function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
        }, 3000);
      }

      // การคำนวณวัตถุดิบ
      document.getElementById('calculateButton').addEventListener('click', function() {
        const leaf = parseFloat(document.getElementById('leafInput').value) || 0;
        const water = parseFloat(document.getElementById('waterInput').value) || 0;
        const yieldDesired = parseFloat(document.getElementById('yieldInput').value) || 0;

        if (leaf === 0 && water === 0 && yieldDesired === 0) {
          showToast('กรุณากรอกข้อมูลอย่างน้อยหนึ่งช่อง');
          return;
        }

        // การคำนวณ (ตัวอย่าง)
        const ratios = {
          ground: { leafToWater: 20, waterToYield: 15 / 20 },
          notGround1: { leafToWater: 15.38, waterToYield: 12 / 15.38 },
          notGround2: { leafToWater: 15.87302, waterToYield: 12 / 15.87302 }
        };

        let values = {
            ground: { leaf: 0, water: 0, yield: 0 },
            notGround1: { leaf: 0, water: 0, yield: 0 },
            notGround2: { leaf: 0, water: 0, yield: 0 }
        };

        if (leaf > 0) {
          values.ground = { leaf, water: leaf * ratios.ground.leafToWater, yield: (leaf * ratios.ground.leafToWater) * ratios.ground.waterToYield };
          values.notGround1 = { leaf, water: leaf * ratios.notGround1.leafToWater, yield: (leaf * ratios.notGround1.leafToWater) * ratios.notGround1.waterToYield };
          values.notGround2 = { leaf, water: leaf * ratios.notGround2.leafToWater, yield: (leaf * ratios.notGround2.leafToWater) * ratios.notGround2.waterToYield };
        } else if (water > 0) {
          values.ground = { leaf: water / ratios.ground.leafToWater, water, yield: water * ratios.ground.waterToYield };
          values.notGround1 = { leaf: water / ratios.notGround1.leafToWater, water, yield: water * ratios.notGround1.waterToYield };
          values.notGround2 = { leaf: water / ratios.notGround2.leafToWater, water, yield: water * ratios.notGround2.waterToYield };
        } else if (yieldDesired > 0) {
          const waterGround = yieldDesired / ratios.ground.waterToYield;
          values.ground = { leaf: waterGround / ratios.ground.leafToWater, water: waterGround, yield: yieldDesired };
          
          const waterNotGround1 = yieldDesired / ratios.notGround1.waterToYield;
          values.notGround1 = { leaf: waterNotGround1 / ratios.notGround1.leafToWater, water: waterNotGround1, yield: yieldDesired };
          
          const waterNotGround2 = yieldDesired / ratios.notGround2.waterToYield;
          values.notGround2 = { leaf: waterNotGround2 / ratios.notGround2.leafToWater, water: waterNotGround2, yield: yieldDesired };
        }


        // แสดงผลลัพธ์
        document.getElementById('resultGroundLeaf').textContent = values.ground.leaf.toFixed(2);
        document.getElementById('resultGroundWater').textContent = values.ground.water.toFixed(2);
        document.getElementById('resultGroundYield').textContent = values.ground.yield.toFixed(2);
        
        document.getElementById('resultNotGroundLeaf1').textContent = values.notGround1.leaf.toFixed(2);
        document.getElementById('resultNotGroundWater1').textContent = values.notGround1.water.toFixed(2);
        document.getElementById('resultNotGroundYield1').textContent = values.notGround1.yield.toFixed(2);
        
        document.getElementById('resultNotGroundLeaf2').textContent = values.notGround2.leaf.toFixed(2);
        document.getElementById('resultNotGroundWater2').textContent = values.notGround2.water.toFixed(2);
        document.getElementById('resultNotGroundYield2').textContent = values.notGround2.yield.toFixed(2);

        document.getElementById('resultContainer').style.display = 'block';
        showToast('คำนวณสำเร็จ!');
      });

      document.getElementById('resetButton').addEventListener('click', function() {
        document.getElementById('leafInput').value = '';
        document.getElementById('waterInput').value = '';
        document.getElementById('yieldInput').value = '';
        document.getElementById('resultContainer').style.display = 'none';
      });

      // ตรวจสอบสถานะอินเทอร์เน็ต
      function updateOnlineStatus() {
        const statusEl = document.getElementById('status');
        if (navigator.onLine) {
          statusEl.innerHTML = '<i class="fas fa-wifi"></i> คุณกำลังออนไลน์';
          statusEl.className = 'status-indicator online';
        } else {
          statusEl.innerHTML = '<i class="fas fa-plane"></i> คุณกำลังออฟไลน์';
          statusEl.className = 'status-indicator offline';
        }
      }

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      updateOnlineStatus();

      // ตรวจสอบสถานะ API
      checkAPIStatus();
    });

    function checkAPIStatus() {
      fetch(window.location.href + '?action=health')
        .then(response => response.json())
        .then(data => {
          const statusEl = document.getElementById('apiStatus');
          if (data.status === 'success') {
            statusEl.innerHTML = '<i class="fas fa-check-circle"></i> ' + data.message;
            statusEl.className = 'api-status connected';
          }
        })
        .catch(error => {
          const statusEl = document.getElementById('apiStatus');
          statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
          statusEl.className = 'api-status error';
        });
    }
  </script>
</body>
</html>
`;
  
  return HtmlService.createHtmlOutput(htmlContent)
    .setTitle('SSKratomYMT - บันทึกยอดขาย')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * จัดการคำขอข้อมูล
 */
function handleDataRequest(e) {
  const action = e.parameter.action;
  
  try {
    if (action === 'getData' || action === 'history') {
      const history = getSalesHistory(); // ต้องมีฟังก์ชัน getSalesHistory() อยู่ในโค้ดจริงของคุณ
      return ContentService.createTextOutput(JSON.stringify(history))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('Error in handleDataRequest:', error);
    return createErrorResponse('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.toString());
  }
}

/**
 * ตรวจสอบสถานะสุขภาพของระบบ
 */
function handleHealthCheck() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const lastRow = sheet.getLastRow();
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'ระบบทำงานปกติ',
      timestamp: new Date().toISOString(),
      totalRecords: lastRow > 0 ? lastRow - 1 : 0,
      sheetName: SHEET_NAME,
      appVersion: '2.0.1'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'ระบบมีปัญหา: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * สร้าง response ข้อผิดพลาด
 */
function createErrorResponse(message) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>เกิดข้อผิดพลาด - SSKratomYMT</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .error { color: #D32F2F; }
      </style>
    </head>
    <body>
      <h1 class="error">⚠️ เกิดข้อผิดพลาด</h1>
      <p>${message}</p>
      <button onclick="window.location.reload()">ลองอีกครั้ง</button>
    </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html)
    .setTitle('เกิดข้อผิดพลาด - SSKratomYMT');
}

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
    
    // ตรวจสอบว่าข้อมูลที่ส่งมาเป็น array (สำหรับ offline sync) หรือ object เดียว
    const records = Array.isArray(requestData) ? requestData : [requestData];
    
    let successCount = 0;
    let duplicateCount = 0;
    
    // วนลูปเพื่อบันทึกทุกรายการข้อมูล
    records.forEach(record => {
      // ⭐⭐ จุดแก้ไข: ตรวจสอบข้อมูลซ้ำโดยดูแค่ 'Date' เท่านั้น ⭐⭐
      if (isDuplicateRecord(sheet, record)) {
        console.log(`พบข้อมูลซ้ำสำหรับวันที่: ${record.date} (เนื่องจากบันทึกข้อมูลวันนี้ไปแล้ว)`);
        duplicateCount++;
        return; // ข้ามการบันทึกข้อมูลซ้ำ
      }
      
      // จัดรูปแบบวันที่และเวลาสำหรับโซนเวลาประเทศไทย
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
        'message': `บันทึกข้อมูลสำเร็จ ${successCount} รายการ${duplicateCount > 0 ? `, พบข้อมูลซ้ำ ${duplicateCount} รายการ (ไม่บันทึกซ้ำ)` : ''}`,
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
 * ฟังก์ชันตรวจสอบข้อมูลซ้ำ (แก้ไขให้ตรวจสอบเฉพาะ 'Date' เท่านั้น)
 */
function isDuplicateRecord(sheet, record) {
  try {
    const data = sheet.getDataRange().getValues();
    
    // ข้ามหัวข้อคอลัมน์ (แถวแรก)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // ตรวจสอบวันที่ (คอลัมน์ 0)
      if (row[0] && record.date) {
        const existingDate = new Date(row[0]);
        const newDate = new Date(record.date);
        
        // เปรียบเทียบวันที่ (ไม่รวมเวลา)
        if (existingDate.toDateString() === newDate.toDateString()) {
          // ถ้าวันที่ตรงกัน ถือว่าซ้ำ (ตามความต้องการของผู้ใช้)
          return true;
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
 * ฟังก์ชันสำหรับทดสอบ (ส่วนนี้ใช้งานใน Apps Script Editor เท่านั้น)
 */
function testDoGet() {
  console.log('=== ทดสอบฟังก์ชัน doGet ===');
  try {
    const htmlOutput = serveHTML();
    console.log('✅ serveHTML ทำงานปกติ');
  } catch (error) {
    console.error('❌ serveHTML ผิดพลาด:', error);
  }
  try {
    const healthCheck = handleHealthCheck();
    console.log('✅ Health check ทำงานปกติ');
  } catch (error) {
    console.error('❌ Health check ผิดพลาด:', error);
  }
  console.log('=== การทดสอบ doGet เสร็จสิ้น ===');
  return 'การทดสอบ doGet เสร็จสิ้น';
}

function getSalesHistory() {
    // ฟังก์ชันนี้ไม่ได้รวมอยู่ในโค้ดเดิมของคุณ แต่จำเป็นต้องมี
    // เพื่อให้ handleDataRequest ทำงานได้ จึงใส่เป็นฟังก์ชันเปล่าไว้
    return [];
}
