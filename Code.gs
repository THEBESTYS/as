// Google Apps Script - Google Sheets 연동

// 시트 설정
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAME = 'FormSubmissions';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // 헤더가 없는 경우 생성
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp', 'Form Type', 'Name', 'Company', 'Email', 'Phone',
        'Service', 'Budget', 'Timeline', 'Description', 'References',
        'Has Attachments', 'Attachment Count', 'Privacy Agree',
        'Newsletter Subscribe', 'Page URL', 'User Agent'
      ];
      sheet.appendRow(headers);
    }
    
    // 데이터 행 추가
    const rowData = [
      new Date(),
      data['form-type'] || 'Unknown',
      data.name || '',
      data.company || '',
      data.email || '',
      data.phone || '',
      data.service || data.projectType || '',
      data.budget || '',
      data.timeline || '',
      data.description || data.message || '',
      data.references || '',
      data.hasAttachments || false,
      data.attachmentCount || 0,
      data.privacyAgree || false,
      data.newsletterSubscribe || false,
      data.pageUrl || '',
      data.userAgent || ''
    ];
    
    sheet.appendRow(rowData);
    
    // 이메일 알림
    sendEmailNotification(data);
    
    // Slack 알림 (옵션)
    // sendSlackNotification(data);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendEmailNotification(data) {
  const recipient = Session.getActiveUser().getEmail(); // 또는 지정 이메일
  const subject = `[ashop] New ${data['form-type'] || 'Form'} Submission`;
  
  const body = `
New form submission received:

📋 Submission Details:
• Type: ${data['form-type'] || 'Unknown'}
• Name: ${data.name || 'N/A'}
• Company: ${data.company || 'N/A'}
• Email: ${data.email || 'N/A'}
• Phone: ${data.phone || 'N/A'}
• Service: ${data.service || data.projectType || 'N/A'}
• Budget: ${data.budget || 'N/A'}
• Timeline: ${data.timeline || 'N/A'}

📝 Message:
${data.description || data.message || 'No message provided'}

⏰ Submitted: ${new Date().toLocaleString('ko-KR')}
📄 View in Google Sheets: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit
  `;
  
  MailApp.sendEmail(recipient, subject, body);
}

// 자동 응답 이메일 (선택)
function sendAutoReply(data) {
  if (!data.email) return;
  
  const subject = 'ashop - Thank you for your inquiry';
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #00D4FF;">Thank you for contacting ashop!</h2>
      <p>We have received your ${data['form-type'] === 'consultation' ? 'consultation request' : 'project inquiry'}.</p>
      <p>Our team will review your request and get back to you within 24 hours.</p>
      <br>
      <p>Best regards,<br>The ashop Team</p>
    </div>
  `;
  
  GmailApp.sendEmail(data.email, subject, '', { htmlBody: htmlBody });
}
