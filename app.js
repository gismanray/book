// Set the worker URL (required by PDF.js to run tasks in the background)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cloudflare.com';

const url = 'pdf/Chapter01.pdf'; // Path to your file
const pageToView = 3;            // Specify the target page number
const scale = 1.5;               // Set the zoom / sharpness level

// Load the PDF document
pdfjsLib.getDocument(url).promise.then(pdf => {
    
    // Fetch the specific page
    return pdf.getPage(pageToView);
    
}).then(page => {
    const canvas = document.getElementById('pdf-canvas');
    const context = canvas.getContext('2d');

    // Calculate dimensions based on original viewport and specified scale
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Package canvas context and viewport together
    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };

    // Render the page into the HTML canvas
    page.render(renderContext);
    console.log(`Page ${pageToView} rendered successfully.`);
    
}).catch(error => {
    console.error('Error loading or rendering PDF:', error);
});
