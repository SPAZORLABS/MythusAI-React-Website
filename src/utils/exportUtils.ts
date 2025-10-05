import * as XLSX from 'xlsx';
import { MasterBreakdownResponse } from '@/services/api/masterBreakdownService';

/**
 * Export master breakdown data to CSV format
 */
export const exportToCSV = (breakdown: MasterBreakdownResponse, filename?: string) => {
  const data = convertBreakdownToTableData(breakdown);
  
  // Create CSV content
  const csvContent = [
    // Header row
    data.headers.join(','),
    // Data rows
    ...data.rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `master_breakdown_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export master breakdown data to Excel format
 */
export const exportToExcel = (breakdown: MasterBreakdownResponse, filename?: string) => {
  const data = convertBreakdownToTableData(breakdown);
  
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet format
  const worksheet = XLSX.utils.aoa_to_sheet([
    data.headers,
    ...data.rows
  ]);
  
  // Set column widths for better readability
  const columnWidths = data.headers.map((header, index) => {
    const maxLength = Math.max(
      header.length,
      ...data.rows.map(row => (row[index] || '').toString().length)
    );
    return { wch: Math.min(Math.max(maxLength + 2, 15), 50) };
  });
  worksheet['!cols'] = columnWidths;
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Breakdown');
  
  // Generate and download the file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `master_breakdown_${new Date().toISOString().split('T')[0]}.xlsx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Convert breakdown data to table format for export
 */
const convertBreakdownToTableData = (breakdown: MasterBreakdownResponse) => {
  const headers = ['Element', 'Values'];
  const rows: string[][] = [];
  
  // Process each scene element
  breakdown.scene_elements.forEach(element => {
    const elementName = element.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (element.values.length === 0) {
      // If no values, add a row with empty value
      rows.push([elementName, '']);
    } else {
      // Add each value as a separate row
      element.values.forEach(value => {
        rows.push([elementName, String(value || '')]);
      });
    }
  });
  
  return { headers, rows };
};

/**
 * Export master breakdown data in a more structured format with all values in one row per element
 */
export const exportToCSVStructured = (breakdown: MasterBreakdownResponse, filename?: string) => {
  const data = convertBreakdownToStructuredData(breakdown);
  
  // Create CSV content
  const csvContent = [
    // Header row
    data.headers.join(','),
    // Data rows
    ...data.rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `master_breakdown_structured_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export master breakdown data in structured Excel format
 */
export const exportToExcelStructured = (breakdown: MasterBreakdownResponse, filename?: string) => {
  const data = convertBreakdownToStructuredData(breakdown);
  
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet format
  const worksheet = XLSX.utils.aoa_to_sheet([
    data.headers,
    ...data.rows
  ]);
  
  // Set column widths for better readability
  const columnWidths = data.headers.map((header, index) => {
    const maxLength = Math.max(
      header.length,
      ...data.rows.map(row => (row[index] || '').toString().length)
    );
    return { wch: Math.min(Math.max(maxLength + 2, 15), 50) };
  });
  worksheet['!cols'] = columnWidths;
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Breakdown');
  
  // Generate and download the file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `master_breakdown_structured_${new Date().toISOString().split('T')[0]}.xlsx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Convert breakdown data to structured table format (one row per element with all values)
 */
const convertBreakdownToStructuredData = (breakdown: MasterBreakdownResponse) => {
  const headers = ['Element', 'Values (Comma Separated)'];
  const rows: string[][] = [];
  
  // Process each scene element
  breakdown.scene_elements.forEach(element => {
    const elementName = element.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const valuesString = element.values.map(value => String(value || '')).join(', ');
    
    rows.push([elementName, valuesString]);
  });
  
  return { headers, rows };
};
