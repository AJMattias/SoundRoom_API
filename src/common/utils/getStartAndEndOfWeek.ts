// src/utils/dateUtils.ts

/**
 * Retorna el primer y último día de la semana correspondiente a la fecha de referencia.
 * Por defecto, la semana comienza el lunes y termina el domingo.
 * 
 * @param referenceDate Fecha desde la cual calcular la semana. Por defecto es hoy.
 * @returns Un objeto con `startOfWeek` (lunes 00:00) y `endOfWeek` (domingo 23:59:59.999)
 */
export const getStartAndEndOfWeek = (
  referenceDate: Date = new Date()
): { startOfWeek: Date; endOfWeek: Date } => {
  const firstDayOfWeek = new Date(referenceDate);
  const day = firstDayOfWeek.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado

  // Calcular diferencia hasta lunes
  const diffToMonday = day === 0 ? -6 : 1 - day;

  // Setear al lunes 00:00
  firstDayOfWeek.setDate(referenceDate.getDate() + diffToMonday);
  firstDayOfWeek.setHours(0, 0, 0, 0);

  // Calcular domingo 23:59:59.999
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
  lastDayOfWeek.setHours(23, 59, 59, 999);

  return {
    startOfWeek: firstDayOfWeek,
    endOfWeek: lastDayOfWeek,
  };
};
