import jsPDF from 'jspdf';

/**
 * Genera un PDF profesional de cotización con diseño premium
 * Tamaño: Letter (215.9 x 279.4 mm)
 * @param {Object} quoteData - Datos de la cotización
 */
export const generateSalesQuotePDF = async (quoteData) => {
    // Letter size: 215.9mm x 279.4mm
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
    });

    // Colores del diseño (azul oscuro y naranja/dorado)
    const darkBlue = [25, 55, 95];
    const accentOrange = [230, 140, 50];
    const darkGray = [51, 51, 51];
    const white = [255, 255, 255];
    const lightGray = [245, 245, 248];
    const successGreen = [34, 139, 34];

    // URL del logo
    const logoUrl = 'https://res.cloudinary.com/dbowaer8j/image/upload/v1743713944/Tesipedia-logo_n1liaw.png';

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Formatear precio
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    // Convertir número a palabras
    const numberToWords = (num) => {
        const units = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
        const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
        const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
        const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

        if (num === 0) return 'cero';
        if (num === 100) return 'cien';
        if (num === 1000) return 'mil';

        let words = '';

        if (num >= 1000) {
            const thousands = Math.floor(num / 1000);
            if (thousands === 1) {
                words += 'mil ';
            } else if (thousands < 10) {
                words += units[thousands] + ' mil ';
            } else if (thousands < 20) {
                words += teens[thousands - 10] + ' mil ';
            } else {
                const t = Math.floor(thousands / 10);
                const u = thousands % 10;
                if (u === 0) {
                    words += tens[t] + ' mil ';
                } else if (t === 2) {
                    words += 'veinti' + units[u] + ' mil ';
                } else {
                    words += tens[t] + ' y ' + units[u] + ' mil ';
                }
            }
            num %= 1000;
        }

        if (num >= 100) {
            if (num === 100) {
                words += 'cien ';
            } else {
                words += hundreds[Math.floor(num / 100)] + ' ';
            }
            num %= 100;
        }

        if (num >= 20) {
            const t = Math.floor(num / 10);
            const u = num % 10;
            if (u === 0) {
                words += tens[t];
            } else if (t === 2) {
                words += 'veinti' + units[u];
            } else {
                words += tens[t] + ' y ' + units[u];
            }
        } else if (num >= 10) {
            words += teens[num - 10];
        } else if (num > 0) {
            words += units[num];
        }

        return words.trim();
    };

    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    // Función para cargar imagen
    const loadImage = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            return null;
        }
    };

    // Generar número de cotización
    const quoteNumber = `COT-${Date.now().toString().slice(-6)}`;

    // Fecha actual
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // ============ HEADER CON DISEÑO DIAGONAL ============
    // Fondo azul oscuro diagonal superior
    doc.setFillColor(...darkBlue);
    doc.triangle(0, 0, pageWidth, 0, 0, 35, 'F');
    doc.triangle(pageWidth, 0, pageWidth, 28, 0, 35, 'F');

    // Línea naranja diagonal
    doc.setFillColor(...accentOrange);
    doc.triangle(0, 35, pageWidth, 28, pageWidth, 33, 'F');
    doc.triangle(0, 35, 0, 40, pageWidth, 33, 'F');

    // Logo de Tesipedia - proporciones cuadradas
    try {
        const logoData = await loadImage(logoUrl);
        if (logoData) {
            // Logo más cuadrado: 32x28 para mejor proporción vertical
            doc.addImage(logoData, 'PNG', margin, 4, 32, 28);
        }
    } catch (error) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...white);
        doc.text('TESIPEDIA', margin + 5, 20);
    }

    // Título de empresa en header (centrado arriba)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...white);
    doc.text('TESIPEDIA', pageWidth / 2 + 25, 9, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('SERVICIOS ACADÉMICOS PROFESIONALES', pageWidth / 2 + 25, 14, { align: 'center' });

    // Línea separadora decorativa
    doc.setDrawColor(0, 0, 0, 0.5);
    doc.setLineWidth(0.3);
    doc.line(pageWidth / 2 - 20, 17, pageWidth / 2 + 70, 17);

    // Información de contacto estilo minimalista elegante
    const contactY = 24;

    // Teléfono
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentOrange);
    doc.text('TELÉFONO', 75, contactY - 2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...white);
    doc.setFontSize(7.5);
    doc.text('+52 (55) 4100 4180', 75, contactY + 2);

    // Separador vertical
    doc.setDrawColor(...accentOrange);
    doc.setLineWidth(0.5);
    doc.line(113, contactY - 5, 113, contactY + 4);

    // Correo
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentOrange);
    doc.text('CORREO', 120, contactY - 2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...white);
    doc.setFontSize(7.5);
    doc.text('tesipediaoficial@gmail.com', 120, contactY + 2);

    // Separador vertical
    doc.line(170, contactY - 5, 170, contactY + 4);

    // Sitio web
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentOrange);
    doc.text('SITIO WEB', 177, contactY - 2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...white);
    doc.setFontSize(7.5);
    doc.text('www.tesipedia.com', 177, contactY + 2);

    let yPos = 40;

    // ============ CAJA DE DATOS DE COTIZACIÓN ============
    const dataBoxHeight = 50;

    // Fondo de la caja
    doc.setFillColor(250, 250, 252);
    doc.rect(margin, yPos, contentWidth, dataBoxHeight, 'F');

    // Borde elegante
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(margin, yPos, contentWidth, dataBoxHeight, 'S');

    // Título COTIZACIÓN centrado arriba dentro de la caja (más pequeño)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkBlue);
    doc.text('COTIZACIÓN', pageWidth / 2, yPos + 10, { align: 'center' });

    // Línea decorativa debajo del título
    doc.setDrawColor(...accentOrange);
    doc.setLineWidth(0.8);
    doc.line(pageWidth / 2 - 25, yPos + 13, pageWidth / 2 + 25, yPos + 13);

    // ===== Datos del cliente (izquierda) - lista apilada =====
    const dataY = yPos + 20;
    const lineSpacing = 10;

    // Cliente
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('CLIENTE', margin + 10, dataY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkBlue);
    doc.setFontSize(10);
    doc.text(quoteData.clientName, margin + 10, dataY + 4);

    // Tipo de trabajo
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('TIPO DE TRABAJO', margin + 10, dataY + lineSpacing);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...accentOrange);
    doc.setFontSize(9);
    doc.text(quoteData.tipoTrabajo, margin + 10, dataY + lineSpacing + 4);

    // Extensión
    if (quoteData.extensionEstimada) {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkGray);
        doc.text('EXTENSIÓN', margin + 10, dataY + (lineSpacing * 2));
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkGray);
        doc.setFontSize(8);
        doc.text(`${quoteData.extensionEstimada} páginas (aproximadamente)`, margin + 10, dataY + (lineSpacing * 2) + 4);
    }

    // ===== Datos de cotización (derecha) - lista apilada =====
    const rightX = pageWidth - margin - 45;

    // Nº Cotización
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('Nº COTIZACIÓN', rightX, dataY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkGray);
    doc.setFontSize(8);
    doc.text(quoteNumber, rightX, dataY + 4);

    // Fecha
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('FECHA', rightX, dataY + lineSpacing);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkGray);
    doc.setFontSize(8);
    doc.text(formattedDate, rightX, dataY + lineSpacing + 4);

    // Validez
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('VALIDEZ', rightX, dataY + (lineSpacing * 2));
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 53, 69); // Rojo
    doc.setFontSize(8);
    doc.text('15 días', rightX, dataY + (lineSpacing * 2) + 4);

    yPos += dataBoxHeight + 8;

    // ============ DESCRIPCIÓN DEL SERVICIO ============
    // Header de la tabla con diseño diagonal
    const tableX = margin;
    const tableWidth = contentWidth;

    // Fondo del header con forma diagonal
    doc.setFillColor(...darkBlue);
    doc.rect(tableX, yPos, tableWidth * 0.65, 8, 'F');

    doc.setFillColor(...accentOrange);
    doc.rect(tableX + tableWidth * 0.65, yPos, tableWidth * 0.35, 8, 'F');

    // Diagonal entre azul y naranja
    doc.setFillColor(...darkBlue);
    doc.triangle(tableX + tableWidth * 0.63, yPos, tableX + tableWidth * 0.68, yPos, tableX + tableWidth * 0.63, yPos + 8, 'F');

    // Texto del header
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...white);
    doc.text('DESCRIPCIÓN DEL SERVICIO', tableX + 5, yPos + 5.5);
    doc.text('INCLUIDO', tableX + tableWidth * 0.68, yPos + 5.5);
    doc.text('PRECIO', tableX + tableWidth - 5, yPos + 5.5, { align: 'right' });

    yPos += 8;

    // Descripción del servicio - usa directamente la descripción enviada desde el formulario
    const descripcionPrincipal = quoteData.descripcionServicio || 'Servicio académico profesional';

    // Fila de descripción principal - multilínea
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkBlue);

    // Dividir texto en líneas para que quepa (solo en la sección de descripción, no en INCLUIDO)
    // Aumentado 20px (aproximadamente 7mm) el ancho: de 0.6 a 0.65
    const maxLineWidth = tableWidth * 0.65 - 10;
    const lines = doc.splitTextToSize(descripcionPrincipal, maxLineWidth);
    const lineHeight = 4;
    const descBoxHeight = Math.max(lines.length * lineHeight + 4, 10);

    doc.setFillColor(...lightGray);
    doc.rect(tableX, yPos, tableWidth, descBoxHeight, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.1);
    doc.line(tableX, yPos + descBoxHeight, tableX + tableWidth, yPos + descBoxHeight);

    // Dibujar cada línea del texto con justificación manual
    lines.forEach((line, index) => {
        const isLastLine = index === lines.length - 1;

        if (isLastLine || line.trim().split(' ').length === 1) {
            // Última línea o línea con una sola palabra: alineación izquierda normal
            doc.text(line, tableX + 5, yPos + 4 + (index * lineHeight));
        } else {
            // Justificar línea distribuyendo espacio entre palabras
            const words = line.trim().split(' ');
            const lineWidthWithoutSpaces = words.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
            const totalSpaceNeeded = maxLineWidth - lineWidthWithoutSpaces;
            const spaceBetweenWords = totalSpaceNeeded / (words.length - 1);

            let currentX = tableX + 5;
            words.forEach((word, wordIndex) => {
                doc.text(word, currentX, yPos + 4 + (index * lineHeight));
                currentX += doc.getTextWidth(word) + spaceBetweenWords;
            });
        }
    });

    // Precio en la fila de descripción (Subtotal antes de descuento)
    const precioParaTabla = quoteData.precioConRecargo || quoteData.precioBase || quoteData.precioRegular || 0;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('$' + formatPrice(precioParaTabla), tableX + tableWidth - 5, yPos + 4, { align: 'right' });

    yPos += descBoxHeight;

    // Servicios incluidos
    const serviciosActualizados = quoteData.serviciosIncluidos.filter(s => s.trim());

    doc.setFontSize(7);
    const rowHeight = 6;

    serviciosActualizados.forEach((item, index) => {
        // Fondo alternado
        if (index % 2 === 0) {
            doc.setFillColor(...lightGray);
        } else {
            doc.setFillColor(255, 255, 255);
        }
        doc.rect(tableX, yPos, tableWidth, rowHeight, 'F');

        // Borde
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(tableX, yPos + rowHeight, tableX + tableWidth, yPos + rowHeight);

        // Detectar si el item empieza con un número (ej: "1 Escáner antiplagio")
        const numberMatch = item.match(/^(\d+)\s+(.+)$/);
        let desc = item;
        let includedValue = '✓';
        let includedColor = accentOrange;

        if (numberMatch) {
            // Si empieza con número, extraerlo y mostrarlo en INCLUIDO
            includedValue = numberMatch[1];
            desc = numberMatch[2];
            includedColor = darkGray;
        }

        // Contenido
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkGray);

        const maxWidth = tableWidth * 0.6;
        while (doc.getTextWidth(desc) > maxWidth && desc.length > 3) {
            desc = desc.slice(0, -4) + '...';
        }
        doc.text(desc, tableX + 10, yPos + 4);

        // Valor en columna INCLUIDO (número o checkmark)
        doc.setTextColor(...includedColor);
        doc.setFont('helvetica', 'bold');
        doc.text(includedValue, tableX + tableWidth * 0.72, yPos + 4);

        // Precio $0.00
        doc.setTextColor(...darkGray);
        doc.setFont('helvetica', 'normal');
        doc.text('$0.00', tableX + tableWidth - 5, yPos + 4, { align: 'right' });

        yPos += rowHeight;
    });

    // Beneficios adicionales
    quoteData.beneficiosAdicionales.filter(b => {
        if (typeof b === 'object') return b.descripcion && b.descripcion.trim();
        return b.trim();
    }).forEach((item, index) => {
        if ((serviciosActualizados.length + index) % 2 === 0) {
            doc.setFillColor(...lightGray);
        } else {
            doc.setFillColor(255, 255, 255);
        }
        doc.rect(tableX, yPos, tableWidth, rowHeight, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(tableX, yPos + rowHeight, tableX + tableWidth, yPos + rowHeight);

        // Extraer descripción y costo del beneficio
        let desc = typeof item === 'object' ? item.descripcion : item;
        const costoBeneficio = typeof item === 'object' ? (parseFloat(item.costo) || 0) : 0;

        // Detectar si el item empieza con un número
        const numberMatch = desc.match(/^(\d+)\s+(.+)$/);
        let includedValue = '✓';
        let includedColor = accentOrange;

        if (numberMatch) {
            includedValue = numberMatch[1];
            desc = numberMatch[2];
            includedColor = darkGray;
        }

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkGray);
        const maxWidth = tableWidth * 0.6;
        while (doc.getTextWidth(desc) > maxWidth && desc.length > 3) {
            desc = desc.slice(0, -4) + '...';
        }
        doc.text(desc, tableX + 10, yPos + 4);

        doc.setTextColor(...includedColor);
        doc.setFont('helvetica', 'bold');
        doc.text(includedValue, tableX + tableWidth * 0.72, yPos + 4);

        // Mostrar el costo del beneficio (si es > 0) o $0.00
        doc.setTextColor(...darkGray);
        doc.setFont('helvetica', 'normal');
        if (costoBeneficio > 0) {
            doc.setTextColor(...accentOrange);
            doc.setFont('helvetica', 'bold');
        }
        doc.text(`$${formatPrice(costoBeneficio)}`, tableX + tableWidth - 5, yPos + 4, { align: 'right' });

        yPos += rowHeight;
    });

    // Fila de Tiempo de Entrega
    const beneficiosFiltrados = quoteData.beneficiosAdicionales.filter(b => {
        if (typeof b === 'object') return b.descripcion && b.descripcion.trim();
        return b.trim();
    });
    const totalItems = serviciosActualizados.length + beneficiosFiltrados.length;
    if (totalItems % 2 === 0) {
        doc.setFillColor(...lightGray);
    } else {
        doc.setFillColor(255, 255, 255);
    }
    doc.rect(tableX, yPos, tableWidth, rowHeight, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.1);
    doc.line(tableX, yPos + rowHeight, tableX + tableWidth, yPos + rowHeight);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69); // Rojo
    const tiempoEntregaTexto = quoteData.tiempoEntrega || '3 semanas';
    const fechaEntrega = quoteData.fechaEntrega || '';
    const textEntrega = `Tiempo estimado de entrega: ${tiempoEntregaTexto}${fechaEntrega ? ` (${fechaEntrega})` : ''}`;

    // Centrar texto
    const textWidth = doc.getTextWidth(textEntrega);
    const centerX = tableX + (tableWidth - textWidth) / 2;
    doc.text(textEntrega, centerX, yPos + 4);

    yPos += rowHeight;

    // Borde inferior de la tabla
    doc.setDrawColor(...darkBlue);
    doc.setLineWidth(0.5);
    doc.line(tableX, yPos, tableX + tableWidth, yPos);

    yPos += 3; // Menor espacio desde la tabla

    // ============ SECCIÓN DE TOTALES Y CTA (Compacta) ============
    const boxHeight = 24; // Altura muy compacta (antes 32)
    const ctaWidth = contentWidth * 0.35;
    const totalsWidth = contentWidth * 0.6;
    const spacing = contentWidth * 0.05;

    // --- CTA Descuento (Izquierda) - Solo mostrar si hay descuento ---
    const descuentoPorcentaje = parseFloat(quoteData.descuentoEfectivo) || 0;

    if (descuentoPorcentaje > 0) {
        doc.setFillColor(255, 248, 240);
        doc.roundedRect(margin, yPos, ctaWidth, boxHeight, 2, 2, 'F');
        doc.setDrawColor(...accentOrange);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, yPos, ctaWidth, boxHeight, 2, 2, 'S');

        // Texto CTA
        let ctaY = yPos + 6; // Inicio ajustado para altura 24
        const ctaCenterX = margin + ctaWidth / 2;

        // Línea 1: "¡Recibe un 10% de" con estilos mixtos
        // Partes: "¡Recibe un " (8pt Naranja), "10%" (12pt Rojo), " de" (8pt Naranja)
        doc.setFont('helvetica', 'bold');

        // Medir anchos para centrar
        doc.setFontSize(8);
        const text1_1 = '¡Recibe un ';
        const w1_1 = doc.getTextWidth(text1_1);

        doc.setFontSize(12); // Grande para el porcentaje
        const text1_2 = `${descuentoPorcentaje}% `; // Usar el porcentaje real
        const w1_2 = doc.getTextWidth(text1_2);

        doc.setFontSize(8);
        const text1_3 = 'de';
        const w1_3 = doc.getTextWidth(text1_3);

        const totalW_Line1 = w1_1 + w1_2 + w1_3;
        let currentX_Line1 = ctaCenterX - (totalW_Line1 / 2);

        // Dibujar Línea 1
        // Parte 1
        doc.setFontSize(8);
        doc.setTextColor(...accentOrange);
        doc.text(text1_1, currentX_Line1, ctaY);
        currentX_Line1 += w1_1;

        // Parte 2 ("10%") - Rojo y Grande
        doc.setFontSize(12);
        doc.setTextColor(220, 53, 69); // Rojo
        doc.text(text1_2, currentX_Line1, ctaY); // Alineado a la baseline, jsPDF lo maneja bien usualmente
        currentX_Line1 += w1_2;

        // Parte 3 (" de")
        doc.setFontSize(8);
        doc.setTextColor(...accentOrange);
        doc.text(text1_3, currentX_Line1, ctaY);

        ctaY += 4.5;
        doc.setFontSize(12);
        doc.setTextColor(220, 53, 69); // Rojo
        doc.text('DESCUENTO', ctaCenterX, ctaY, { align: 'center' });

        ctaY += 4.5;
        // "pagando en EFECTIVO!"
        doc.setFontSize(8);
        const textPart1 = 'pagando en ';
        const textPart2 = 'EFECTIVO!';
        const width1 = doc.getTextWidth(textPart1);
        const width2 = doc.getTextWidth(textPart2);
        const totalW = width1 + width2;

        let currentX = ctaCenterX - (totalW / 2);

        doc.setTextColor(...accentOrange);
        doc.text(textPart1, currentX, ctaY);

        currentX += width1;
        doc.setTextColor(40, 167, 69);
        doc.text(textPart2, currentX, ctaY);

        ctaY += 4;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7); // Nota más pequeña
        doc.setTextColor(...darkGray);
        doc.text('(Retiro sin tarjeta)', ctaCenterX, ctaY, { align: 'center' });
    }

    // --- Tabla de Totales (Derecha) ---
    const totalsX = margin + ctaWidth + spacing;

    // Cálculos
    const precioBase = quoteData.precioBase || quoteData.precioRegular || 0;
    const descuento = quoteData.descuentoMonto || 0;
    const granTotal = quoteData.precioConDescuento || 0;

    const recargoMonto = quoteData.recargoMonto || 0;
    const tieneRecargo = recargoMonto > 0;

    let totalsY = yPos + 6; // Inicio más ajustado
    // const labelX = totalsX + 5; // Variable ya no usada, usaré totalsX + 5 directo
    // const valueX = totalsX + totalsWidth - 5; // Variable ya no usada, usaré alineacionDerecha directa

    // Valores
    const costoBeneficios = quoteData.beneficiosAdicionales.reduce((total, b) => {
        if (typeof b === 'object') {
            return total + (parseFloat(b.costo) || 0);
        }
        return total;
    }, 0);
    const subtotalMostrado = precioBase + recargoMonto + costoBeneficios;
    const alineacionDerecha = tableX + tableWidth - 5;

    // Subtotal
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('Subtotal:', totalsX + 5, totalsY);
    doc.text(`$${formatPrice(subtotalMostrado)}`, alineacionDerecha, totalsY, { align: 'right' });

    totalsY += 5; // Menor espacio entre líneas

    // Recargo
    if (tieneRecargo) {
        doc.setTextColor(220, 53, 69); // Rojo para urgencia
        doc.text(`Recargo Urgencia (+${quoteData.recargoPorcentaje}%):`, totalsX + 5, totalsY);
        doc.text(`+$${formatPrice(recargoMonto)}`, alineacionDerecha, totalsY, { align: 'right' });
        totalsY += 5;
    }

    // Beneficios adicionales
    if (costoBeneficios > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(230, 140, 50); // Naranja
        doc.text('Beneficios adicionales:', totalsX + 5, totalsY);
        doc.text(`+$${formatPrice(costoBeneficios)}`, alineacionDerecha, totalsY, { align: 'right' });
        totalsY += 5;
    }

    // Descuento - Solo mostrar si es mayor a 0
    if (descuentoPorcentaje > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...successGreen);
        doc.text(`Descuento pagando en efectivo (${quoteData.descuentoEfectivo}%):`, totalsX + 5, totalsY);
        doc.text(`-$${formatPrice(descuento)}`, alineacionDerecha, totalsY, { align: 'right' });
        totalsY += 5;
    }

    totalsY += (descuentoPorcentaje > 0 ? 3 : 8); // Espacio antes del total final

    // GRAN TOTAL Box (Altura reducida)
    const grandTotalHeight = 8; // Reducido de 10
    const grandTotalLabelWidth = 35;

    // Parte Azul
    doc.setFillColor(...darkBlue);
    const polyY = totalsY - 6;

    doc.rect(totalsX, polyY, grandTotalLabelWidth, grandTotalHeight, 'F');
    doc.triangle(
        totalsX + grandTotalLabelWidth, polyY,
        totalsX + grandTotalLabelWidth, polyY + grandTotalHeight,
        totalsX + grandTotalLabelWidth + 5, polyY + (grandTotalHeight / 2),
        'F'
    );

    // Parte Naranja
    doc.setFillColor(...accentOrange);
    const orangeX = totalsX + grandTotalLabelWidth + 5;
    doc.rect(orangeX, polyY, totalsWidth - (orangeX - totalsX), grandTotalHeight, 'F');

    // Textos Gran Total
    doc.setFontSize(8); // Ajustado para caja más pequeña
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...white);
    doc.text('TOTAL FINAL', totalsX + 5, polyY + 5.5);

    doc.setFontSize(10); // Ajustado
    doc.text(`$${formatPrice(granTotal)}`, alineacionDerecha, polyY + 5.5, { align: 'right' });

    yPos += boxHeight + 8;

    // ============ FORMAS DE PAGO ============
    // Header
    doc.setFillColor(...darkBlue);
    doc.rect(margin, yPos, contentWidth, 7, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...white);
    doc.text('FORMAS DE PAGO ACEPTADAS', margin + 5, yPos + 5);

    yPos += 7;

    // Contenido
    doc.setFillColor(...lightGray);
    doc.rect(margin, yPos, contentWidth, 22, 'F');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold'); // Negritas
    doc.setTextColor(...darkGray);
    doc.text('Aceptamos Visa, Mastercard, American Express, PayPal y Mercado Pago en Meses Sin Intereses.', margin + 5, yPos + 5);

    // Carga de Logos de métodos de pago
    const logoY = yPos + 9;
    const logoWidth = 28;
    const logoHeight = 12;
    const logoSpacing = 34;
    let currentLogoX = margin + 10;

    // URLs de los logos (convertidos a PNG vía Cloudinary si son SVG)
    const visaUrl = 'https://res.cloudinary.com/dgxkixm5f/image/upload/f_png/v1770330843/Visa_Inc.-Logo.wine_tzmjsa.svg';
    const mastercardUrl = 'https://res.cloudinary.com/dbowaer8j/image/upload/f_png/v1743714158/mc_symbol_zpes4d.svg';
    const amexUrl = 'https://res.cloudinary.com/dbowaer8j/image/upload/f_png/v1743714158/amex-svgrepo-com_m3vtdk.svg';
    const paypalUrl = 'https://res.cloudinary.com/dgxkixm5f/image/upload/f_png/v1770330985/PayPal-Logo.wine_rb7k4b.svg';
    const mpUrl = 'https://res.cloudinary.com/dgxkixm5f/image/upload/v1770325904/Mercado_Pago.svg_ngrqk4.png';

    try {
        const [visaImg, mastercardImg, amexImg, paypalImg, mpImg] = await Promise.all([
            loadImage(visaUrl),
            loadImage(mastercardUrl),
            loadImage(amexUrl),
            loadImage(paypalUrl),
            loadImage(mpUrl)
        ]);

        const logos = [
            { img: visaImg, name: 'VISA' },
            { img: mastercardImg, name: 'MasterCard' },
            { img: amexImg, name: 'AMEX' },
            { img: paypalImg, name: 'PayPal' },
            { img: mpImg, name: 'MercadoPago' }
        ];

        logos.forEach(logo => {
            // Fondo blanco para todos
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(currentLogoX, logoY, logoWidth, logoHeight, 2, 2, 'F');
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.1);
            doc.roundedRect(currentLogoX, logoY, logoWidth, logoHeight, 2, 2, 'S');

            if (logo.img) {
                // Ajustes de dimensión por logo para evitar deformación
                // Box total: 28 x 12
                let pX = 4;
                let pY = 2.5;

                // Cálculos aproximados de Aspect Ratio para evitar "aplastamiento"
                if (logo.name === 'MasterCard') { pX = 7; pY = 1.5; }      // ~1.5:1
                if (logo.name === 'VISA') { pX = 5; pY = 2; }            // ~2.5:1 (Menos pY para más altura)
                if (logo.name === 'AMEX') { pX = 6; pY = 1; }            // ~1:1
                if (logo.name === 'PayPal') { pX = 2; pY = 1; }        // ~4:1 (Muy ancho, necesita altura reducida)
                if (logo.name === 'MercadoPago') { pX = 2; pY = 2; }     // ~3:1
                const imgW = logoWidth - (pX * 2);
                const imgH = logoHeight - (pY * 2);

                // Centrar
                const imgX = currentLogoX + pX;
                const imgY = logoY + pY;

                doc.addImage(logo.img, 'PNG', imgX, imgY, imgW, imgH, undefined, 'FAST');
            } else {
                // Fallback
                doc.setFontSize(7);
                doc.setTextColor(0, 0, 0);
                doc.text(logo.name, currentLogoX + logoWidth / 2, logoY + logoHeight / 2 + 1, { align: 'center' });
            }

            currentLogoX += logoSpacing;
        });

    } catch (error) {
        console.error("Error drawing payment logos:", error);
        // Fallback genérico si Promise.all falla catastróficamente
    }

    yPos += 30; // Reducido de 35 a 15 para subir las columnas 20px

    // ============ SECCIÓN FINAL ============
    // Col 1: Esquema de Pago
    // Col 2: Firma (Centrada entre PayPal y Mercado Pago)

    const columnGap = 10;
    const colWidth = (contentWidth - columnGap) / 2;
    const col1X = margin;

    // Calcular centro entre PayPal (index 3) y Mercado Pago (index 4)
    // LogoStartX = margin + 10. Spacing = 34.
    // PayPal X = margin + 10 + (3 * 34) = margin + 112
    // MP X = margin + 10 + (4 * 34) = margin + 146
    // Width logo = 28.
    // Centro visual: Entre el centro de PayPal y el centro de MP, o entre los dos logos?
    // "entre paypal y mercado pago" -> Asumiremos el espacio entre ambos logos, o el centro del bloque formado por ellos.
    // Centro de PayPal = margin + 112 + 14 = margin + 126
    // Centro de MP = margin + 146 + 14 = margin + 160
    // Promedio: margin + 143.
    // O tal vez se refiere al hueco entre ellos (margin + 112 + 28 = 140 start MP). Hueco es de 140 a 146 (6mm).
    // Probablemente quiere que la firma esté alineada visualmente bajo esos dos últimos logos.
    // Usaré X = margin + 135 (aprox centro de los dos últimos logos).
    // Usaré X = margin + 135 (aprox centro de los dos últimos logos) + 7mm solicitado
    const firmaCenterX = margin + 145;

    const startSectionY = yPos;

    // --- Columna 1: Esquema de Pago ---
    let col1Y = startSectionY;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentOrange);
    doc.text('ESQUEMA DE PAGO:', col1X, col1Y);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);

    const esquemaLines = doc.splitTextToSize(quoteData.esquemaPago, colWidth);
    const paymentLineHeight = 3.5 * 1.15;
    esquemaLines.forEach((line, i) => {
        doc.text(line, col1X, col1Y + 5 + (i * paymentLineHeight));
    });

    // --- Columna 2: Firma (Centrada en X calculado) ---
    let col2Y = startSectionY;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkGray);
    doc.setFontSize(8);
    doc.text('Atentamente,', firmaCenterX, col2Y, { align: 'center' });

    col2Y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkBlue);
    doc.setFontSize(12); // Aumentado a 1.5x (de 10 a 15)
    doc.text('TESIPEDIA', firmaCenterX, col2Y, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Servicios Académicos Profesionales', firmaCenterX, col2Y + 5, { align: 'center' });

    // --- Sección Final: Nota de Validez (Posición fija) ---
    // Bajada 30px adicionales para evitar sobreposición con las columnas
    // Footer empieza en pageHeight - 15.
    // Posición nota = pageHeight - 15 - 10 - 30 = pageHeight - 55.

    // pageHeight ya existe en el scope superior
    const finalNoteY = pageHeight - 25; // Bajado 30px (de -25 a -55)

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69); // Rojo
    const notaTexto = 'La presente cotización es personalizada y válida exclusivamente para este proyecto.';
    doc.text(notaTexto, pageWidth / 2, finalNoteY, { align: 'center' });

    // ============ FOOTER CON DISEÑO DIAGONAL ============
    const footerY = pageHeight - 20;

    // Fondo azul oscuro diagonal (Completo hasta abajo)
    doc.setFillColor(...darkBlue);
    // Triángulo 1 (Parte superior del corte)
    doc.triangle(0, pageHeight, 0, footerY + 5, pageWidth, footerY, 'F');
    // Triángulo 2 (Relleno esquina inferior derecha restante)
    doc.triangle(0, pageHeight, pageWidth, footerY, pageWidth, pageHeight, 'F');

    // Línea naranja diagonal
    doc.setFillColor(...accentOrange);
    doc.triangle(0, footerY + 5, pageWidth, footerY, pageWidth, footerY - 3, 'F');
    doc.triangle(0, footerY + 5, 0, footerY + 2, pageWidth, footerY - 3, 'F'); // Completar grosor si es necesario
    doc.triangle(0, footerY + 5, 0, footerY, pageWidth, footerY - 3, 'F');

    // ============ GUARDAR PDF ============
    const clientNameSafe = quoteData.clientName.replace(/[^a-zA-Z0-9]/g, '_');
    const fechaHoy = new Date().toISOString().split('T')[0];
    const fileName = `Cotizacion_Tesipedia_${clientNameSafe}_${fechaHoy}.pdf`;

    doc.save(fileName);

    return fileName;
};

export default generateSalesQuotePDF;
