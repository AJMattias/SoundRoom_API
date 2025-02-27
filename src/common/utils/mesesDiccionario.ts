 export function convertirMeses(numerosMeses: string[]): string[] {
    // Objeto diccionario de meses
    const mesesDiccionario: { [key: string]: string } = {
        "1": 'Ene',
        "2": 'Feb',
        "3": 'Mar',
        "4": 'Abr',
        "5": 'May',
        "6": 'Jun',
        "7": 'Jul',
        "8": 'Ago',
        "9": 'Sep',
        "10": 'Oct',
        "11": 'Nov',
        "12": 'Dic'
        // Añade más meses según sea necesario
    };

    // Mapear los números de los meses a los nombres de los meses usando el diccionario
    const mesesString = numerosMeses.map((numero) => mesesDiccionario[numero]);

    return mesesString;
}