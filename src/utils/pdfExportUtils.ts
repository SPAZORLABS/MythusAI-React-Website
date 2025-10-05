import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface ProductionReportData {
  formData: {
    shootLocation: string;
    shootDate: string;
    dayNumber: string;
    sceneNumber: string;
    completed: string;
    partCompleted: string;
    toPickUp: string;
    callShootTime: string;
    breakfastOnLocation: string;
    firstShot: string;
    lunchBreak: string;
    firstShotPostLunch: string;
    eveningSnacks: string;
    wrap: string;
    numberOfSetups: string;
    totalHours: string;
    extraAddEquipment: string;
    juniorsRequirement: string;
    actualCount: string;
    wrapTime: string;
    notes: string;
    approvedBy: string;
    firstAD: string;
    productionHOD: string;
  };
  characters: Array<{
    character: string;
    castName: string;
    callTime: string;
    reportTime: string;
  }>;
  selectedScreenplay?: {
    title: string;
    id: string;
  };
  selectedScene?: {
    scene_number: string;
    header: string;
    body: string;
  };
}

export const exportProductionReportToPDF = async (data: ProductionReportData): Promise<void> => {
  try {
    // Create a new PDF document - A4 landscape to match the frontend
    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add a new page - A4 landscape (841.89 x 595.28)
    const page = pdfDoc.addPage([841.89, 595.28]);
    const { width, height } = page.getSize();
    
    // Set up margins and spacing to match frontend
    const margin = 40;
    const cellHeight = 25;
    const lineThickness = 1;
    const borderThickness = 2;
    
    // Helper function to add text
    const addText = (text: string, x: number, y: number, fontSize: number = 9, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
      const fontToUse = isBold ? boldFont : font;
      let adjustedX = x;
      
      if (align === 'center') {
        const textWidth = fontToUse.widthOfTextAtSize(text, fontSize);
        adjustedX = x - textWidth / 2;
      } else if (align === 'right') {
        const textWidth = fontToUse.widthOfTextAtSize(text, fontSize);
        adjustedX = x - textWidth;
      }
      
      page.drawText(text, {
        x: adjustedX,
        y: y - fontSize,
        size: fontSize,
        font: fontToUse,
        color: rgb(0, 0, 0),
      });
    };
    
    // Helper function to draw a rectangle (cell)
    const drawRect = (x: number, y: number, width: number, height: number, thickness: number = lineThickness, fillColor?: any) => {
      if (fillColor) {
        page.drawRectangle({
          x,
          y,
          width,
          height,
          color: fillColor,
        });
      }
      page.drawRectangle({
        x,
        y,
        width,
        height,
        borderColor: rgb(0, 0, 0),
        borderWidth: thickness,
      });
    };
    
    // Helper function to draw a line
    const drawLine = (startX: number, startY: number, endX: number, endY: number, thickness: number = lineThickness) => {
      page.drawLine({
        start: { x: startX, y: startY },
        end: { x: endX, y: endY },
        thickness,
        color: rgb(0, 0, 0),
      });
    };
    
    let currentY = height - margin;
    
    // Main container border (thick border)
    const containerWidth = width - (margin * 2);
    const containerHeight = height - (margin * 2) - 20;
    drawRect(margin, currentY - containerHeight, containerWidth, containerHeight, borderThickness);
    
    currentY -= 40;
    
    // Header section
    drawRect(margin, currentY - 40, containerWidth, 40, borderThickness);
    drawLine(margin, currentY - 40, margin + containerWidth, currentY - 40, lineThickness);
    
    addText('DAILY PRODUCTION REPORT', margin + containerWidth / 2, currentY - 15, 14, true, 'center');
    addText('PRODUCTION HOUSE', margin + containerWidth / 2, currentY - 30, 12, true, 'center');
    
    currentY -= 45;
    
    // Shoot Location Row
    drawRect(margin, currentY - cellHeight, containerWidth, cellHeight, lineThickness);
    drawLine(margin + containerWidth / 4, currentY - cellHeight, margin + containerWidth / 4, currentY, lineThickness);
    
    addText('Shoot Location', margin + 10, currentY - 8, 9, true);
    addText(data.formData.shootLocation || '', margin + containerWidth / 4 + 10, currentY - 8, 9);
    
    currentY -= cellHeight;
    
    // Shoot Date Row
    drawRect(margin, currentY - cellHeight, containerWidth, cellHeight, lineThickness);
    drawLine(margin + containerWidth / 4, currentY - cellHeight, margin + containerWidth / 4, currentY, lineThickness);
    
    addText('Shoot Date', margin + 10, currentY - 8, 9, true);
    addText(data.formData.shootDate || 'XX-XX-XXXX', margin + containerWidth / 4 + 10, currentY - 8, 9);
    addText(`Day (${data.formData.dayNumber || 'N'})`, margin + containerWidth / 4 + 10, currentY - 18, 8);
    
    currentY -= cellHeight;
    
    // Scene Number and Status Row
    drawRect(margin, currentY - cellHeight, containerWidth, cellHeight, lineThickness);
    drawLine(margin + containerWidth / 4, currentY - cellHeight, margin + containerWidth / 4, currentY, lineThickness);
    drawLine(margin + containerWidth / 2, currentY - cellHeight, margin + containerWidth / 2, currentY, lineThickness);
    drawLine(margin + (containerWidth * 3) / 4, currentY - cellHeight, margin + (containerWidth * 3) / 4, currentY, lineThickness);
    
    addText('Scene Number:', margin + 10, currentY - 8, 9, true);
    addText(data.formData.sceneNumber || '', margin + 80, currentY - 8, 9);
    
    addText('Completed:', margin + containerWidth / 4 + 10, currentY - 8, 9, true);
    addText(data.formData.completed || '', margin + containerWidth / 4 + 80, currentY - 8, 9);
    
    addText('Part Completed:', margin + containerWidth / 2 + 10, currentY - 8, 9, true);
    addText(data.formData.partCompleted || '', margin + containerWidth / 2 + 80, currentY - 8, 9);
    
    addText('To Pick Up:', margin + (containerWidth * 3) / 4 + 10, currentY - 8, 9, true);
    addText(data.formData.toPickUp || '', margin + (containerWidth * 3) / 4 + 80, currentY - 8, 9);
    
    currentY -= cellHeight;
    
    // Time Schedule Rows (4 rows)
    const scheduleRows = [
      { label1: 'Call/Shoot Time', value1: data.formData.callShootTime, label2: 'Breakfast on Location', value2: data.formData.breakfastOnLocation },
      { label1: 'First Shot', value1: data.formData.firstShot, label2: 'Lunch Break', value2: data.formData.lunchBreak },
      { label1: '1st Shot Post Lunch', value1: data.formData.firstShotPostLunch, label2: 'Evening Snacks', value2: data.formData.eveningSnacks },
      { label1: 'Wrap', value1: data.formData.wrap, label2: 'Number of Setups', value2: data.formData.numberOfSetups }
    ];
    
    scheduleRows.forEach(row => {
      drawRect(margin, currentY - cellHeight, containerWidth, cellHeight, lineThickness);
      drawLine(margin + containerWidth / 4, currentY - cellHeight, margin + containerWidth / 4, currentY, lineThickness);
      drawLine(margin + containerWidth / 2, currentY - cellHeight, margin + containerWidth / 2, currentY, lineThickness);
      drawLine(margin + (containerWidth * 3) / 4, currentY - cellHeight, margin + (containerWidth * 3) / 4, currentY, lineThickness);
      
      addText(row.label1, margin + 10, currentY - 8, 9, true);
      addText(row.value1 || '', margin + containerWidth / 4 + 10, currentY - 8, 9);
      addText(row.label2, margin + containerWidth / 2 + 10, currentY - 8, 9, true);
      addText(row.value2 || '', margin + (containerWidth * 3) / 4 + 10, currentY - 8, 9);
      
      currentY -= cellHeight;
    });
    
    // Total Hours and Extra Equipment Row
    drawRect(margin, currentY - cellHeight, containerWidth, cellHeight, lineThickness);
    drawLine(margin + containerWidth / 4, currentY - cellHeight, margin + containerWidth / 4, currentY, lineThickness);
    drawLine(margin + containerWidth / 2, currentY - cellHeight, margin + containerWidth / 2, currentY, lineThickness);
    drawLine(margin + (containerWidth * 3) / 4, currentY - cellHeight, margin + (containerWidth * 3) / 4, currentY, lineThickness);
    
    addText('Total Hours', margin + 10, currentY - 8, 9, true);
    addText(data.formData.totalHours || '', margin + containerWidth / 4 + 10, currentY - 8, 9);
    addText('Extra Add. Equipment', margin + containerWidth / 2 + 10, currentY - 8, 9, true);
    addText(data.formData.extraAddEquipment || '', margin + (containerWidth * 3) / 4 + 10, currentY - 8, 9);
    
    currentY -= cellHeight;
    
    // Juniors and Wrap Time Row
    drawRect(margin, currentY - cellHeight, containerWidth, cellHeight, lineThickness);
    drawLine(margin + containerWidth / 4, currentY - cellHeight, margin + containerWidth / 4, currentY, lineThickness);
    drawLine(margin + containerWidth / 2, currentY - cellHeight, margin + containerWidth / 2, currentY, lineThickness);
    drawLine(margin + (containerWidth * 3) / 4, currentY - cellHeight, margin + (containerWidth * 3) / 4, currentY, lineThickness);
    
    addText('Juniors Requirement -', margin + 10, currentY - 8, 9, true);
    addText(data.formData.juniorsRequirement || '', margin + 120, currentY - 8, 9);
    addText('Actual Count:', margin + containerWidth / 4 + 10, currentY - 8, 9, true);
    addText(data.formData.actualCount || '', margin + containerWidth / 4 + 80, currentY - 8, 9);
    addText('Wrap Time:', margin + containerWidth / 2 + 10, currentY - 8, 9, true);
    addText(data.formData.wrapTime || '', margin + containerWidth / 2 + 80, currentY - 8, 9);
    
    currentY -= cellHeight;
    
    // Characters Header
    drawRect(margin, currentY - cellHeight, containerWidth, cellHeight, lineThickness, rgb(0.9, 0.9, 0.9));
    drawLine(margin + containerWidth / 4, currentY - cellHeight, margin + containerWidth / 4, currentY, lineThickness);
    drawLine(margin + containerWidth / 2, currentY - cellHeight, margin + containerWidth / 2, currentY, lineThickness);
    drawLine(margin + (containerWidth * 3) / 4, currentY - cellHeight, margin + (containerWidth * 3) / 4, currentY, lineThickness);
    
    addText('Characters', margin + 10, currentY - 8, 9, true);
    addText('Cast Name', margin + containerWidth / 4 + 10, currentY - 8, 9, true);
    addText('Call Time', margin + containerWidth / 2 + 10, currentY - 8, 9, true);
    addText('Report Time', margin + (containerWidth * 3) / 4 + 10, currentY - 8, 9, true);
    
    currentY -= cellHeight;
    
    // Characters Rows
    data.characters.forEach((char, index) => {
      drawRect(margin, currentY - cellHeight, containerWidth, cellHeight, lineThickness);
      drawLine(margin + containerWidth / 4, currentY - cellHeight, margin + containerWidth / 4, currentY, lineThickness);
      drawLine(margin + containerWidth / 2, currentY - cellHeight, margin + containerWidth / 2, currentY, lineThickness);
      drawLine(margin + (containerWidth * 3) / 4, currentY - cellHeight, margin + (containerWidth * 3) / 4, currentY, lineThickness);
      
      addText(char.character || '', margin + 10, currentY - 8, 9);
      addText(char.castName || '', margin + containerWidth / 4 + 10, currentY - 8, 9);
      addText(char.callTime || '', margin + containerWidth / 2 + 10, currentY - 8, 9);
      addText(char.reportTime || '', margin + (containerWidth * 3) / 4 + 10, currentY - 8, 9);
      
      currentY -= cellHeight;
    });
    
    // Notes Section
    currentY -= 20;
    drawRect(margin, currentY - 40, containerWidth, 40, borderThickness);
    drawLine(margin, currentY - 20, margin + containerWidth, currentY - 20, lineThickness);
    
    addText('Notes:', margin + 10, currentY - 8, 9, true);
    
    // Split notes into lines if too long
    const notes = data.formData.notes || '';
    const maxCharsPerLine = 100;
    const noteLines = notes.length > maxCharsPerLine ? 
      [notes.substring(0, maxCharsPerLine), notes.substring(maxCharsPerLine, maxCharsPerLine * 2)] :
      [notes];
    
    noteLines.forEach((line, index) => {
      if (index < 2) { // Limit to 2 lines
        addText(line, margin + 10, currentY - 25 - (index * 10), 9);
      }
    });
    
    currentY -= 50;
    
    // Approval Section
    drawRect(margin, currentY - 60, containerWidth, 60, borderThickness);
    drawLine(margin, currentY - 20, margin + containerWidth, currentY - 20, lineThickness);
    drawLine(margin + containerWidth / 2, currentY - 20, margin + containerWidth / 2, currentY - 60, lineThickness);
    
    addText('Approved by:', margin + 10, currentY - 8, 9, true);
    
    // 1st AD
    drawLine(margin + 20, currentY - 35, margin + containerWidth / 2 - 20, currentY - 35, lineThickness);
    addText(data.formData.firstAD || '', margin + 30, currentY - 45, 9);
    addText('1st AD:', margin + 30, currentY - 55, 9, true);
    
    // Production HOD
    drawLine(margin + containerWidth / 2 + 20, currentY - 35, margin + containerWidth - 20, currentY - 35, lineThickness);
    addText(data.formData.productionHOD || '', margin + containerWidth / 2 + 30, currentY - 45, 9);
    addText('Production HOD:', margin + containerWidth / 2 + 30, currentY - 55, 9, true);
    
    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    
    // Create blob and download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename
    const screenplayTitle = data.selectedScreenplay?.title || 'Production';
    const shootDate = data.formData.shootDate || 'Unknown';
    const sceneNumber = data.formData.sceneNumber || 'Unknown';
    const filename = `Daily_Production_Report_${screenplayTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${shootDate}_Scene_${sceneNumber}.pdf`;
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};

export default {
  exportProductionReportToPDF
};
