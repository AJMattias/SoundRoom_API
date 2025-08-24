import fs from 'fs-extra';
import { PDFDocument, rgb } from 'pdf-lib';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

//CharImage example
export async function generateBarChartExample(labels, data) {
    const width = 600;
    const height = 400;

    const chartCallback = (ChartJS) => {
        ChartJS.defaults.global.defaultFontSize = 16;
    };

    const backgroundColour = 'white'
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

    const data = {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    const chartImage = await chartJSNodeCanvas.renderToBuffer(data);

    return chartImage;
}

//chart image with data parameters
export async function generateBarChart(labels, data) {
    const width = 600;
    const height = 400;

    const chartCallback = (ChartJS) => {
        ChartJS.defaults.global.defaultFontSize = 16;
    };

    const backgroundColour = 'white'
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

    const data = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Propietarios que alquilan',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    const chartImage = await chartJSNodeCanvas.renderToBuffer(data);

    return chartImage;
}


// Función para generar el PDF con el gráfico de barras y texto relacionado
export async function generatePDF(chartImage) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([700, 500]);

    page.drawText('Reporte', {
        x: 50,
        y: 450,
        size: 24,
        color: rgb(0, 0, 0),
    });

    // Insertar imagen del gráfico
    const image = await pdfDoc.embedPng(chartImage);
    const imageSize = image.scale(0.5);
    page.drawImage(image, {
        x: 50,
        y: 150,
        width: imageSize.width,
        height: imageSize.height
    });

    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
}