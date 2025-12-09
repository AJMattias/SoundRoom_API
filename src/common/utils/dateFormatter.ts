export function parseDateDDMMYYYY(dateString: string): Date {
    const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    
    if (!match) {
        throw new Error(`Formato de fecha inválido: ${dateString}.`);
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // RESTAR 1 al mes es crucial, ya que new Date() usa el índice 0-11
    return new Date(year, month - 1, day);
}