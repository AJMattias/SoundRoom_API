export function parseDateDDMMYYYY(dateString: string): Date {
    const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    
    if (!match) {
        throw new Error(`Formato de fecha inválido: ${dateString}.`);
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // ✅ CAMBIO CLAVE: Usar Date.UTC() para crear una fecha universal
    // Date.UTC devuelve el número de milisegundos desde 1970-01-01T00:00:00.000Z.
    // Luego creamos el objeto Date con ese timestamp.
    return new Date(Date.UTC(year, month - 1, day));
}

