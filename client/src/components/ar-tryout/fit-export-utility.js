/**
 * Utility functions for exporting and importing clothing fit adjustments
 * Use these functions to permanently save your clothing fit settings to files
 */

// Export saved adjustments to a JSON file
export const exportFitAdjustmentsToFile = (savedAdjustments) => {
    try {
      // Create a data structure with metadata and the actual adjustments
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        appName: "H&M AR Try-On",
        adjustments: savedAdjustments,
        itemCount: Object.keys(savedAdjustments).length
      };
      
      // Create a JSON string with the complete data
      const dataStr = JSON.stringify(exportData, null, 2);
      
      // Create a blob with the JSON data
      const blob = new Blob([dataStr], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      
      // Set the filename - include a timestamp for uniqueness
      const date = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      link.download = `clothing-fit-adjustments-${date}.json`;
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Release the blob URL
      URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: `Fit adjustments for ${Object.keys(savedAdjustments).length} items exported successfully!`
      };
    } catch (error) {
      console.error('Error exporting adjustments:', error);
      return {
        success: false,
        message: 'Error exporting fit adjustments: ' + error.message
      };
    }
  };
  
  // Import saved adjustments from a JSON file
  export const importFitAdjustmentsFromFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // Parse the file content as JSON
          const fileData = JSON.parse(e.target.result);
          
          // Extract the adjustments - handle both the new format with metadata and old format
          let importedData;
          let itemCount = 0;
          let exportDate = null;
          
          if (fileData.adjustments && fileData.version) {
            // New format with metadata
            importedData = fileData.adjustments;
            itemCount = fileData.itemCount || Object.keys(importedData).length;
            exportDate = fileData.exportDate;
          } else {
            // Old format or direct adjustments object
            importedData = fileData;
            itemCount = Object.keys(importedData).length;
          }
          
          // Validate the imported data
          if (typeof importedData !== 'object') {
            throw new Error('Invalid file format. Expected a JSON object of adjustments.');
          }
          
          if (itemCount === 0) {
            throw new Error('No saved adjustments found in the file.');
          }
          
          // Return the imported data
          resolve({
            success: true,
            data: importedData,
            itemCount,
            exportDate,
            message: `Successfully imported ${itemCount} items from file.`
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading the file. Please try again.'));
      };
      
      // Read the file as text
      reader.readAsText(file);
    });
  };