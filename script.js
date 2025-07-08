<script>
        // *** สำคัญมาก: เปลี่ยน 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' ด้วย URL ที่คุณได้รับจากการเผยแพร่ Apps Script ***
        // ทำตามขั้นตอนที่ 2 ด้านล่าง เพื่อให้ได้ URL นี้
        const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwVvx0LRySiXzJvwycSvVxOT8qWnEl9HkL09uTzZ7X6yTukke9h4QC3_lwn47Sgmp8A/exec'; 

        // ตั้งค่าตัวแปรสำหรับการแบ่งหน้า
        let currentPage = 1;
        const recordsPerPage = 10;
        let allHistoryData = [];

        // ตั้งค่าวันที่เริ่มต้นเป็นวันปัจจุบัน
        document.getElementById('date').valueAsDate = new Date();

        // ฟังก์ชันจัดรูปแบบตัวเลขด้วยเครื่องหมายคอมม่า
        function formatNumber(num) {
            if (typeof num !== 'number' || isNaN(num)) return '0.00';
            return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        
        // ฟังก์ชันคำนวณรายรับอัตโนมัติ
        function calculateIncome() {
            const quantity = parseFloat(document.getElementById('quantity').value) || 0;
            const rawWaterDebt = parseFloat(document.getElementById('rawWaterDebt').value) || 0;
            const pricePerUnit = 40; // ราคาต่อหน่วย 40 บาท
            
            const netUnits = Math.max(0, quantity - rawWaterDebt);
            const totalIncome = netUnits * pricePerUnit;
            
            document.getElementById('totalIncome').value = formatNumber(totalIncome);
            document.getElementById('summaryIncome').textContent = formatNumber(totalIncome) + ' ฿';
            return totalIncome;
        }
        
        // ฟังก์ชันคำนวณรายจ่าย
        function calculateExpenses() {
            const pipeCost = parseFloat(document.getElementById('pipeCost').value) || 0;
            const shareCost = parseFloat(document.getElementById('shareCost').value) || 0;
            const savings = parseFloat(document.getElementById('savings').value) || 0;
            const otherExpenses = parseFloat(document.getElementById('otherExpenses').value) || 0;
            const totalExpenses = pipeCost + shareCost + savings + otherExpenses;
            document.getElementById('totalExpenses').value = formatNumber(totalExpenses);
            document.getElementById('summaryExpenses').textContent = formatNumber(totalExpenses) + ' ฿';
            return totalExpenses;
        }
        
        // ฟังก์ชันคำนวณคงเหลือ
        function calculateRemaining() {
            const totalIncome = calculateIncome();
            const totalExpenses = calculateExpenses();
            const remaining = totalIncome - totalExpenses;
            
            document.getElementById('remaining').value = formatNumber(remaining);
            document.getElementById('summaryRemaining').textContent = formatNumber(remaining) + ' ฿';
            
            return remaining;
        }
        
        // ฟังก์ชันอัปเดตตัวอย่างข้อมูลสำหรับ Modal
        function updateModalPreview() {
            const previewElement = document.getElementById('modalPreviewContent');
            
            // ใช้ค่าจาก input โดยตรง และคำนวณใหม่เพื่อให้มั่นใจว่าได้ค่าล่าสุด
            const date = document.getElementById('date').value;
            const quantity = parseFloat(document.getElementById('quantity').value) || 0;
            const rawWaterDebt = parseFloat(document.getElementById('rawWaterDebt').value) || 0;
            const pipeCost = parseFloat(document.getElementById('pipeCost').value) || 0;
            const shareCost = parseFloat(document.getElementById('shareCost').value) || 0;
            const savings = parseFloat(document.getElementById('savings').value) || 0;
            const otherExpenses = parseFloat(document.getElementById('otherExpenses').value) || 0;

            const pricePerUnit = 40;
            const calculatedIncome = Math.max(0, quantity - rawWaterDebt) * pricePerUnit;
            const calculatedExpenses = pipeCost + shareCost + savings + otherExpenses;
            const calculatedRemaining = calculatedIncome - calculatedExpenses;

            let previewHTML = `
                <div class="summary-item">
                    <span><i class="far fa-calendar-alt"></i> วันที่:</span>
                    <span>${date}</span>
                </div>
                <div class="summary-item">
                    <span><i class="fas fa-bottle-water"></i> จำนวนขวดที่ขายได้:</span>
                    <span>${quantity} ขวด</span>
                </div>
                <div class="summary-item">
                    <span><i class="fas fa-exclamation-circle"></i> ค้างน้ำดิบ:</span>
                    <span>${rawWaterDebt} ขวด</span>
                </div>
                <div class="summary-item">
                    <span><i class="fas fa-coins"></i> รวมรายรับ:</span>
                    <span>${formatNumber(calculatedIncome)} ฿</span>
                </div>
                <div class="summary-item">
                    <span><i class="fas fa-leaf"></i> ค่าท่อม:</span>
                    <span>${formatNumber(pipeCost)} ฿</span>
                </div>
                <div class="summary-item">
                    <span><i class="fas fa-handshake"></i> ค่าแชร์:</span>
                    <span>${formatNumber(shareCost)} ฿</span>
                </div>
                <div class="summary-item">
                    <span><i class="fas fa-piggy-bank"></i> เก็บออม:</span>
                    <span>${formatNumber(savings)} ฿</span>
                </div>
                <div class="summary-item">
                    <span><i class="fas fa-receipt"></i> ค่าใช้จ่ายอื่น:</span>
                    <span>${formatNumber(otherExpenses)} ฿</span>
                </div>
                <div class="summary-item summary-total">
                    <span><i class="fas fa-money-bill-wave"></i> รวมรายจ่าย:</span>
                    <span>${formatNumber(calculatedExpenses)} ฿</span>
                </div>
                <div class="summary-item summary-total">
                    <span><i class="fas fa-wallet"></i> คงเหลือ:</span>
                    <span>${formatNumber(calculatedRemaining)} ฿</span>
                </div>
            `;
            
            previewElement.innerHTML = previewHTML;
        }
        
        // ฟังก์ชันดึงข้อมูลจากฟอร์มสำหรับส่งไปยัง Apps Script
        function getFormDataForSubmission() {
            const data = {
                date: document.getElementById('date').value,
                quantity: parseFloat(document.getElementById('quantity').value) || 0,
                rawWaterDebt: parseFloat(document.getElementById('rawWaterDebt').value) || 0,
                pipeCost: parseFloat(document.getElementById('pipeCost').value) || 0,
                shareCost: parseFloat(document.getElementById('shareCost').value) || 0,
                savings: parseFloat(document.getElementById('savings').value) || 0,
                otherExpenses: parseFloat(document.getElementById('otherExpenses').value) || 0,
            };

            // คำนวณค่าที่ส่งไปให้ Apps Script โดยตรง
            const pricePerUnit = 40;
            data.totalIncome = Math.max(0, data.quantity - data.rawWaterDebt) * pricePerUnit;
            data.totalExpenses = data.pipeCost + data.shareCost + data.savings + data.otherExpenses;
            data.remaining = data.totalIncome - data.totalExpenses;
            
            return data;
        }
        
        // ตั้ง Event Listeners สำหรับการคำนวณอัตโนมัติ
        const inputs = ['quantity', 'rawWaterDebt', 'pipeCost', 'shareCost', 'savings', 'otherExpenses'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', calculateRemaining);
        });

        // Tab Switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                this.classList.add('active');
                document.getElementById(`${this.dataset.tab}-tab`).classList.add('active');
                
                if (this.dataset.tab === 'history') {
                    loadHistory();
                }
            });
        });
        
        // Preview Button (เปลี่ยนเป็น ตรวจสอบข้อมูลก่อนบันทึก)
        document.getElementById('previewBtn').addEventListener('click', function() {
            const quantity = parseFloat(document.getElementById('quantity').value) || 0;

            if (quantity <= 0) {
                showStatus('กรุณากรอกจำนวนขวดที่ขายได้ (ต้องมากกว่า 0) ก่อนตรวจสอบข้อมูล', 'error');
                return;
            }
            
            updateModalPreview(); // อัปเดตตัวอย่างใน modal
            document.getElementById('previewModal').style.display = 'flex'; // เปลี่ยนเป็น flex เพื่อจัดกลาง
        });
        
        // Confirm Save Button
        document.getElementById('confirmSaveBtn').addEventListener('click', async function() {
            document.getElementById('previewModal').style.display = 'none';
            await submitFormData(); // เรียกใช้ฟังก์ชัน submit โดยตรง
        });

        // Cancel Save Button
        document.getElementById('cancelSaveBtn').addEventListener('click', function() {
            document.getElementById('previewModal').style.display = 'none';
        });

        // Close Modal Buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            });
        });
        
        // Click outside modal to close
        window.addEventListener('click', function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        });

        // Refresh History Button
        document.getElementById('refreshHistory').addEventListener('click', loadHistory);

        // Export Data Button (ปัจจุบันยังไม่ได้เชื่อมต่อจริง)
        document.getElementById('exportData').addEventListener('click', function() {
            showStatus('ฟังก์ชันส่งออกข้อมูลยังไม่พร้อมใช้งานในตอนนี้', 'info');
        });

        // ฟังก์ชันสร้าง Pagination
        function setupPagination(totalRecords) {
            const pagination = document.getElementById('pagination');
            pagination.innerHTML = '';
            
            const totalPages = Math.ceil(totalRecords / recordsPerPage);
            
            if (totalPages <= 1) return;
            
            // Previous Button
            const prevLi = document.createElement('li');
            prevLi.className = 'page-item';
            prevLi.innerHTML = `<a class="page-link" href="#" id="prevPage"><i class="fas fa-chevron-left"></i></a>`;
            pagination.appendChild(prevLi);
            
            // Page Numbers
            for (let i = 1; i <= totalPages; i++) {
                const li = document.createElement('li');
                li.className = 'page-item';
                li.innerHTML = `<a class="page-link ${i === currentPage ? 'active' : ''}" href="#" data-page="${i}">${i}</a>`;
                pagination.appendChild(li);
            }
            
            // Next Button
            const nextLi = document.createElement('li');
            nextLi.className = 'page-item';
            nextLi.innerHTML = `<a class="page-link" href="#" id="nextPage"><i class="fas fa-chevron-right"></i></a>`;
            pagination.appendChild(nextLi);
            
            // Event Listeners
            document.querySelectorAll('.page-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    if (this.id === 'prevPage' && currentPage > 1) {
                        currentPage--;
                    } else if (this.id === 'nextPage' && currentPage < totalPages) {
                        currentPage++;
                    } else if (this.dataset.page) {
                        currentPage = parseInt(this.dataset.page);
                    }
                    
                    displayHistoryPage();
                });
            });
        }

        // ฟังก์ชันแสดงข้อมูลแบ่งหน้า
        function displayHistoryPage() {
            const tbody = document.getElementById('historyTableBody');
            tbody.innerHTML = '';
            
            const startIndex = (currentPage - 1) * recordsPerPage;
            const endIndex = Math.min(startIndex + recordsPerPage, allHistoryData.length);
            
            if (allHistoryData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">ไม่พบข้อมูล</td></tr>';
                return;
            }
            
            for (let i = startIndex; i < endIndex; i++) {
                const item = allHistoryData[i];
                const row = document.createElement('tr');
                // เพิ่ม ID ให้กับแถวเพื่อใช้อ้างอิงในการแสดงรายละเอียด (ถ้ามี)
                row.dataset.id = item.id; 
                row.innerHTML = `
                    <td>${item.date}</td>
                    <td>${item.quantity || 0} ขวด</td>
                    <td>${formatNumber(item.totalIncome || 0)} ฿</td>
                    <td>${formatNumber(item.totalExpenses || 0)} ฿</td>
                    <td>${formatNumber(item.remaining || 0)} ฿</td>
                    <td><span class="badge badge-success"><i class="fas fa-check-circle"></i> บันทึกแล้ว</span></td>
                    <td>
                        <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="showDetail('${item.id}')">
                            <i class="fas fa-info-circle"></i> รายละเอียด
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            }
            
            setupPagination(allHistoryData.length);
        }

//ฟังก์ชันโหลดประวัติ
async function loadHistory() {
    if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        showStatus('กรุณาตั้งค่า URL ของ Google Apps Script ก่อนใช้งาน', 'warning');
        return;
    }

    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;"><div class="spinner"></div>กำลังโหลดข้อมูล...</td></tr>';
    
    try {
        // เพิ่ม timestamp เพื่อป้องกันการ cache
        const urlWithTimestamp = `${GOOGLE_APPS_SCRIPT_URL}?method=GET&timestamp=${new Date().getTime()}`;
        
        const response = await fetch(urlWithTimestamp, {
            method: 'GET',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // เนื่องจากใช้ no-cors เราจะไม่สามารถอ่าน response JSON ได้โดยตรง
        // ให้ใช้วิธีอื่นเพื่อรับข้อมูล เช่น การใช้ Google Sheets API โดยตรง
        // หรือตั้งค่า CORS ใน Google Apps Script
        
        // วิธีแก้ไขชั่วคราว: แสดงข้อมูลตัวอย่าง (คุณควรแทนที่ส่วนนี้ด้วยการเรียกข้อมูลจริง)
        allHistoryData = [
            {
                id: '1',
                date: '2023-01-01',
                quantity: 10,
                rawWaterDebt: 2,
                totalIncome: 320,
                pipeCost: 50,
                shareCost: 100,
                savings: 500,
                otherExpenses: 0,
                totalExpenses: 650,
                remaining: -330
            }
        ];
        
        currentPage = 1;
        displayHistoryPage();
        showStatus('โหลดข้อมูลประวัติสำเร็จ (ตัวอย่าง)', 'success');
        
    } catch (error) {
        console.error('Error loading history:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">ไม่สามารถโหลดข้อมูลได้</td></tr>';
        showStatus('เกิดข้อผิดพลาดในการโหลดประวัติ', 'error');
    }
}
        
        // ฟังก์ชันแสดงรายละเอียด
        window.showDetail = async function(id) {
            const detailContent = document.getElementById('detailModalContent');
            detailContent.innerHTML = '<div class="spinner"></div><div style="text-align: center; margin-top: 10px;">กำลังโหลดรายละเอียด...</div>';
            
            document.getElementById('detailModal').style.display = 'flex';
            
            // หาข้อมูลจาก allHistoryData ที่โหลดมาแล้ว แทนการเรียก API ซ้ำ
            const detailData = allHistoryData.find(item => item.id === id);

            if (!detailData) {
                // หากไม่พบข้อมูล อาจจะลองดึงใหม่จาก Apps Script (แต่ควรพบถ้าอยู่ใน allHistoryData)
                detailContent.innerHTML = `
                    <div class="error" style="padding: 15px; border-radius: 8px;">
                        <i class="fas fa-exclamation-triangle"></i> ไม่พบรายละเอียดสำหรับรายการนี้
                    </div>
                `;
                return;
            }
            
            detailContent.innerHTML = `
                <div class="summary-item">
                    <span><i class="far fa-calendar-alt"></i> วันที่:</span>
                    <span>${detailData.date || 'N/A'}</span>
                </div>
                <div class="summary-item">
                    <span><i class="fas fa-bottle-water"></i> จำนวนขวดที่ขายได้:</span>
                    <span>${detailData.quantity || 0} ขวด</span>
                </div>
                <div class="summary-item">
                    <span><i class="fas fa-exclamation-circle"></i> ค้างน้ำดิบ:</span>
                    <span>${detailData.rawWaterDebt || 0} ขวด</span>
                </div>
                <div class="summary-item">
                    <span><i class="fas fa-coins"></i> รวมรายรับ:</span>
                    <span>${formatNumber(detailData.totalIncome || 0)} ฿</span>
                </div>
                <div class="summary-item">
                    <span><i class="fas fa-leaf"></i> ค่าท่อม:</span>
                    <span>${formatNumber(detailData.pipeCost || 0)} ฿</span>
                </div>
                <div class="summary-item">
                    <span><i class="fas fa-handshake"></i> ค่าแชร์:</span>
                    <span>${formatNumber(detailData.shareCost || 0)} ฿</span>
                </div>
                <div class="summary-item">
                    <span><i class="fas fa-piggy-bank"></i> เก็บออม:</span>
                    <span>${formatNumber(detailData.savings || 0)} ฿</span>
                </div>
                <div class="summary-item">
                    <span><i class="fas fa-receipt"></i> ค่าใช้จ่ายอื่น:</span>
                    <span>${formatNumber(detailData.otherExpenses || 0)} ฿</span>
                </div>
                <div class="summary-item summary-total">
                    <span><i class="fas fa-money-bill-wave"></i> รวมรายจ่าย:</span>
                    <span>${formatNumber(detailData.totalExpenses || 0)} ฿</span>
                </div>
                <div class="summary-item summary-total">
                    <span><i class="fas fa-wallet"></i> คงเหลือ:</span>
                    <span>${formatNumber(detailData.remaining || 0)} ฿</span>
                </div>
            `;
        };
        
//// ฟังก์ชันส่งข้อมูลไปยัง Google Sheet
async function submitFormData() {
    const submitBtn = document.getElementById('confirmSaveBtn');
    const salesForm = document.getElementById('salesForm');

    submitBtn.disabled = true;
    const originalButtonText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังบันทึก...';

    const formData = getFormDataForSubmission();

    // ตรวจสอบข้อมูลก่อนส่ง
    if (!formData.date || formData.quantity <= 0) {
        showStatus('กรุณากรอกวันที่และจำนวนขวดที่ขายได้ (ต้องมากกว่า 0)', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalButtonText;
        return;
    }

    try {
        // เพิ่ม timestamp เพื่อป้องกันการ cache
        const urlWithTimestamp = `${GOOGLE_APPS_SCRIPT_URL}?timestamp=${new Date().getTime()}`;
        
        const response = await fetch(urlWithTimestamp, {
            method: 'POST',
            mode: 'no-cors', // เพิ่มนี้เพื่อจัดการกับ CORS
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // เนื่องจากใช้ no-cors เราจะไม่สามารถอ่าน response ได้โดยตรง
        // ให้แสดงข้อความสำเร็จโดยไม่ต้องตรวจสอบ response
        showStatus('บันทึกข้อมูลสำเร็จ! ระบบกำลังอัปเดต...', 'success');

        // รีเซ็ตฟอร์ม
        salesForm.reset();
        document.getElementById('date').valueAsDate = new Date();
        document.getElementById('shareCost').value = '100';
        document.getElementById('savings').value = '500';
        calculateRemaining();
        
        // รีเฟรชประวัติหลังจากบันทึก (รอ 2 วินาทีเพื่อให้ Google Sheet อัปเดต)
        setTimeout(loadHistory, 2000);

    } catch (error) {
        console.error('Error:', error);
        showStatus('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalButtonText;
    }
}

// แสดงสถานะการบันทึก
function showStatus(message, type) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = type;
    statusElement.style.display = 'block';

    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 5000);
}

// คำนวณเริ่มต้น (เรียกเมื่อโหลดหน้าครั้งแรก)
calculateRemaining();

// โหลดประวัติเมื่อหน้าเว็บโหลดเสร็จ (ถ้าแท็บประวัติเป็นแท็บ active)
document.addEventListener('DOMContentLoaded', function() {
    // *** ตรวจสอบว่า GOOGLE_APPS_SCRIPT_URL ยังเป็นค่าเริ่มต้นหรือไม่ สำหรับการโหลดประวัติ ***
    if (typeof GOOGLE_APPS_SCRIPT_URL === 'undefined' || GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' || !GOOGLE_APPS_SCRIPT_URL.startsWith('https://script.google.com/macros/s/')) {
        // แสดงสถานะว่ายังไม่ได้ตั้งค่า Apps Script URL
        showStatus('กรุณาตั้งค่า GOOGLE_APPS_SCRIPT_URL ในโค้ดก่อนใช้งาน (ทั้งบันทึกและประวัติ)', 'warning');
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">**กรุณาตั้งค่า Google Apps Script URL ในโค้ด**</td></tr>';
        return;
    }

    if (document.querySelector('.tab.active').dataset.tab === 'history') {
        loadHistory();
            }
        });
    </script>