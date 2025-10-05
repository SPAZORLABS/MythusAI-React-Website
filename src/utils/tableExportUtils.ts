/**
 * Export Handsontable data to CSV format
 */
export const exportTableToCSV = (hotInstance: any, filename?: string) => {
  if (!hotInstance) {
    console.error('No Handsontable instance provided');
    return;
  }

  try {
    // Get the data from Handsontable
    const data = hotInstance.getData();
    const headers = hotInstance.getColHeader();
    
    // Find the index of scene_id column to exclude it
    const sceneIdIndex = headers.findIndex((header: string) => 
      header.toLowerCase() === 'scene_id' || header.toLowerCase() === 'scene id'
    );
    
    // Filter out scene_id column from headers and data
    const filteredHeaders = headers.filter((_: any, index: number) => index !== sceneIdIndex);
    const filteredData = data.map((row: any[]) => 
      row.filter((_: any, index: number) => index !== sceneIdIndex)
    );
    
    // Create CSV content
    const csvRows: string[] = [];
    
    // Add header row
    csvRows.push(filteredHeaders.map(header => `"${header}"`).join(','));
    
    // Add data rows
    filteredData.forEach((row: any[]) => {
      const csvRow = row.map(cell => {
        // Handle null/undefined values
        if (cell === null || cell === undefined) {
          return '""';
        }
        
        // Convert to string and escape quotes
        const cellValue = String(cell).replace(/"/g, '""');
        return `"${cellValue}"`;
      });
      csvRows.push(csvRow.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `scenes_table_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Failed to export table to CSV:', error);
    throw new Error('Failed to export table data');
  }
};

/**
 * Export Handsontable data to Excel format using XLSX
 */
export const exportTableToExcel = (hotInstance: any, filename?: string) => {
  if (!hotInstance) {
    console.error('No Handsontable instance provided');
    return;
  }

  try {
    // Import XLSX dynamically to avoid bundle size issues if not used
    import('xlsx').then(XLSX => {
      // Get the data from Handsontable
      const data = hotInstance.getData();
      const headers = hotInstance.getColHeader();
      
      // Find the index of scene_id column to exclude it
      const sceneIdIndex = headers.findIndex((header: string) => 
        header.toLowerCase() === 'scene_id' || header.toLowerCase() === 'scene id'
      );
      
      // Filter out scene_id column from headers and data
      const filteredHeaders = headers.filter((_: any, index: number) => index !== sceneIdIndex);
      const filteredData = data.map((row: any[]) => 
        row.filter((_: any, index: number) => index !== sceneIdIndex)
      );
      
      // Create worksheet data
      const worksheetData = [
        filteredHeaders,
        ...filteredData
      ];
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Set column widths for better readability
      const columnWidths = headers.map((header: string, index: number) => {
        const maxLength = Math.max(
          header.length,
          ...data.map((row: any[]) => (row[index] || '').toString().length)
        );
        return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
      });
      worksheet['!cols'] = columnWidths;
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Scenes Table');
      
      // Generate and download the file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename || `scenes_table_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }).catch(error => {
      console.error('Failed to load XLSX library:', error);
      throw new Error('XLSX library not available');
    });
    
  } catch (error) {
    console.error('Failed to export table to Excel:', error);
    throw new Error('Failed to export table data');
  }
};

/**
 * Export only visible data from Handsontable (respects filters)
 */
export const exportVisibleTableToCSV = (hotInstance: any, filename?: string) => {
  if (!hotInstance) {
    console.error('No Handsontable instance provided');
    return;
  }

  try {
    // Get visible data (respects filters and hidden rows)
    const visibleData = hotInstance.getData('filter');
    const headers = hotInstance.getColHeader();
    
    // Find the index of scene_id column to exclude it
    const sceneIdIndex = headers.findIndex((header: string) => 
      header.toLowerCase() === 'scene_id' || header.toLowerCase() === 'scene id'
    );
    
    // Filter out scene_id column from headers and data
    const filteredHeaders = headers.filter((_: any, index: number) => index !== sceneIdIndex);
    const filteredData = visibleData.map((row: any[]) => 
      row.filter((_: any, index: number) => index !== sceneIdIndex)
    );
    
    // Create CSV content
    const csvRows: string[] = [];
    
    // Add header row
    csvRows.push(filteredHeaders.map(header => `"${header}"`).join(','));
    
    // Add visible data rows
    filteredData.forEach((row: any[]) => {
      const csvRow = row.map(cell => {
        // Handle null/undefined values
        if (cell === null || cell === undefined) {
          return '""';
        }
        
        // Convert to string and escape quotes
        const cellValue = String(cell).replace(/"/g, '""');
        return `"${cellValue}"`;
      });
      csvRows.push(csvRow.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `scenes_table_filtered_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Failed to export visible table data:', error);
    throw new Error('Failed to export visible table data');
  }
};
